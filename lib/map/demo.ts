import type { AtlasMapPoint, AtlasMapSnapshot, MapCoordinate, MapTrip } from '@/types/map';
import type { ProfileMemory } from '@/types/profile';
import type { ProfileSnapshot } from '@/types/profile';
import type { TransportMode } from '@/types/trip';
import type { NetworkUser } from '@/lib/network';
import type { WineItem } from '@/types/wine';

const owner = { id: 'demo-alicia', name: 'Alicia Demo' };
const friend = { id: 'demo-bruno', name: 'Bruno Demo' };

export function getAtlasDemoSnapshot(): AtlasMapSnapshot {
  const memories: Array<{ memory: ProfileMemory; coordinate: MapCoordinate; source: 'mine' | 'shared' }> = [
    { source: 'mine', coordinate: { latitude: 40.4168, longitude: -3.7038 }, memory: memory('demo-memory-madrid', 'Una tarde en el Retiro', 'Parque del Retiro, Madrid', '2026-04-18', [], { latitude: 40.4168, longitude: -3.7038 }) },
    { source: 'shared', coordinate: { latitude: 41.3874, longitude: 2.1686 }, memory: memory('demo-memory-barcelona', 'Cena después del tren', 'Eixample, Barcelona', '2026-05-03', [friend.id], { latitude: 41.3874, longitude: 2.1686 }) },
    { source: 'mine', coordinate: { latitude: 40.424, longitude: -3.705 }, memory: memory('demo-restaurant-madrid', 'Casa Lucio', 'La Latina, Madrid', '2026-06-14', [friend.id], { latitude: 40.424, longitude: -3.705 }, true) },
  ];
  const trips = [
    trip('demo-car', 'Madrid a Valencia', 'car', [[40.4168, -3.7038], [40.09, -3.12], [39.86, -2.45], [39.72, -1.58], [39.4699, -0.3763]]),
    trip('demo-train', 'El tren hacia Barcelona', 'train', [[40.4168, -3.7038], [41.6488, -0.8891], [41.3874, 2.1686]]),
    trip('demo-boat', 'Del puerto a Palma', 'boat', [[41.35, 2.18], [39.5696, 2.6502]]),
    trip('demo-plane', 'Vuelo a París', 'plane', [[40.4893, -3.5676], [48.8566, 2.3522]]),
  ];
  const points: AtlasMapPoint[] = [
    ...memories.map(({ memory: value, coordinate, source }) => ({ id: `${value.isRestaurant ? 'restaurant' : 'memory'}-${value.id}`, layer: value.isRestaurant ? 'restaurants' as const : 'memories' as const, source, ...coordinate, title: value.title, subtitle: value.place, year: '2026', participantIds: value.participantIds, participantNames: value.participantNames, peopleIds: [value.userId!, ...value.participantIds], ownerId: value.userId, ownerName: value.ownerName, memory: value })),
    ...trips.map((value) => ({ id: `trip-${value.id}`, layer: 'trips' as const, source: value.source, ...value.points[0], title: value.title, subtitle: `${value.stops.length} paradas`, year: value.year, participantIds: value.participantIds, participantNames: value.participants.map((person) => person.name), peopleIds: [value.userId, ...value.participantIds], ownerId: value.userId, ownerName: value.ownerName, trip: value })),
  ];
  return {
    points,
    wineRegions: [
      { id: 'demo-rioja', name: 'DOCa Rioja', country: 'España', latitude: 42.466, longitude: -2.445, radius: 76000, wineCount: 8, wineryCount: 5, favoriteCount: 4, averageRating: 4.6 },
      { id: 'demo-ribera', name: 'DO Ribera del Duero', country: 'España', latitude: 41.671, longitude: -3.689, radius: 72000, wineCount: 5, wineryCount: 4, favoriteCount: 2, averageRating: 4.3 },
      { id: 'demo-cava', name: 'DO Cava', country: 'España', latitude: 41.423, longitude: 1.785, radius: 56000, wineCount: 4, wineryCount: 3, favoriteCount: 1, averageRating: 4.1 },
      { id: 'demo-champagne', name: 'Champagne AOC', country: 'Francia', latitude: 49.054, longitude: 4.027, radius: 72000, wineCount: 3, wineryCount: 2, favoriteCount: 2, averageRating: 4.8 },
      { id: 'demo-priorat', name: 'DOCa Priorat', country: 'España', latitude: 41.145, longitude: .821, radius: 36000, wineCount: 2, wineryCount: 2, favoriteCount: 1, averageRating: 4.4 },
      { id: 'demo-rias', name: 'DO Rías Baixas', country: 'España', latitude: 42.438, longitude: -8.716, radius: 56000, wineCount: 1, wineryCount: 1, favoriteCount: 1, averageRating: 4.2 },
      { id: 'demo-barolo', name: 'Barolo DOCG', country: 'Italia', latitude: 44.61, longitude: 7.94, radius: 26000, wineCount: 3, wineryCount: 2, favoriteCount: 2, averageRating: 4.7 },
      { id: 'demo-chianti', name: 'Chianti Classico DOCG', country: 'Italia', latitude: 43.515, longitude: 11.31, radius: 44000, wineCount: 2, wineryCount: 2, favoriteCount: 1, averageRating: 4.3 },
      { id: 'demo-prosecco', name: 'Prosecco DOC', country: 'Italia', latitude: 45.876, longitude: 12.214, radius: 76000, wineCount: 1, wineryCount: 1, favoriteCount: 0, averageRating: 4.0 },
      { id: 'demo-bordeaux', name: 'Bordeaux AOP', country: 'Francia', latitude: 44.84, longitude: -.58, radius: 105000, wineCount: 4, wineryCount: 3, favoriteCount: 2, averageRating: 4.5 },
      { id: 'demo-sancerre', name: 'Sancerre AOP', country: 'Francia', latitude: 47.33, longitude: 2.84, radius: 35000, wineCount: 2, wineryCount: 2, favoriteCount: 1, averageRating: 4.4 },
    ],
    participants: [
      { ...owner, itemCount: 6, ownsContent: true },
      { ...friend, itemCount: 3, ownsContent: false },
    ],
    years: ['2026'],
  };
}

export function getAtlasDemoArchive() {
  const snapshot = getAtlasDemoSnapshot();
  return {
    memories: snapshot.points.flatMap((point) => point.memory ? [point.memory] : []),
    trips: snapshot.points.flatMap((point) => point.trip ? [point.trip] : []),
  };
}

export function getAtlasDemoProfileSnapshot(requestedId?: string): ProfileSnapshot {
  const archive = getAtlasDemoArchive();
  const isOwner = !requestedId || requestedId === owner.id;
  const profile = isOwner ? { id: owner.id, fullName: owner.name, username: 'alicia.demo', biography: 'Guardo viajes, sobremesas y lugares a los que quiero volver.', city: 'Madrid', country: 'España', memberSince: '2024-02-12', privacy: 'friends' as const } : { id: friend.id, fullName: friend.name, username: 'bruno.demo', biography: 'Trenes, ciudades y memorias compartidas.', city: 'Barcelona', country: 'España', memberSince: '2025-01-08', privacy: 'friends' as const };
  const memories = isOwner ? archive.memories : archive.memories.filter((item) => item.participantIds.includes(friend.id));
  return {
    viewerId: owner.id,
    profile,
    access: isOwner ? 'owner' : 'friend',
    statistics: { memories: memories.length, wines: 6, favoriteWines: 3, countriesVisited: 4, citiesVisited: 9, trips: isOwner ? archive.trips.length : 1, restaurants: 2, libraryItems: 5, friends: 7, publicContributions: 4, travelDistanceKm: 2840 },
    memories,
    wines: [],
    libraryItems: [],
    countries: [{ name: 'España', count: 7 }, { name: 'Francia', count: 2 }, { name: 'Portugal', count: 1 }],
    cities: [{ name: 'Madrid', count: 4 }, { name: 'Barcelona', count: 3 }, { name: 'París', count: 2 }],
    favoritePlaces: [{ name: 'Parque del Retiro', count: 3 }, { name: 'Palma', count: 2 }],
    favoriteWines: [],
    achievements: [{ id: 'memories', title: 'Primera memoria', description: 'Guardó su primera memoria.' }, { id: 'friends', title: 'Memoria compartida', description: 'Conectó con otra persona en Atlas.' }],
    timeline: memories.map((item) => ({ id: `memory-${item.id}`, title: item.title, subtitle: item.place, date: item.date, kind: 'memory' as const, href: `/memories/${item.id}` })),
  };
}

export function getAtlasDemoNetwork(): NetworkUser[] {
  return [
    { id: friend.id, fullName: friend.name, username: 'bruno.demo', friendship: 'friends', sharedMemoryCount: 2, audience: 'close' },
    { id: 'demo-camila', fullName: 'Camila Demo', username: 'camila.demo', friendship: 'friends', sharedMemoryCount: 1, audience: 'nearby' },
    { id: 'demo-diego', fullName: 'Diego Demo', username: 'diego.demo', friendship: 'pending_incoming', friendshipId: 'demo-request', sharedMemoryCount: 0, audience: 'public' },
  ];
}

export function getAtlasDemoWines(): WineItem[] {
  return [
    demoWine('demo-wine-rioja', 'Viña Ardanza Reserva', 'La Rioja Alta', 2017, 4.8, '/images/wine-rioja.png', 'España', 'La Rioja', 'Rioja', ['Tempranillo', 'Garnacha'], true, 32.5),
    demoWine('demo-wine-barolo', 'Barolo del Comune', 'Marchesi di Barolo', 2019, 4.6, '/images/wine-barolo.png', 'Italia', 'Piemonte', 'Barolo', ['Nebbiolo'], true, 48),
    demoWine('demo-wine-chianti', 'Chianti Classico Riserva', 'Castello di Ama', 2020, 4.4, '/images/wine-chianti.png', 'Italia', 'Toscana', 'Chianti Classico', ['Sangiovese'], false, 28.9),
    demoWine('demo-wine-sancerre', 'Sancerre Blanc', 'Domaine Vacheron', 2022, 4.5, '/images/wine-sancerre.png', 'Francia', 'Loire', 'Sancerre', ['Sauvignon Blanc'], true, 36),
  ];
}

function memory(id: string, title: string, place: string, date: string, participantIds: string[], coordinate: MapCoordinate, isRestaurant = false): ProfileMemory {
  const city = place.includes('Barcelona') ? 'Barcelona' : 'Madrid';
  return { id, userId: owner.id, ownerName: owner.name, title, place, city, country: 'España', date, ...coordinate, category: isRestaurant ? 'Restaurante' : 'Memoria', route: [], participantIds, participantNames: participantIds.map(() => friend.name), visibility: participantIds.length ? 'friends' : 'private', isRestaurant, restaurantCuisine: isRestaurant ? 'Castiza' : undefined, restaurantVibe: isRestaurant ? 'Clásico de culto' : undefined, restaurantPriceLevel: isRestaurant ? 3 : undefined, restaurantRating: isRestaurant ? 4.7 : undefined, restaurantMustOrder: isRestaurant ? 'Huevos rotos y vino de la casa' : undefined, restaurantStatus: isRestaurant ? 'visited' : undefined, isFavoritePlace: false, isOwner: true };
}

function demoWine(id: string, name: string, winery: string, vintage: number, rating: number, imageUrl: string, country: string, region: string, denominationValue: string, grapes: string[], favorite: boolean, price: number): WineItem {
  return { id, user_id: owner.id, owner_name: owner.name, name, winery, vintage, rating, price, supermarket: country === 'España' ? 'Carrefour' : 'Supercor', image_url: imageUrl, photos: [imageUrl], country, region, denomination: denominationValue, grapes, favorite, is_popular: true, visibility: 'private', participants: [], linked_memories: [], tasting_notes: 'Una botella ligada a un lugar, una mesa y una memoria concreta.', created_at: '2026-06-18T12:00:00.000Z' };
}

function trip(id: string, title: string, transportMode: TransportMode, rawPoints: Array<[number, number]>): MapTrip {
  const points = rawPoints.map(([latitude, longitude]) => ({ latitude, longitude }));
  return { id, userId: owner.id, ownerName: owner.name, title, description: 'Datos de demostración no personales.', startDate: '2026-05-01', endDate: '2026-05-08', transportMode, visibility: 'private', routeGeometry: points, participants: transportMode === 'train' ? [{ id: friend.id, name: friend.name }] : [], stops: points.map((point, index) => ({ id: `${id}-stop-${index}`, position: index, title: index === 0 ? 'Origen' : index === points.length - 1 ? 'Destino' : `Parada ${index}`, ...point })), wines: [], photos: [], countries: ['España'], cities: [], distanceKm: null, source: 'mine', points, year: '2026', participantIds: transportMode === 'train' ? [friend.id] : [] };
}
