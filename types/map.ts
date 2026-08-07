import type { ProfileMemory } from '@/types/profile';
import type { WineItem } from '@/types/wine';
import type { AtlasTrip } from '@/types/trip';

export type MapSource = 'mine' | 'shared' | 'public';
export type MapLayer = 'memories' | 'wines' | 'trips' | 'favorites' | 'restaurants';
export interface MapCoordinate { latitude: number; longitude: number }
export type MapTrip = AtlasTrip & { source: MapSource; points: MapCoordinate[]; year?: string; participantIds: string[] };
export interface AtlasWineRegion {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  radius: number;
  wineCount: number;
  wineryCount: number;
  favoriteCount: number;
  averageRating?: number;
}
export interface AtlasMapPoint {
  id: string;
  layer: MapLayer;
  source: MapSource;
  latitude: number;
  longitude: number;
  title: string;
  subtitle?: string;
  year?: string;
  participantIds: string[];
  participantNames: string[];
  ownerId?: string;
  ownerName?: string;
  ownerAvatarUrl?: string;
  memory?: ProfileMemory;
  wine?: WineItem;
  trip?: MapTrip;
}
export interface AtlasMapSnapshot {
  points: AtlasMapPoint[];
  wineRegions: AtlasWineRegion[];
  participants: Array<{ id: string; name: string }>;
  years: string[];
}
export interface AtlasMapFilters { query: string; sources: Set<MapSource>; layers: Set<MapLayer>; year: string; participant: string }
