import { useState, useMemo, useEffect } from "react";
import { useOutletContext, useBlocker } from "react-router";
import { Star, Check, ChevronDown, ThumbsUpIcon, ThumbsDownIcon } from "lucide-react";
import { BottomSheet } from "~/components/BottomSheet";
import type { SalonContext } from "./salon";
import { Button } from "@heroui/react";

type FilterType = "rating" | "service" | "stylist" | null;

export default function SalonReviews() {
  const { salon } = useOutletContext<SalonContext>();
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [stylistFilter, setStylistFilter] = useState<string>("all");
  const [openFilter, setOpenFilter] = useState<FilterType>(null);

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
      if (serviceFilter !== "all" && !review.services.includes(serviceFilter)) {
        return false;
      }
      if (stylistFilter !== "all" && review.stylistId !== stylistFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (ratingFilter === "high") return b.rating - a.rating;
      if (ratingFilter === "low") return a.rating - b.rating;
      return 0;
    });

  // Block back navigation when modal is open
  const blocker = useBlocker(openFilter !== null);

  useEffect(() => {
    if (blocker.state === "blocked") {
      setOpenFilter(null);
      blocker.reset();
    }
  }, [blocker]);

  const closeFilter = () => setOpenFilter(null);

  // Get display labels
  const getRatingLabel = () => {
    if (ratingFilter === "high") return "Eng yuqori";
    if (ratingFilter === "low") return "Eng past";
    return "Baho";
  };

  const getServiceLabel = () => {
    if (serviceFilter === "all") return "Xizmat";
    return serviceFilter;
  };

  const getStylistLabel = () => {
    if (stylistFilter === "all") return "Usta";
    const stylist = getStylist(stylistFilter);
    return stylist?.name || "Usta";
  };

  return (
    <div className="py-4 space-y-4">
      <div className="px-4">
        {/* Rating summary */}
        <div className="pt-2 flex items-center gap-4">
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

      </div>

      {/* Filter buttons - sticky */}
      <div className="z-30 bg-white dark:bg-stone-900 px-4 py-">
        <div className="grid grid-cols-11 gap-2">
          <button
            type="button"
            onClick={() => setOpenFilter("rating")}
            className={`col-span-3 flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${ratingFilter !== "all"
              ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
              : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
              }`}
          >
            <span className="truncate">{getRatingLabel()}</span>
            <ChevronDown size={14} className="shrink-0 ml-1" />
          </button>

          <button
            type="button"
            onClick={() => setOpenFilter("service")}
            className={`col-span-4 flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${serviceFilter !== "all"
              ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
              : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
              }`}
          >
            <span className="truncate">{getServiceLabel()}</span>
            <ChevronDown size={14} className="shrink-0 ml-1" />
          </button>

          <button
            type="button"
            onClick={() => setOpenFilter("stylist")}
            className={`col-span-4 flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${stylistFilter !== "all"
              ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
              : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
              }`}
          >
            <span className="truncate">{getStylistLabel()}</span>
            <ChevronDown size={14} className="shrink-0 ml-1" />
          </button>
        </div>
      </div>

      {/* Reviews list */}
      <div className="divide-y divide-stone-100 dark:divide-stone-800">
        {filteredReviews.map((review) => {
          const stylist = getStylist(review.stylistId);

          return (
            <div key={review.id} className="flex gap-4 px-4 py-4">
              <div className="w-12 h-12 shrink-0">
                <img
                  src={review.avatar}
                  alt={review.author}
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <div className="w-full flex flex-col gap-2">
                <div className="flex justify-between gap-1">
                  <div className="flex flex-col gap-1">
                    <span className="text-base font-semibold text-stone-900 dark:text-stone-100">
                      {review.author}
                    </span>
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
                  </div>
                  <div>
                    <p className="text-sm text-stone-600 dark:text-stone-300 mt-1">
                      {review.date}
                    </p>
                  </div>
                </div>

                <div className="flex text-sm gap flex-col mt-2">
                  <span className="font-semibold">Mutaxassis: </span>
                  <div>
                    {stylist?.name || "Noma'lum"}
                  </div>
                </div>

                <div className="flex text-sm gap flex-col mt-2">
                  <span className="font-semibold">Xizmatlar: </span>
                  <div>
                    {review.services.map(i => (
                      <span>{i}</span>
                    ))}
                  </div>
                </div>

                <div className="flex text-sm gap flex-col mt-2">
                  <span className="font-semibold">Sharh: </span>
                  <div>
                    {review.text}
                  </div>
                </div>

                <div className="flex gap-2">

                  <Button isIconOnly size="sm" variant="secondary" className={'rounded-xl'}>
                    <ThumbsUpIcon />
                  </Button>

                  <Button isIconOnly size="sm" variant="secondary" className={'rounded-xl'}>
                    <ThumbsDownIcon />
                  </Button>
                </div>
              </div>
            </div>
            // <div key={review.id} className="py-3 px-4">
            //   <div className="flex gap-3">
            //     <img
            //       src={review.avatar}
            //       alt={review.author}
            //       className="size-12 rounded-full object-cover"
            //     />
            //     <div className="flex items-start flex-col justify-start gap-1">
            //       <span className="font-semibold text-stone-900 dark:text-stone-100">
            //         {review.author}
            //       </span>
            //       <div className="flex items-center gap-0.5">
            //         {[1, 2, 3, 4, 5].map((star) => (
            //           <Star
            //             key={star}
            //             size={12}
            //             className={
            //               star <= review.rating
            //                 ? "fill-yellow-400 text-yellow-400"
            //                 : "text-stone-300 dark:text-stone-600"
            //             }
            //           />
            //         ))}
            //       </div>
            //     </div>
            //     <span className="ml-auto text-xs text-stone-400 dark:text-stone-500">
            //       {review.date}
            //     </span>
            //   </div>

            //   {/* <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            //     {review.services.join(", ")} {stylist && `· ${stylist.name}`}
            //   </p> */}

            //   <p className="text-stone-600 dark:text-stone-300 mt-1">
            //     {review.text}
            //   </p>
            // </div>
          );
        })}

        {filteredReviews.length === 0 && (
          <div className="py-8 text-center text-stone-500 dark:text-stone-400">
            Bu filtr bo'yicha sharhlar yo'q
          </div>
        )}
      </div>

      {/* Rating Filter BottomSheet */}
      <BottomSheet
        isOpen={openFilter === "rating"}
        onClose={closeFilter}
        title="Baho bo'yicha saralash"
        showCloseButton={false}
        maxHeight="auto"
      >
        <div className="py-2">
          {[
            { id: "high", label: "Eng yuqori" },
            { id: "low", label: "Eng past" },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setRatingFilter(option.id);
                closeFilter();
              }}
              className="w-full flex items-center justify-between px-2 py-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              <span className="text-base text-stone-900 dark:text-stone-100">{option.label}</span>
              {ratingFilter === option.id && (
                <Check size={18} className="text-primary" />
              )}
            </button>
          ))}
          {ratingFilter !== "all" && (
            <button
              type="button"
              onClick={() => {
                setRatingFilter("all");
                closeFilter();
              }}
              className="w-full mt-2 py-3 rounded-xl text-base font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              Tozalash
            </button>
          )}
        </div>
      </BottomSheet>

      {/* Service Filter BottomSheet */}
      <BottomSheet
        isOpen={openFilter === "service"}
        onClose={closeFilter}
        title="Xizmat bo'yicha filtrlash"
        showCloseButton={false}
        maxHeight="50vh"
      >
        <div className="py-2">
          {allServices.map((service) => (
            <button
              key={service}
              type="button"
              onClick={() => {
                setServiceFilter(service);
                closeFilter();
              }}
              className="w-full flex items-center justify-between px-2 py-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              <span className="text-base text-stone-900 dark:text-stone-100">{service}</span>
              {serviceFilter === service && (
                <Check size={18} className="text-primary" />
              )}
            </button>
          ))}
          {serviceFilter !== "all" && (
            <button
              type="button"
              onClick={() => {
                setServiceFilter("all");
                closeFilter();
              }}
              className="w-full mt-2 py-3 rounded-xl text-base font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              Tozalash
            </button>
          )}
        </div>
      </BottomSheet>

      {/* Stylist Filter BottomSheet */}
      <BottomSheet
        isOpen={openFilter === "stylist"}
        onClose={closeFilter}
        title="Usta bo'yicha filtrlash"
        showCloseButton={false}
        maxHeight="50vh"
      >
        <div className="py-2">
          {salon.stylists.map((stylist) => (
            <button
              key={stylist.id}
              type="button"
              onClick={() => {
                setStylistFilter(stylist.id);
                closeFilter();
              }}
              className="w-full flex items-center justify-between px-2 py-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <img
                  src={stylist.avatar}
                  alt={stylist.name}
                  className="size-12 rounded-full object-cover"
                />
                <div className="text-left">
                  <p className="text-base text-stone-900 dark:text-stone-100">{stylist.name}</p>
                  <p className="text-sm text-stone-500 dark:text-stone-400">{stylist.role}</p>
                </div>
              </div>
              {stylistFilter === stylist.id && (
                <Check size={18} className="text-primary" />
              )}
            </button>
          ))}
          {stylistFilter !== "all" && (
            <button
              type="button"
              onClick={() => {
                setStylistFilter("all");
                closeFilter();
              }}
              className="w-full mt-2 py-3 rounded-xl text-base font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              Tozalash
            </button>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}
