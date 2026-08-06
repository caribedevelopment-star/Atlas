import { WineBottleImage } from './WineBottleImage';
import { cx } from './utils';

export interface WinePhotoStripProps {
  photos?: string[];
  name: string;
  className?: string;
}

export function WinePhotoStrip({ photos = [], name, className }: WinePhotoStripProps) {
  const visiblePhotos = photos.filter(Boolean).slice(0, 4);

  if (visiblePhotos.length === 0) return null;

  return (
    <div className={cx('grid grid-cols-4 gap-2', className)}>
      {visiblePhotos.map((photo, index) => (
        <WineBottleImage
          key={`${photo}-${index}`}
          src={photo}
          alt={`${name} foto ${index + 1}`}
          className="aspect-square rounded-2xl"
          imageClassName="p-2"
        />
      ))}
    </div>
  );
}
