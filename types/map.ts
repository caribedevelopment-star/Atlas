import type { ProfileMemory } from '@/types/profile';
import type { WineItem } from '@/types/wine';

export type MapSource = 'mine' | 'friends' | 'public';
export type MapLayer = 'memories' | 'wines' | 'trips' | 'favorites' | 'restaurants';
export interface MapCoordinate { latitude: number; longitude: number }
export interface MapTrip { id: string; title: string; source: MapSource; visibility: WineItem['visibility']; points: MapCoordinate[]; memories: ProfileMemory[]; year?: string; participantIds: string[] }
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
export interface AtlasMapSnapshot { points: AtlasMapPoint[]; participants: Array<{ id: string; name: string }>; years: string[] }
export interface AtlasMapFilters { query: string; sources: Set<MapSource>; layers: Set<MapLayer>; year: string; participant: string }
