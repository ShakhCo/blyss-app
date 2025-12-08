import { Button } from "@heroui/react";
import { ChevronRight, MessageCircle, Navigation, Star } from "lucide-react";
import type { Review, Stylist } from "~/components/ReviewCard";

export interface SalonFeedData {
  id: string;
  name: string;
  image: string;
  address: string;
  likes?: number;
  comments?: number;
  rating?: number;
  distance?: string;
  gallery?: string[];
  reviews?: Review[];
  stylists?: Stylist[];
}

export interface SalonFeedCardProps {
  salon: SalonFeedData;
  onClick?: () => void;
  onBookClick?: () => void;
  onLikeClick?: () => void;
  onNavigateClick?: () => void;
  onReviewsClick?: () => void;
}

export function SalonFeedCard({
  salon,
  onClick,
  onBookClick,
  onLikeClick,
  onNavigateClick,
  onReviewsClick,
}: SalonFeedCardProps) {
  const galleryImages = salon.gallery ?? [
    salon.image,
    salon.image,
    salon.image,
    salon.image,
  ];

  return (
    <div className="flex flex-col p-0">

      <button type="button" onClick={onClick} className="px-2 text-left">
        <div className="rounded-2xl overflow-hidden w-full">
          <div className="h-48 mb-0.5 relative w-full">
            <img
              alt={salon.name}
              className="h-full w-full shrink-0 select-none object-cover"
              loading="lazy"
              src={salon.image}
            />
          </div>

          <div className="grid grid-cols-4 gap-0.5">
            {galleryImages.slice(0, 4).map((img, index) => (
              <div key={index} className="aspect-square overflow-hidden">
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </button>

      <div className="grid grid-cols-12 gap-2 px-2 pt-2 pb-3">
        <div className="col-span-8">
          <div className="flex flex-1 flex-col justify-center gap-1 px-2 py-1 rounded-xl">
            <h3 className="text-lg font-semibold line-clamp-1 flex items-center dark:text-stone-100">
              <span>{salon.name}</span>
              <ChevronRight size={16} />
            </h3>
            <p className="text-sm text-gray-500 dark:text-stone-400 line-clamp-1">{salon.address}</p>
          </div>
        </div>
        <div className="col-span-4 py-1">
          <Button className="w-full truncate" onPress={onBookClick}>
            <span className="truncate">Band qilish</span>
          </Button>
        </div>
      </div>

      <div className="pb-8">
        <div className="px-3 flex items-center gap-2 w-full h-8">
          <button
            type="button"
            onClick={onLikeClick}
            className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 px-2 rounded-full h-full hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          >
            <Star size={20} className="mx-auto fill-yellow-500 text-yellow-500" />
            <span className="text-sm dark:text-stone-300">{salon.rating ?? 0}</span>
          </button>
          <button
            type="button"
            onClick={onReviewsClick}
            className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 px-2 rounded-full h-full hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          >
            <MessageCircle size={20} className="mx-auto dark:text-stone-300" />
            <span className="text-sm dark:text-stone-300">{salon.comments ?? 0}</span>
          </button>
          <button
            type="button"
            onClick={onNavigateClick}
            className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 px-2 rounded-full h-full hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          >
            <Navigation size={20} className="mx-auto dark:text-stone-300" />
            <span className="text-sm dark:text-stone-300">{salon.distance ?? "N/A"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
