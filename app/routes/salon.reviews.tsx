import { useOutletContext } from "react-router";
import { Star } from "lucide-react";
import type { SalonContext } from "./salon";

export default function SalonReviews() {
  const { salon } = useOutletContext<SalonContext>();

  return (
    <div className="p-4 space-y-4">
      {/* Rating summary */}
      <div className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-4 flex items-center gap-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-stone-900 dark:text-stone-100">
            {salon.rating}
          </div>
          <div className="flex items-center gap-0.5 justify-center mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={14}
                className={
                  star <= Math.round(salon.rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-stone-300 dark:text-stone-600"
                }
              />
            ))}
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {salon.reviewCount} ta sharh
          </p>
        </div>
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-2">
              <span className="text-xs text-stone-500 w-3">{rating}</span>
              <div className="flex-1 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full"
                  style={{
                    width: rating === 5 ? "70%" : rating === 4 ? "20%" : rating === 3 ? "7%" : "3%",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-3">
        {salon.reviews.map((review) => (
          <div
            key={review.id}
            className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-4"
          >
            <div className="flex items-start gap-3">
              <img
                src={review.avatar}
                alt={review.author}
                className="size-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-stone-900 dark:text-stone-100">
                    {review.author}
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    {review.date}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={12}
                      className={
                        star <= review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-stone-300 dark:text-stone-600"
                      }
                    />
                  ))}
                </div>
                <p className="text-sm text-stone-600 dark:text-stone-300 mt-2">
                  {review.text}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
