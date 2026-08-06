import type { WineItem, WineVisibility } from '@/types/wine';

export type ProfilePrivacy = 'private' | 'friends' | 'public';
export type ProfileAccess = 'owner' | 'friend' | 'public';

export interface AtlasProfile {
  id: string;
  fullName: string;
  username: string;
  biography?: string;
  city?: string;
  country?: string;
  avatarUrl?: string;
  memberSince?: string;
  privacy: ProfilePrivacy;
}

export interface ProfileMemory {
  id: string;
  userId?: string;
  ownerName?: string;
  ownerAvatarUrl?: string;
  title: string;
  description?: string;
  city?: string;
  country?: string;
  place?: string;
  category?: string;
  date?: string;
  createdAt?: string;
  latitude?: number;
  longitude?: number;
  route: Array<{ latitude: number; longitude: number }>;
  participantIds: string[];
  participantNames: string[];
  linkedWineId?: string;
  visibility: WineVisibility;
  isRestaurant: boolean;
  isFavoritePlace: boolean;
  tripId?: string;
}

export interface ProfileLibraryItem { id: string; userId?: string; title: string; visibility: WineVisibility; createdAt?: string }
export interface ProfileAchievement { id: string; title: string; description: string }
export interface ProfileTimelineItem { id: string; title: string; subtitle?: string; date?: string; kind: 'memory' | 'wine' | 'library' }
export interface ProfilePlace { name: string; count: number }

export interface ProfileStatistics {
  memories: number;
  wines: number;
  favoriteWines: number;
  countriesVisited: number;
  citiesVisited: number;
  trips: number;
  restaurants: number;
  libraryItems: number;
  friends: number;
  publicContributions: number;
  travelDistanceKm: number | null;
}

export interface ProfileSnapshot {
  profile: AtlasProfile;
  access: ProfileAccess;
  statistics: ProfileStatistics;
  memories: ProfileMemory[];
  wines: WineItem[];
  libraryItems: ProfileLibraryItem[];
  countries: ProfilePlace[];
  cities: ProfilePlace[];
  favoritePlaces: ProfilePlace[];
  favoriteWines: WineItem[];
  achievements: ProfileAchievement[];
  timeline: ProfileTimelineItem[];
}

export interface ProfileUpdate { full_name: string; username: string; bio: string; city: string; country: string; privacy: ProfilePrivacy }
