import type { ProfileMemory } from '@/types/profile';
import type { WineItem, WineParticipant, WineVisibility } from '@/types/wine';

export interface TripPhoto { id: string; storagePath: string; caption?: string; position: number }
export interface TripStop { id: string; position: number; memoryId?: string; title: string; latitude?: number; longitude?: number; city?: string; country?: string; memory?: ProfileMemory }
export interface AtlasTrip { id: string; userId: string; title: string; description?: string; coverImageUrl?: string; startDate: string; endDate: string; visibility: WineVisibility; routeGeometry: Array<{ latitude: number; longitude: number }>; participants: WineParticipant[]; stops: TripStop[]; wines: WineItem[]; photos: TripPhoto[]; countries: string[]; cities: string[]; distanceKm: number | null; createdAt?: string; updatedAt?: string }
export interface TripInput { id?: string; title: string; description: string; coverImageUrl: string; startDate: string; endDate: string; visibility: WineVisibility; stops: Array<{ memoryId?: string; title: string; latitude?: number; longitude?: number; city?: string; country?: string }>; participantIds: string[]; wineIds: string[]; photos: Array<{ storagePath: string; caption?: string }> }
