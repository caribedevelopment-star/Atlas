export interface EditorialRestaurant {
  id: string;
  name: string;
  chef: string;
  description: string;
  cuisine: string;
  distinction: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  website: string;
  sourceLabel: string;
  sourceUrl: string;
}

// Selección editorial, no ranking de usuarios. Revisada el 25 de agosto de 2026.
export const madridEditorialRestaurants: EditorialRestaurant[] = [
  {
    id: 'diverxo-madrid', name: 'DiverXO', chef: 'Dabiz Muñoz', cuisine: 'Vanguardia creativa', distinction: '3 estrellas Michelin',
    description: 'Una experiencia hedonista, radical y teatral concebida como un viaje culinario sin límites.',
    address: 'C. del Padre Damián, 23, 28036 Madrid', city: 'Madrid', country: 'España', latitude: 40.4577954, longitude: -3.6859491,
    website: 'https://diverxo.com/', sourceLabel: 'Web oficial', sourceUrl: 'https://diverxo.com/',
  },
  {
    id: 'deessa-madrid', name: 'Deessa', chef: 'Quique Dacosta', cuisine: 'Mediterránea contemporánea', distinction: '2 estrellas Michelin',
    description: 'Alta cocina en el Ritz que entrelaza territorio, memoria y producto en dos recorridos de mar y tierra.',
    address: 'Pl. de la Lealtad, 5, 28014 Madrid', city: 'Madrid', country: 'España', latitude: 40.4155502, longitude: -3.6927255,
    website: 'https://www.mandarinoriental.com/es-es/madrid/hotel-ritz/dine/deessa', sourceLabel: 'Mandarin Oriental', sourceUrl: 'https://www.mandarinoriental.com/es-es/madrid/hotel-ritz/dine/deessa',
  },
  {
    id: 'smoked-room-madrid', name: 'Smoked Room Madrid', chef: 'Dani García', cuisine: 'Brasa y humo', distinction: '2 estrellas Michelin',
    description: 'Un omakase íntimo donde el fuego, las brasas y el humo construyen una experiencia precisa y envolvente.',
    address: 'P.º de la Castellana, 57, 28046 Madrid', city: 'Madrid', country: 'España', latitude: 40.4388252, longitude: -3.6917467,
    website: 'https://smokedroomrestaurants.com/en/madrid/', sourceLabel: 'Web oficial', sourceUrl: 'https://smokedroomrestaurants.com/en/madrid/',
  },
  {
    id: 'dstage-madrid', name: 'DSTAgE', chef: 'Diego Guerrero', cuisine: 'Creativa y sostenible', distinction: '2 estrellas Michelin · Estrella Verde',
    description: 'Cocina libre, técnica y cercana en un espacio urbano que convierte cada pase en parte del relato.',
    address: 'C. de Regueros, 8, 28004 Madrid', city: 'Madrid', country: 'España', latitude: 40.4245942, longitude: -3.6963316,
    website: 'https://dstageconcept.com/', sourceLabel: 'Web oficial', sourceUrl: 'https://dstageconcept.com/',
  },
  {
    id: 'ramon-freixa-atelier-madrid', name: 'Ramón Freixa Atelier', chef: 'Ramón Freixa', cuisine: 'Mediterránea de autor', distinction: '2 estrellas Michelin',
    description: 'Solo diez comensales frente a la cocina: un formato íntimo, estacional y muy centrado en el gesto del chef.',
    address: 'C. de Velázquez, 24, 28001 Madrid', city: 'Madrid', country: 'España', latitude: 40.4242034, longitude: -3.6840318,
    website: 'https://ramonfreixaatelier.com/', sourceLabel: 'Web oficial', sourceUrl: 'https://ramonfreixaatelier.com/',
  },
];

export function restaurantSaveHref(restaurant: EditorialRestaurant) {
  const params = new URLSearchParams({
    type: 'restaurant', name: restaurant.name, location: restaurant.address, lat: String(restaurant.latitude), lng: String(restaurant.longitude),
    city: restaurant.city, country: restaurant.country, cuisine: restaurant.cuisine, chef: restaurant.chef, website: restaurant.website, description: restaurant.description,
  });
  return `/memories/new?${params}`;
}
