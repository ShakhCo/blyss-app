import { Button } from "@heroui/react";
import { useEffect } from "react";
import { BottomSheet } from "~/components/BottomSheet";
import { ReviewCard, type Review, type Stylist } from "~/components/ReviewCard";
import { bottomNav } from "~/stores/bottomNav";

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  salonName: string;
  rating: number;
  reviewCount: number | string;
  reviews: Review[];
  stylists?: Stylist[];
}

export function ReviewsModal({
  isOpen,
  onClose,
  salonName,
  rating,
  reviewCount,
  reviews,
  stylists = [],
}: ReviewsModalProps) {
  // Helper to find stylist by id
  const getStylist = (stylistId: string) => {
    return stylists.find((s) => s.id === stylistId);
  };

  // Hide bottom nav when modal opens, show when it closes
  useEffect(() => {
    if (isOpen) {
      bottomNav.hide();
    } else {
      bottomNav.show();
    }
  }, [isOpen]);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`${salonName}`}
      subtitle={`${reviewCount} ta sharh`}
      maxHeight="70vh"
    >
      <div className="relative">
        {/* Reviews list */}
        <div className="divide-y divide-stone-100 dark:divide-stone-800 -mx-4 pb-10">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              stylist={getStylist(review.stylistId)}
              showActions={false}
            />
          ))}

          {reviews.length === 0 && (
            <div className="py-8 text-center text-stone-500 dark:text-stone-400">
              Hali sharhlar yo'q
            </div>
          )}
        </div>
        <div className="fixed bottom-0 left-0 bg-white w-full pb-4 px-4 pt-2">
          <Button onClick={onClose} size="lg" className={'w-full'}>Yaxshi</Button>
        </div>
      </div>
    </BottomSheet>
  );
}
