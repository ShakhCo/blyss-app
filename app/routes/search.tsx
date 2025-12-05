import { useState, useMemo } from "react";
import { AppLayout } from "~/components/AppLayout";
import type { Route } from "./+types/search";
import { SearchBar } from "~/components/SearchBar";
import { bottomNav } from "~/stores/bottomNav";
import { SearchPageSkeleton } from "~/components/skeletons";
import { ServiceButton } from "~/components/ServiceButton";
import { Clock, X, MapPin, Star } from "lucide-react";

// Import service icons
import scissorIcon from "~/assets/icons/scissor.png";
import makeupIcon from "~/assets/icons/makeup.png";
import dyeIcon from "~/assets/icons/dye.png";
import massageIcon from "~/assets/icons/massage.png";
import shavingBrushIcon from "~/assets/icons/shaving-brush.png";
import creamIcon from "~/assets/icons/cream.png";
import pluckingIcon from "~/assets/icons/plucking.png";

// Recent searches mock data
const recentSearches = [
  { id: "1", text: "Soch olish", type: "service" },
  { id: "2", text: "Malika Go'zallik Saloni", type: "salon" },
  { id: "3", text: "Pardoz", type: "service" },
  { id: "4", text: "Massaj", type: "service" },
];

// Popular services (same as home)
const popularServices = [
  { id: "1", name: "Soch olish", icon: scissorIcon },
  { id: "2", name: "Pardoz", icon: makeupIcon },
  { id: "3", name: "Bo'yash", icon: dyeIcon },
  { id: "4", name: "Soqol", icon: shavingBrushIcon },
  { id: "5", name: "Teri", icon: creamIcon },
  { id: "6", name: "Epilyatsiya", icon: pluckingIcon },
  { id: "7", name: "Massaj", icon: massageIcon },
];

// Mock search results
const allSalons = [
  {
    id: "1",
    name: "Malika Go'zallik Saloni",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop",
    services: ["Soch", "Tirnoq", "Yuz"],
    address: "Navoiy ko'chasi, 25",
    rating: 4.8,
    reviewCount: "3.1k",
    distance: "1.2 km",
  },
  {
    id: "2",
    name: "Zilola Beauty",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop",
    services: ["Soch", "Yuz", "Pardoz"],
    address: "Amir Temur shoh ko'chasi, 108",
    rating: 4.7,
    reviewCount: "2.7k",
    distance: "2.4 km",
  },
  {
    id: "3",
    name: "Sitora Salon",
    image: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=400&h=400&fit=crop",
    services: ["Pardoz", "Soch", "Spa"],
    address: "Bobur ko'chasi, 42",
    rating: 4.9,
    reviewCount: "1.8k",
    distance: "3.1 km",
  },
  {
    id: "4",
    name: "Baraka Sartaroshxona",
    image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=400&fit=crop",
    services: ["Soch olish", "Soqol", "Massaj"],
    address: "Yunusobod tumani, 12",
    rating: 4.6,
    reviewCount: "980",
    distance: "0.8 km",
  },
  {
    id: "5",
    name: "Premium Beauty Studio",
    image: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=400&h=400&fit=crop",
    services: ["Pardoz", "Tirnoq", "Epilyatsiya"],
    address: "Mirzo Ulug'bek, 55",
    rating: 4.9,
    reviewCount: "2.1k",
    distance: "4.2 km",
  },
];

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Qidirish - Blyss" },
    { name: "description", content: "Salon va xizmatlarni qidirish" },
  ];
}

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [recentItems, setRecentItems] = useState(recentSearches);

  const handleRemoveRecent = (id: string) => {
    setRecentItems(recentItems.filter(item => item.id !== id));
  };

  const handleClearAll = () => {
    setRecentItems([]);
  };

  // Filter salons based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allSalons.filter(
      (salon) =>
        salon.name.toLowerCase().includes(query) ||
        salon.address.toLowerCase().includes(query) ||
        salon.services.some((s) => s.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const hasSearchQuery = searchQuery.trim().length > 0;

  return (
    <AppLayout back={true}>
      <div className="pb-6">
        {/* Search Bar */}
        <div className="px-4 pt-6 pb-4">
          <SearchBar
            autoFocus
            placeholder="Salon, xizmat yoki manzil qidiring..."
            onSearch={setSearchQuery}
            onFilterClick={() => console.log("Filter clicked")}
            onFocus={() => bottomNav.hide()}
            onBlur={() => bottomNav.show()}
          />
        </div>

        {/* Search Results */}
        {hasSearchQuery ? (
          <div className="px-4">
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
              {searchResults.length} ta natija topildi
            </p>

            {searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map((salon) => (
                  <button
                    key={salon.id}
                    type="button"
                    className="w-full flex gap-3 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-2xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-left"
                  >
                    <img
                      src={salon.image}
                      alt={salon.name}
                      className="size-20 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0 py-1">
                      <h3 className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                        {salon.name}
                      </h3>
                      <p className="text-xs text-primary mt-0.5">
                        {salon.services.join(" · ")}
                      </p>
                      <div className="flex items-center gap-1 mt-1.5 text-stone-500 dark:text-stone-400">
                        <MapPin size={12} />
                        <span className="text-xs truncate">{salon.address}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                            {salon.rating}
                          </span>
                          <span className="text-xs text-stone-400">({salon.reviewCount})</span>
                        </div>
                        <span className="text-xs text-stone-400">{salon.distance}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-stone-500 dark:text-stone-400">
                  "{searchQuery}" bo'yicha hech narsa topilmadi
                </p>
                <p className="text-sm text-stone-400 dark:text-stone-500 mt-1">
                  Boshqa so'z bilan qidirib ko'ring
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Recent Searches */}
            {recentItems.length > 0 && (
              <div className="px-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                    So'nggi qidiruvlar
                  </h2>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-sm text-primary font-medium"
                  >
                    Tozalash
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 rounded-full pl-3 pr-2 py-1.5 group"
                    >
                      <Clock size={14} className="text-stone-400" />
                      <span className="text-sm text-stone-700 dark:text-stone-300">{item.text}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRecent(item.id)}
                        className="p-0.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                      >
                        <X size={14} className="text-stone-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Services */}
            <div className="px-4 mb-6">
              <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-3">
                Mashhur xizmatlar
              </h2>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
                {popularServices.map((service) => (
                  <ServiceButton
                    key={service.id}
                    icon={service.icon}
                    name={service.name}
                    onClick={() => setSearchQuery(service.name)}
                  />
                ))}
              </div>
            </div>

            {/* Recommended Salons */}
            <div className="px-4">
              <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-3">
                Tavsiya etilgan salonlar
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[...allSalons, ...allSalons, ...allSalons, ...allSalons, ...allSalons, ...allSalons].map((salon) => (
                  <button
                    key={salon.id}
                    type="button"
                    className="flex flex-col bg-stone-50 dark:bg-stone-800/50 rounded-2xl overflow-hidden hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-left"
                  >
                    <img
                      src={salon.image}
                      alt={salon.name}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="p-3">
                      <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100 line-clamp-2">
                        {salon.name}
                      </h3>
                      <p className="text-xs text-primary mt-0.5 truncate">
                        {salon.services.join(" · ")}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                          {salon.rating}
                        </span>
                        <span className="text-xs text-stone-400">·</span>
                        <span className="text-xs text-stone-400">{salon.distance}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}

// Loading state shown while the route is loading
export function HydrateFallback() {
  return (
    <AppLayout>
      <SearchPageSkeleton />
    </AppLayout>
  );
}
