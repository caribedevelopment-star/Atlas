import { supabase } from '@/lib/supabase';

export type WineEnrichmentReview = {
  id: string;
  wine_id: string;
  provider_name: string;
  proposed_image_url: string;
  source_url?: string | null;
  source_license?: string | null;
  confidence: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  wine?: { name?: string; winery?: string | null; vintage?: number | null } | null;
};

export async function getCurrentUserIsAdmin(): Promise<boolean> {
  const { data } = await supabase.auth.getUser();
  return data.user?.app_metadata?.role === 'admin';
}

export async function listPendingWineEnrichmentReviews(): Promise<WineEnrichmentReview[]> {
  const { data, error } = await supabase
    .from('wine_enrichment_reviews')
    .select('id,wine_id,provider_name,proposed_image_url,source_url,source_license,confidence,status,created_at,wine:wines(name,winery,vintage)')
    .eq('status', 'pending')
    .order('confidence', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as WineEnrichmentReview[];
}

export async function reviewWineEnrichment(reviewId: string, decision: 'approved' | 'rejected'): Promise<void> {
  const { error } = await supabase.rpc('atlas_review_wine_enrichment', {
    review_id: reviewId,
    decision,
  });
  if (error) throw error;
}

export async function runWineEnrichment(wineId?: string): Promise<void> {
  const { error } = await supabase.functions.invoke('enrich-wine-catalog', {
    body: { limit: wineId ? 1 : 5, wineId },
  });
  if (error) throw error;
}
