import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { AppLayout } from "~/components/AppLayout";
import { Button, Spinner } from "@heroui/react";
import { useBookingCartStore, type BookingService } from "~/stores/booking";
import { getBusinessDetails, type BusinessDetailsService } from "~/lib/business-api";
import { Check, AlertCircle } from "lucide-react";
import { bottomNav } from "~/stores/bottomNav";

export function meta() {
  return [
    { title: "Xizmat qo'shish - Blyss" },
    { name: "description", content: "Qo'shimcha xizmat tanlash" },
  ];
}

// Format price with thousand separators
function formatPrice(price: number): string {
  return price.toLocaleString("uz-UZ");
}

// Format duration to readable string
function formatDuration(minutes: number | undefined | null): string {
  if (!minutes || minutes <= 0) {
    return "";
  }
  if (minutes < 60) {
    return `${minutes} daqiqa`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} soat`;
  }
  return `${hours} soat ${remainingMinutes} daqiqa`;
}

// Get duration from service (handles both field names)
function getServiceDuration(service: { duration_minutes?: number; duration?: number }): number {
  return service.duration_minutes || service.duration || 0;
}

// Get service name (prefer Uzbek)
function getServiceName(name: { uz: string; ru: string } | undefined): string {
  if (!name) return "Xizmat";
  return name.uz || name.ru || "Xizmat";
}

export default function BookingAddService() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { selectedServices, addService, salonId: cartSalonId } = useBookingCartStore();

  const salonId = searchParams.get("salonId") || cartSalonId || "";

  // State for fetching services
  const [services, setServices] = useState<BusinessDetailsService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    bottomNav.hide();
  }, []);

  // Fetch business services
  useEffect(() => {
    if (!salonId) {
      setError("Biznes topilmadi");
      setIsLoading(false);
      return;
    }

    const fetchServices = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const details = await getBusinessDetails(salonId);
        setServices(details.services || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Xizmatlarni yuklashda xatolik");
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [salonId]);

  // Filter out already selected services
  const availableServices = services.filter(
    (s) => s.id && !selectedServices.some((ss) => ss.id === s.id)
  );

  const handleAddService = (service: BusinessDetailsService) => {
    if (!service.id) return;

    setIsNavigating(true);

    // Convert to BookingService format
    const durationMins = getServiceDuration(service);
    const bookingService: BookingService = {
      id: service.id,
      name: getServiceName(service.name),
      nameMultilingual: service.name,
      duration: formatDuration(durationMins) || "—",
      durationMinutes: durationMins,
      price: formatPrice(service.price || 0),
      priceNumber: service.price || 0,
      category: "Xizmat", // API doesn't return category
    };

    addService(bookingService);
    navigate(`/booking?salonId=${salonId}`, { replace: true });
  };

  // Loading state
  if (isLoading) {
    return (
      <AppLayout back>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" color="current" />
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AppLayout back>
        <div className="flex flex-col items-center justify-center h-64 px-4">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <p className="text-stone-500 text-center mb-4">{error}</p>
          <Button onPress={() => navigate(-1)}>Orqaga qaytish</Button>
        </div>
      </AppLayout>
    );
  }

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
              {services.length === 0
                ? "Xizmatlar mavjud emas"
                : "Barcha xizmatlar tanlangan"}
            </p>
            <p className="text-sm text-stone-500 text-center">
              {services.length === 0
                ? "Bu biznesda hozircha xizmatlar yo'q"
                : "Siz barcha mavjud xizmatlarni tanladingiz"}
            </p>
            <Button className="mt-6" onPress={() => navigate(-1)}>
              Orqaga qaytish
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {availableServices.map((service) => (
              <div
                key={service.id}
                className="px-4 py-4 flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-stone-900 dark:text-stone-100">
                    {getServiceName(service.name)}
                  </h4>
                  <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                    {formatDuration(getServiceDuration(service))
                      ? `${formatDuration(getServiceDuration(service))} · `
                      : ""}
                    {formatPrice(service.price || 0)} so'm
                  </p>
                  {service.description?.uz && (
                    <p className="text-xs text-stone-400 mt-1 line-clamp-2">
                      {service.description.uz}
                    </p>
                  )}
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
        )}
      </div>
    </AppLayout>
  );
}
