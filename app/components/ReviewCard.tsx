import { Star, ThumbsUpIcon, ThumbsDownIcon } from "lucide-react";
import { Button, Chip } from "@heroui/react";

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
  services: string[];
  stylistId: string;
}

export interface Stylist {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface ReviewCardProps {
  review: Review;
  stylist?: Stylist;
  showStylist?: boolean;
  showServices?: boolean;
  showActions?: boolean;
  onLike?: (reviewId: string) => void;
  onDislike?: (reviewId: string) => void;
}

export function ReviewCard({
  review,
  stylist,
  showStylist = true,
  showServices = true,
  showActions = true,
  onLike,
  onDislike,
}: ReviewCardProps) {
  return (
    <div className="flex flex-col gap-2 px-4 py-4">

      <div className="flex gap-3">

        <div className="w-12 h-12 shrink-0">
          <img
            src={review.avatar}
            alt={review.author}
            className="h-full w-full rounded-full object-cover"
          />
        </div>

        <div className="flex flex-col">
          <span className="text-base font-semibold text-stone-900 dark:text-stone-100">
            {review.author}
          </span>
          <span className="text-sm">
            {review.date}
          </span>
        </div>
      </div>

      <div className="w-full flex flex-col gap-2 mb-1">

        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={14}
              className={
                star <= review.rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-stone-300 dark:text-stone-600"
              }
            />
          ))}
        </div>

        <div className="flex text-base gap flex-col">
          {/* <span className="font-semibold">Sharh: </span> */}
          <div>{review.text}</div>
        </div>

        {/* {showStylist && (
          <div className="flex text-base gap flex-col">
            <span className="font-semibold">Mutaxassis: </span>
            <div>{stylist?.name || "Noma'lum"}</div>
          </div>
        )} */}

        {showServices && review.services.length > 0 && (
          <div className="flex text-base gap flex-col">
            {/* <span className="font-semibold">Xizmatlar: </span> */}
            <div className="flex flex-wrap gap-1">
              {review.services.map((service, index) => (
                // <span key={index}>
                //   {service}
                //   {index < review.services.length - 1 && ","}
                // </span>
                <Chip size="lg" className="rounded-lg" key={index}>
                  {service}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {showActions && (
          <div className="flex gap-2">
            <Button
              isIconOnly
              size="sm"
              variant="secondary"
              className="rounded-xl"
              onPress={() => onLike?.(review.id)}
            >
              <ThumbsUpIcon size={16} />
            </Button>

            <Button
              isIconOnly
              size="sm"
              variant="secondary"
              className="rounded-xl"
              onPress={() => onDislike?.(review.id)}
            >
              <ThumbsDownIcon size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
