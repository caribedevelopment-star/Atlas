export type WineVisibility = 'private' | 'friends' | 'public';
export type WineSource = 'mine' | 'friends' | 'public';

export interface WineParticipant {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface WineItem {
  id: string;
  user_id?: string;
  owner_name?: string;
  owner_avatar_url?: string;
  name: string;
  winery?: string;
  vintage?: number;
  rating?: number;
  supermarket?: string;
  shop?: string;
  price?: number;
  tasting_notes?: string;
  notes?: string;
  image_url?: string;
  photos: string[];
  country?: string;
  region?: string;
  denomination?: string;
  grapes: string[];
  favorite: boolean;
  visibility: WineVisibility;
  participants: WineParticipant[];
  linked_memories: Array<{ id: string; title: string; date?: string }>;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  interaction_id?: string;
  date_tasted?: string;
  purchase_location?: string;
  description?: string;
}

export interface CreateWineInput {
  name: string;
  winery?: string;
  vintage?: number;
  rating?: number;
  supermarket?: string;
  price?: number | null;
  tasting_notes?: string;
  image_path?: string;
  photo_paths?: string[];
  country?: string;
  region?: string;
  denomination?: string;
  grapes?: string[];
  shop?: string;
  visibility?: WineVisibility;
  favorite?: boolean;
  description?: string;
  date_tasted?: string;
  purchase_location?: string;
}

export type WineSort = 'recent' | 'rating' | 'price-asc' | 'price-desc' | 'vintage' | 'alphabetical';

export interface WineFilters {
  source: 'all' | WineSource;
  favorite: boolean;
  minimumRating: number | null;
  minimumPrice: number | null;
  maximumPrice: number | null;
  country: string;
  region: string;
  denomination: string;
  grape: string;
  vintage: string;
  retailer: string;
}
