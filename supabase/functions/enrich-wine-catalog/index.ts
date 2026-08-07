import { createClient } from '@supabase/supabase-js';

type WineRow = { id:string;name:string;winery:string|null;vintage:number|null;image_path:string|null;canonical_image_url:string|null;country:string|null;region:string|null;denomination:string|null;grapes:string[]|null;description:string|null };
type ProviderConfig = { name:string;searchUrl:string;token?:string;reusableLicenses:string[] };
type ProviderResult = { name?:string;winery?:string;vintage?:number|string;imageUrl?:string;sourceUrl?:string;license?:string;reusable?:boolean;imageType?:string;description?:string;country?:string;region?:string;denomination?:string;grapes?:string[] };
type Match = { result:ProviderResult;provider:ProviderConfig;confidence:number };

const cors = { 'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type' };
const genericImageTerms = /(?:stock|generic|placeholder|wine[-_ ]?glass|wine[-_ ]?bottle|default[-_ ]?wine|copa(?:s)?[-_ ]?de[-_ ]?vino)/i;

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok',{headers:cors});
  if (request.method !== 'POST') return json({error:'Method not allowed'},405);

  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) return json({error:'Supabase configuration is missing'},500);
  const admin = createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});

  const authorization = request.headers.get('Authorization');
  if (!authorization) return json({error:'Authorization required'},401);
  const token = authorization.replace(/^Bearer\s+/i,'');
  const isServiceCall = token === serviceKey;
  if (!isServiceCall) {
    const { data:claims,error:authError } = await admin.auth.getClaims(token);
    if (authError || !claims?.claims?.sub) return json({error:'Invalid authorization'},401);
  }

  const body = await request.json().catch(()=>({})) as { wineId?:string;batchSize?:number };
  const batchSize = Math.min(Math.max(Number(body.batchSize)||10,1),25);
  let query = admin.from('wines').select('id,name,winery,vintage,image_path,canonical_image_url,country,region,denomination,grapes,description')
    .is('canonical_image_url',null).is('image_path',null).in('enrichment_status',['pending','failed']).order('created_at',{ascending:true}).limit(batchSize);
  if (body.wineId) query = query.eq('id',body.wineId);
  if (!isServiceCall && !body.wineId) return json({error:'A wine id is required'},403);

  const { data:wines,error } = await query;
  if (error) return json({error:error.message},500);
  const providers = configuredProviders();
  const outcomes: Array<{id:string;status:string}> = [];
  for (const wine of (wines??[]) as WineRow[]) outcomes.push(await enrich(admin,wine,providers));
  return json({processed:outcomes.length,outcomes});
});

async function enrich(admin:ReturnType<typeof createClient>,wine:WineRow,providers:ProviderConfig[]) {
  try {
    if (!providers.length) {
      await setStatus(admin,wine.id,'failed',null,'configuration');
      return {id:wine.id,status:'failed'};
    }
    const matches:Match[]=[];
    for (const provider of providers) {
      const query=[wine.name,wine.winery,wine.vintage].filter(Boolean).join(' ');
      const response=await fetch(provider.searchUrl.replace('{query}',encodeURIComponent(query)),{headers:provider.token?{Authorization:`Bearer ${provider.token}`}:{},signal:AbortSignal.timeout(8000)});
      if(!response.ok)continue;
      const payload=await response.json() as {results?:ProviderResult[]}|ProviderResult[];
      const results=Array.isArray(payload)?payload:payload.results??[];
      for(const result of results.slice(0,10)){
        const confidence=identityConfidence(wine,result);
        if(confidence>=.7&&await validReusableBottle(result,provider))matches.push({result,provider,confidence});
      }
    }
    const match=matches.sort((a,b)=>b.confidence-a.confidence)[0];
    if(!match){await setStatus(admin,wine.id,'no_match',null,null);return{id:wine.id,status:'no_match'};}
    const source=`${match.provider.name}:${match.result.sourceUrl}`;
    if(match.confidence>=.9){
      const metadata={country:wine.country??clean(match.result.country),region:wine.region??clean(match.result.region),denomination:wine.denomination??clean(match.result.denomination),grapes:wine.grapes?.length?wine.grapes:cleanArray(match.result.grapes),description:wine.description??clean(match.result.description)};
      const {error}=await admin.from('wines').update({canonical_image_url:match.result.imageUrl,enrichment_status:'matched',enrichment_confidence:match.confidence,enrichment_source:source,enriched_at:new Date().toISOString(),...metadata}).eq('id',wine.id).is('image_path',null).is('canonical_image_url',null);
      if(error)throw error;
      return{id:wine.id,status:'matched'};
    }
    const {error:candidateError}=await admin.from('wine_enrichment_candidates').upsert({wine_id:wine.id,proposed_image_url:match.result.imageUrl,source_name:match.provider.name,source_url:match.result.sourceUrl,source_license:match.result.license,confidence:match.confidence,metadata:match.result},{onConflict:'wine_id,proposed_image_url'});
    if(candidateError)throw candidateError;
    await setStatus(admin,wine.id,'needs_review',match.confidence,source);
    return{id:wine.id,status:'needs_review'};
  }catch(error){
    console.error('Wine enrichment failed',wine.id,error);
    await setStatus(admin,wine.id,'failed',null,null);
    return{id:wine.id,status:'failed'};
  }
}

function configuredProviders():ProviderConfig[]{
  try {
    const parsed=JSON.parse(Deno.env.get('WINE_CATALOG_PROVIDERS')??'[]') as ProviderConfig[];
    return parsed.filter((provider)=>provider.name&&provider.searchUrl?.startsWith('https://')&&provider.searchUrl.includes('{query}')&&provider.reusableLicenses?.length);
  } catch { return []; }
}

function identityConfidence(wine:WineRow,result:ProviderResult){
  const name=similarity(normalize(wine.name),normalize(result.name));
  const winery=wine.winery?similarity(normalize(wine.winery),normalize(result.winery)):1;
  const vintage=wine.vintage?Number(result.vintage)===wine.vintage?1:0:1;
  if(name<.8||winery<.65||vintage===0)return 0;
  return Math.round((name*.6+winery*.25+vintage*.15)*100)/100;
}

async function validReusableBottle(result:ProviderResult,provider:ProviderConfig){
  if(!result.imageUrl?.startsWith('https://')||!result.sourceUrl?.startsWith('https://')||!result.license)return false;
  const imageUrl=new URL(result.imageUrl);
  if(['token','expires','signature','x-amz-signature','x-goog-signature'].some((key)=>imageUrl.searchParams.has(key)))return false;
  if(!result.reusable&&!provider.reusableLicenses.includes(result.license))return false;
  const evidence=`${result.imageUrl} ${result.imageType??''} ${result.description??''}`;
  if(genericImageTerms.test(evidence)||!/(?:bottle|label|botella|etiqueta)/i.test(`${result.imageType??''} ${result.description??''}`))return false;
  try{const response=await fetch(result.imageUrl,{method:'HEAD',redirect:'follow',signal:AbortSignal.timeout(5000)});return response.ok&&(response.headers.get('content-type')??'').startsWith('image/');}catch{return false;}
}

async function setStatus(admin:ReturnType<typeof createClient>,id:string,status:string,confidence:number|null,source:string|null){
  await admin.from('wines').update({enrichment_status:status,enrichment_confidence:confidence,enrichment_source:source,enriched_at:new Date().toISOString()}).eq('id',id).is('canonical_image_url',null).is('image_path',null);
}
function normalize(value:unknown){return String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
function clean(value:unknown){return typeof value==='string'&&value.trim()?value.trim().slice(0,500):null;}
function cleanArray(value:unknown){return Array.isArray(value)?value.filter((item):item is string=>typeof item==='string'&&Boolean(item.trim())).map((item)=>item.trim().slice(0,100)).slice(0,20):[];}
function similarity(a:string,b:string){if(!a||!b)return 0;if(a===b)return 1;const left=new Set(a.split(' ')),right=new Set(b.split(' '));const common=[...left].filter((token)=>right.has(token)).length;return common/Math.max(left.size,right.size);}
function json(body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json'}});}
