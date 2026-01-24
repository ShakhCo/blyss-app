import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
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
import { useLocationStore } from "~/stores/location";
import { getNearestBusinesses, getDistance, type Business } from "~/lib/business-api";
import { MapPin, Star } from "lucide-react";
import { ReviewsModal } from "~/components/ReviewsModal";
import { salonsData } from "./salon";

// Import service icons
import scissorIcon from "~/assets/icons/scissor.png";
import makeupIcon from "~/assets/icons/makeup.png";
import dyeIcon from "~/assets/icons/dye.png";
import massageIcon from "~/assets/icons/massage.png";
import shavingBrushIcon from "~/assets/icons/shaving-brush.png";
import creamIcon from "~/assets/icons/cream.png";
import pluckingIcon from "~/assets/icons/plucking.png";

// All services for sticky header
const allServices = [
  { id: "1", name: "Soch olish", icon: scissorIcon, badge: null },
  { id: "4", name: "Soqol", icon: shavingBrushIcon },
  { id: "3", name: "Bo'yash", icon: dyeIcon },
  { id: "2", name: "Pardoz", icon: makeupIcon, badge: "-30%" },
  { id: "5", name: "Teri", icon: creamIcon },
  { id: "6", name: "Epilyatsiya", icon: pluckingIcon },
  { id: "7", name: "Massaj", icon: massageIcon },
];

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "BLYSS - Go'zallik Salonlari" },
    { name: "description", content: "Eng yaqin go'zallik salonlarini toping" },
  ];
}

// Default Tashkent coordinates if location not available
const DEFAULT_LOCATION = { lat: 41.2995, lng: 69.2401 };

export default function Home() {
  const navigate = useNavigate();
  const { ref: servicesRef, scrollProgress } = useScrollProgress();
  const [reviewsSalon, setReviewsSalon] = useState<SalonFeedData | null>(null);
  const clearOnboardingData = useOnboardingStore((state) => state.clearData);
  const { lat, lon } = useLocationStore();

  // Fetch nearest businesses using React Query
  const { data: businessesResponse, isLoading: isLoadingBusinesses, error: businessError, refetch } = useQuery({
    queryKey: ["nearestBusinesses", lat, lon],
    queryFn: async () => {
      const result = await getNearestBusinesses({
        lat: lat ?? DEFAULT_LOCATION.lat,
        lng: lon ?? DEFAULT_LOCATION.lng,
        radius: 100,
        page: 1,
        page_size: 20,
      });

      const userLat = lat ?? DEFAULT_LOCATION.lat;
      const userLng = lon ?? DEFAULT_LOCATION.lng;

      // Fetch accurate distances for each business
      const businessWithDistances = await Promise.all(
        result.data.map(async (business) => {
          try {
            const distanceResult = await getDistance({
              userLocation: { lat: userLat, lng: userLng },
              businessLocation: { lat: business.location.lat, lng: business.location.lng },
            });
            // Convert distance to km if API returns meters
            const distanceInKm = distanceResult.metric === 'm'
              ? distanceResult.distance / 1000
              : distanceResult.distance;
            return { ...business, distance: distanceInKm };
          } catch {
            // If distance fetch fails, keep the original distance
            return business;
          }
        })
      );

      return businessWithDistances;
    },
  });

  const businesses = businessesResponse ?? [];

  // Show bottom nav and clear onboarding data when home page mounts
  useEffect(() => {
    bottomNav.show();
    clearOnboardingData();
  }, []);

  // Map businesses to FeaturedSalon format
  const nearestSalons = useMemo(() => {
    return businesses.slice(0, 5).map((business) => {
      // Get active services and format them
      const activeServices = business.services.filter((s) => s.is_active);
      const serviceNames = activeServices.slice(0, 2).map((s) => s.name);
      const remainingCount = activeServices.length - 2;

      // Format distance: show meters if < 1km, otherwise km
      const distanceValue = Math.round(business.distance * 10) / 10;
      const distanceText = distanceValue < 1
        ? `${Math.round(business.distance * 1000)}m`
        : `${distanceValue}km`;

      return {
        id: business.id,
        name: business.business_name,
        image: `https://images.fresha.com/lead-images/placeholders/beauty-salon-91.jpg?class=venue-gallery-mobile`,
        services: remainingCount > 0
          ? [...serviceNames, `+${remainingCount}`]
          : serviceNames,
        address: `${distanceText} sizdan`,
        rating: 4.5,
        reviewCount: "1.2k",
        isFavorite: false,
      } satisfies FeaturedSalon;
    });
  }, [businesses]);

  // Map businesses to SalonFeedData format
  const feedSalons = useMemo(() => {
    return businesses.map((business) => {
      const salonDetail = salonsData[business.id];
      // Get active services and format them
      const activeServices = business.services.filter((s) => s.is_active);
      const serviceNames = activeServices.slice(0, 3).map((s) => s.name);
      const remainingCount = activeServices.length - 3;

      // Format distance: show meters if < 1km, otherwise km
      const distanceValue = Math.round(business.distance * 10) / 10;
      const distanceText = distanceValue < 1
        ? `${Math.round(business.distance * 1000)}m`
        : `${distanceValue}km`;

      return {
        id: business.id,
        name: business.business_name,
        image: `https://images.fresha.com/lead-images/placeholders/beauty-salon-91.jpg?class=venue-gallery-mobile`,
        address: `${distanceText} sizdan`,
        services: remainingCount > 0
          ? [...serviceNames, `+${remainingCount}`]
          : serviceNames,
        likes: 75,
        rating: 4.5,
        comments: salonDetail?.reviews.length ?? 12,
        distance: `${distanceText} sizdan`,
        gallery: salonDetail?.gallery,
        reviews: salonDetail?.reviews,
        stylists: salonDetail?.stylists,
      } satisfies SalonFeedData;
    });
  }, [businesses]);

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
            placeholder="Qidirish..."
            onFocus={() => navigate("/search")}
            onFilterClick={() => console.log("Filter clicked")}
          />
        </div>

        {/* Services Section */}
        <div className="px-4">
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
          <div className="flex items-center justify-center gap-1.5 pt-3">
            <span className="size-2 rounded-full bg-stone-800 dark:bg-stone-200" />
            <span className="size-1.5 rounded-full bg-stone-300 dark:bg-stone-600" />
            <span className="size-1.5 rounded-full bg-stone-300 dark:bg-stone-600" />
          </div>
        </div>

        {/* Featured Salon Section */}
        <div className="mt-6 mb-6 bg-gradient-to-br from-stone-100 via-stone-100 to-stone-50 dark:from-stone-800 dark:via-stone-800 dark:to-stone-900 rounded-3xl pt-4 overflow-hidden">
          <SectionHeader
            title="Eng yaqin salonlar"
            actionLabel="Barchasini ko'rish"
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
              <p className="text-red-500 text-sm mb-2">Salonlarni yuklashda xatolik</p>
              <button
                onClick={() => refetch()}
                className="text-primary text-sm font-medium"
              >
                Qayta urinish
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
              Yaqin atrofda salon topilmadi
            </div>
          )}
        </div>

        {/* Salon Feed */}
        <div className="flex flex-col">
          {isLoadingBusinesses ? (
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-full h-[280px] bg-stone-100 animate-pulse"
                />
              ))}
            </>
          ) : businessError ? (
            <div className="px-4 py-8 text-center">
              <p className="text-red-500 text-sm mb-2">Salonlarni yuklashda xatolik</p>
              <button
                onClick={() => refetch()}
                className="text-primary text-sm font-medium"
              >
                Qayta urinish
              </button>
            </div>
          ) : feedSalons.length > 0 ? (
            feedSalons.map((salon) => (
              <SalonFeedCard
                key={salon.id}
                salon={salon}
                onClick={() => handleSalonClick(salon)}
                onBookClick={() => handleBookClick(salon)}
                onLikeClick={() => console.log(`Like: ${salon.name}`)}
                onNavigateClick={() => console.log(`Navigate: ${salon.name}`)}
                onReviewsClick={() => handleReviewsClick(salon)}
              />
            ))
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
