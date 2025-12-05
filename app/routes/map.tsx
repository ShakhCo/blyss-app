import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AppLayout } from "~/components/AppLayout";
import type { Route } from "./+types/map";
import { bottomNav } from "~/stores/bottomNav";
import { Star, X, ChevronRight } from "lucide-react";

// Salon data with coordinates
const salons = [
  {
    id: "1",
    name: "Malika Go'zallik Saloni",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop",
    address: "Navoiy ko'chasi, 25",
    rating: 4.8,
    reviewCount: "3.1k",
    lat: 41.311081,
    lng: 69.240562,
    services: ["Soch", "Tirnoq", "Yuz"],
  },
  {
    id: "2",
    name: "Zilola Beauty",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop",
    address: "Amir Temur shoh ko'chasi, 108",
    rating: 4.7,
    reviewCount: "2.7k",
    lat: 41.314472,
    lng: 69.248123,
    services: ["Soch", "Yuz", "Pardoz"],
  },
  {
    id: "3",
    name: "Sitora Salon",
    image: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=400&h=400&fit=crop",
    address: "Bobur ko'chasi, 42",
    rating: 4.9,
    reviewCount: "1.8k",
    lat: 41.308234,
    lng: 69.253891,
    services: ["Pardoz", "Soch", "Spa"],
  },
  {
    id: "4",
    name: "Baraka Sartaroshxona",
    image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=400&fit=crop",
    address: "Yunusobod tumani, 12",
    rating: 4.6,
    reviewCount: "980",
    lat: 41.318921,
    lng: 69.232145,
    services: ["Soch olish", "Soqol"],
  },
  {
    id: "5",
    name: "Premium Beauty Studio",
    image: "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=400&h=400&fit=crop",
    address: "Mirzo Ulug'bek, 55",
    rating: 4.9,
    reviewCount: "2.1k",
    lat: 41.305678,
    lng: 69.267432,
    services: ["Pardoz", "Tirnoq", "Epilyatsiya"],
  },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Xarita - Blyss" },
    { name: "description", content: "Yaqin atrofdagi salonlar" },
  ];
}

export default function MapPage() {
  const navigate = useNavigate();
  const [selectedSalon, setSelectedSalon] = useState<typeof salons[0] | null>(null);
  const [MapComponent, setMapComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    bottomNav.hide();
    return () => {
      bottomNav.show();
    };
  }, []);

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
        const { MapContainer, TileLayer, Marker, Popup, useMap } = module;

        // Component to handle map centering
        const MapController = ({ salon }: { salon: typeof salons[0] | null }) => {
          const map = useMap();
          useEffect(() => {
            if (salon) {
              map.flyTo([salon.lat, salon.lng], 15, {
                animate: true,
                duration: 1.5,
              });
            }
          }, [salon, map]);
          return null;
        };

        const Map = ({ selected }: { selected: typeof salons[0] | null }) => (
          <MapContainer
            center={[41.311081, 69.245]}
            zoom={13}
            className="h-full w-full"
            zoomControl={false}
          >
            <MapController salon={selected} />
            <TileLayer
              attribution=""
              url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png"
            />
            {salons.map((salon) => (
              <Marker
                key={salon.id}
                position={[salon.lat, salon.lng]}
                eventHandlers={{
                  click: () => setSelectedSalon(salon),
                }}
              >
                <Popup>
                  <div className="font-medium">{salon.name}</div>
                  <div className="text-sm text-gray-500">{salon.address}</div>
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
      `}</style>

      <div className="relative h-[calc(100vh-7.5rem)] overflow-hidden">
        {/* Map */}
        <div className="absolute inset-0">
          {MapComponent ? (
            <MapComponent selected={selectedSalon} />
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
            {salons.length} ta salon
          </div>
        </div>

        {/* Selected Salon Card */}
        {selectedSalon && (
          <div className="fixed bottom-4 left-4 right-4 z-[1000]">
            <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-xl p-3">
              <div className="flex gap-3">
                <img
                  src={selectedSalon.image}
                  alt={selectedSalon.name}
                  className="size-20 rounded-xl object-cover shrink-0"
                />
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
