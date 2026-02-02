import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import type { Route } from "./+types/home";
import { AppLayout } from "~/components/AppLayout";
import {
  FeaturedSalonCard,
  type FeaturedSalon,
} from "~/components/FeaturedSalonCard";
import { SalonFeedCard, type SalonFeedData } from "~/components/SalonFeedCard";
import { StickyServicesHeader } from "~/components/StickyServicesHeader";
import { ServiceButton } from "~/components/ServiceButton";
import { SearchBar } from "~/components/SearchBar";
import { SectionHeader } from "~/components/SectionHeader";
import { useScrollProgress } from "~/hooks/useScrollProgress";
import { bottomNav } from "~/stores/bottomNav";
import { HomeSkeleton } from "~/components/skeletons";
import { useOnboardingStore } from "~/stores/onboarding-store";
import { useTestableLocation, getTestableLocation, useLocationStore } from "~/stores/location";
import { useI18nStore } from "~/stores/i18n-store";
import { useBusinessesStore } from "~/stores/businesses";
import { getNearestBusinesses, getBusinessDetails, type NearestBusiness } from "~/lib/business-api";
import { MapPin, Star } from "lucide-react";
import { ReviewsModal } from "~/components/ReviewsModal";
import { queryClient } from "~/lib/query-client";

// Pagination constants
const INITIAL_PAGE_SIZE = 3;
const LOAD_MORE_SIZE = 3;

// Hook to detect if element is in viewport
function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect(); // Once seen, stop observing
        }
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, isInView };
}

// Helper to format distance with fallback
const formatDistance = (distance?: number, metric?: string) => {
  if (distance == null) return null;
  const unit = metric || "km";
  // Round down: < 1km to nearest 0.05, >= 1km to nearest 0.1
  const rounded = distance < 1
    ? Math.floor(distance * 20) / 20  // 0.87 → 0.85
    : Math.floor(distance * 10) / 10; // 3.54 → 3.5
  return `${rounded}${unit}`;
};

// Lazy loading card wrapper - only calculates distance when visible
function LazySalonCard({
  business,
  language,
  t,
  onClick,
  onBookClick,
  onReviewsClick,
  onHover,
}: {
  business: NearestBusiness;
  language: "uz" | "ru";
  t: (key: string) => string;
  onClick: () => void;
  onBookClick: () => void;
  onReviewsClick: (salon: SalonFeedData) => void;
  onHover: () => void;
}) {
  const { ref, isInView } = useInView();

  // Only compute distance when card is in view
  const salon = useMemo(() => {
    const services = business.services || [];
    const serviceNames = services.slice(0, 3).map((s) => s.name?.[language] || s.name?.uz || "");
    const remainingCount = Math.max(0, services.length - 3);

    // Only calculate distance if in view
    const distanceText = isInView ? formatDistance(business.distance, business.distance_metric) : undefined;

    const businessId = business.business_id || business.business_name || "unknown";
    const businessName = business.business_name || "Unknown";

    return {
      id: businessId,
      name: businessName,
      image: business.avatar_url || undefined,
      address: business.location?.display_address || (distanceText ? `${distanceText} ${t('home.fromYou')}` : ""),
      services: remainingCount > 0
        ? [...serviceNames, `+${remainingCount}`]
        : serviceNames,
      likes: 75,
      rating: 4.5,
      comments: 12,
      distance: distanceText ?? undefined,
      businessLocation: business.location ? { lat: business.location.lat, lng: business.location.lng } : undefined,
    } satisfies SalonFeedData;
  }, [business, language, t, isInView]);

  return (
    <div
      ref={ref}
      onMouseEnter={onHover}
      onTouchStart={onHover}
    >
      <SalonFeedCard
        salon={salon}
        onClick={onClick}
        onBookClick={onBookClick}
        onLikeClick={() => console.log(`Like: ${salon.name}`)}
        onNavigateClick={() => console.log(`Navigate: ${salon.name}`)}
        onReviewsClick={() => onReviewsClick(salon)}
      />
    </div>
  );
}

// Import service icons
import scissorIcon from "~/assets/icons/scissor.png";
import makeupIcon from "~/assets/icons/makeup.png";
import dyeIcon from "~/assets/icons/dye.png";
import massageIcon from "~/assets/icons/massage.png";
import shavingBrushIcon from "~/assets/icons/shaving-brush.png";
import creamIcon from "~/assets/icons/cream.png";
import pluckingIcon from "~/assets/icons/plucking.png";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "BLYSS - Go'zallik Salonlari" },
    { name: "description", content: "Eng yaqin go'zallik salonlarini toping" },
  ];
}

// Default Tashkent coordinates if location not available
const DEFAULT_LOCATION = { lat: 41.2995, lng: 69.2401 };

// Prefetch first page of businesses during navigation
export async function clientLoader() {
  const location = getTestableLocation();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["nearestBusinesses", location?.lat, location?.lon],
    queryFn: async () => {
      const result = await getNearestBusinesses({
        lat: location?.lat ?? DEFAULT_LOCATION.lat,
        lng: location?.lon ?? DEFAULT_LOCATION.lng,
        radius: 1000,
        page: 1,
        page_size: INITIAL_PAGE_SIZE,
      });
      return result;
    },
    initialPageParam: 1,
  });

  return null;
}

export default function Home() {
  const navigate = useNavigate();
  const { ref: servicesRef, scrollProgress } = useScrollProgress();
  const [reviewsSalon, setReviewsSalon] = useState<SalonFeedData | null>(null);
  const clearOnboardingData = useOnboardingStore((state) => state.clearData);
  const location = useTestableLocation();
  const { t, language } = useI18nStore();
  const cachedBusinesses = useBusinessesStore((state) => state.businesses);
  const setBusinesses = useBusinessesStore((state) => state.setBusinesses);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // All services for sticky header - using translations
  const allServices = useMemo(() => [
    { id: "1", name: t('service.haircut'), icon: scissorIcon, badge: null },
    { id: "4", name: t('service.beard'), icon: shavingBrushIcon },
    { id: "3", name: t('service.coloring'), icon: dyeIcon },
    { id: "2", name: t('service.makeup'), icon: makeupIcon, badge: "-30%" },
    { id: "5", name: t('service.skincare'), icon: creamIcon },
    { id: "6", name: t('service.epilation'), icon: pluckingIcon },
    { id: "7", name: t('service.massage'), icon: massageIcon },
  ], [t]);

  // Fetch nearest businesses using React Query with infinite scroll
  const {
    data,
    isLoading: isLoadingBusinesses,
    isFetchingNextPage,
    error: businessError,
    refetch,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["nearestBusinesses", location?.lat, location?.lon],
    queryFn: async ({ pageParam = 1 }) => {
      const pageSize = pageParam === 1 ? INITIAL_PAGE_SIZE : LOAD_MORE_SIZE;
      const result = await getNearestBusinesses({
        lat: location?.lat ?? DEFAULT_LOCATION.lat,
        lng: location?.lon ?? DEFAULT_LOCATION.lng,
        radius: 1000,
        page: pageParam,
        page_size: pageSize,
      });
      return result;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.has_next) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    placeholderData: keepPreviousData,
  });

  // Flatten all pages into a single array of businesses
  const businesses = useMemo(() => {
    if (!data?.pages) return [];
    const allBusinesses = data.pages.flatMap(page => page.data || []);
    return allBusinesses.filter(b => b.business_id);
  }, [data]);

  // Update cache when businesses change
  useEffect(() => {
    if (businesses.length > 0) {
      setBusinesses(businesses);
    }
  }, [businesses, setBusinesses]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Show skeleton only if loading AND no cached data
  const showSkeleton = isLoadingBusinesses && cachedBusinesses.length === 0;

  const fetchLocation = useLocationStore((state) => state.fetchLocation);

  // Show bottom nav, clear onboarding data, and fetch location when home page mounts
  useEffect(() => {
    bottomNav.show();
    clearOnboardingData();
    fetchLocation();
  }, []);

  // Map businesses to FeaturedSalon format
  const nearestSalons = useMemo(() => {
    return businesses.slice(0, 5).map((business, index) => {
      // Get services and format them based on language
      const services = business.services || [];
      const serviceNames = services.slice(0, 2).map((s) => s.name?.[language] || s.name?.uz || "");
      const remainingCount = Math.max(0, services.length - 2);

      // Format distance using API-provided metric
      const distanceText = formatDistance(business.distance, business.distance_metric);

      // Use business_id if available, otherwise fallback to business_name or index
      const businessId = business.business_id || business.business_name || `business-${index}`;
      const businessName = business.business_name || "Unknown";

      return {
        id: businessId,
        name: businessName,
        image: business.avatar_url || undefined,
        services: remainingCount > 0
          ? [...serviceNames, `+${remainingCount}`]
          : serviceNames,
        address: business.location?.display_address || (distanceText ? `${distanceText} ${t('home.fromYou')}` : ""),
        rating: 4.5,
        reviewCount: "1.2k",
        isFavorite: false,
      } satisfies FeaturedSalon;
    });
  }, [businesses, language, t]);

  // Show sticky header when scrolled past 50%
  const showStickyHeader = scrollProgress > 0.5;

  const handleServiceClick = (service: { id: string; name: string }) => {
    console.log(`Selected service: ${service.name}`);
  };

  const handleSalonClick = (salon: FeaturedSalon | SalonFeedData) => {
    navigate(`/salon/${salon.id}`);
  };

  const handleFavoriteToggle = (salon: FeaturedSalon) => {
    console.log(`Toggle favorite: ${salon.name}`);
  };

  const handleBookClick = (salon: SalonFeedData) => {
    navigate(`/salon/${salon.id}`);
  };

  const handleReviewsClick = (salon: SalonFeedData) => {
    setReviewsSalon(salon);
  };

  // Prefetch salon details on hover for faster navigation
  const handleSalonHover = (businessId: string) => {
    queryClient.prefetchQuery({
      queryKey: ["business", businessId],
      queryFn: () => getBusinessDetails(businessId),
    });
  };

  return (
    <AppLayout>
      <div>
        <StickyServicesHeader
          services={allServices}
          isVisible={showStickyHeader}
          onServiceClick={handleServiceClick}
        />

        {/* Header with Search */}
        <div className="px-4 py-6">
          <SearchBar
            placeholder={t('home.search')}
            onFocus={() => navigate("/search")}
            onFilterClick={() => console.log("Filter clicked")}
          />
        </div>

        {/* Services Section */}
        <div className="px-4 mb-4">
          <div
            ref={servicesRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2"
          >
            {allServices.map((service) => (
              <ServiceButton
                key={service.id}
                icon={service.icon}
                name={service.name}
                onClick={() => handleServiceClick(service)}
              />
            ))}
          </div>

          {/* Scroll indicator dots */}
          {/* <div className="flex items-center justify-center gap-1.5 pt-3">
            <span className="size-2 rounded-full bg-stone-800 dark:bg-stone-200" />
            <span className="size-1.5 rounded-full bg-stone-300 dark:bg-stone-600" />
            <span className="size-1.5 rounded-full bg-stone-300 dark:bg-stone-600" />
          </div> */}
        </div>

        {/* Featured Salon Section */}
        {/* <div className="mt-6 mb-6 bg-gradient-to-br from-stone-100 via-stone-100 to-stone-50 dark:from-stone-800 dark:via-stone-800 dark:to-stone-900 rounded-3xl pt-4 overflow-hidden">
          <SectionHeader
            title={t('home.nearestSalons')}
            actionLabel={t('home.viewAll')}
            onActionClick={() => console.log("View all salons")}
            className="px-4 mb-4"
          />

          {isLoadingBusinesses ? (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pl-4 pr-3 pb-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="min-w-[280px] h-[200px] bg-stone-200 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : businessError ? (
            <div className="px-4 pb-4">
              <p className="text-red-500 text-sm mb-2">{t('home.loadError')}</p>
              <button
                onClick={() => refetch()}
                className="text-primary text-sm font-medium"
              >
                {t('home.retry')}
              </button>
            </div>
          ) : nearestSalons.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pl-4 pr-3 pb-4 overflow-hidden">
              {nearestSalons.map((salon) => (
                <FeaturedSalonCard
                  key={salon.id}
                  salon={salon}
                  onClick={() => handleSalonClick(salon)}
                  onFavoriteToggle={() => handleFavoriteToggle(salon)}
                />
              ))}
            </div>
          ) : (
            <div className="px-4 pb-4 text-center text-stone-500 text-sm h-72 flex items-center justify-center">
              {t('home.noSalonsNearby')}
            </div>
          )}
        </div> */}

        {/* Salon Feed */}
        <div className="flex flex-col">
          {showSkeleton ? (
            <>
              {[1].map((i) => (
                <div key={i} className="flex flex-col p-0 w-full">
                  {/* Image skeleton */}
                  <div className="px-2">
                    <div className="rounded-2xl overflow-hidden w-full">
                      <div className="h-48 mb-0.5 w-full bg-stone-200 dark:bg-stone-800 animate-pulse" />
                      <div className="grid grid-cols-4 gap-0.5">
                        {[1, 2, 3, 4].map((j) => (
                          <div key={j} className="aspect-square bg-stone-200 dark:bg-stone-800 animate-pulse" />
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Info skeleton */}
                  <div className="grid grid-cols-12 gap-2 px-2 pt-2">
                    <div className="col-span-8 px-2 py-1">
                      <div className="h-5 w-32 bg-stone-200 dark:bg-stone-800 rounded animate-pulse mb-2" />
                      <div className="h-4 w-48 bg-stone-200 dark:bg-stone-800 rounded animate-pulse" />
                    </div>
                    <div className="col-span-4 py-1">
                      <div className="h-10 w-full bg-stone-200 dark:bg-stone-800 rounded-xl animate-pulse" />
                    </div>
                  </div>
                  {/* Action buttons skeleton */}
                  <div className="pb-8 mt-3">
                    <div className="px-3 flex items-center gap-2 w-full h-8">
                      <div className="h-8 w-16 bg-stone-200 dark:bg-stone-800 rounded-full animate-pulse" />
                      <div className="h-8 w-16 bg-stone-200 dark:bg-stone-800 rounded-full animate-pulse" />
                      <div className="h-8 w-20 bg-stone-200 dark:bg-stone-800 rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : businessError ? (
            <div className="px-4 py-8 text-center">
              <p className="text-red-500 text-sm mb-2">{t('home.loadError')}</p>
              <button
                onClick={() => refetch()}
                className="text-primary text-sm font-medium"
              >
                {t('home.retry')}
              </button>
            </div>
          ) : businesses.length > 0 ? (
            <div>
              {businesses.map((business) => (
                <LazySalonCard
                  key={business.business_id || business.business_name}
                  business={business}
                  language={language}
                  t={t}
                  onClick={() => navigate(`/salon/${business.business_id}`)}
                  onBookClick={() => navigate(`/salon/${business.business_id}`)}
                  onReviewsClick={handleReviewsClick}
                  onHover={() => handleSalonHover(business.business_id || "")}
                />
              ))}

              {/* Load more trigger */}
              <div ref={loadMoreRef} className="py-4">
                {isFetchingNextPage && (
                  <>
                    {[1].map((i) => (
                      <div key={i} className="flex flex-col p-0 w-full">
                        {/* Image skeleton */}
                        <div className="px-2">
                          <div className="rounded-2xl overflow-hidden w-full">
                            <div className="h-48 mb-0.5 w-full bg-stone-200 dark:bg-stone-800 animate-pulse" />
                            <div className="grid grid-cols-4 gap-0.5">
                              {[1, 2, 3, 4].map((j) => (
                                <div key={j} className="aspect-square bg-stone-200 dark:bg-stone-800 animate-pulse" />
                              ))}
                            </div>
                          </div>
                        </div>
                        {/* Info skeleton */}
                        <div className="grid grid-cols-12 gap-2 px-2 pt-2">
                          <div className="col-span-8 px-2 py-1">
                            <div className="h-5 w-32 bg-stone-200 dark:bg-stone-800 rounded animate-pulse mb-2" />
                            <div className="h-4 w-48 bg-stone-200 dark:bg-stone-800 rounded animate-pulse" />
                          </div>
                          <div className="col-span-4 py-1">
                            <div className="h-10 w-full bg-stone-200 dark:bg-stone-800 rounded-xl animate-pulse" />
                          </div>
                        </div>
                        {/* Action buttons skeleton */}
                        <div className="pb-8 mt-3">
                          <div className="px-3 flex items-center gap-2 w-full h-8">
                            <div className="h-8 w-16 bg-stone-200 dark:bg-stone-800 rounded-full animate-pulse" />
                            <div className="h-8 w-16 bg-stone-200 dark:bg-stone-800 rounded-full animate-pulse" />
                            <div className="h-8 w-20 bg-stone-200 dark:bg-stone-800 rounded-full animate-pulse" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-stone-500 text-sm">
            </div>
          )}
        </div>
      </div>

      {/* Single Reviews Modal for all salon cards */}
      <ReviewsModal
        isOpen={reviewsSalon !== null}
        onClose={() => setReviewsSalon(null)}
        salonName={reviewsSalon?.name ?? ""}
        rating={reviewsSalon?.rating ?? 0}
        reviewCount={reviewsSalon?.comments ?? 0}
        reviews={reviewsSalon?.reviews ?? []}
        stylists={reviewsSalon?.stylists}
      />
    </AppLayout>
  );
}

// Loading state shown while the route is loading
export function HydrateFallback() {
  return (
    <AppLayout>
      <HomeSkeleton />
    </AppLayout>
  );
}
