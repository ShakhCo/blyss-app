import { MapPinIcon } from "./icons/MapPinIcon";
import { StarIcon } from "./icons/StarIcon";

export interface NearbyLocation {
  id: string;
  name: string;
  image: string;
  location: string;
  distance: string;
  rating: number;
}

interface NearbyLocationCardProps {
  location: NearbyLocation;
  onClick?: () => void;
}

export function NearbyLocationCard({ location, onClick }: NearbyLocationCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex gap-4 items-center w-full text-left bg-stone-100 rounded-2xl p-3 active:scale-[0.98] transition-transform"
    >
      <img
        src={location.image}
        alt={location.name}
        className="size-20 rounded-xl object-cover shrink-0"
      />
      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        <h3 className="font-semibold text-sm text-stone-900 leading-tight line-clamp-2">
          {location.name}
        </h3>
        <div className="flex items-center gap-1.5">
          <MapPinIcon className="size-3.5 text-stone-400 shrink-0" />
          <span className="text-xs text-stone-500">
            {location.location} • {location.distance}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <StarIcon className="size-3.5 text-amber-500 shrink-0" />
          <span className="text-xs font-medium text-stone-700">{location.rating}</span>
        </div>
      </div>
    </button>
  );
}
