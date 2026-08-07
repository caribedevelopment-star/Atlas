import { createClient } from 'npm:@supabase/supabase-js@2.111.0';

type WineRow = { id:string; name:string; winery:string|null; vintage:number|null; enrichment_attempts:number|null };
type OffProduct = { code?:string; product_name?:string; brands?:string; image_front_url?:string; image_front_small_url?:string };
const url=Deno.env.get('SUPABASE_URL')??'';
const serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')??'';
const admin=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
const source='Open Food Facts';
const license='CC BY-SA';

Deno.serve(async(req)=>{
  if(req.method!=='POST') return respond({error:'METHOD_NOT_ALLOWED'},405);
  if(!(await authorized(req))) return respond({error:'UNAUTHORIZED'},401);
  try{
    const body=await req.json().catch(()=>({})) as {wineId?:string};
    let q=admin.from('wines').select('id,name,winery,vintage,enrichment_attempts').eq('is_popular',true).eq('enrichment_status','pending').order('created_at',{ascending:true}).limit(1);
    if(body.wineId) q=q.eq('id',body.wineId);
    const {data,error}=await q;
    if(error) throw error;
    const wine=(data?.[0]??null) as WineRow|null;
    if(!wine)return respond({processed:0,status:'idle'});
    const result=await enrich(wine);
    return respond({processed:1,result});
  }catch(e){console.error('wine-enrichment fatal',err(e));return respond({error:'ENRICHMENT_FAILED'},500)}
});

async function authorized(req:Request){
  const cron=req.headers.get('x-atlas-cron-secret');
  if(cron){const {data,error}=await admin.rpc('atlas_get_wine_enrichment_cron_secret');if(!error&&typeof data==='string'&&equal(cron,data))return true;}
  const token=req.headers.get('authorization')?.replace(/^Bearer\s+/i,'').trim();
  if(!token)return false;
  const {data,error}=await admin.auth.getUser(token);
  return !error&&data.user?.app_metadata?.role==='admin';
}

async function enrich(wine:WineRow){
  const attempts=(wine.enrichment_attempts??0)+1;
  await admin.from('wines').update({enrichment_attempts:attempts,enrichment_error:null}).eq('id',wine.id);
  try{
    const candidates=await search(wine);const best=candidates[0];
    if(!best){await finish(wine.id,{enrichment_status:'no_match',enrichment_confidence:null,enrichment_source:source,enrichment_source_url:null,enrichment_license:license,enrichment_error:null});return {wineId:wine.id,status:'no_match'}}
    if(best.score>=0.86){await finish(wine.id,{canonical_image_url:best.imageUrl,enrichment_status:'matched',enrichment_confidence:best.score,enrichment_source:source,enrichment_source_url:best.sourceUrl,enrichment_license:license,enrichment_error:null});return {wineId:wine.id,status:'matched',confidence:best.score}}
    if(best.score>=0.60){const {error}=await admin.from('wine_enrichment_reviews').upsert({wine_id:wine.id,provider_name:source,proposed_image_url:best.imageUrl,source_url:best.sourceUrl,source_license:license,confidence:best.score,proposed_payload:{code:best.product.code,product_name:best.product.product_name,brands:best.product.brands},status:'pending'},{onConflict:'wine_id,provider_name,proposed_image_url'});if(error)throw error;await finish(wine.id,{enrichment_status:'needs_review',enrichment_confidence:best.score,enrichment_source:source,enrichment_source_url:best.sourceUrl,enrichment_license:license,enrichment_error:null});return {wineId:wine.id,status:'needs_review',confidence:best.score}}
    await finish(wine.id,{enrichment_status:'no_match',enrichment_confidence:best.score,enrichment_source:source,enrichment_source_url:best.sourceUrl,enrichment_license:license,enrichment_error:null});return {wineId:wine.id,status:'no_match',confidence:best.score};
  }catch(e){
    const message=err(e);
    const transient=/OPEN_FOOD_FACTS_(429|5\d\d)/.test(message);
    const nextStatus=transient&&attempts<5?'pending':'failed';
    await finish(wine.id,{enrichment_status:nextStatus,enrichment_error:message.slice(0,500)});
    return {wineId:wine.id,status:nextStatus,error:message};
  }
}

async function finish(id:string,values:Record<string,unknown>){await admin.from('wines').update({...values,enriched_at:new Date().toISOString()}).eq('id',id)}
async function search(wine:WineRow){const u=new URL('https://world.openfoodfacts.org/cgi/search.pl');u.searchParams.set('search_terms',[wine.name,wine.winery].filter(Boolean).join(' '));u.searchParams.set('search_simple','1');u.searchParams.set('action','process');u.searchParams.set('json','1');u.searchParams.set('page_size','8');u.searchParams.set('fields','code,product_name,brands,image_front_url,image_front_small_url');const r=await fetch(u,{headers:{Accept:'application/json','User-Agent':'Atlas/1.0 wine-catalog-enrichment'}});if(!r.ok)throw new Error(`OPEN_FOOD_FACTS_${r.status}`);const p=await r.json() as {products?:OffProduct[]};return (p.products??[]).flatMap(product=>{const imageUrl=product.image_front_url??product.image_front_small_url;if(!imageUrl||!/^https:\/\/images\.openfoodfacts\.org\//i.test(imageUrl))return[];const score=scoreCandidate(wine,product);const code=product.code?.trim();return[{product,score,imageUrl,sourceUrl:code?`https://world.openfoodfacts.org/product/${encodeURIComponent(code)}`:'https://world.openfoodfacts.org/'}]}).sort((a,b)=>b.score-a.score)}
function scoreCandidate(wine:WineRow,p:OffProduct){const a=norm(wine.name),b=norm(p.product_name??''),w=norm(wine.winery??''),brands=norm(p.brands??'');if(!b)return 0;const ns=overlap(tokens(a),tokens(b));const bs=w&&brands?Math.max(overlap(tokens(w),tokens(brands)),brands===w?1:0):0;const exactName=a===b;const strongName=ns>=0.85;let s=ns*.72+bs*.28;if(exactName)s=Math.max(s,.84+bs*.16);else if(strongName&&bs>=.5)s=Math.max(s,.78+bs*.18);return Math.min(1,Math.round(s*10000)/10000)}
function norm(v:string){return v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\b(19|20)\d{2}\b/g,' ').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim()}
function tokens(v:string){const stop=new Set(['bodega','bodegas','vino','wine','the','de','del','la','el','los','las']);return new Set(v.split(' ').filter(x=>x.length>1&&!stop.has(x)))}
function overlap(a:Set<string>,b:Set<string>){if(!a.size||!b.size)return 0;let hits=0;for(const t of a)if(b.has(t))hits++;return hits/a.size}
function equal(a:string,b:string){if(a.length!==b.length)return false;let x=0;for(let i=0;i<a.length;i++)x|=a.charCodeAt(i)^b.charCodeAt(i);return x===0}
function err(e:unknown){return e instanceof Error?e.message:String(e??'UNKNOWN_ERROR')}
function respond(payload:unknown,status=200){return new Response(JSON.stringify(payload),{status,headers:{'content-type':'application/json'}})}
