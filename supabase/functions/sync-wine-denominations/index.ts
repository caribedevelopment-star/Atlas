import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EAMBROSIA_API = 'https://webgate.ec.europa.eu/eambrosia-api/api/v1/geographical-indications';
const COUNTRY_NAMES: Record<string, string> = { ES: 'España', IT: 'Italia', FR: 'Francia' };

type EAmbrosiaGI = {
  giIdentifier?: string;
  protectedNames?: string[];
  countries?: string[];
  giType?: string;
  productType?: string;
  status?: string;
  removedFlag?: boolean;
};

Deno.serve(async (request) => {
  if (request.method !== 'POST') return json({ error: 'METHOD_NOT_ALLOWED' }, 405);
  const projectUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const expectedSecret = Deno.env.get('ATLAS_WINE_DENOMINATIONS_SYNC_SECRET');
  const providedSecret = request.headers.get('x-atlas-sync-secret');
  if (!projectUrl || !serviceKey) return json({ error: 'SERVER_CONFIGURATION_MISSING' }, 500);
  if (!expectedSecret || providedSecret !== expectedSecret) return json({ error: 'UNAUTHORIZED' }, 401);

  const response = await fetch(EAMBROSIA_API, { headers: { accept: 'application/json', 'user-agent': 'Atlas/1.0 wine-denomination-sync' } });
  if (!response.ok) return json({ error: 'EAMBROSIA_UNAVAILABLE', status: response.status }, 502);
  const payload = await response.json() as EAmbrosiaGI[];
  const rows = payload.flatMap((item) => {
    const countryCode = item.countries?.find((country) => country in COUNTRY_NAMES);
    const name = item.protectedNames?.find((value) => value.trim())?.trim();
    if (!countryCode || !name || !item.giIdentifier || item.productType !== 'WINE' || item.status !== 'registered' || item.removedFlag) return [];
    return [{
      id: `eambrosia-${item.giIdentifier}`,
      name,
      country_code: countryCode,
      country: COUNTRY_NAMES[countryCode],
      classification: item.giType || 'GI',
      official_id: item.giIdentifier,
      source_url: `${EAMBROSIA_API}/${item.giIdentifier}`,
      active: true,
      updated_at: new Date().toISOString(),
    }];
  });

  const supabase = createClient(projectUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  for (let index = 0; index < rows.length; index += 400) {
    const { error } = await supabase.from('wine_denominations').upsert(rows.slice(index, index + 400), { onConflict: 'country_code,name' });
    if (error) return json({ error: 'SUPABASE_UPSERT_FAILED', detail: error.message }, 500);
  }
  return json({ synced: rows.length, countries: COUNTRY_NAMES, source: EAMBROSIA_API });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}
