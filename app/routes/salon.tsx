import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@heroui/react";
import { AppLayout } from "~/components/AppLayout";
import type { Route } from "./+types/salon";
import { bottomNav } from "~/stores/bottomNav";
import { bookingUI, bookingCart } from "~/stores/booking";
import { Star, Clock, MapPin, Phone, ChevronDown } from "lucide-react";
import { getBusinessDetails, type BusinessDetailsResponse, type WorkingHours } from "~/lib/business-api";
import { Logo } from "~/components/icons/Logo";
import { useSafeAreaValues } from "~/hooks/useSafeAreaValues";
import { useI18nStore } from "~/stores/i18n-store";
import { queryClient } from "~/lib/query-client";
import { BottomSheet } from "~/components/BottomSheet";
import { SlidePanel } from "~/components/SlidePanel";
import { ReviewCard } from "~/components/ReviewCard";
import { ReviewFilters, type ReviewFiltersState } from "~/components/ReviewFilters";
import { RatingSummary } from "~/components/RatingSummary";

// Mock salon data - shared across all salon routes
export const salonsData: Record<string, {
  id: string;
  name: string;
  image?: string;
  gallery: string[];
  rating: number;
  reviewCount: string;
  address: string;
  phone: string;
  workingHours: string;
  weeklyHours: Array<{ day: string; hours: string; isOpen: boolean }>;
  description: string;
  services: Array<{
    id: string;
    name: string;
    duration: string;
    price: string;
    category: string;
  }>;
  amenities: string[];
  stylists: Array<{
    id: string;
    name: string;
    avatar: string;
    role: string;
  }>;
  reviews: Array<{
    id: string;
    author: string;
    avatar: string;
    rating: number;
    date: string;
    text: string;
    services: string[];
    stylistId: string;
  }>;
}> = {
  "1": {
    id: "1",
    name: "Shark Barbershop",
    image: "https://yonolighting.com/wp-content/uploads/2024/09/Top-10-Best-Lighting-Ideas-for-Your-Barber-Shop.webp",
    gallery: [
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1593702288056-7927b442d0fa?w=400&h=400&fit=crop",
    ],
    rating: 4.8,
    reviewCount: "3.1k",
    address: "Navoiy ko'chasi, 25, Toshkent",
    phone: "+998 90 123 45 67",
    workingHours: "09:00 - 21:00",
    weeklyHours: [
      { day: "Dushanba", hours: "09:00 - 21:00", isOpen: true },
      { day: "Seshanba", hours: "09:00 - 21:00", isOpen: true },
      { day: "Chorshanba", hours: "09:00 - 21:00", isOpen: true },
      { day: "Payshanba", hours: "09:00 - 21:00", isOpen: true },
      { day: "Juma", hours: "09:00 - 21:00", isOpen: true },
      { day: "Shanba", hours: "10:00 - 20:00", isOpen: true },
      { day: "Yakshanba", hours: "Yopiq", isOpen: false },
    ],
    description: "Shark Barbershop - erkaklar uchun zamonaviy sartaroshxona. Bizning professional ustalarimiz sizga eng yaxshi soch turmagi va soqol parvarishini taqdim etadi.\n\nBiz 2018 yildan beri mijozlarimizga xizmat ko'rsatib kelmoqdamiz. Bizning maqsadimiz - har bir erkakni chiroyli va ishonchli his qilish.",
    services: [
      { id: "1", name: "Soch olish klassik", duration: "30 daqiqa", price: "40,000", category: "Soch" },
      { id: "2", name: "Soch olish premium", duration: "45 daqiqa", price: "60,000", category: "Soch" },
      { id: "4", name: "Soch bo'yash", duration: "1 soat", price: "80,000", category: "Soch" },
      { id: "6", name: "Soqol olish", duration: "20 daqiqa", price: "25,000", category: "Soqol" },
      { id: "10", name: "Soch + Soqol kombo", duration: "50 daqiqa", price: "70,000", category: "Soqol" },
      { id: "11", name: "Yuz tozalash", duration: "30 daqiqa", price: "50,000", category: "Teri" },
      { id: "12", name: "Yuz massaji", duration: "20 daqiqa", price: "35,000", category: "Teri" },
      { id: "13", name: "Qosh shakllantirish", duration: "15 daqiqa", price: "20,000", category: "Teri" },
    ],
    amenities: ["Wi-Fi", "Choy/Qahva", "Avtoturargoh", "Konditsioner", "PlayStation"],
    stylists: [
      { id: "s1", name: "Anvar", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop", role: "Senior barber" },
      { id: "s2", name: "Rustam", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop", role: "Barber" },
      { id: "s3", name: "Sherzod", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop", role: "Junior barber" },
    ],
    reviews: [
      {
        id: "1",
        author: "Jamshid A.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        rating: 5,
        date: "2 kun oldin",
        text: "Juda yaxshi barbershop! Soch olish sifati ajoyib, ustalar professional.",
        services: ["Soch olish klassik", "Soqol olish"],
        stylistId: "s1",
      },
      {
        id: "2",
        author: "Sardor K.",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
        rating: 5,
        date: "1 hafta oldin",
        text: "Fade soch olish zo'r bo'ldi. Aynan men xohlagan kabi chiqdi.",
        services: ["Fade soch olish"],
        stylistId: "s2",
      },
      {
        id: "3",
        author: "Bobur T.",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
        rating: 4,
        date: "2 hafta oldin",
        text: "Yaxshi joy, lekin dam olish kunlari odamlar ko'p.",
        services: ["Soch olish premium", "Yuz tozalash"],
        stylistId: "s3",
      },
    ],
  },
};

type TabType = "services" | "gallery" | "reviews" | "about";

type ServiceType = {
  id: string;
  name: string;
  duration: string;
  price: string;
  category: string;
};

const tabs: { id: TabType; index: number }[] = [
  { id: "services", index: 0 },
  { id: "gallery", index: 1 },
  { id: "reviews", index: 2 },
  { id: "about", index: 3 },
];

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Salon - Blyss" },
    { name: "description", content: "Salon ma'lumotlari" },
  ];
}

// Prefetch salon details during navigation
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const { id } = params;

  if (id) {
    await queryClient.prefetchQuery({
      queryKey: ["business", id],
      queryFn: () => getBusinessDetails(id),
    });
  }

  return null;
}

export default function SalonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useI18nStore();
  const { safeAreaValue, contentAreaValue } = useSafeAreaValues();

  // Tab state
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<1 | -1>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Service modal state
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  // Gallery modal state
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [galleryDragX, setGalleryDragX] = useState(0);
  const galleryStartXRef = useRef(0);
  const galleryIsDraggingRef = useRef(false);

  // Reviews filter state
  const [reviewFilters, setReviewFilters] = useState<ReviewFiltersState>({
    rating: "all",
    service: "all",
    stylist: "all",
  });

  // Touch tracking for tab swipe
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchMoveRef = useRef<{ x: number; y: number } | null>(null);
  const isHorizontalSwipeRef = useRef(false);

  // About section state
  const [isHoursExpanded, setIsHoursExpanded] = useState(false);

  // Build tabs with translated labels
  const tabsWithLabels = tabs.map(tab => ({
    ...tab,
    label: t(`salon.tabs.${tab.id}` as any),
  }));

  // Fetch business details using React Query
  const { data: businessData, isLoading, error } = useQuery({
    queryKey: ["business", id],
    queryFn: () => getBusinessDetails(id || ""),
    enabled: !!id,
  });

  // Hide bottom nav
  useEffect(() => {
    bottomNav.hide();
    bookingUI.reset();
    return () => {
      bottomNav.show();
    };
  }, []);

  // Helper to convert seconds to 24-hour time format
  const secondsTo24Hour = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  // Day name mapping
  const getDayName = (day: string): string => t(`day.${day}` as any);

  // Transform working hours from API format
  const transformWorkingHours = (workingHours: WorkingHours) => {
    const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
    return dayOrder.map(day => {
      const dayHours = workingHours[day];
      return {
        day: getDayName(day),
        hours: dayHours.is_open
          ? `${secondsTo24Hour(dayHours.start)} - ${secondsTo24Hour(dayHours.end)}`
          : t('salon.closed'),
        isOpen: dayHours.is_open,
      };
    });
  };

  // Get today's working hours string
  const getTodayWorkingHours = (workingHours: WorkingHours): string => {
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
    const today = new Date();
    const currentDay = dayNames[today.getDay()];
    const dayHours = workingHours[currentDay];
    if (!dayHours.is_open) return t('salon.closed');
    return `${secondsTo24Hour(dayHours.start)} - ${secondsTo24Hour(dayHours.end)}`;
  };

  // Transform API data to match the expected salon format
  const salon = businessData ? {
    id: businessData.business_id || id || "",
    name: businessData.business_name || "Unknown",
    image: businessData.avatar_url || undefined,
    gallery: [],
    rating: 4.5,
    reviewCount: "1.2k",
    address: businessData.business_location?.display_address || businessData.business_location?.city || "Toshkent",
    phone: businessData.business_phone_number || "",
    workingHours: businessData.working_hours ? getTodayWorkingHours(businessData.working_hours) : "",
    weeklyHours: businessData.working_hours ? transformWorkingHours(businessData.working_hours) : [],
    description: "",
    services: (businessData.services || []).map(s => ({
      id: s.id || "",
      name: s.name?.[language] || s.name?.uz || "",
      duration: s.duration_minutes ? `${s.duration_minutes} ${t('common.minutes')}` : "",
      price: s.price?.toLocaleString() || "0",
      category: "General",
    })),
    amenities: [],
    stylists: [],
    reviews: [],
  } : salonsData["1"];

  const handleTabClick = (index: number) => {
    setSwipeDirection(index > activeTabIndex ? 1 : -1);
    setActiveTabIndex(index);
  };

  // Touch event handlers for tab swipe
  const handleTabTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    touchMoveRef.current = null;
    isHorizontalSwipeRef.current = false;
  };

  const handleTabTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    touchMoveRef.current = { x: currentX, y: currentY };

    // Determine if this is a horizontal swipe on first significant movement
    if (!isHorizontalSwipeRef.current) {
      const deltaX = Math.abs(currentX - touchStartRef.current.x);
      const deltaY = Math.abs(currentY - touchStartRef.current.y);

      // If horizontal movement is greater, it's a swipe
      if (deltaX > 10 && deltaX > deltaY * 1.5) {
        isHorizontalSwipeRef.current = true;
      }
    }
  };

  const handleTabTouchEnd = () => {
    if (!touchStartRef.current || !touchMoveRef.current) {
      touchStartRef.current = null;
      return;
    }

    if (isHorizontalSwipeRef.current) {
      const deltaX = touchMoveRef.current.x - touchStartRef.current.x;
      const threshold = 50;

      if (deltaX < -threshold && activeTabIndex < tabs.length - 1) {
        setSwipeDirection(1);
        setActiveTabIndex(activeTabIndex + 1);
      } else if (deltaX > threshold && activeTabIndex > 0) {
        setSwipeDirection(-1);
        setActiveTabIndex(activeTabIndex - 1);
      }
    }

    touchStartRef.current = null;
    touchMoveRef.current = null;
    isHorizontalSwipeRef.current = false;
  };

  // Service modal handlers
  const openServiceModal = (service: ServiceType) => {
    setSelectedService(service);
    setIsServiceModalOpen(true);
  };

  const closeServiceModal = () => {
    setIsServiceModalOpen(false);
  };

  const handleBookService = (service: ServiceType) => {
    closeServiceModal();
    bookingCart.clear();
    bookingCart.setSalon(salon.id, salon.name);
    bookingCart.addService(service);
    navigate(`/booking?salonId=${salon.id}&serviceId=${service.id}`);
  };

  // Gallery handlers
  const closeGalleryModal = () => {
    setSelectedImageIndex(null);
    setGalleryDragX(0);
  };

  const goToNextImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex < salon.gallery.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
    setGalleryDragX(0);
  };

  const goToPrevImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
    setGalleryDragX(0);
  };

  const handleGalleryTouchStart = (e: React.TouchEvent) => {
    galleryStartXRef.current = e.touches[0].clientX;
    galleryIsDraggingRef.current = true;
  };

  const handleGalleryTouchMove = (e: React.TouchEvent) => {
    if (!galleryIsDraggingRef.current) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - galleryStartXRef.current;

    if (selectedImageIndex === 0 && diff > 0) {
      setGalleryDragX(diff * 0.3);
    } else if (selectedImageIndex === salon.gallery.length - 1 && diff < 0) {
      setGalleryDragX(diff * 0.3);
    } else {
      setGalleryDragX(diff);
    }
  };

  const handleGalleryTouchEnd = () => {
    galleryIsDraggingRef.current = false;
    const threshold = window.innerWidth * 0.2;

    if (galleryDragX < -threshold && selectedImageIndex !== null && selectedImageIndex < salon.gallery.length - 1) {
      goToNextImage();
    } else if (galleryDragX > threshold && selectedImageIndex !== null && selectedImageIndex > 0) {
      goToPrevImage();
    } else {
      setGalleryDragX(0);
    }
  };

  // Reviews helpers
  const getStylist = (stylistId: string) => salon.stylists.find((s) => s.id === stylistId);

  const allReviewServices = useMemo(() => {
    const services = new Set<string>();
    salon.reviews.forEach((review) => {
      review.services.forEach((service) => services.add(service));
    });
    return Array.from(services);
  }, [salon.reviews]);

  const filteredReviews = salon.reviews
    .filter((review) => {
      if (reviewFilters.service !== "all" && !review.services.includes(reviewFilters.service)) return false;
      if (reviewFilters.stylist !== "all" && review.stylistId !== reviewFilters.stylist) return false;
      return true;
    })
    .sort((a, b) => {
      if (reviewFilters.rating === "high") return b.rating - a.rating;
      if (reviewFilters.rating === "low") return a.rating - b.rating;
      return 0;
    });

  // About section helpers
  const dayKeys = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
  const today = new Date();
  const currentDayKey = dayKeys[today.getDay()];
  const currentDayName = t(`day.${currentDayKey}` as any);
  const todaySchedule = salon.weeklyHours.find((s) => s.day === currentDayName);

  const hasDescription = salon.description && salon.description.trim().length > 0;
  const hasWeeklyHours = salon.weeklyHours && salon.weeklyHours.length > 0;
  const hasAmenities = salon.amenities && salon.amenities.length > 0;
  const hasStylists = salon.stylists && salon.stylists.length > 0;

  // Skeleton component
  const SalonSkeleton = () => (
    <div className="max-w-lg mx-auto min-h-screen bg-white dark:bg-stone-900">
      <div className="h-48 sticky top-0 z-20 bg-stone-200 dark:bg-stone-800 animate-pulse" />
      <div className="px-4 py-3 bg-white dark:bg-stone-900 relative z-10">
        <div className="h-6 w-48 bg-stone-200 dark:bg-stone-800 rounded animate-pulse mb-2" />
        <div className="flex items-center gap-3">
          <div className="h-4 w-16 bg-stone-200 dark:bg-stone-800 rounded animate-pulse" />
          <div className="h-4 w-24 bg-stone-200 dark:bg-stone-800 rounded animate-pulse" />
        </div>
      </div>
      <div className="sticky top-48 z-40 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
        <div className="flex">
          {tabsWithLabels.map((tab) => (
            <div key={tab.id} className="flex-1 py-3">
              <div className="h-4 w-16 mx-auto bg-stone-200 dark:bg-stone-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="h-24 w-full bg-stone-200 dark:bg-stone-800 rounded-lg animate-pulse" />
        <div className="h-24 w-full bg-stone-200 dark:bg-stone-800 rounded-lg animate-pulse" />
        <div className="h-24 w-full bg-stone-200 dark:bg-stone-800 rounded-lg animate-pulse" />
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <AppLayout back removeHeader>
        <SalonSkeleton />
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout back removeHeader>
        <div className="max-w-lg mx-auto min-h-screen bg-white dark:bg-stone-900 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-red-500 mb-2">{t('salon.error')}</p>
            <button onClick={() => navigate("/")} className="text-primary text-sm font-medium">
              {t('salon.backToHome')}
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Tab content components
  const ServicesContent = () => (
    <div className="pt-2">
      <div className="divide-y divide-stone-100 dark:divide-stone-800">
        {salon.services.map((service) => (
          <div
            key={service.id}
            onClick={() => openServiceModal(service)}
            className="px-4 py-3 flex items-center justify-between gap-3"
          >
            <button type="button" className="flex-1 min-w-0 text-left">
              <h4 className="font-semibold text-stone-900 dark:text-stone-100">{service.name}</h4>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                {service.price} {t('common.currency')} · {service.duration}
              </p>
            </button>
            <Button size="sm" onPress={() => handleBookService(service)}>
              {t('salon.book')}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );

  const GalleryContent = () => (
    <div className="p-0">
      <div className="grid grid-cols-3 gap-0.5">
        {salon.gallery.map((img, index) => (
          <div
            key={index}
            onClick={() => setSelectedImageIndex(index)}
            className="aspect-square overflow-hidden cursor-pointer"
          >
            <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-200" />
          </div>
        ))}
      </div>
      {salon.gallery.length === 0 && (
        <div className="py-12 text-center text-stone-500 dark:text-stone-400">
          {t('salon.noImages')}
        </div>
      )}
    </div>
  );

  const ReviewsContent = () => (
    <div className="py-4 space-y-4">
      <div className="px-4">
        <RatingSummary rating={salon.rating} reviewCount={salon.reviewCount} />
      </div>
      <ReviewFilters
        services={allReviewServices}
        stylists={salon.stylists}
        value={reviewFilters}
        onChange={setReviewFilters}
      />
      <div className="divide-y divide-stone-100 dark:divide-stone-800">
        {filteredReviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            stylist={getStylist(review.stylistId)}
            onLike={(id) => console.log("Like:", id)}
            onDislike={(id) => console.log("Dislike:", id)}
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

  const AboutContent = () => (
    <div className="pt-2">
      {hasDescription && (
        <div className="border-b-6 border-stone-50 dark:border-stone-800">
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="flex flex-col">
              <span className="font-semibold text-stone-900 dark:text-stone-100">{t('salon.aboutSalon')}</span>
              <span className="text-sm text-stone-400">{t('salon.descriptionInfo')}</span>
            </div>
          </div>
          <div className="px-4 pb-4">
            <p className="text-stone-600 text-base dark:text-stone-400 leading-relaxed whitespace-pre-line">
              {salon.description}
            </p>
          </div>
        </div>
      )}

      <div className="border-b-6 border-stone-50 dark:border-stone-800">
        <div className="divide-y divide-stone-100 dark:divide-stone-800">
          {salon.address && (
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="size-10 shrink-0 bg-stone-50 dark:bg-stone-800/50 rounded-xl flex items-center justify-center">
                <MapPin size={22} className="text-primary" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm text-stone-400 dark:text-stone-500">{t('salon.address')}</span>
                <span className="font-medium text-stone-900 dark:text-stone-100 truncate">{salon.address}</span>
              </div>
            </div>
          )}
          {salon.phone && (
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="size-10 shrink-0 bg-stone-50 dark:bg-stone-800/50 rounded-xl flex items-center justify-center">
                <Phone size={22} className="text-primary" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm text-stone-400 dark:text-stone-500">{t('salon.phone')}</span>
                <a href={`tel:${salon.phone}`} className="font-medium text-primary">{salon.phone}</a>
              </div>
            </div>
          )}
        </div>
      </div>

      {hasWeeklyHours && (
        <div className="border-b-6 border-stone-50 dark:border-stone-800">
          <button
            type="button"
            onClick={() => setIsHoursExpanded(!isHoursExpanded)}
            className="w-full px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="size-10 shrink-0 bg-stone-50 dark:bg-stone-800/50 rounded-xl flex items-center justify-center">
                <Clock size={22} className="text-primary" />
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <span className="text-sm text-stone-400 dark:text-stone-500">{t('salon.today')} · {currentDayName}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-stone-900 dark:text-stone-100">
                    {todaySchedule?.hours || salon.workingHours}
                  </span>
                  {todaySchedule?.isOpen && (
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-500/20 rounded-full text-xs text-green-600 dark:text-green-400 font-medium">
                      {t('salon.open')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <motion.div animate={{ rotate: isHoursExpanded ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
              <ChevronDown size={20} className="text-stone-400" />
            </motion.div>
          </button>

          <AnimatePresence initial={false}>
            {isHoursExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 border-t border-stone-100 dark:border-stone-800">
                  <div className="pt-3 space-y-1">
                    {salon.weeklyHours.map((schedule) => {
                      const isToday = schedule.day === currentDayName;
                      return (
                        <div key={schedule.day} className={`flex items-center justify-between py-2 px-3 rounded-xl ${isToday ? "bg-primary/5" : ""}`}>
                          <span className={`${isToday ? "font-medium text-primary" : "text-stone-600 dark:text-stone-400"}`}>
                            {schedule.day}
                            {isToday && <span className="text-xs ml-1">({t('salon.todayShort')})</span>}
                          </span>
                          <span className={`font-medium ${schedule.isOpen ? (isToday ? "text-primary" : "text-stone-900 dark:text-stone-100") : "text-red-500 dark:text-red-400"}`}>
                            {schedule.hours}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {hasAmenities && (
        <div className="border-b-6 border-stone-50 dark:border-stone-800">
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="flex flex-col">
              <span className="font-semibold text-stone-900 dark:text-stone-100">{t('salon.amenities')}</span>
              <span className="text-sm text-stone-400">{t('salon.amenitiesCount', { count: salon.amenities.length })}</span>
            </div>
          </div>
          <div className="px-4 pb-4">
            <div className="flex flex-wrap gap-2">
              {salon.amenities.map((amenity) => (
                <span key={amenity} className="px-3 py-1 bg-stone-100 dark:bg-stone-800 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-300">
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {hasStylists && (
        <div>
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="flex flex-col">
              <span className="font-semibold text-stone-900 dark:text-stone-100">{t('salon.team')}</span>
              <span className="text-sm text-stone-400">{t('salon.specialistsCount', { count: salon.stylists.length })}</span>
            </div>
          </div>
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {salon.stylists.map((stylist) => (
              <div key={stylist.id} className="px-4 py-3 flex items-center gap-3">
                <img src={stylist.avatar} alt={stylist.name} className="size-12 rounded-full object-cover" />
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-stone-900 dark:text-stone-100">{stylist.name}</span>
                  <span className="text-sm text-stone-500 dark:text-stone-400">{stylist.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const tabContents = [
    <ServicesContent key="services" />,
    <GalleryContent key="gallery" />,
    <ReviewsContent key="reviews" />,
    <AboutContent key="about" />,
  ];

  return (
    <AppLayout back removeHeader>
      <div className="max-w-lg mx-auto min-h-screen bg-white dark:bg-stone-900 flex flex-col">
        {/* Hero Section */}
        <div
          className="h-64 relative sticky z-20"
          style={{ top: `calc(${safeAreaValue.top + contentAreaValue.top + 23}px - 12rem)` }}
        >
          {salon.image ? (
            <img src={salon.image} alt={salon.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
              <Logo width={100} height={100} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-2xl font-bold text-white mb-2">{salon.name}</h1>
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <span className="text-white font-medium text-sm">{salon.rating}</span>
                <span className="text-white/80 text-sm">({salon.reviewCount})</span>
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm">
                <Clock size={14} />
                <span>{salon.workingHours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="sticky z-30 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800"
          style={{ top: `calc(${safeAreaValue.top + contentAreaValue.top + 23}px + 4rem)` }}
        >
          <div className="flex">
            {tabsWithLabels.map((tab, index) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(index)}
                className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTabIndex === index ? "text-primary" : "text-stone-500 dark:text-stone-400"
                  }`}
              >
                {tab.label}
                {activeTabIndex === index && (
                  <motion.span
                    layoutId="salon-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content with swipe */}
        <div
          className="flex-1 min-h-0 overflow-hidden flex flex-col"
          ref={containerRef}
        >
          <AnimatePresence initial={false} mode="popLayout" custom={swipeDirection}>
            <motion.div
              key={activeTabIndex}
              custom={swipeDirection}
              initial="enter"
              animate="center"
              exit="exit"
              variants={{
                enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
              }}
              transition={{ x: { type: "tween", duration: 0.3, ease: [0.32, 0.72, 0, 1] }, opacity: { duration: 0.2 } }}
              onTouchStart={handleTabTouchStart}
              onTouchMove={handleTabTouchMove}
              onTouchEnd={handleTabTouchEnd}
              className="w-full flex-1 overflow-y-auto"
              style={{ touchAction: "pan-y pinch-zoom" }}
            >
              {tabContents[activeTabIndex]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <BottomSheet
          isOpen={isServiceModalOpen}
          onClose={closeServiceModal}
          title={selectedService.name}
          footer={
            <Button
              className="w-full py-6 bg-primary text-white font-semibold rounded-2xl"
              onPress={() => handleBookService(selectedService)}
            >
              {t('salon.book')} — {selectedService.price} {t('common.currency')}
            </Button>
          }
        >
          <div className="grid grid-cols-1 gap-4 py-4">
            <div>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-1">{t('salon.duration')}</p>
              <p className="font-semibold text-stone-900 dark:text-white">{selectedService.duration}</p>
            </div>
            <div>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-1">{t('salon.price')}</p>
              <p className="font-bold text-lg text-primary">{selectedService.price} {t('common.currency')}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-stone-900 dark:text-white mb-2">{t('salon.aboutService')}</h3>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">{t('salon.serviceDescription')}</p>
          </div>
        </BottomSheet>
      )}

      {/* Gallery Modal */}
      <SlidePanel isOpen={selectedImageIndex !== null} onClose={closeGalleryModal} showHeader={false} className="bg-black">
        {selectedImageIndex !== null && (
          <>
            <div
              className="absolute inset-0 flex items-center overflow-hidden"
              onClick={closeGalleryModal}
              onTouchStart={handleGalleryTouchStart}
              onTouchMove={handleGalleryTouchMove}
              onTouchEnd={handleGalleryTouchEnd}
            >
              <motion.div
                className="flex items-center"
                initial={false}
                animate={{ x: `calc(${galleryDragX}px - ${selectedImageIndex * 100}vw)` }}
                transition={{ duration: galleryIsDraggingRef.current ? 0 : 0.3, ease: [0.32, 0.72, 0, 1] }}
                style={{ width: `${salon.gallery.length * 100}vw` }}
              >
                {salon.gallery.map((img, index) => (
                  <div key={index} className="w-screen h-screen flex items-center justify-center shrink-0 px-0 relative">
                    <img src={img} alt="" className="max-w-full max-h-[70vh] object-contain" onClick={closeGalleryModal} />
                    <div className="absolute left-0 top-0 bottom-24 w-[25%] bg-transparent z-10 cursor-pointer" onClick={(e) => { e.stopPropagation(); goToPrevImage(); }} />
                    <div className="absolute right-0 top-0 bottom-24 w-[25%] bg-transparent z-10 cursor-pointer" onClick={(e) => { e.stopPropagation(); goToNextImage(); }} />
                  </div>
                ))}
              </motion.div>
            </div>
            <div className="absolute top-[calc(15vh-24px)] left-0 right-0 z-30 flex justify-center">
              <div className="px-3 py-1 rounded-full bg-black/50 text-white text-sm">
                {selectedImageIndex + 1}/{salon.gallery.length}
              </div>
            </div>
            <div className="absolute bottom-4 left-0 right-0 z-20" onClick={(e) => e.stopPropagation()}>
              <div className="flex gap-2 justify-center overflow-x-auto scrollbar-hide py-2">
                {salon.gallery.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => { setSelectedImageIndex(index); setGalleryDragX(0); }}
                    className={`shrink-0 size-12 rounded overflow-hidden transition-all ${index === selectedImageIndex ? "ring-2 ring-white scale-105" : "opacity-50 hover:opacity-75"
                      }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </SlidePanel>
    </AppLayout>
  );
}

// Export type for compatibility
export type SalonContext = {
  salon: typeof salonsData[string];
};
