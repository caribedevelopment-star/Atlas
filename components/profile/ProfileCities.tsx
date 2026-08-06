import type { ProfilePlace } from '@/types/profile'; import { PlaceList } from './ProfileCountries';
export function ProfileCities({ cities }: { cities: ProfilePlace[] }) { return <PlaceList title="Ciudades visitadas" values={cities} empty="No hay ciudades verificables en las memorias visibles." />; }
