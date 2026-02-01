import { Star } from "lucide-react";
import { useI18nStore } from "~/stores/i18n-store";

interface RatingDistribution {
  rating: number;
  percentage: number;
}

interface RatingSummaryProps {
  rating: number;
  reviewCount: number | string;
  distribution?: RatingDistribution[];
}

const defaultDistribution: RatingDistribution[] = [
  { rating: 5, percentage: 70 },
  { rating: 4, percentage: 20 },
  { rating: 3, percentage: 7 },
  { rating: 2, percentage: 3 },
  { rating: 1, percentage: 0 },
];

export function RatingSummary({
  rating,
  reviewCount,
  distribution = defaultDistribution,
}: RatingSummaryProps) {
  const { t } = useI18nStore();

  return (
    <div className="pt-2 flex items-center gap-4">
      <div className="text-center">
        <div className="text-4xl font-bold text-stone-900 dark:text-stone-100">
          {rating}
        </div>
        <div className="flex items-center gap-0.5 justify-center mt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={14}
              className={
                star <= Math.round(rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-stone-300 dark:text-stone-600"
              }
            />
          ))}
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          {t('reviews.count', { count: reviewCount })}
        </p>
      </div>

      <div className="flex-1 space-y-1.5">
        {distribution
          .sort((a, b) => b.rating - a.rating)
          .map(({ rating: r, percentage }) => (
            <div key={r} className="flex items-center gap-2">
              <span className="text-xs text-stone-500 w-3">{r}</span>
              <div className="flex-1 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
