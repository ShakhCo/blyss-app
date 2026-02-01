import { useState, useMemo } from "react";
import { useOutletContext } from "react-router";
import type { SalonContext } from "./salon";
import { ReviewCard } from "~/components/ReviewCard";
import { ReviewFilters, type ReviewFiltersState } from "~/components/ReviewFilters";
import { RatingSummary } from "~/components/RatingSummary";
import { useI18nStore } from "~/stores/i18n-store";

export default function SalonReviews() {
  const { salon } = useOutletContext<SalonContext>();
  const { t } = useI18nStore();
  const [filters, setFilters] = useState<ReviewFiltersState>({
    rating: "all",
    service: "all",
    stylist: "all",
  });

  // Helper to find stylist by id
  const getStylist = (stylistId: string) => {
    return salon.stylists.find((s) => s.id === stylistId);
  };

  // Get unique services from all reviews
  const allServices = useMemo(() => {
    const services = new Set<string>();
    salon.reviews.forEach((review) => {
      review.services.forEach((service) => services.add(service));
    });
    return Array.from(services);
  }, [salon.reviews]);

  // Filter and sort reviews
  const filteredReviews = salon.reviews
    .filter((review) => {
      if (filters.service !== "all" && !review.services.includes(filters.service)) {
        return false;
      }
      if (filters.stylist !== "all" && review.stylistId !== filters.stylist) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (filters.rating === "high") return b.rating - a.rating;
      if (filters.rating === "low") return a.rating - b.rating;
      return 0;
    });

  const handleLike = (reviewId: string) => {
    console.log("Like review:", reviewId);
  };

  const handleDislike = (reviewId: string) => {
    console.log("Dislike review:", reviewId);
  };

  return (
    <div className="py-4 space-y-4">
      <div className="px-4">
        <RatingSummary rating={salon.rating} reviewCount={salon.reviewCount} />
      </div>

      {/* Filter buttons */}
      <ReviewFilters
        services={allServices}
        stylists={salon.stylists}
        value={filters}
        onChange={setFilters}
      />

      {/* Reviews list */}
      <div className="divide-y divide-stone-100 dark:divide-stone-800">
        {filteredReviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            stylist={getStylist(review.stylistId)}
            onLike={handleLike}
            onDislike={handleDislike}
          />
        ))}

        {filteredReviews.length === 0 && (
          <div className="py-8 text-center text-stone-500 dark:text-stone-400">
            {t('salon.noReviews')}
          </div>
        )}
      </div>
    </div>
  );
}
