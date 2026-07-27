export type User = {
  id: string;
  name: string;
  initials: string;
  color: 'olive' | 'burgundy' | 'slate';
};

export type Memory = {
  id: string;
  title: string;
  date: string;
  city: string;
  country: string;
  image: string;
  gallery: string[];
  story: string;
  shared: boolean;
  relatedWineId?: string;
  participants: string[];
  coords: { x: number; y: number };
};

export type WineRating = {
  userId: string;
  score: number;
  note?: string;
};

export type Wine = {
  id: string;
  name: string;
  winery: string;
  country: string;
  region: string;
  type: string;
  vintage: number;
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
  category: string;
  author: string;
  readingTime: string;
  date: string;
};

export const users: User[] = [
  { id: 'kimberly', name: 'Kimberly Toboada', initials: 'KT', color: 'olive' },
  { id: 'cania', name: 'Cania Russian', initials: 'CR', color: 'burgundy' },
  { id: 'leo', name: 'Leo Bobbio', initials: 'LB', color: 'slate' },
  { id: 'ale', name: 'Ale Bobbio', initials: 'AB', color: 'olive' },
  { id: 'helene', name: 'Helene L.', initials: 'HL', color: 'burgundy' },
];

export const wines: Wine[] = [
  {
    id: 'barolo',
    name: 'Barolo Riserva',
    winery: 'Cantina Vietti',
    country: 'Italy',
    region: 'Piedmont',
    type: 'Red',
    vintage: 2016,
    image: '/images/wine-barolo.png',
    addedBy: 'kimberly',
    ratings: [
      { userId: 'ale', score: 9.6 },
      { userId: 'kimberly', score: 9.8, note: 'Structured, endless finish.' },
      { userId: 'leo', score: 9.4 },
      { userId: 'helene', score: 9.3 },
    ],
  },
  {
    id: 'rioja',
    name: 'Rioja Gran Reserva',
    winery: 'Bodegas Muga',
    country: 'Spain',
    region: 'La Rioja',
    type: 'Red',
    vintage: 2014,
    image: '/images/wine-rioja.png',
    addedBy: 'cania',
    ratings: [
      { userId: 'cania', score: 9.5, note: 'Leather and dark cherry.' },
      { userId: 'kimberly', score: 9.1 },
      { userId: 'leo', score: 9.0 },
    ],
  },
  {
    id: 'sancerre',
    name: 'Sancerre Blanc',
    winery: 'Domaine Vacheron',
    country: 'France',
    region: 'Loire Valley',
    type: 'White',
    vintage: 2021,
    image: '/images/wine-sancerre.png',
    addedBy: 'helene',
    ratings: [
      { userId: 'helene', score: 9.2, note: 'Crisp, flinty, bright.' },
      { userId: 'cania', score: 8.9 },
      { userId: 'kimberly', score: 9.4 },
    ],
  },
  {
    id: 'chianti',
    name: 'Chianti Classico',
    winery: 'Castello di Ama',
    country: 'Italy',
    region: 'Tuscany',
    type: 'Red',
    vintage: 2019,
    image: '/images/wine-chianti.png',
    addedBy: 'ale',
    ratings: [
      { userId: 'ale', score: 9.0 },
      { userId: 'helene', score: 9.2, note: 'Perfect with the sunset.' },
      { userId: 'leo', score: 8.8 },
    ],
  },
];

export const memories: Memory[] = [
  {
    id: 'santorini',
    title: 'The last light over Oia',
    date: 'June 14, 2024',
    city: 'Oia, Santorini',
    country: 'Greece',
    image: '/images/memory-santorini.png',
    gallery: ['/images/memory-santorini.png', '/images/memory-lisbon.png'],
    story:
      'We climbed the narrow steps just before dusk, chasing the light as it spilled over the caldera. The whole island seemed to hold its breath. We shared a bottle on a quiet terrace and watched the blue domes turn gold, then rose, then nothing at all. Some evenings you keep forever.',
    shared: true,
    relatedWineId: 'sancerre',
    participants: ['kimberly', 'ale'],
    coords: { x: 57, y: 43 },
  },
  {
    id: 'tuscany',
    title: 'A long lunch in the hills',
    date: 'September 3, 2023',
    city: 'Val d’Orcia, Tuscany',
    country: 'Italy',
    image: '/images/memory-tuscany.png',
    gallery: ['/images/memory-tuscany.png', '/images/memory-kyoto.png'],
    story:
      'Cypress trees lined the road like quiet sentinels. We found a farmhouse table under an olive tree and stayed until the light went amber. Bread, oil, and a bottle of Chianti that tasted like the ground it came from.',
    shared: true,
    relatedWineId: 'chianti',
    participants: ['kimberly', 'leo', 'helene'],
    coords: { x: 52, y: 37 },
  },
  {
    id: 'kyoto',
    title: 'Morning stillness in Arashiyama',
    date: 'November 22, 2023',
    city: 'Arashiyama, Kyoto',
    country: 'Japan',
    image: '/images/memory-kyoto.png',
    gallery: ['/images/memory-kyoto.png'],
    story:
      'We arrived before the crowds, when the temple paths were still wet with dew. The maples were at their reddest. We walked without speaking, letting the quiet do the talking.',
    shared: false,
    participants: ['kimberly'],
    coords: { x: 85, y: 41 },
  },
  {
    id: 'lisbon',
    title: 'Yellow trams and pastel walls',
    date: 'April 8, 2024',
    city: 'Alfama, Lisbon',
    country: 'Portugal',
    image: '/images/memory-lisbon.png',
    gallery: ['/images/memory-lisbon.png', '/images/memory-santorini.png'],
    story:
      'The tram rattled up the hill past walls the color of faded sunlight. We got lost on purpose, following the sound of a distant fado, and found a tiny square where nobody was in a hurry.',
    shared: false,
    participants: ['cania', 'ale'],
    coords: { x: 44, y: 40 },
  },
];

export const articles: Article[] = [
  {
    id: 'terroir',
    title: 'On terroir: how a place learns to taste like itself',
    excerpt:
      'The idea that soil, slope, and weather can be tasted in a glass is older than any label. A meditation on place and patience.',
    cover: '/images/article-terroir.png',
    category: 'Wine',
    author: 'Kimberly Toboada',
    readingTime: '6 min read',
    date: 'May 12, 2024',
  },
  {
    id: 'cities',
    title: 'The cities we only half-remember',
    excerpt:
      'Memory is not a photograph. It is a negotiation between what happened and what mattered. On travelling to remember.',
    cover: '/images/article-cities.png',
    category: 'Travel',
    author: 'Leo Bobbio',
    readingTime: '8 min read',
    date: 'March 4, 2024',
  },
  {
    id: 'journal',
    title: 'Keeping a journal you will actually return to',
    excerpt:
      'A few gentle habits for capturing the small details — the ones that bring an entire evening back years later.',
    cover: '/images/article-memory.png',
    category: 'Journaling',
    author: 'Helene L.',
    readingTime: '5 min read',
    date: 'February 18, 2024',
  },
];

export const books: Book[] = [
  {
    id: 'atlas-wines',
    title: 'The Atlas of Wines',
    author: 'Kimberly Toboada',
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
    author: 'Leo Bobbio',
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
    author: 'Helene L.',
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
  userId: 'kimberly',
  avatar: '/images/avatar.png',
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

export function getUser(id: string): User {
  return users.find((u) => u.id === id) ?? users[0];
}

export function getWine(id?: string): Wine | undefined {
  return wines.find((w) => w.id === id);
}

export function getMemory(id: string): Memory | undefined {
  return memories.find((m) => m.id === id);
}
