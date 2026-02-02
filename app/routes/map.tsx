import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "~/components/AppLayout";
import type { Route } from "./+types/map";
import { bottomNav } from "~/stores/bottomNav";
import { Star, X, ChevronRight, RefreshCw, ArrowLeft } from "lucide-react";
import { useTestableLocation, useLocationStore } from "~/stores/location";
import { getNearestBusinesses, getDistance } from "~/lib/business-api";
import { useI18nStore } from "~/stores/i18n-store";

// Default Tashkent coordinates if location not available
const DEFAULT_LOCATION = { lat: 41.2995, lng: 69.2401 };

// Salon type for map display
interface MapSalon {
  id: string;
  name: string;
  image?: string;
  address: string;
  rating: number;
  reviewCount: string;
  lat: number;
  lng: number;
  services: string[];
  distance?: string;
}

// Helper to format distance with fallback
const formatDistance = (distance?: number, metric?: string) => {
  if (distance == null) return undefined;
  const unit = metric || "km";
  const rounded = distance < 1
    ? Math.floor(distance * 20) / 20
    : Math.floor(distance * 10) / 10;
  return `${rounded}${unit}`;
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Xarita - Blyss" },
    { name: "description", content: "Yaqin atrofdagi salonlar" },
  ];
}

export default function MapPage() {
  const navigate = useNavigate();
  const [selectedSalon, setSelectedSalon] = useState<MapSalon | null>(null);
  const [MapComponent, setMapComponent] = useState<React.ComponentType<any> | null>(null);
  const [locationError, setLocationError] = useState(false);
  const { language } = useI18nStore();

  // Use location from store
  const storeLocation = useTestableLocation();
  const fetchLocation = useLocationStore((state) => state.fetchLocation);
  const isLocationLoading = useLocationStore((state) => state.isLoading);

  // Convert store location format to map format
  const userLocation = storeLocation
    ? { lat: storeLocation.lat, lng: storeLocation.lon }
    : null;

  // Fetch businesses from API
  const {
    data: businessesData,
    isLoading: isLoadingBusinesses,
    refetch: refetchBusinesses,
  } = useQuery({
    queryKey: ["mapBusinesses", storeLocation?.lat, storeLocation?.lon],
    queryFn: async () => {
      const result = await getNearestBusinesses({
        lat: storeLocation?.lat ?? DEFAULT_LOCATION.lat,
        lng: storeLocation?.lon ?? DEFAULT_LOCATION.lng,
        radius: 1000,
        page: 1,
        page_size: 100,
      });
      return result;
    },
    enabled: !!storeLocation || !isLocationLoading,
  });

  // Fetch distance for selected salon
  const { data: selectedDistance, isLoading: isLoadingDistance } = useQuery({
    queryKey: ["salonDistance", selectedSalon?.id, storeLocation?.lat, storeLocation?.lon],
    queryFn: async () => {
      if (!selectedSalon || !storeLocation) return null;
      const result = await getDistance({
        userLocation: { lat: storeLocation.lat, lng: storeLocation.lon },
        businessLocation: { lat: selectedSalon.lat, lng: selectedSalon.lng },
      });
      return result;
    },
    enabled: !!selectedSalon && !!storeLocation,
  });

  // Transform businesses to MapSalon format
  const salons = useMemo<MapSalon[]>(() => {
    if (!businessesData?.data) return [];
    return businessesData.data
      .filter((b) => b.location?.lat && b.location?.lng)
      .map((business) => {
        const services = business.services || [];
        const serviceNames = services.slice(0, 3).map((s) => s.name?.[language] || s.name?.uz || "");

        return {
          id: business.business_id || business.business_name || "unknown",
          name: business.business_name || "Unknown",
          image: business.avatar_url,
          address: business.location?.display_address || "",
          rating: 4.5,
          reviewCount: "1.2k",
          lat: business.location!.lat,
          lng: business.location!.lng,
          services: serviceNames,
          distance: formatDistance(business.distance, business.distance_metric),
        };
      });
  }, [businessesData, language]);

  useEffect(() => {
    bottomNav.hide();
    return () => {
      bottomNav.show();
    };
  }, []);

  // Request user location from store if not available
  useEffect(() => {
    if (!storeLocation && !isLocationLoading) {
      fetchLocation().then(() => {
        // Check if location was obtained after fetch
        const loc = useLocationStore.getState().location;
        if (!loc) {
          setLocationError(true);
        }
      });
    }
  }, [storeLocation, isLocationLoading, fetchLocation]);

  // Dynamically import leaflet components (client-side only)
  useEffect(() => {
    import("react-leaflet").then((module) => {
      import("leaflet").then((L) => {
        // Fix default marker icon
        delete (L.default.Icon.Default.prototype as any)._getIconUrl;
        L.default.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });

        // Create map component
        const { MapContainer, TileLayer, Marker, Popup } = module;


        // Custom user location icon with pulsing effect
        const userIcon = new L.default.DivIcon({
          className: "user-location-marker",
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">
              <div style="position: absolute; width: 40px; height: 40px; background: rgba(59, 130, 246, 0.2); border-radius: 50%; animation: pulse 2s ease-out infinite;"></div>
              <div style="position: absolute; width: 24px; height: 24px; background: rgba(59, 130, 246, 0.3); border-radius: 50%;"></div>
              <div style="position: relative; width: 16px; height: 16px; background: #3b82f6; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const Map = ({
          userLoc,
          businesses,
          onSalonClick,
        }: {
          userLoc: { lat: number; lng: number } | null;
          businesses: MapSalon[];
          onSalonClick: (salon: MapSalon) => void;
        }) => (
          <MapContainer
            center={userLoc ? [userLoc.lat, userLoc.lng] : [DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng]}
            zoom={14}
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              attribution=""
              url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png"
            />
            {/* User location marker */}
            {userLoc && (
              <Marker position={[userLoc.lat, userLoc.lng]} icon={userIcon}>
                <Popup>
                  <div className="font-medium">Sizning joylashuvingiz</div>
                </Popup>
              </Marker>
            )}
            {businesses.map((salon) => (
              <Marker
                key={salon.id}
                position={[salon.lat, salon.lng]}
                eventHandlers={{
                  click: () => onSalonClick(salon),
                }}
              >
                <Popup>
                  <div className="font-medium">{salon.name}</div>
                  {salon.address && <div className="text-sm text-gray-500">{salon.address}</div>}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        );

        setMapComponent(() => Map);
      });
    });
  }, []);

  return (
    <AppLayout back>
      {/* Import Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <style>{`
        .leaflet-control-attribution {
          display: none !important;
        }
        .leaflet-container {
          touch-action: none;
        }
        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .user-location-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>

      <div className="relative h-[calc(100vh)] overflow-hidden">
        {/* Map */}
        <div className="absolute inset-0">
          {locationError && !userLocation ? (
            <div className="h-full w-full flex flex-col items-center justify-center gap-4 bg-stone-100 dark:bg-stone-800 p-4">
              <p className="text-stone-600 dark:text-stone-400 text-center">
                Joylashuvni aniqlab bo'lmadi
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setLocationError(false);
                    fetchLocation().then(() => {
                      const loc = useLocationStore.getState().location;
                      if (!loc) {
                        setLocationError(true);
                      }
                    });
                  }}
                  className="px-4 py-2 bg-primary text-white font-medium rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                  <RefreshCw size={16} />
                  Qayta urinish
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium rounded-xl flex items-center gap-2 hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Orqaga
                </button>
              </div>
            </div>
          ) : isLocationLoading && !userLocation ? (
            <div className="h-full w-full flex items-center justify-center bg-stone-100 dark:bg-stone-800">
              <div className="flex flex-col items-center gap-2">
                <div className="size-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                <span className="text-sm text-stone-500">Joylashuv aniqlanmoqda...</span>
              </div>
            </div>
          ) : MapComponent ? (
            <MapComponent
              userLoc={userLocation}
              businesses={salons}
              onSalonClick={setSelectedSalon}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-stone-100 dark:bg-stone-800">
              <div className="flex flex-col items-center gap-2">
                <div className="size-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                <span className="text-sm text-stone-500">Xarita yuklanmoqda...</span>
              </div>
            </div>
          )}
        </div>

        {/* Salon count badge */}
        <div className="absolute top-4 left-4 z-[1000]">
          <div className="px-3 py-1.5 bg-white dark:bg-stone-800 rounded-full shadow-lg text-sm font-medium text-stone-900 dark:text-stone-100">
            {isLoadingBusinesses ? (
              <span className="flex items-center gap-2">
                <div className="size-3 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                Yuklanmoqda...
              </span>
            ) : (
              `${salons.length} ta salon`
            )}
          </div>
        </div>

        {/* Selected Salon Card */}
        {selectedSalon && (
          <div className="fixed bottom-4 left-4 right-4 z-[1000]">
            <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-xl p-3">
              <div className="flex gap-3">
                {selectedSalon.image ? (
                  <img
                    src={selectedSalon.image}
                    alt={selectedSalon.name}
                    className="size-20 rounded-xl object-cover shrink-0"
                  />
                ) : (
                  <div className="size-20 rounded-xl bg-stone-200 dark:bg-stone-700 shrink-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-stone-400 dark:text-stone-500">
                      {selectedSalon.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-stone-900 dark:text-stone-100 line-clamp-1">
                      {selectedSalon.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSelectedSalon(null)}
                      className="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-full shrink-0"
                    >
                      <X size={16} className="text-stone-400" />
                    </button>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    {selectedSalon.address}
                    {selectedDistance && (
                      <span className="ml-1">
                        • {formatDistance(selectedDistance.distance, selectedDistance.metric)} uzoqlikda
                      </span>
                    )}
                    {isLoadingDistance && !selectedDistance && (
                      <span className="ml-1 inline-flex items-center gap-1">
                        • <span className="size-2 border border-stone-400 border-t-transparent rounded-full animate-spin" />
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={14} className="fill-yellow-500 text-yellow-500" />
                    <span className="text-sm font-medium text-stone-900 dark:text-stone-100">
                      {selectedSalon.rating}
                    </span>
                    <span className="text-xs text-stone-400">
                      ({selectedSalon.reviewCount})
                    </span>
                  </div>
                  {selectedSalon.services.length > 0 && (
                    <div className="flex items-center gap-1 mt-1.5">
                      {selectedSalon.services.slice(0, 3).map((service) => (
                        <span
                          key={service}
                          className="px-2 py-0.5 bg-stone-100 dark:bg-stone-700 rounded-full text-xs text-stone-600 dark:text-stone-300"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/salon/${selectedSalon.id}`)}
                className="w-full mt-3 py-2.5 bg-primary text-white font-medium rounded-xl flex items-center justify-center gap-1 hover:bg-primary/90 transition-colors"
              >
                Batafsil ko'rish
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
