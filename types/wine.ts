export interface WineItem {
  id: string;
  user_id?: string;
  name: string;
  winery?: string;
  vintage?: number;
  rating?: number;
  supermarket?: string;
  price?: number;
  tasting_notes?: string;
  image_url?: string;
  is_popular?: boolean;
  created_at?: string;
}
