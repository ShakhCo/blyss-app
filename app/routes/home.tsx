import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
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
import { MapPin, Star } from "lucide-react";
import { useUserStore } from "~/stores/user-store";
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

const nearestSalons: (FeaturedSalon & { lat: number; lng: number })[] = [
  {
    id: "1",
    name: "Shark Barbershop",
    image:
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=400&fit=crop",
    services: ["Soch", "Soqol", "2+"],
    address: "Navoiy ko'chasi, 25",
    rating: 4.8,
    reviewCount: "3.1k",
    isFavorite: true,
    lat: 41.311081,
    lng: 69.240562,
  },
  {
    id: "2",
    name: "Boss Barbershop",
    image:
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=400&fit=crop",
    services: ["Soch", "Soqol", "Teri"],
    address: "Amir Temur shoh ko'chasi, 108",
    rating: 4.7,
    reviewCount: "2.7k",
    isFavorite: false,
    lat: 41.314472,
    lng: 69.248123,
  },
  {
    id: "3",
    name: "Malika Go'zallik Saloni",
    image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop",
    services: ["Pardoz", "Soch", "Spa"],
    address: "Bobur ko'chasi, 42",
    rating: 4.9,
    reviewCount: "1.8k",
    isFavorite: false,
    lat: 41.308234,
    lng: 69.253891,
  },
];

const feedSalons: SalonFeedData[] = nearestSalons.map((salon) => {
  const salonDetail = salonsData[salon.id];
  return {
    id: salon.id,
    name: salon.name,
    image: salon.image,
    address: salon.address,
    likes: 75,
    rating: salon.rating,
    comments: salonDetail?.reviews.length ?? 0,
    distance: "2.4km sizdan",
    gallery: salonDetail?.gallery,
    reviews: salonDetail?.reviews,
    stylists: salonDetail?.stylists,
  };
});

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const { ref: servicesRef, scrollProgress } = useScrollProgress();
  const user = useUserStore((state) => state.user);
  const [reviewsSalon, setReviewsSalon] = useState<SalonFeedData | null>(null);

  // Show bottom nav when home page mounts
  useEffect(() => {
    bottomNav.show();
  }, []);

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
        </div>

        {/* Salon Feed */}
        <div className="flex flex-col">
          {[...feedSalons, ...feedSalons, ...feedSalons].map((salon, index) => (
            <SalonFeedCard
              key={`${salon.id}-${index}`}
              salon={salon}
              onClick={() => handleSalonClick(salon)}
              onBookClick={() => handleBookClick(salon)}
              onLikeClick={() => console.log(`Like: ${salon.name}`)}
              onNavigateClick={() => console.log(`Navigate: ${salon.name}`)}
              onReviewsClick={() => handleReviewsClick(salon)}
            />
          ))}
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
