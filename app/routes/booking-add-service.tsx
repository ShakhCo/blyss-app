import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { AppLayout } from "~/components/AppLayout";
import { Button } from "@heroui/react";
import { useBookingCartStore } from "~/stores/booking";
import { Check, ChevronLeft } from "lucide-react";
import { bottomNav } from "~/stores/bottomNav";

// Import service icons
import scissorIcon from "~/assets/icons/scissor.png";
import makeupIcon from "~/assets/icons/makeup.png";
import massageIcon from "~/assets/icons/massage.png";
import creamIcon from "~/assets/icons/cream.png";
import pluckingIcon from "~/assets/icons/plucking.png";

const categoryIcons: Record<string, string> = {
  Soch: scissorIcon,
  Tirnoq: pluckingIcon,
  Yuz: makeupIcon,
  Spa: massageIcon,
  Teri: creamIcon,
};

// Mock salon data (same as booking.tsx)
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
  },
  "2": {
    id: "2",
    name: "Zilola Beauty",
    services: [
      { id: "1", name: "Soch olish", duration: "30 daqiqa", price: "60,000", category: "Soch" },
      { id: "2", name: "Pardoz", duration: "1 soat", price: "120,000", category: "Yuz" },
      { id: "3", name: "Qosh bo'yash", duration: "30 daqiqa", price: "40,000", category: "Yuz" },
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
  },
};

export function meta() {
  return [
    { title: "Xizmat qo'shish - Blyss" },
    { name: "description", content: "Qo'shimcha xizmat tanlash" },
  ];
}

export default function BookingAddService() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { selectedServices, addService } = useBookingCartStore();

  const salonId = searchParams.get("salonId") || "1";
  const salon = salonsData[salonId] || salonsData["1"];

  // Capture available services on mount only
  const [availableServices] = useState(() =>
    salon.services.filter(
      (s) => !selectedServices.some((ss) => ss.id === s.id)
    )
  );

  // Group available services by category
  const servicesByCategory = availableServices.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, typeof availableServices>);

  useEffect(() => {
    bottomNav.hide();
  }, []);

  const [isNavigating, setIsNavigating] = useState(false);

  const handleAddService = (service: typeof salon.services[0]) => {
    setIsNavigating(true);
    addService(service);
    navigate(`/booking?salonId=${salonId}`, { replace: true });
  };

  return (
    <AppLayout back>
      
      <div className="px-4 pt-6 pb-4 flex items-center gap-2">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          Xizmat qo'shish
        </h1>
      </div>

      <div className="bg-white dark:bg-stone-900">
        {!isNavigating && availableServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Check size={32} className="text-primary" />
            </div>
            <p className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
              Barcha xizmatlar tanlangan
            </p>
            <p className="text-sm text-stone-500 text-center">
              Siz barcha mavjud xizmatlarni tanladingiz
            </p>
            <Button
              className="mt-6"
              onPress={() => navigate(-1)}
            >
              Orqaga qaytish
            </Button>
          </div>
        ) : (
          <div>
            {Object.entries(servicesByCategory).map(([category, services]) => (
              <div key={category} className="border-b-1 border-stone-100 dark:border-stone-800">
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
                      className="px-4 py-4 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-stone-900 dark:text-stone-100">
                          {service.name}
                        </h4>
                        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                          {service.duration} · {service.price} so'm
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddService(service)}
                        type="button"
                        className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary/90 transition-colors active:scale-[0.98]"
                      >
                        Qo'shish
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
