import { Avatar, Card } from "@heroui/react";
import { HeartIcon } from "./icons/HeartIcon";
import { StarIcon } from "./icons/StarIcon";
import { Navigation, Star } from "lucide-react";

export interface FeaturedSalon {
  id: string;
  name: string;
  image: string;
  services: string[];
  address: string;
  rating: number;
  reviewCount: string;
  isFavorite?: boolean;
}

interface FeaturedSalonCardProps {
  salon: FeaturedSalon;
  onFavoriteToggle?: () => void;
  onClick?: () => void;
}

export function FeaturedSalonCard({ salon, onFavoriteToggle, onClick }: FeaturedSalonCardProps) {
  return (
    <div className="w-[220px] shrink-0 overflow-hidden rounded-b-2xl">
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left"
      >
        <div className="relative">
          <img
            src={salon.image}
            alt={salon.name}
            className="w-full h-[194px] object-cover rounded-xl"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle?.();
            }}
            className="absolute top-2 right-2 size-8 rounded-full bg-[#fef1f2] flex items-center justify-center"
          >
            <HeartIcon
              className={`size-5 ${salon.isFavorite ? 'text-[#ed4c5c] fill-current' : 'text-[#ed4c5c]'}`}
              filled={salon.isFavorite}
            />
          </button>
        </div>

        <div className="pt-3 px-2 pb-1 space-y-1 overflow-hidden rounded-b-2xl ">
          <p className="text-xs text-primary tracking-wide">
            {salon.services.join(" . ")}
          </p>
          <h3 className="font-bold text-base text-[#111111] dark:text-stone-100">
            {salon.name}
          </h3>
          <p className="text-sm text-[#50555c] dark:text-stone-400 truncate">
            {salon.address}
          </p>
          <div className="flex items-center gap-2 pt-2">
            <Star size={18}  className="text-yellow-500 fill-yellow-500" />
            <span className="text-xs dark:text-stone-300">
              <span className="font-bold text-sm">{salon.rating}</span>
              <span className="text-sm ml-1">({salon.reviewCount})</span>
            </span>
          </div>
        </div>
      </button>
    </div>
  );
}
