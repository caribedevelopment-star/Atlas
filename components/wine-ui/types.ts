export type WineVisibility = 'private' | 'circle' | 'network' | 'public';

export interface WineParticipant {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

export interface WineLinkedMemory {
  id: string;
  title: string;
  date?: string | null;
}

export interface WineOwner {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

export interface WineUIRecord {
  id?: string;
  user?: WineOwner | string | null;
  photos?: string[];
  price?: number | string | null;
  country?: string | null;
  region?: string | null;
  grapes?: string[];
  vintage?: number | string | null;
  supermarket?: string | null;
  shop?: string | null;
  notes?: string | null;
  rating?: number | null;
  favorite?: boolean;
  visibility?: WineVisibility;
  participants?: WineParticipant[];
  linkedMemories?: WineLinkedMemory[];
  createdAt?: string | null;
}
