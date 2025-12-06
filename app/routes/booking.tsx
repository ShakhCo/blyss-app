import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { AppLayout } from "~/components/AppLayout";
import { Avatar, Button, Modal } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import type { Route } from "./+types/booking";
import { useBookingStore, useBookingCartStore, useBookingUIStore, type BookingService } from "~/stores/booking";
import { Clock, Calendar as CalendarIcon, Check, User, X, ChevronDown, CreditCard, Banknote, Plus, Building2, MapPin, Star, Crown, Gem } from "lucide-react";
import { Calendar } from "~/components/Calendar";

// Import service icons
import scissorIcon from "~/assets/icons/scissor.png";
import makeupIcon from "~/assets/icons/makeup.png";
import massageIcon from "~/assets/icons/massage.png";
import creamIcon from "~/assets/icons/cream.png";
import pluckingIcon from "~/assets/icons/plucking.png";
import { bottomNav } from "~/stores/bottomNav";

const categoryIcons: Record<string, string> = {
  Soch: scissorIcon,
  Tirnoq: pluckingIcon,
  Yuz: makeupIcon,
  Spa: massageIcon,
  Teri: creamIcon,
};

// Stylist level type
type StylistLevel = "standart" | "lux" | "premium";

// Stylist type
type Stylist = {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  specialty: string;
  level: StylistLevel;
};

// Level display config
const stylistLevelConfig: Record<StylistLevel, { label: string; color: string; icon: typeof Star }> = {
  standart: { label: "Standart", color: "bg-stone-500", icon: Star },
  lux: { label: "Lux", color: "bg-amber-500", icon: Crown },
  premium: { label: "Premium", color: "bg-purple-500", icon: Gem },
};

// Card type
type PaymentCard = {
  id: string;
  cardNumber: string;
  cardType: "uzcard" | "humo" | "visa" | "mastercard";
  expiryDate: string;
};

// Mock saved cards
const savedCards: PaymentCard[] = [
  { id: "1", cardNumber: "8600 **** **** 1234", cardType: "uzcard", expiryDate: "12/26" },
  { id: "2", cardNumber: "9860 **** **** 5678", cardType: "humo", expiryDate: "08/25" },
];

// Mock salon data (same as salon.tsx - in real app this would come from API/store)
const salonsData: Record<
  string,
  {
    id: string;
    name: string;
    services: Array<{
      id: string;
      name: string;
      duration: string;
      price: string;
      category: string;
    }>;
    stylists: Stylist[];
  }
> = {
  "1": {
    id: "1",
    name: "Malika Go'zallik Saloni",
    services: [
      { id: "1", name: "Soch olish", duration: "30 daqiqa", price: "50,000", category: "Soch" },
      { id: "2", name: "Soch bo'yash", duration: "2 soat", price: "200,000", category: "Soch" },
      { id: "3", name: "Ukladka", duration: "45 daqiqa", price: "80,000", category: "Soch" },
      { id: "4", name: "Manikur", duration: "1 soat", price: "70,000", category: "Tirnoq" },
      { id: "5", name: "Pedikur", duration: "1.5 soat", price: "90,000", category: "Tirnoq" },
      { id: "6", name: "Yuz tozalash", duration: "1 soat", price: "150,000", category: "Yuz" },
    ],
    stylists: [
      // Standart
      { id: "1", name: "Shahlo", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop", rating: 4.5, specialty: "Yuz", level: "standart" },
      { id: "2", name: "Feruza", avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop", rating: 4.4, specialty: "Soch", level: "standart" },
      { id: "3", name: "Kamola", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop", rating: 4.6, specialty: "Tirnoq", level: "standart" },
      // Lux
      { id: "4", name: "Dilnoza", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", rating: 4.8, specialty: "Tirnoq", level: "lux" },
      { id: "5", name: "Gulnora", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop", rating: 4.7, specialty: "Soch", level: "lux" },
      { id: "6", name: "Nigora", avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop", rating: 4.8, specialty: "Yuz", level: "lux" },
      // Premium
      { id: "7", name: "Malika", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", rating: 4.9, specialty: "Soch", level: "premium" },
      { id: "8", name: "Zarina", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop", rating: 4.9, specialty: "Yuz", level: "premium" },
    ],
  },
  "2": {
    id: "2",
    name: "Zilola Beauty",
    services: [
      { id: "1", name: "Soch olish", duration: "30 daqiqa", price: "60,000", category: "Soch" },
      { id: "2", name: "Pardoz", duration: "1 soat", price: "120,000", category: "Yuz" },
      { id: "3", name: "Qosh bo'yash", duration: "30 daqiqa", price: "40,000", category: "Yuz" },
    ],
    stylists: [
      // Standart
      { id: "1", name: "Nodira", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop", rating: 4.5, specialty: "Soch", level: "standart" },
      { id: "2", name: "Aziza", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop", rating: 4.4, specialty: "Yuz", level: "standart" },
      // Lux
      { id: "3", name: "Mohira", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", rating: 4.7, specialty: "Soch", level: "lux" },
      { id: "4", name: "Sabina", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop", rating: 4.8, specialty: "Yuz", level: "lux" },
      // Premium
      { id: "5", name: "Zilola", avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop", rating: 4.9, specialty: "Yuz", level: "premium" },
      { id: "6", name: "Dildora", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", rating: 4.9, specialty: "Soch", level: "premium" },
    ],
  },
  "3": {
    id: "3",
    name: "Sitora Salon",
    services: [
      { id: "1", name: "Pardoz", duration: "1.5 soat", price: "180,000", category: "Yuz" },
      { id: "2", name: "Massaj", duration: "1 soat", price: "200,000", category: "Spa" },
      { id: "3", name: "Spa paket", duration: "3 soat", price: "500,000", category: "Spa" },
    ],
    stylists: [
      // Standart
      { id: "1", name: "Sevara", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop", rating: 4.5, specialty: "Spa", level: "standart" },
      { id: "2", name: "Laylo", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop", rating: 4.6, specialty: "Yuz", level: "standart" },
      { id: "3", name: "Umida", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop", rating: 4.4, specialty: "Spa", level: "standart" },
      // Lux
      { id: "4", name: "Madina", avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop", rating: 4.7, specialty: "Yuz", level: "lux" },
      { id: "5", name: "Nargiza", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", rating: 4.8, specialty: "Spa", level: "lux" },
      // Premium
      { id: "6", name: "Sitora", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", rating: 4.9, specialty: "Spa", level: "premium" },
      { id: "7", name: "Iroda", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", rating: 4.9, specialty: "Yuz", level: "premium" },
    ],
  },
};

// Available time slots
const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00",
];

// Mock unavailable times per date (in a real app, this would come from an API)
// Key format: "YYYY-MM-DD", value: array of unavailable times
const unavailableTimesPerDate: Record<string, string[]> = {
  // Example: To mark a date as fully booked, add all timeSlots for that date
  // "2025-12-25": timeSlots, // Fully booked example
  // To mark specific times as unavailable:
  // "2025-12-20": ["12:00", "12:30", "15:00"],
};

// Helper function to format date as "YYYY-MM-DD"
const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Function to check if a date has no available time slots
const isDateUnavailable = (date: Date): boolean => {
  const dateKey = formatDateKey(date);
  const unavailableTimes = unavailableTimesPerDate[dateKey] || [];

  // For today, also check if all remaining times are past
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    const availableSlots = timeSlots.filter((time) => {
      // Check if time is not in unavailable list
      if (unavailableTimes.includes(time)) return false;

      // Check if time is not past (with 20 min buffer)
      const [hours, minutes] = time.split(":").map(Number);
      const slotTime = new Date();
      slotTime.setHours(hours, minutes, 0, 0);
      const minTime = new Date(now.getTime() + 20 * 60 * 1000);
      return slotTime >= minTime;
    });
    return availableSlots.length === 0;
  }

  // For other dates, check if all times are unavailable
  return unavailableTimes.length >= timeSlots.length;
};

// Function to find the first available date
const getFirstAvailableDate = (): Date => {
  const today = new Date();
  const limitDate = new Date();
  limitDate.setDate(today.getDate() + 14);

  const current = new Date(today);
  while (current <= limitDate) {
    if (!isDateUnavailable(current)) {
      return new Date(current);
    }
    current.setDate(current.getDate() + 1);
  }
  return today; // Fallback to today if no available dates
};

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Band qilish - Blyss" },
    { name: "description", content: "Xizmatni band qilish" },
  ];
}

export default function Booking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const addBooking = useBookingStore((state) => state.addBooking);

  // Cart store for multiple services
  const { selectedServices, addService, removeService, clearCart, setSalon, getTotalPrice } = useBookingCartStore();

  const salonId = searchParams.get("salonId") || "1";
  const serviceId = searchParams.get("serviceId") || "1";

  const salon = salonsData[salonId] || salonsData["1"];
  const initialService = salon.services.find((s) => s.id === serviceId) || salon.services[0];

  const [selectedDate, setSelectedDate] = useState<Date | null>(() => getFirstAvailableDate());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedStylist, setSelectedStylist] = useState<Stylist>({ id: "anyone", name: "Istalgan", avatar: "", rating: 0, specialty: "", level: "standart" });

  // UI state from Zustand store
  const {
    isStylistExpanded,
    isLocationExpanded,
    isServicesExpanded,
    isCalendarExpanded,
    isTimeExpanded,
    isPaymentExpanded,
    setExpanded,
    resetUI,
  } = useBookingUIStore();

  const setIsStylistExpanded = (value: boolean) => setExpanded("isStylistExpanded", value);
  const setIsLocationExpanded = (value: boolean) => setExpanded("isLocationExpanded", value);
  const setIsServicesExpanded = (value: boolean) => setExpanded("isServicesExpanded", value);
  const setIsCalendarExpanded = (value: boolean) => setExpanded("isCalendarExpanded", value);
  const setIsTimeExpanded = (value: boolean) => setExpanded("isTimeExpanded", value);
  const setIsPaymentExpanded = (value: boolean) => setExpanded("isPaymentExpanded", value);

  const [selectedStylistLevel, setSelectedStylistLevel] = useState<StylistLevel>("standart");
  const [swipeDirection, setSwipeDirection] = useState<1 | -1>(1);
  const [serviceLocation, setServiceLocation] = useState<"salon" | "home">("salon");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
  const [selectedCard, setSelectedCard] = useState<PaymentCard | null>(null);

  // Initialize cart with the initial service on mount
  useEffect(() => {
    setSalon(salon.id, salon.name);
    if (selectedServices.length === 0) {
      addService(initialService);
    }
  }, []);

  // Min date is today, max date is 60 days from now
  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 60);

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString("uz-UZ", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedTime || selectedServices.length === 0) return;

    addBooking({
      salonId: salon.id,
      salonName: salon.name,
      services: selectedServices,
      date: selectedDate.toISOString().split("T")[0],
      time: selectedTime,
      status: "pending",
    });

    // Clear cart, reset UI state, and navigate to orders page
    clearCart();
    resetUI();
    navigate("/orders");
  };

  // Calculate total price
  const homeServiceFee = 30000;
  const totalPrice = getTotalPrice() + (serviceLocation === "home" ? homeServiceFee : 0);
  const formatPrice = (price: number) => price.toLocaleString("uz-UZ");

  useEffect(() => {
    bottomNav.hide();
  }, []);

  return (
    <AppLayout back>
      <div className="bg-stone-50 dark:bg-stone-950">

        {/* Specialist Selection */}
        <div className="bg-white dark:bg-stone-900 mt-2">
          {/* Header - Always visible, clickable to expand */}
          <button
            type="button"
            onClick={() => setIsStylistExpanded(!isStylistExpanded)}
            className="w-full px-4 pr-5 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Avatar className="size-12">
                {selectedStylist.id === "anyone" ? (
                  <>
                    <Avatar.Image alt="Istalgan" src="https://cdn-icons-png.flaticon.com/512/149/149071.png" />
                    <Avatar.Fallback><User size={20} /></Avatar.Fallback>
                  </>
                ) : (
                  <>
                    <Avatar.Image alt={selectedStylist.name} src={selectedStylist.avatar} />
                    <Avatar.Fallback>{selectedStylist.name.slice(0, 2)}</Avatar.Fallback>
                  </>
                )}
              </Avatar>
              <div className="text-left">
                <p className="text-sm text-stone-500 dark:text-stone-400">Mutaxassis</p>
                <p className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  {selectedStylist.id === "anyone" ? (
                    "Istalgan mutaxassis"
                  ) : (
                    <>
                      {selectedStylist.name}
                      <span className="text-stone-400 dark:text-stone-500">·</span>
                      {(() => {
                        const LevelIcon = stylistLevelConfig[selectedStylist.level].icon;
                        return <LevelIcon size={14} className="text-primary" />;
                      })()}
                      {stylistLevelConfig[selectedStylist.level].label}
                    </>
                  )}
                </p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: isStylistExpanded ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <ChevronDown size={24} className="text-stone-400" />
            </motion.div>
          </button>

          {/* Expandable content */}
          <AnimatePresence initial={false}>
            {isStylistExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="overflow-hidden"
              >
                {/* Level tabs */}
                <div className="border-b border-stone-200 dark:border-stone-800">
                  <div className="flex">
                    {(["standart", "lux", "premium"] as StylistLevel[]).map((level, index) => {
                      const levels: StylistLevel[] = ["standart", "lux", "premium"];
                      const currentIndex = levels.indexOf(selectedStylistLevel);
                      const LevelIcon = stylistLevelConfig[level].icon;
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => {
                            setSwipeDirection(index > currentIndex ? 1 : -1);
                            setSelectedStylistLevel(level);
                          }}
                          className={`flex-1 py-3 text-sm font-medium transition-colors relative flex items-center justify-center gap-1.5 ${selectedStylistLevel === level
                            ? "text-primary"
                            : "text-stone-500 dark:text-stone-400"
                            }`}
                        >
                          <LevelIcon size={14} />
                          {stylistLevelConfig[level].label}
                          {selectedStylistLevel === level && (
                            <motion.span
                              layoutId="stylist-level-indicator"
                              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Stylists list */}
                <div className="overflow-hidden">
                  <AnimatePresence initial={false} mode="popLayout" custom={swipeDirection}>
                    <motion.div
                      key={selectedStylistLevel}
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
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.1}
                      dragMomentum={false}
                      onDragEnd={(_, info) => {
                        const swipeThreshold = 50;
                        const levels: StylistLevel[] = ["standart", "lux", "premium"];
                        const currentIndex = levels.indexOf(selectedStylistLevel);

                        if (info.offset.x < -swipeThreshold && currentIndex < levels.length - 1) {
                          setSwipeDirection(1);
                          setSelectedStylistLevel(levels[currentIndex + 1]);
                        } else if (info.offset.x > swipeThreshold && currentIndex > 0) {
                          setSwipeDirection(-1);
                          setSelectedStylistLevel(levels[currentIndex - 1]);
                        }
                      }}
                      className="divide-y divide-stone-100 dark:divide-stone-800 cursor-grab active:cursor-grabbing"
                    >
                      {/* Filtered Stylists */}
                      {salon.stylists
                        .filter((stylist) => stylist.level === selectedStylistLevel)
                        .map((stylist) => {
                          const isSelected = selectedStylist?.id === stylist.id;
                          return (
                            <button
                              type="button"
                              key={stylist.id}
                              onClick={() => {
                                setSelectedStylist(stylist);
                                setIsStylistExpanded(false);
                              }}
                              className="w-full px-4 py-3 flex items-center gap-3"
                            >
                              <Avatar className="size-10 shrink-0">
                                <Avatar.Image alt={stylist.name} src={stylist.avatar} />
                                <Avatar.Fallback>{stylist.name.slice(0, 2)}</Avatar.Fallback>
                              </Avatar>
                              <div className="flex-1 min-w-0 text-left">
                                <h4 className="font-medium text-stone-900 dark:text-stone-100">
                                  {stylist.name}
                                </h4>
                                <p className="text-sm text-stone-500 dark:text-stone-400">
                                  {stylist.specialty} · ⭐ {stylist.rating}
                                </p>
                              </div>
                              <div className={`size-5 shrink-0 rounded-full border-2 flex items-center justify-center ${isSelected
                                ? "border-primary bg-primary"
                                : "border-stone-300 dark:border-stone-600"
                                }`}>
                                {isSelected && <Check size={12} className="text-white" />}
                              </div>
                            </button>
                          );
                        })}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Service Location */}
        <div className="bg-white dark:bg-stone-900 mt-2">
          {/* Header - Always visible, clickable to expand */}
          <button
            type="button"
            onClick={() => setIsLocationExpanded(!isLocationExpanded)}
            className="w-full px-4 pr-5 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="size-12 shrink-0 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                {serviceLocation === "salon" ? (
                  <Building2 size={22} className="text-primary" />
                ) : (
                  <MapPin size={22} className="text-primary" />
                )}
              </div>
              <div className="text-left">
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  Xizmat joyi{serviceLocation === "home" && <span className="text-primary"> · +{formatPrice(homeServiceFee)} so'm</span>}
                </p>
                <p className="font-semibold text-stone-900 dark:text-stone-100">
                  {serviceLocation === "salon" ? "Salonda" : "Mening manzilimda"}
                </p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: isLocationExpanded ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <ChevronDown size={24} className="text-stone-400" />
            </motion.div>
          </button>

          {/* Expandable content */}
          <AnimatePresence initial={false}>
            {isLocationExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="overflow-hidden"
              >
                <div className="divide-y divide-stone-100 dark:divide-stone-800 border-t border-stone-100 dark:border-stone-800">
                  {/* Salon option */}
                  <button
                    type="button"
                    onClick={() => {
                      setServiceLocation("salon");
                      setIsLocationExpanded(false);
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3"
                  >
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className="font-medium text-stone-900 dark:text-stone-100">
                        Salonda
                      </h4>
                      <p className="text-sm text-stone-500 dark:text-stone-400">
                        Salonga tashrif buyuring
                      </p>
                    </div>
                    <div className={`size-5 shrink-0 rounded-full border-2 flex items-center justify-center ${serviceLocation === "salon"
                      ? "border-primary bg-primary"
                      : "border-stone-300 dark:border-stone-600"
                      }`}>
                      {serviceLocation === "salon" && <Check size={12} className="text-white" />}
                    </div>
                  </button>

                  {/* Home/Location option */}
                  <button
                    type="button"
                    onClick={() => {
                      setServiceLocation("home");
                      setIsLocationExpanded(false);
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3"
                  >
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className="font-medium text-stone-900 dark:text-stone-100">
                        Mening manzilimda
                      </h4>
                      <p className="text-sm text-stone-500 dark:text-stone-400">
                        Mutaxassis sizga keladi · +{formatPrice(homeServiceFee)} so'm
                      </p>
                    </div>
                    <div className={`size-5 shrink-0 rounded-full border-2 flex items-center justify-center ${serviceLocation === "home"
                      ? "border-primary bg-primary"
                      : "border-stone-300 dark:border-stone-600"
                      }`}>
                      {serviceLocation === "home" && <Check size={12} className="text-white" />}
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Date Selection */}
        <div className="bg-white dark:bg-stone-900 mt-2">
          {/* Header - Always visible, clickable to expand */}
          <button
            type="button"
            onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
            className="w-full px-4 pr-5 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="size-12 shrink-0 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                <CalendarIcon size={22} className="text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm text-stone-500 dark:text-stone-400">Sana</p>
                <p className="font-semibold text-stone-900 dark:text-stone-100">
                  {selectedDate
                    ? selectedDate.toLocaleDateString("uz-UZ", {
                      weekday: "short",
                      day: "numeric",
                      month: "long",
                    })
                    : "Sanani tanlang"}
                </p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: isCalendarExpanded ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <ChevronDown size={24} className="text-stone-400" />
            </motion.div>
          </button>

          {/* Expandable content */}
          <AnimatePresence initial={false}>
            {isCalendarExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 border-t border-stone-100 dark:border-stone-800 pt-4">
                  <Calendar
                    onChange={(dateStr) => {
                      const [year, month, day] = dateStr.split("-").map(Number);
                      setSelectedDate(new Date(year, month - 1, day));
                      // Reset time selection when date changes
                      setSelectedTime(null);
                      setIsCalendarExpanded(false);
                      // Auto-expand time section after selecting date
                      setIsTimeExpanded(true);
                    }}
                    isDateUnavailable={isDateUnavailable}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Time Selection */}
        <div className="bg-white dark:bg-stone-900 mt-2">
          {/* Header - Always visible, clickable to expand */}
          <button
            type="button"
            onClick={() => setIsTimeExpanded(!isTimeExpanded)}
            className="w-full px-4 pr-5 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="size-12 shrink-0 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                <Clock size={22} className="text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm text-stone-500 dark:text-stone-400">Vaqt</p>
                <p className="font-semibold text-stone-900 dark:text-stone-100">
                  {selectedTime || "Vaqtni tanlang"}
                </p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: isTimeExpanded ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <ChevronDown size={24} className="text-stone-400" />
            </motion.div>
          </button>

          {/* Expandable content */}
          <AnimatePresence initial={false}>
            {isTimeExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2 overflow-x-auto px-4 pb-4 border-t border-stone-100 dark:border-stone-800 pt-4 scrollbar-hide">
                  {timeSlots
                    .filter((time) => {
                      // If selected date is today, filter out past times (with 20 min buffer)
                      if (selectedDate) {
                        const now = new Date();
                        const isToday = selectedDate.toDateString() === now.toDateString();
                        if (isToday) {
                          const [hours, minutes] = time.split(":").map(Number);
                          const slotTime = new Date();
                          slotTime.setHours(hours, minutes, 0, 0);
                          const minTime = new Date(now.getTime() + 20 * 60 * 1000); // 20 minutes from now
                          return slotTime >= minTime;
                        }
                      }
                      return true;
                    })
                    .map((time) => {
                      const isSelected = selectedTime === time;
                      // Get unavailable times for selected date from mock data
                      const dateKey = selectedDate ? formatDateKey(selectedDate) : "";
                      const unavailableTimes = unavailableTimesPerDate[dateKey] || [];
                      const isUnavailable = unavailableTimes.includes(time);
                      return (
                        <motion.button
                          key={time}
                          type="button"
                          onClick={() => {
                            if (!isUnavailable) {
                              setSelectedTime(time);
                              setIsTimeExpanded(false);
                            }
                          }}
                          disabled={isUnavailable}
                          initial={false}
                          animate={{
                            scale: isSelected ? 1.05 : 1,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 600,
                            damping: 15,
                          }}
                          className={`px-4 py-2.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${isSelected
                            ? "bg-primary text-white"
                            : isUnavailable
                              ? "bg-stone-100 dark:bg-stone-800 text-stone-300 dark:text-stone-600 cursor-not-allowed"
                              : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                            }`}
                        >
                          {time}
                        </motion.button>
                      );
                    })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Selected Services */}
        <div className="bg-white dark:bg-stone-900 mt-2">
          {/* Header - Always visible, clickable to expand */}
          <button
            type="button"
            onClick={() => setIsServicesExpanded(!isServicesExpanded)}
            className="w-full px-4 pr-5 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="size-12 shrink-0 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                <img
                  src={selectedServices.length > 0 ? (categoryIcons[selectedServices[0].category] || scissorIcon) : scissorIcon}
                  alt="Services"
                  className="size-6 object-contain"
                />
              </div>
              <div className="text-left">
                <p className="text-sm text-stone-500 dark:text-stone-400">Xizmatlar</p>
                <p className="font-semibold text-stone-900 dark:text-stone-100">
                  {selectedServices.length === 1
                    ? selectedServices[0].name
                    : `${selectedServices.length} ta xizmat`}
                  <span className="font-normal text-stone-500 dark:text-stone-400"> · {formatPrice(totalPrice)} so'm</span>
                </p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: isServicesExpanded ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <ChevronDown size={24} className="text-stone-400" />
            </motion.div>
          </button>

          {/* Expandable content */}
          <AnimatePresence initial={false}>
            {isServicesExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="overflow-hidden"
              >
                <div className="divide-y divide-stone-100 dark:divide-stone-800 border-t border-stone-100 dark:border-stone-800">
                  {selectedServices.map((service) => (
                    <div
                      key={service.id}
                      className="px-4 py-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-stone-900 dark:text-stone-100">
                          {service.name}
                        </h4>
                        <p className="text-sm text-stone-500 dark:text-stone-400">
                          {service.duration} · {service.price} so'm
                        </p>
                      </div>
                      {selectedServices.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeService(service.id);
                          }}
                          className="size-8 flex items-center justify-center rounded-full border border-red-300 text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {selectedServices.length < salon.services.length && (
                  <button
                    type="button"
                    onClick={() => navigate(`/booking/add-service?salonId=${salonId}`)}
                    className="px-4 py-3 text-sm font-semibold text-primary border-t border-stone-100 dark:border-stone-800 w-full text-left"
                  >
                    + Boshqa xizmat qo'shish
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Payment Method */}
        <div className="bg-white dark:bg-stone-900 mt-2">
          {/* Header - Always visible, clickable to expand */}
          <button
            type="button"
            onClick={() => setIsPaymentExpanded(!isPaymentExpanded)}
            className="w-full px-4 pr-5 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="size-12 shrink-0 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                {paymentMethod === "cash" ? (
                  <Banknote size={22} className="text-primary" />
                ) : (
                  <CreditCard size={22} className="text-primary" />
                )}
              </div>
              <div className="text-left">
                <p className="text-sm text-stone-500 dark:text-stone-400">To'lov usuli</p>
                <p className="font-semibold text-stone-900 dark:text-stone-100">
                  {paymentMethod === "cash"
                    ? "Naqd pul"
                    : selectedCard
                      ? selectedCard.cardNumber
                      : "Karta"}
                </p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: isPaymentExpanded ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <ChevronDown size={24} className="text-stone-400" />
            </motion.div>
          </button>

          {/* Expandable content */}
          <AnimatePresence initial={false}>
            {isPaymentExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="overflow-hidden"
              >
                <div className="divide-y divide-stone-100 dark:divide-stone-800 border-t border-stone-100 dark:border-stone-800">
                  {/* Cash option */}
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("cash");
                      setSelectedCard(null);
                      setIsPaymentExpanded(false);
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3"
                  >
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className="font-medium text-stone-900 dark:text-stone-100">
                        Naqd pul
                      </h4>
                      <p className="text-sm text-stone-500 dark:text-stone-400">
                        Salonda to'lash
                      </p>
                    </div>
                    <div className={`size-5 shrink-0 rounded-full border-2 flex items-center justify-center ${paymentMethod === "cash"
                      ? "border-primary bg-primary"
                      : "border-stone-300 dark:border-stone-600"
                      }`}>
                      {paymentMethod === "cash" && <Check size={12} className="text-white" />}
                    </div>
                  </button>

                  {/* Saved cards */}
                  {savedCards.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => {
                        setSelectedCard(card);
                        setPaymentMethod("card");
                        setIsPaymentExpanded(false);
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3"
                    >
                      <div className="flex-1 min-w-0 text-left">
                        <h4 className="font-medium text-stone-900 dark:text-stone-100">
                          {card.cardNumber}
                        </h4>
                        <p className="text-sm text-stone-500 dark:text-stone-400">
                          {card.cardType.toUpperCase()} · {card.expiryDate} · 5% chegirma
                        </p>
                      </div>
                      <div className={`size-5 shrink-0 rounded-full border-2 flex items-center justify-center ${paymentMethod === "card" && selectedCard?.id === card.id
                        ? "border-primary bg-primary"
                        : "border-stone-300 dark:border-stone-600"
                        }`}>
                        {paymentMethod === "card" && selectedCard?.id === card.id && <Check size={12} className="text-white" />}
                      </div>
                    </button>
                  ))}

                  {/* Add new card button */}
                  <button
                    type="button"
                    onClick={() => {
                      // Navigate to add card page or open add card modal
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3"
                  >
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className="font-medium text-primary">
                        + Yangi karta qo'shish
                      </h4>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Button */}
        <div className="p-4">
          <Button
            className="w-full py-6 bg-primary text-white font-semibold rounded-2xl disabled:opacity-50"
            isDisabled={!selectedDate || !selectedTime || !selectedStylist || selectedServices.length === 0}
            onPress={handleConfirmBooking}
          >
            {selectedDate && selectedTime && selectedStylist && selectedServices.length > 0 ? (
              <span className="flex items-center gap-2">
                <Check size={18} />
                Tasdiqlash — {formatPrice(totalPrice)} so'm
              </span>
            ) : (
              selectedServices.length === 0 ? "Xizmat tanlang" : !selectedStylist ? "Mutaxassisni tanlang" : "Sana va vaqtni tanlang"
            )}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}

