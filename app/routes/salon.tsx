import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation, Outlet } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "~/components/AppLayout";
import type { Route } from "./+types/salon";
import { bottomNav } from "~/stores/bottomNav";
import { bookingUI } from "~/stores/booking";
import { Star, Clock } from "lucide-react";

// Mock salon data - shared across all salon routes
export const salonsData: Record<string, {
  id: string;
  name: string;
  image: string;
  gallery: string[];
  rating: number;
  reviewCount: string;
  address: string;
  phone: string;
  workingHours: string;
  description: string;
  services: Array<{
    id: string;
    name: string;
    duration: string;
    price: string;
    category: string;
  }>;
  amenities: string[];
  reviews: Array<{
    id: string;
    author: string;
    avatar: string;
    rating: number;
    date: string;
    text: string;
  }>;
}> = {
  "1": {
    id: "1",
    name: "Malika Go'zallik Saloni",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400&h=400&fit=crop",
    ],
    rating: 4.8,
    reviewCount: "3.1k",
    address: "Navoiy ko'chasi, 25, Toshkent",
    phone: "+998 90 123 45 67",
    workingHours: "09:00 - 21:00",
    description: "Malika Go'zallik Saloni - bu zamonaviy go'zallik saloni bo'lib, yuqori sifatli xizmatlar ko'rsatadi. Bizning professional jamoamiz sizga eng yaxshi natijalarni taqdim etadi.\n\nBiz 2015 yildan beri mijozlarimizga xizmat ko'rsatib kelmoqdamiz. Bizning maqsadimiz - har bir mijozni go'zal va ishonchli his qilish.",
    services: [
      { id: "1", name: "Soch olish", duration: "30 daqiqa", price: "50,000", category: "Soch" },
      { id: "2", name: "Soch bo'yash", duration: "2 soat", price: "200,000", category: "Soch" },
      { id: "3", name: "Ukladka", duration: "45 daqiqa", price: "80,000", category: "Soch" },
      { id: "4", name: "Manikur", duration: "1 soat", price: "70,000", category: "Tirnoq" },
      { id: "5", name: "Pedikur", duration: "1.5 soat", price: "90,000", category: "Tirnoq" },
      { id: "6", name: "Yuz tozalash", duration: "1 soat", price: "150,000", category: "Yuz" },
    ],
    amenities: ["Wi-Fi", "Choy/Qahva", "Avtoturargoh", "Konditsioner"],
    reviews: [
      {
        id: "1",
        author: "Nilufar A.",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        rating: 5,
        date: "2 kun oldin",
        text: "Juda yaxshi salon! Xizmat sifati ajoyib, xodimlar juda mehribon.",
      },
      {
        id: "2",
        author: "Madina K.",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
        rating: 5,
        date: "1 hafta oldin",
        text: "Soch bo'yash xizmati zo'r bo'ldi. Rang aynan men xohlagan kabi chiqdi.",
      },
      {
        id: "3",
        author: "Zarina T.",
        avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop",
        rating: 4,
        date: "2 hafta oldin",
        text: "Yaxshi salon, lekin kutish vaqti biroz uzun edi.",
      },
    ],
  },
  "2": {
    id: "2",
    name: "Zilola Beauty",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=400&h=400&fit=crop",
    ],
    rating: 4.7,
    reviewCount: "2.7k",
    address: "Amir Temur shoh ko'chasi, 108, Toshkent",
    phone: "+998 90 234 56 78",
    workingHours: "10:00 - 20:00",
    description: "Zilola Beauty - premium go'zallik saloni. Biz har bir mijozga individual yondashuvni taklif qilamiz.",
    services: [
      { id: "1", name: "Soch olish", duration: "30 daqiqa", price: "60,000", category: "Soch" },
      { id: "2", name: "Pardoz", duration: "1 soat", price: "120,000", category: "Yuz" },
      { id: "3", name: "Qosh bo'yash", duration: "30 daqiqa", price: "40,000", category: "Yuz" },
    ],
    amenities: ["Wi-Fi", "Choy/Qahva"],
    reviews: [
      {
        id: "1",
        author: "Sabina M.",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
        rating: 5,
        date: "3 kun oldin",
        text: "Premium xizmat! Hammasi zo'r.",
      },
    ],
  },
  "3": {
    id: "3",
    name: "Sitora Salon",
    image: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=800&h=600&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=400&h=400&fit=crop",
    ],
    rating: 4.9,
    reviewCount: "1.8k",
    address: "Bobur ko'chasi, 42, Toshkent",
    phone: "+998 90 345 67 89",
    workingHours: "09:00 - 22:00",
    description: "Sitora Salon - eng yuqori darajadagi xizmat. Spa va relaksatsiya xizmatlari mavjud.",
    services: [
      { id: "1", name: "Pardoz", duration: "1.5 soat", price: "180,000", category: "Yuz" },
      { id: "2", name: "Massaj", duration: "1 soat", price: "200,000", category: "Spa" },
      { id: "3", name: "Spa paket", duration: "3 soat", price: "500,000", category: "Spa" },
    ],
    amenities: ["Wi-Fi", "Choy/Qahva", "Avtoturargoh", "Konditsioner", "Spa"],
    reviews: [
      {
        id: "1",
        author: "Gulnora R.",
        avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop",
        rating: 5,
        date: "1 kun oldin",
        text: "Eng yaxshi spa tajribasi!",
      },
    ],
  },
};

type TabType = "services" | "gallery" | "reviews" | "about";

const tabs: { id: TabType; label: string; path: string }[] = [
  { id: "services", label: "Xizmatlar", path: "" },
  { id: "gallery", label: "Galereya", path: "gallery" },
  { id: "reviews", label: "Sharhlar", path: "reviews" },
  { id: "about", label: "Haqida", path: "about" },
];

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Salon - Blyss" },
    { name: "description", content: "Salon ma'lumotlari" },
  ];
}

// Get tab index for animation direction
const getTabIndex = (tabId: TabType): number => {
  return tabs.findIndex(t => t.id === tabId);
};

export default function SalonLayout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const [swipeDirection, setSwipeDirection] = useState<1 | -1>(1);
  const previousTabRef = useRef<TabType>("services");

  const salon = salonsData[id || ""] || salonsData["1"];

  // Determine active tab from current path
  const getActiveTab = (): TabType => {
    const path = location.pathname;
    if (path.endsWith("/gallery")) return "gallery";
    if (path.endsWith("/reviews")) return "reviews";
    if (path.endsWith("/about")) return "about";
    return "services";
  };

  const activeTab = getActiveTab();

  // Update swipe direction when tab changes
  useEffect(() => {
    const currentIndex = getTabIndex(activeTab);
    const previousIndex = getTabIndex(previousTabRef.current);
    if (currentIndex !== previousIndex) {
      setSwipeDirection(currentIndex > previousIndex ? 1 : -1);
      previousTabRef.current = activeTab;
    }
  }, [activeTab]);

  const handleTabClick = (tab: typeof tabs[0]) => {
    const currentIndex = getTabIndex(activeTab);
    const newIndex = getTabIndex(tab.id);
    setSwipeDirection(newIndex > currentIndex ? 1 : -1);

    const basePath = `/salon/${id}`;
    const newPath = tab.path ? `${basePath}/${tab.path}` : basePath;
    navigate(newPath, { replace: true });
  };

  useEffect(() => {
    bottomNav.hide();
    // Reset booking UI state when visiting salon page
    bookingUI.reset();
    return () => {
      bottomNav.show();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const heroHeight = heroRef.current.offsetHeight;
      const scrollY = window.scrollY;
      const opacity = Math.min(0.5, (scrollY / heroHeight) * 0.5);
      setOverlayOpacity(opacity);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AppLayout back removeHeader>
      <div className="min-h-screen bg-white dark:bg-stone-900">
        <div className="sticky -top-48">
          {/* Hero Section with Image */}
          <div ref={heroRef} className="relative h-72">
            <img
              src={salon.image}
              alt={salon.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Black overlay that increases on scroll */}
            <div
              className="absolute inset-0 bg-black pointer-events-none"
              style={{ opacity: overlayOpacity }}
            />

            {/* Salon name overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <h1 className="text-xl font-bold text-white mb-1">
                {salon.name}
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-white font-medium text-sm">{salon.rating}</span>
                  <span className="text-white/70 text-sm">({salon.reviewCount})</span>
                </div>
                <span className="text-white/50">•</span>
                <div className="flex items-center gap-1 text-white/80 text-sm">
                  <Clock size={14} />
                  <span>{salon.workingHours}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="sticky top-0 z-40 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab)}
                  className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === tab.id
                    ? "text-primary"
                    : "text-stone-500 dark:text-stone-400"
                    }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
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
        </div>

        {/* Tab Content - rendered via Outlet with animation */}
        <div className="pb-6 overflow-hidden">
          <AnimatePresence initial={false} mode="popLayout" custom={swipeDirection}>
            <motion.div
              key={activeTab}
              custom={swipeDirection}
              initial="enter"
              animate="center"
              exit="exit"
              variants={{
                enter: (dir: number) => ({
                  x: dir > 0 ? "100%" : "-100%",
                  opacity: 0,
                }),
                center: {
                  x: 0,
                  opacity: 1,
                },
                exit: (dir: number) => ({
                  x: dir > 0 ? "-100%" : "100%",
                  opacity: 0,
                }),
              }}
              transition={{
                x: { type: "tween", duration: 0.3, ease: [0.32, 0.72, 0, 1] },
                opacity: { duration: 0.2 },
              }}
            >
              <Outlet context={{ salon }} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  );
}

// Export type for child routes to use
export type SalonContext = {
  salon: typeof salonsData[string];
};
