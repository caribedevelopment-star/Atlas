import type { TransportMode } from '@/types/trip';

export const transportModes: TransportMode[] = ['car', 'train', 'boat', 'plane'];

export const transportMeta: Record<TransportMode, { label: string; shortLabel: string; description: string; color: string }> = {
  car: { label: 'En carro', shortLabel: 'Carro', description: 'Ruta vial azul, precisa y legible como navegación.', color: '#4285F4' },
  train: { label: 'En tren', shortLabel: 'Tren', description: 'Raíles metálicos y traviesas en movimiento.', color: '#0F8A55' },
  boat: { label: 'En barco', shortLabel: 'Barco', description: 'Deriva marítima con una estela de agua.', color: '#0EA5E9' },
  plane: { label: 'En avión', shortLabel: 'Avión', description: 'Gran arco aéreo con una estela luminosa.', color: '#8B5CF6' },
};

export function normalizeTransportMode(value: unknown, title = '', description = ''): TransportMode {
  if (value === 'car' || value === 'train' || value === 'boat' || value === 'plane') return value;
  const context = `${title} ${description}`.toLocaleLowerCase('es');
  if (/avión|avion|vuelo|aéreo|aereo|airport|flight/.test(context)) return 'plane';
  if (/barco|ferry|crucero|velero|navío|navio|puerto/.test(context)) return 'boat';
  if (/tren|ferrocarril|rail|ave\b/.test(context)) return 'train';
  return 'car';
}
