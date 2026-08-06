export const ATLAS_NAVIGATION = [
  { label: 'Mapa', href: '/home', icon: 'map' },
  { label: 'Memorias', href: '/memories', icon: 'memories' },
  { label: 'Vinos', href: '/wines', icon: 'wines' },
  { label: 'Biblioteca', href: '/library', icon: 'library' },
  { label: 'Perfil', href: '/profile', icon: 'profile' },
] as const;

export function isNavigationActive(pathname: string | null, href: string) {
  return pathname === href || Boolean(pathname?.startsWith(`${href}/`));
}
