import { useEffect, useState, useRef } from "react";
import { useParams, useBlocker, useNavigate } from "react-router";
import { AppLayout } from "~/components/AppLayout";
import { Modal, Button } from "@heroui/react";
import type { Route } from "./+types/salon";
import { bottomNav } from "~/stores/bottomNav";
import { bookingUI, bookingCart } from "~/stores/booking";
import {
  Star,
  MapPin,
  Clock,
  Phone,
  Heart,
  Share2,
  Check,
  ChevronLeft,
  ChevronDown,
} from "lucide-react";

// Import service icons
import scissorIcon from "~/assets/icons/scissor.png";
import makeupIcon from "~/assets/icons/makeup.png";
import massageIcon from "~/assets/icons/massage.png";
import creamIcon from "~/assets/icons/cream.png";
import pluckingIcon from "~/assets/icons/plucking.png";

// Map category names to icons
const categoryIcons: Record<string, string> = {
  "Soch": scissorIcon,
  "Tirnoq": pluckingIcon,
  "Yuz": makeupIcon,
  "Spa": massageIcon,
  "Teri": creamIcon,
};

// Mock salon data
const salonsData: Record<string, {
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

const tabs: { id: TabType; label: string }[] = [
  { id: "services", label: "Xizmatlar" },
  { id: "gallery", label: "Galereya" },
  { id: "reviews", label: "Sharhlar" },
  { id: "about", label: "Haqida" },
];

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Salon - Blyss" },
    { name: "description", content: "Salon ma'lumotlari" },
  ];
}

type ServiceType = {
  id: string;
  name: string;
  duration: string;
  price: string;
  category: string;
};

export default function Salon() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("services");
  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const salon = salonsData[id || ""] || salonsData["1"];

  const openServiceModal = (service: ServiceType) => {
    // Always set the service first, then open
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const closeServiceModal = () => {
    setIsModalOpen(false);
    // Don't clear selectedService - it will be replaced when opening a new one
  };

  const handleBookService = (service: ServiceType) => {
    // Close modal if open
    closeServiceModal();
    // Clear cart and add the selected service
    bookingCart.clear();
    bookingCart.setSalon(salon.id, salon.name);
    bookingCart.addService(service);
    // Navigate to booking page with salon and service info
    navigate(`/booking?salonId=${salon.id}&serviceId=${service.id}`);
  };

  // Block back navigation when modal is open
  const blocker = useBlocker(isModalOpen);

  useEffect(() => {
    if (blocker.state === "blocked") {
      closeServiceModal();
      blocker.reset();
    }
  }, [blocker]);

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
      const heroHeight = heroRef.current.offsetHeight; // 288px (h-72)
      const scrollY = window.scrollY;
      // Black overlay from 0% to 50% as user scrolls
      const opacity = Math.min(0.5, (scrollY / heroHeight) * 0.5);
      setOverlayOpacity(opacity);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Group services by category
  const servicesByCategory = salon.services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, typeof salon.services>);


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
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === tab.id
                    ? "text-primary"
                    : "text-stone-500 dark:text-stone-400"
                    }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="pb-6">
          {/* Services Tab */}
          {activeTab === "services" && (
            <div className="">
              <div className="h-[6px] bg-stone-50">
              </div>
              {Object.entries(servicesByCategory).map(([category, services]) => (
                <div key={category} className="border-b-6 border-stone-50 dark:border-stone-800">
                  {/* Category Header */}
                  <div className="px-4 py-3 flex items-center gap-3">
                    <div className="size-12 shrink-0 bg-stone-100 dark:bg-stone-800 rounded-2xl flex items-center justify-center">
                      <img
                        src={categoryIcons[category] || scissorIcon}
                        alt={category}
                        className="size-7 object-contain"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-stone-900 dark:text-stone-100">{category}</span>
                      <span className="text-sm text-stone-400">{services.length} ta xizmat</span>
                    </div>
                  </div>

                  {/* Services List */}
                  <div className="divide-y divide-stone-100 dark:divide-stone-800">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => openServiceModal(service)}
                        className="px-4 py-4 flex items-center justify-between gap-3"
                      >
                        <button
                          type="button"
                          className="flex-1 min-w-0 text-left"
                        >
                          <h4 className="font-semibold text-stone-900 dark:text-stone-100">
                            {service.name}
                          </h4>
                          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                            {service.duration} · {service.price} so'm
                          </p>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookService(service);
                          }}
                          type="button"
                          className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary/90 transition-colors active:scale-[0.98]"
                        >
                          Band qilish
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === "gallery" && (
            <div className="p-4">
              <div className="grid grid-cols-2 gap-2">
                {salon.gallery.map((img, index) => (
                  <div
                    key={index}
                    className={`rounded-xl overflow-hidden ${index === 0 ? "col-span-2 aspect-video" : "aspect-square"
                      }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="p-4 space-y-4">
              {/* Rating summary */}
              <div className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-4 flex items-center gap-4">
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

              {/* Reviews list */}
              <div className="space-y-3">
                {salon.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={review.avatar}
                        alt={review.author}
                        className="size-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-stone-900 dark:text-stone-100">
                            {review.author}
                          </span>
                          <span className="text-xs text-stone-500 dark:text-stone-400">
                            {review.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={12}
                              className={
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-stone-300 dark:text-stone-600"
                              }
                            />
                          ))}
                        </div>
                        <p className="text-sm text-stone-600 dark:text-stone-300 mt-2">
                          {review.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === "about" && (
            <div className="p-4 space-y-6">
              {/* Description */}
              <div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">
                  Salon haqida
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-line">
                  {salon.description}
                </p>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-3">
                  Aloqa
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-stone-600 dark:text-stone-300">
                    <div className="size-10 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center">
                      <MapPin size={18} className="text-primary" />
                    </div>
                    <span className="text-sm">{salon.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-stone-600 dark:text-stone-300">
                    <div className="size-10 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center">
                      <Clock size={18} className="text-primary" />
                    </div>
                    <div>
                      <span className="text-sm">{salon.workingHours}</span>
                      <span className="text-xs text-green-500 font-medium ml-2">Ochiq</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-stone-600 dark:text-stone-300">
                    <div className="size-10 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center">
                      <Phone size={18} className="text-primary" />
                    </div>
                    <span className="text-sm">{salon.phone}</span>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-3">
                  Qulayliklar
                </h3>
                <div className="flex flex-wrap gap-2">
                  {salon.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 rounded-full text-sm text-stone-600 dark:text-stone-300"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Service Detail Modal */}
      <Modal.Container
        isOpen={isModalOpen}
        onOpenChange={(open) => !open && closeServiceModal()}
        placement="bottom"
        backdropClassName="data-[exiting]:duration-400"
        className="data-[entering]:duration-300 data-[exiting]:duration-400 data-[entering]:animate-in data-[entering]:slide-in-from-bottom-full data-[entering]:fade-in-0 data-[entering]:ease-fluid-out data-[exiting]:animate-out data-[exiting]:slide-out-to-bottom-full data-[exiting]:opacity-100 data-[exiting]:ease-out-quart"
      >
        <Modal.Dialog className="sm:max-w-md mb-0 sm:min-h-[90vh]">
          {({ close }) => (
            <>
              <Modal.CloseTrigger />
              {selectedService && (
                <>
                  <Modal.Header className="flex-row items-center gap-4 pb-2">
                    <div className="size-14 shrink-0 bg-stone-100 dark:bg-stone-800 rounded-2xl flex items-center justify-center">
                      <img
                        src={categoryIcons[selectedService.category] || scissorIcon}
                        alt={selectedService.category}
                        className="size-8 object-contain"
                      />
                    </div>
                    <div>
                      <Modal.Heading className="text-lg">
                        {selectedService.name}
                      </Modal.Heading>
                      <p className="text-sm text-stone-500 dark:text-stone-400">
                        {selectedService.category}
                      </p>
                    </div>
                  </Modal.Header>

                  <Modal.Body className="py-4">
                    {/* Service Details */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between py-3 border-b border-stone-100 dark:border-stone-800">
                        <div className="flex items-center gap-3 text-stone-600 dark:text-stone-400">
                          <Clock size={18} />
                          <span>Davomiyligi</span>
                        </div>
                        <span className="font-medium text-stone-900 dark:text-stone-100">
                          {selectedService.duration}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-stone-100 dark:border-stone-800">
                        <div className="flex items-center gap-3 text-stone-600 dark:text-stone-400">
                          <Star size={18} />
                          <span>Narxi</span>
                        </div>
                        <span className="font-bold text-lg text-primary">
                          {selectedService.price} so'm
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                      Professional xizmat ko'rsatish. Tajribali mutaxassislar tomonidan amalga oshiriladi. Yuqori sifatli materiallar ishlatiladi.
                    </p>
                  </Modal.Body>

                  <Modal.Footer className="pt-2">
                    <Button
                      className="w-full py-6 bg-primary text-white font-semibold rounded-2xl"
                      onPress={() => handleBookService(selectedService)}
                    >
                      Band qilish — {selectedService.price} so'm
                    </Button>
                  </Modal.Footer>
                </>
              )}
            </>
          )}
        </Modal.Dialog>
      </Modal.Container>
    </AppLayout>
  );
}
