import { Heart } from 'lucide-react';
import type { WineItem } from '@/types/wine';
import { WineCard, WineGrid } from '@/components/wine-ui';
import { ProfileEmptyState } from './ProfileEmptyState';
export function FavoriteWines({ wines }: { wines: WineItem[] }) { return <section aria-labelledby="favorite-wines-title"><h2 id="favorite-wines-title" className="text-lg font-semibold text-white">Vinos favoritos</h2><div className="mt-4">{wines.length ? <WineGrid className="lg:grid-cols-2">{wines.slice(0, 4).map((wine) => <WineCard key={wine.id} name={wine.name} winery={wine.winery} imageUrl={wine.image_url} photos={wine.photos} vintage={wine.vintage} country={wine.country} region={wine.region} grapes={wine.grapes} rating={wine.rating} price={wine.price} favorite visibility={wine.visibility} />)}</WineGrid> : <ProfileEmptyState title="Sin favoritos visibles" description="Los vinos marcados como favoritos aparecerán aquí." icon={Heart} />}</div></section>; }
