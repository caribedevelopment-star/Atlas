export type Memory = {
  id: string;
  title: string;
  date: string;
  location: string;
  country: string;
  image: string;
  gallery: string[];
  story: string;
  shared: boolean;
  relatedWineId?: string;
};

export type WineRating = {
  user: string;
  score: number;
  note?: string;
};

export type Wine = {
  id: string;
  name: string;
  country: string;
  region: string;
  type: string;
  image: string;
  addedBy: string;
  ratings: WineRating[];
};

export type Book = {
  id: string;
  title: string;
  author: string;
  description: string;
  cover: string;
  file: string;
  pages: number;
  size: string;
  category: string;
};

export type Article = {
  id: string;
  title: string;
  excerpt: string;
  cover: string;
  author: string;
  readingTime: string;
  date: string;
};

export const wines: Wine[] = [
  {
    id: 'barolo',
    name: 'Barolo Riserva',
    country: 'Italy',
    region: 'Piedmont',
    type: 'Red — Nebbiolo',
    image: '/images/wine-barolo.png',
    addedBy: 'elena.m',
    ratings: [
      { user: 'elena.m', score: 5, note: 'Structured, endless finish.' },
      { user: 'marco', score: 4 },
      { user: 'sofia', score: 5 },
    ],
  },
  {
    id: 'rioja',
    name: 'Rioja Gran Reserva',
    country: 'Spain',
    region: 'La Rioja',
    type: 'Red — Tempranillo',
    image: '/images/wine-rioja.png',
    addedBy: 'marco',
    ratings: [
      { user: 'marco', score: 5, note: 'Leather and dark cherry.' },
      { user: 'elena.m', score: 4 },
    ],
  },
  {
    id: 'sancerre',
    name: 'Sancerre Blanc',
    country: 'France',
    region: 'Loire Valley',
    type: 'White — Sauvignon Blanc',
    image: '/images/wine-sancerre.png',
    addedBy: 'sofia',
    ratings: [
      { user: 'sofia', score: 4, note: 'Crisp, flinty, bright.' },
      { user: 'marco', score: 4 },
      { user: 'elena.m', score: 5 },
    ],
  },
  {
    id: 'chianti',
    name: 'Chianti Classico',
    country: 'Italy',
    region: 'Tuscany',
    type: 'Red — Sangiovese',
    image: '/images/wine-chianti.png',
    addedBy: 'elena.m',
    ratings: [
      { user: 'elena.m', score: 4 },
      { user: 'sofia', score: 4, note: 'Perfect with the sunset.' },
    ],
  },
];

export const memories: Memory[] = [
  {
    id: 'santorini',
    title: 'The last light over Oia',
    date: 'June 14, 2024',
    location: 'Oia, Santorini',
    country: 'Greece',
    image: '/images/memory-santorini.png',
    gallery: ['/images/memory-santorini.png', '/images/memory-lisbon.png'],
    story:
      'We climbed the narrow steps just before dusk, chasing the light as it spilled over the caldera. The whole island seemed to hold its breath. We shared a bottle on a quiet terrace and watched the blue domes turn gold, then rose, then nothing at all. Some evenings you keep forever.',
    shared: true,
    relatedWineId: 'sancerre',
  },
  {
    id: 'tuscany',
    title: 'A long lunch in the hills',
    date: 'September 3, 2023',
    location: 'Val d’Orcia, Tuscany',
    country: 'Italy',
    image: '/images/memory-tuscany.png',
    gallery: ['/images/memory-tuscany.png', '/images/memory-kyoto.png'],
    story:
      'Cypress trees lined the road like quiet sentinels. We found a farmhouse table under an olive tree and stayed until the light went amber. Bread, oil, and a bottle of Chianti that tasted like the ground it came from.',
    shared: true,
    relatedWineId: 'chianti',
  },
  {
    id: 'kyoto',
    title: 'Morning stillness in Arashiyama',
    date: 'November 22, 2023',
    location: 'Arashiyama, Kyoto',
    country: 'Japan',
    image: '/images/memory-kyoto.png',
    gallery: ['/images/memory-kyoto.png'],
    story:
      'We arrived before the crowds, when the temple paths were still wet with dew. The maples were at their reddest. We walked without speaking, letting the quiet do the talking.',
    shared: false,
  },
  {
    id: 'lisbon',
    title: 'Yellow trams and pastel walls',
    date: 'April 8, 2024',
    location: 'Alfama, Lisbon',
    country: 'Portugal',
    image: '/images/memory-lisbon.png',
    gallery: ['/images/memory-lisbon.png', '/images/memory-santorini.png'],
    story:
      'The tram rattled up the hill past walls the color of faded sunlight. We got lost on purpose, following the sound of a distant fado, and found a tiny square where nobody was in a hurry.',
    shared: false,
  },
];

export const articles: Article[] = [
  {
    id: 'terroir',
    title: 'On terroir: how a place learns to taste like itself',
    excerpt:
      'The idea that soil, slope, and weather can be tasted in a glass is older than any label. A meditation on place and patience.',
    cover: '/images/article-terroir.png',
    author: 'Elena Moreau',
    readingTime: '6 min read',
    date: 'May 2024',
  },
  {
    id: 'cities',
    title: 'The cities we only half-remember',
    excerpt:
      'Memory is not a photograph. It is a negotiation between what happened and what mattered. On travelling to remember.',
    cover: '/images/article-cities.png',
    author: 'Marco Bianchi',
    readingTime: '8 min read',
    date: 'March 2024',
  },
  {
    id: 'journal',
    title: 'Keeping a journal you will actually return to',
    excerpt:
      'A few gentle habits for capturing the small details — the ones that bring an entire evening back years later.',
    cover: '/images/article-memory.png',
    author: 'Sofia Katz',
    readingTime: '5 min read',
    date: 'February 2024',
  },
];

export const books: Book[] = [
  {
    id: 'atlas-wines',
    title: 'The Atlas of Wines',
    author: 'Elena Moreau',
    description:
      'A field companion to the regions, grapes, and quiet cellars worth travelling for. Notes, maps, and pairings collected over a decade.',
    cover: '/images/book-atlas-wines.png',
    file: '/books/atlas-wines.pdf',
    pages: 148,
    size: '4.2 MB',
    category: 'Wine',
  },
  {
    id: 'travel-memory',
    title: 'Travel & Memory',
    author: 'Marco Bianchi',
    description:
      'Essays on why some places stay with us long after we leave, and how to hold onto the details that matter.',
    cover: '/images/book-travel-memory.png',
    file: '/books/travel-memory.pdf',
    pages: 96,
    size: '2.8 MB',
    category: 'Travel',
  },
  {
    id: 'terroir-guide',
    title: 'A Guide to Terroir',
    author: 'Sofia Katz',
    description:
      'Soil, slope, and season — a gentle introduction to tasting the place inside every glass.',
    cover: '/images/book-terroir-guide.png',
    file: '/books/terroir-guide.pdf',
    pages: 112,
    size: '3.5 MB',
    category: 'Wine',
  },
];

export const profile = {
  name: 'Elena Moreau',
  handle: 'elena.m',
  avatar: '/images/avatar.png',
  bio: 'Collecting places, wines, and the stories between them.',
  stats: {
    memories: 24,
    winesAdded: 11,
    articlesWritten: 3,
    countriesVisited: 9,
  },
};

export function averageRating(wine: Wine): number {
  if (wine.ratings.length === 0) return 0;
  const sum = wine.ratings.reduce((acc, r) => acc + r.score, 0);
  return Math.round((sum / wine.ratings.length) * 10) / 10;
}

export function getWine(id?: string): Wine | undefined {
  return wines.find((w) => w.id === id);
}

export function getMemory(id: string): Memory | undefined {
  return memories.find((m) => m.id === id);
}
