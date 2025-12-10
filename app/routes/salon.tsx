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
    image: "https://st3.depositphotos.com/3919539/16400/i/450/depositphotos_164002372-stock-photo-man-stylish-client-in-barbershop.jpg",
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
      // { id: "3", name: "Fade soch olish", duration: "45 daqiqa", price: "55,000", category: "Soch" },
      { id: "4", name: "Soch bo'yash", duration: "1 soat", price: "80,000", category: "Soch" },
      // { id: "5", name: "Soch davolash", duration: "45 daqiqa", price: "70,000", category: "Soch" },
      { id: "6", name: "Soqol olish", duration: "20 daqiqa", price: "25,000", category: "Soqol" },
      // { id: "7", name: "Soqol shakllantirish", duration: "30 daqiqa", price: "35,000", category: "Soqol" },
      // { id: "8", name: "Soqol bo'yash", duration: "30 daqiqa", price: "40,000", category: "Soqol" },
      // { id: "9", name: "Royal shave", duration: "40 daqiqa", price: "50,000", category: "Soqol" },
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
  "2": {
    id: "2",
    name: "Boss Barbershop",
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=600&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=400&fit=crop",
    ],
    rating: 4.7,
    reviewCount: "2.7k",
    address: "Amir Temur shoh ko'chasi, 108, Toshkent",
    phone: "+998 90 234 56 78",
    workingHours: "10:00 - 22:00",
    weeklyHours: [
      { day: "Dushanba", hours: "10:00 - 22:00", isOpen: true },
      { day: "Seshanba", hours: "10:00 - 22:00", isOpen: true },
      { day: "Chorshanba", hours: "10:00 - 22:00", isOpen: true },
      { day: "Payshanba", hours: "10:00 - 22:00", isOpen: true },
      { day: "Juma", hours: "10:00 - 22:00", isOpen: true },
      { day: "Shanba", hours: "10:00 - 22:00", isOpen: true },
      { day: "Yakshanba", hours: "11:00 - 18:00", isOpen: true },
    ],
    description: "Boss Barbershop - premium erkaklar sartaroshxonasi. Biz har bir mijozga individual yondashuvni taklif qilamiz. Zamonaviy uslublar va klassik texnikalar.",
    services: [
      { id: "1", name: "Soch olish klassik", duration: "30 daqiqa", price: "45,000", category: "Soch" },
      { id: "2", name: "Soch olish VIP", duration: "1 soat", price: "80,000", category: "Soch" },
      { id: "3", name: "Fade haircut", duration: "45 daqiqa", price: "60,000", category: "Soch" },
      { id: "4", name: "Skin fade", duration: "50 daqiqa", price: "65,000", category: "Soch" },
      { id: "5", name: "Soch bo'yash", duration: "1 soat", price: "90,000", category: "Soch" },
      { id: "6", name: "Soqol olish", duration: "20 daqiqa", price: "30,000", category: "Soqol" },
      { id: "7", name: "Soqol dizayn", duration: "35 daqiqa", price: "45,000", category: "Soqol" },
      { id: "8", name: "Hot towel shave", duration: "45 daqiqa", price: "55,000", category: "Soqol" },
      { id: "9", name: "Soch + Soqol", duration: "1 soat", price: "75,000", category: "Soqol" },
      { id: "10", name: "Boss paket", duration: "1.5 soat", price: "120,000", category: "Soqol" },
      { id: "11", name: "Yuz tozalash", duration: "30 daqiqa", price: "45,000", category: "Teri" },
      { id: "12", name: "Charcoal mask", duration: "25 daqiqa", price: "40,000", category: "Teri" },
      { id: "13", name: "Bosh massaji", duration: "20 daqiqa", price: "35,000", category: "Teri" },
    ],
    amenities: ["Wi-Fi", "Choy/Qahva", "PlayStation", "TV"],
    stylists: [
      { id: "s1", name: "Jasur", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop", role: "Master barber" },
      { id: "s2", name: "Otabek", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", role: "Senior barber" },
    ],
    reviews: [
      {
        id: "1",
        author: "Alisher M.",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
        rating: 5,
        date: "3 kun oldin",
        text: "Premium xizmat! Eng yaxshi barbershop shaharda.",
        services: ["Soch olish VIP", "Hot towel shave"],
        stylistId: "s1",
      },
      {
        id: "2",
        author: "Temur N.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        rating: 5,
        date: "1 hafta oldin",
        text: "Fade haircut zo'r chiqdi, ustalar professional.",
        services: ["Fade haircut", "Soqol dizayn"],
        stylistId: "s2",
      },
    ],
  },
  "3": {
    id: "3",
    name: "Malika Go'zallik Saloni",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=400&h=400&fit=crop",
    ],
    rating: 4.9,
    reviewCount: "1.8k",
    address: "Bobur ko'chasi, 42, Toshkent",
    phone: "+998 90 345 67 89",
    workingHours: "09:00 - 21:00",
    weeklyHours: [
      { day: "Dushanba", hours: "09:00 - 21:00", isOpen: true },
      { day: "Seshanba", hours: "09:00 - 21:00", isOpen: true },
      { day: "Chorshanba", hours: "09:00 - 21:00", isOpen: true },
      { day: "Payshanba", hours: "09:00 - 21:00", isOpen: true },
      { day: "Juma", hours: "09:00 - 21:00", isOpen: true },
      { day: "Shanba", hours: "09:00 - 20:00", isOpen: true },
      { day: "Yakshanba", hours: "10:00 - 18:00", isOpen: true },
    ],
    description: "Malika Go'zallik Saloni - ayollar uchun zamonaviy go'zallik saloni. Biz yuqori sifatli xizmatlar ko'rsatamiz: soch turmagi, pardoz, manikur, pedikur va spa xizmatlari.\n\nBizning professional jamoamiz sizga eng yaxshi natijalarni taqdim etadi.",
    services: [
      { id: "1", name: "Soch olish", duration: "45 daqiqa", price: "60,000", category: "Soch" },
      { id: "2", name: "Soch bo'yash", duration: "2 soat", price: "200,000", category: "Soch" },
      { id: "3", name: "Ukladka", duration: "45 daqiqa", price: "80,000", category: "Soch" },
      { id: "4", name: "Keratin davolash", duration: "2.5 soat", price: "350,000", category: "Soch" },
      { id: "5", name: "Balayaj", duration: "3 soat", price: "400,000", category: "Soch" },
      { id: "6", name: "Kelin soch turmagi", duration: "2 soat", price: "300,000", category: "Soch" },
      { id: "7", name: "Pardoz kunlik", duration: "1 soat", price: "100,000", category: "Yuz" },
      { id: "8", name: "Pardoz oqshom", duration: "1.5 soat", price: "180,000", category: "Yuz" },
      { id: "9", name: "Kelin pardozi", duration: "2.5 soat", price: "500,000", category: "Yuz" },
      { id: "10", name: "Qosh bo'yash", duration: "30 daqiqa", price: "40,000", category: "Yuz" },
      { id: "11", name: "Qosh lamination", duration: "45 daqiqa", price: "80,000", category: "Yuz" },
      { id: "12", name: "Kiprik uzaytirish", duration: "2 soat", price: "180,000", category: "Yuz" },
      { id: "13", name: "Manikur klassik", duration: "1 soat", price: "70,000", category: "Tirnoq" },
      { id: "14", name: "Manikur gel lak", duration: "1.5 soat", price: "100,000", category: "Tirnoq" },
      { id: "15", name: "Tirnoq dizayni", duration: "2 soat", price: "150,000", category: "Tirnoq" },
      { id: "16", name: "Pedikur", duration: "1.5 soat", price: "90,000", category: "Tirnoq" },
      { id: "17", name: "Yuz tozalash", duration: "1 soat", price: "150,000", category: "Teri" },
      { id: "18", name: "Yuz parvarishi", duration: "1 soat", price: "180,000", category: "Teri" },
      { id: "19", name: "Klassik massaj", duration: "1 soat", price: "150,000", category: "Spa" },
      { id: "20", name: "Relaks massaj", duration: "1.5 soat", price: "200,000", category: "Spa" },
    ],
    amenities: ["Wi-Fi", "Choy/Qahva", "Avtoturargoh", "Konditsioner", "Spa"],
    stylists: [
      { id: "s1", name: "Malika", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop", role: "Founder & Master stylist" },
      { id: "s2", name: "Dilnoza", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop", role: "Senior stylist" },
      { id: "s3", name: "Gulnora", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop", role: "Makeup artist" },
      { id: "s4", name: "Sevinch", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop", role: "Nail technician" },
    ],
    reviews: [
      {
        id: "1",
        author: "Nilufar A.",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        rating: 5,
        date: "2 kun oldin",
        text: "Juda yaxshi salon! Xizmat sifati ajoyib, xodimlar juda mehribon.",
        services: ["Soch bo'yash", "Ukladka"],
        stylistId: "s2",
      },
      {
        id: "2",
        author: "Madina K.",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
        rating: 5,
        date: "1 hafta oldin",
        text: "Kelin pardozi zo'r bo'ldi. Aynan men xohlagan kabi chiqdi.",
        services: ["Kelin pardozi", "Kelin soch turmagi"],
        stylistId: "s3",
      },
      {
        id: "3",
        author: "Zarina T.",
        avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop",
        rating: 5,
        date: "2 hafta oldin",
        text: "Eng yaxshi go'zallik saloni! Hammasi professional darajada.",
        services: ["Manikur gel lak", "Pedikur", "Qosh lamination"],
        stylistId: "s4",
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
  const [swipeDirection, setSwipeDirection] = useState<1 | -1>(1);
  const previousTabRef = useRef<TabType>("services");
  const [infoOpacity, setInfoOpacity] = useState(1);
  const [showHeroName, setShowHeroName] = useState(false);

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

  // Scroll-based opacity for Gallery Grid and Salon Info
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Fade out info before showing hero name overlay
      const fadeDistance = 48;
      const opacity = Math.max(0, 1 - scrollY / fadeDistance);
      setInfoOpacity(opacity);

      // Show hero name when scrolled past 48px
      setShowHeroName(scrollY >= 48);
    };

    // Calculate initial state on mount
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AppLayout back removeHeader>
      <div className="max-w-lg mx-auto min-h-screen bg-white dark:bg-stone-900">

        {/* Hero Section with Image */}
        <div className="h-48 sticky top-0 z-20 relative">
          <img
            src={salon.image}
            alt={salon.name}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay for text readability */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300"
            style={{ opacity: showHeroName ? 1 : 0 }}
          />
          {/* Salon name overlay */}
          <div
            className="absolute bottom-3 left-4 right-4 transition-all duration-300 origin-bottom-left"
            style={{
              opacity: showHeroName ? 1 : 0,
              transform: showHeroName ? "translateY(0) scale(1)" : "translateY(8px) scale(0.95)",
            }}
          >
            <h2 className="text-xl font-bold text-white mb-1">{salon.name}</h2>
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

        {/* Salon Info */}
        <div
          className="px-4 py-3 bg-white dark:bg-stone-900 relative z-10 origin-top"
          style={{
            opacity: infoOpacity,
            transform: `scale(${0.9 + infoOpacity * 0.1})`,
          }}
        >
          <h1 className="text-xl font-bold text-stone-900 dark:text-white mb-1">
            {salon.name}
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span className="text-stone-900 dark:text-white font-medium text-sm">{salon.rating}</span>
              <span className="text-stone-500 dark:text-stone-400 text-sm">({salon.reviewCount})</span>
            </div>
            <span className="text-stone-300 dark:text-stone-600">•</span>
            <div className="flex items-center gap-1 text-stone-600 dark:text-stone-400 text-sm">
              <Clock size={14} />
              <span>{salon.workingHours}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="sticky top-48 z-40 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
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
