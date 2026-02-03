import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { AppLayout } from "~/components/AppLayout";
import { Avatar, Button, Spinner } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import type { Route } from "./+types/booking";
import {
  useBookingStore,
  useBookingCartStore,
  useBookingUIStore,
  type BookingService,
  type BookingServiceWithSelection,
} from "~/stores/booking";
import {
  Clock,
  Calendar as CalendarIcon,
  Check,
  User,
  X,
  ChevronDown,
  Banknote,
  Building2,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { Calendar } from "~/components/Calendar";
import { bottomNav } from "~/stores/bottomNav";
import { useI18nStore } from "~/stores/i18n-store";
import {
  getEmployeesForService,
  getAvailableSlots,
  createBooking,
  formatDateToAPI,
  getEmployeeFullName,
  type Employee,
  type CreateBookingRequest,
  type BookingItem,
} from "~/lib/booking-api";
import { getBusinessDetails } from "~/lib/business-api";
import { useUserStore, isAuthenticated } from "~/stores/user-store";
import { AuthDialog } from "~/components/AuthDialog";

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

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Band qilish - Blyss" },
    { name: "description", content: "Xizmatni band qilish" },
  ];
}

export default function Booking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language, t } = useI18nStore();
  const user = useUserStore((state) => state.user);
  const accessToken = useUserStore((state) => state.access_token);

  // Auth dialog state
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [pendingBookingConfirm, setPendingBookingConfirm] = useState(false);

  // Cart store
  const {
    salonId,
    salonName,
    selectedServices,
    selectedDate,
    availableSlots,
    isLoadingSlots,
    addService,
    removeService,
    updateServiceEmployee,
    updateServiceTime,
    setSelectedDate,
    setAvailableSlots,
    setIsLoadingSlots,
    clearCart,
    getTotalPrice,
    getTotalDuration,
    isReadyToBook,
    setSalon,
  } = useBookingCartStore();

  const addBooking = useBookingStore((state) => state.addBooking);

  // UI state
  const {
    isStylistExpanded,
    isLocationExpanded,
    isServicesExpanded,
    isCalendarExpanded,
    isTimeExpanded,
    activeServiceIndex,
    setExpanded,
    setActiveServiceIndex,
    resetUI,
  } = useBookingUIStore();

  const setIsStylistExpanded = (value: boolean) => setExpanded("isStylistExpanded", value);
  const setIsLocationExpanded = (value: boolean) => setExpanded("isLocationExpanded", value);
  const setIsServicesExpanded = (value: boolean) => setExpanded("isServicesExpanded", value);
  const setIsCalendarExpanded = (value: boolean) => setExpanded("isCalendarExpanded", value);
  const setIsTimeExpanded = (value: boolean) => setExpanded("isTimeExpanded", value);

  // Local state
  const [serviceLocation, setServiceLocation] = useState<"salon" | "home">("salon");
  const [employeesPerService, setEmployeesPerService] = useState<Record<string, Employee[]>>({});
  const [loadingEmployees, setLoadingEmployees] = useState<Record<string, boolean>>({});
  const [employeeErrors, setEmployeeErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref for caching employees by service+date
  const employeeCache = useRef<Map<string, Employee[]>>(new Map());

  // URL params
  const urlSalonId = searchParams.get("salonId");
  const urlServiceId = searchParams.get("serviceId");

  // Initialize from URL params if cart is empty
  useEffect(() => {
    async function initializeFromUrl() {
      if (urlSalonId && (!salonId || salonId !== urlSalonId)) {
        try {
          const businessDetails = await getBusinessDetails(urlSalonId);
          if (businessDetails.business_name) {
            setSalon(urlSalonId, businessDetails.business_name);
          }

          // Add initial service if provided
          if (urlServiceId && businessDetails.services) {
            const service = businessDetails.services.find((s) => s.id === urlServiceId);
            if (service) {
              const bookingService: BookingService = {
                id: service.id || "",
                name: service.name?.[language] || service.name?.uz || "",
                nameMultilingual: service.name,
                duration: service.duration_minutes ? `${service.duration_minutes} daqiqa` : "",
                durationMinutes: service.duration_minutes,
                price: service.price?.toLocaleString() || "0",
                priceNumber: service.price,
                category: "General",
              };
              addService(bookingService);
            }
          }
        } catch (err) {
          console.error("Failed to load business details:", err);
        }
      }
    }

    initializeFromUrl();
  }, [urlSalonId, urlServiceId]);

  // Fetch employees for each selected service with proper cleanup
  useEffect(() => {
    const abortController = new AbortController();

    async function fetchEmployeesForServices() {
      if (!salonId || selectedServices.length === 0) return;

      const dateStr = selectedDate || undefined;

      for (const service of selectedServices) {
        if (abortController.signal.aborted) return;

        // Skip if already have employees for this service+date combo
        const cacheKey = `${service.id}-${dateStr || "no-date"}`;
        if (employeeCache.current.has(cacheKey)) {
          // Use cached data if available
          const cachedEmployees = employeeCache.current.get(cacheKey);
          if (cachedEmployees && !employeesPerService[service.id]) {
            setEmployeesPerService((prev) => ({
              ...prev,
              [service.id]: cachedEmployees,
            }));
          }
          continue;
        }

        // Skip if already loading
        if (loadingEmployees[service.id]) {
          continue;
        }

        setLoadingEmployees((prev) => ({ ...prev, [service.id]: true }));
        // Clear any previous error for this service
        setEmployeeErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[service.id];
          return newErrors;
        });

        try {
          const result = await getEmployeesForService(salonId, service.id, dateStr);
          if (!abortController.signal.aborted) {
            setEmployeesPerService((prev) => ({
              ...prev,
              [service.id]: result.employees,
            }));
            employeeCache.current.set(cacheKey, result.employees);
          }
        } catch (err) {
          if (!abortController.signal.aborted) {
            console.error(`Failed to fetch employees for service ${service.id}:`, err);
            setEmployeeErrors((prev) => ({
              ...prev,
              [service.id]: "Mutaxassislarni yuklashda xatolik",
            }));
          }
        } finally {
          if (!abortController.signal.aborted) {
            setLoadingEmployees((prev) => ({ ...prev, [service.id]: false }));
          }
        }
      }
    }

    fetchEmployeesForServices();

    return () => {
      abortController.abort();
    };
  }, [salonId, selectedServices, selectedDate]);

  // Fetch available slots when date is selected (without requiring employee)
  const fetchAvailableSlots = useCallback(
    async () => {
      if (!salonId || !selectedDate || selectedServices.length === 0) return;

      const service = selectedServices[0]; // Use first service for slot fetching
      setIsLoadingSlots(true);

      try {
        const result = await getAvailableSlots(salonId, {
          date: selectedDate,
          service_id: service.id,
          // No employee_id - get all available slots
        });

        setAvailableSlots(result.slots);
      } catch (err) {
        console.error("Failed to fetch available slots:", err);
        setAvailableSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    },
    [salonId, selectedDate, selectedServices]
  );

  // Auto-fetch slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate, fetchAvailableSlots]);

  useEffect(() => {
    bottomNav.hide();
    // Reset UI state on mount
    resetUI();

    // Auto-select today's date on mount
    if (!selectedDate) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      setSelectedDate(`${year}-${month}-${day}`);
    }

    return () => bottomNav.show();
  }, []);

  // Calculate total price
  const homeServiceFee = 30000;
  const totalPrice = getTotalPrice() + (serviceLocation === "home" ? homeServiceFee : 0);
  const formatPrice = (price: number) => price.toLocaleString("uz-UZ");

  // Handle date selection
  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    // Clear time and employee selections when date changes
    selectedServices.forEach((service) => {
      updateServiceTime(service.id, null);
      updateServiceEmployee(service.id, null);
    });
    // Don't clear availableSlots here - keep showing old slots with loading overlay
    // Clear employees to force re-fetch with new date
    setEmployeesPerService({});
    setEmployeeErrors({});
  };

  // Handle time selection (before employee)
  const handleTimeSelect = (serviceId: string, time: string) => {
    updateServiceTime(serviceId, time);
    // After selecting time, expand employee selection
    setIsStylistExpanded(true);
  };

  // Handle employee selection for a service
  const handleEmployeeSelect = (serviceId: string, employee: Employee) => {
    updateServiceEmployee(serviceId, employee);
    setIsStylistExpanded(false);

    // Move to next service if there are more
    const currentIndex = selectedServices.findIndex((s) => s.id === serviceId);
    if (currentIndex < selectedServices.length - 1) {
      setActiveServiceIndex(currentIndex + 1);
      // Reset time for next service
      setIsStylistExpanded(false);
    }
  };

  // Handle booking confirmation
  const handleConfirmBooking = async () => {
    if (!isReadyToBook() || !salonId || !selectedDate) return;

    // Check if user is authenticated
    if (!isAuthenticated(accessToken)) {
      // Show auth dialog
      setIsAuthDialogOpen(true);
      setPendingBookingConfirm(true);
      return;
    }

    await submitBooking();
  };

  // Actually submit the booking (called after auth or if already authenticated)
  const submitBooking = async () => {
    if (!isReadyToBook() || !salonId || !selectedDate) return;

    // Get fresh user data from store (may have changed after login)
    const currentUser = useUserStore.getState().user;

    setIsSubmitting(true);
    setError(null);

    try {
      // Build booking items
      const items: BookingItem[] = selectedServices.map((service) => ({
        service_id: service.id,
        service_name: service.nameMultilingual || { uz: service.name, ru: service.name },
        employee_id: service.selectedEmployee!.id,
        employee_name: getEmployeeFullName(service.selectedEmployee!),
        start_time: `${selectedDate}T${service.selectedTime}`,
        price: service.selectedEmployee!.service_price,
        duration_minutes: service.selectedEmployee!.service_duration_minutes,
      }));

      const bookingRequest: CreateBookingRequest = {
        business_id: salonId,
        customer_name: currentUser?.first_name
          ? `${currentUser.first_name} ${currentUser.last_name || ""}`.trim()
          : "Guest",
        customer_phone: currentUser?.phone_number || "",
        customer_telegram_id: currentUser?.telegram_id || null,
        booking_date: selectedDate,
        notes: serviceLocation === "home" ? "Xizmat manzilda ko'rsatiladi" : "",
        items,
      };

      const result = await createBooking(salonId, bookingRequest);

      // Add to local store for immediate display
      addBooking({
        salonId,
        salonName: salonName || "",
        services: selectedServices,
        date: selectedDate,
        time: selectedServices[0].selectedTime || "",
        status: "pending",
      });

      // Clear cart and navigate
      clearCart();
      resetUI();
      navigate("/orders");
    } catch (err) {
      console.error("Failed to create booking:", err);
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle successful authentication from dialog
  const handleAuthSuccess = () => {
    setIsAuthDialogOpen(false);
    if (pendingBookingConfirm) {
      setPendingBookingConfirm(false);
      // Submit booking after successful auth
      submitBooking();
    }
  };

  // Get active service for employee/time selection
  const activeService = selectedServices[activeServiceIndex] || selectedServices[0];

  // Check if date has any available slots (simplified check)
  const isDateUnavailable = (date: Date): boolean => {
    // For now, just check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Get services that still need employee/time selection (memoized for performance)
  const pendingServices = useMemo(
    () => selectedServices.filter((s) => !s.selectedEmployee || !s.selectedTime),
    [selectedServices]
  );
  const completedServices = useMemo(
    () => selectedServices.filter((s) => s.selectedEmployee && s.selectedTime),
    [selectedServices]
  );

  if (!salonId || selectedServices.length === 0) {
    return (
      <AppLayout back>
        <div className="flex flex-col items-center justify-center h-64 px-4">
          <AlertCircle className="text-stone-400 mb-4" size={48} />
          <p className="text-stone-500 text-center">
            Xizmat tanlanmagan. Iltimos, salondan xizmat tanlang.
          </p>
          <Button className="mt-4" onPress={() => navigate(-1)}>
            Orqaga
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout back>
      <div className="bg-stone-50 dark:bg-stone-950 min-h-screen pb-24">

        {/* Salon Name */}
        <div className="bg-white dark:bg-stone-900 px-5 pt-6 pb-4 sticky top-0 z-100 border-b border-stone-100 dark:border-stone-800">
          <h1 className="font-semibold text-xl text-stone-900 dark:text-stone-100">{salonName}</h1>
        </div>

        {/* Date Selection - Always visible */}
        <div className="bg-white dark:bg-stone-900 mt-2 border-b border-stone-100 dark:border-stone-800">
          <div className="px-4 pb-4 pt-3">
            <Calendar
              value={selectedDate || undefined}
              onChange={handleDateSelect}
              isDateUnavailable={isDateUnavailable}
            />
          </div>
        </div>

        {/* Time Selection - Right under calendar */}
        {selectedDate && (
          <div className="py-3 bg-white dark:bg-stone-900 mt-2 border-b border-stone-100 dark:border-stone-800">

            {/* <div className="px-4 flex items-center gap-2 mb-3">
              <Clock size={18} className="text-primary" />
              <p className="text-sm font-medium text-stone-700 dark:text-stone-300">Vaqtni tanlang</p>
            </div> */}

            {availableSlots.length === 0 && !isLoadingSlots ? (
              <p className="text-sm text-stone-500 py-2">
                Bo'sh vaqt yo'q. Boshqa sanani tanlang.
              </p>
            ) : (
              <div className="relative">
                {/* Loading overlay */}
                {isLoadingSlots && (
                  <div className="absolute inset-0 bg-white/60 dark:bg-stone-900/60 z-10 flex items-center justify-center rounded-lg">
                    <Spinner size="sm" />
                  </div>
                )}

                <div className={`px-4 flex gap-2 overflow-x-auto scrollbar-hide py-1 ${isLoadingSlots ? "pointer-events-none" : ""}`}>
                  {availableSlots.map(({ time, available_employees }) => {
                    const activeService = selectedServices[activeServiceIndex];
                    const isSelected = activeService?.selectedTime === time;
                    const hasAvailableEmployees = available_employees.length > 0;

                    return (
                      <motion.button
                        key={time}
                        type="button"
                        onClick={() => {
                          if (hasAvailableEmployees && activeService && !isLoadingSlots) {
                            handleTimeSelect(activeService.id, time);
                          }
                        }}
                        disabled={!hasAvailableEmployees || isLoadingSlots}
                        initial={false}
                        animate={{ scale: isSelected ? 1.05 : 1 }}
                        className={`px-6 py-3 rounded-full text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${isSelected
                          ? "bg-primary text-white"
                          : hasAvailableEmployees
                            ? "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                            : "bg-stone-100 dark:bg-stone-800 text-stone-300 dark:text-stone-600 cursor-not-allowed"
                          }`}
                      >
                        {time}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Services with Employee Selection */}
        {selectedServices.map((service, index) => {
          // Get employees available at the selected time
          const selectedTime = service.selectedTime;
          const timeSlot = availableSlots.find((s) => s.time === selectedTime);
          const availableEmployeeIds = timeSlot?.available_employees || [];
          const allEmployees = employeesPerService[service.id] || [];
          const availableEmployees = selectedTime
            ? allEmployees.filter((e) => availableEmployeeIds.includes(e.id))
            : allEmployees;

          return (
            <div key={service.id} className="bg-white dark:bg-stone-900 mt-2">
              {/* Service Header */}
              <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 shrink-0 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                    <img
                      src={categoryIcons[service.category] || scissorIcon}
                      alt={service.name}
                      className="size-5 object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-stone-900 dark:text-stone-100">
                      {service.name}
                    </h3>
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      {service.selectedEmployee
                        ? `${formatPrice(service.selectedEmployee.service_price)} so'm · ${service.selectedEmployee.service_duration_minutes} daqiqa`
                        : `${service.price} so'm · ${service.duration}`}
                      {service.selectedTime && (
                        <span className="text-primary"> · {service.selectedTime}</span>
                      )}
                    </p>
                  </div>
                </div>
                {selectedServices.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeService(service.id)}
                    className="size-8 flex items-center justify-center rounded-full border border-red-300 text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Employee Selection - Only show after time is selected */}
              {service.selectedTime && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveServiceIndex(index);
                      setIsStylistExpanded(activeServiceIndex === index ? !isStylistExpanded : true);
                    }}
                    className="w-full px-4 py-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {service.selectedEmployee ? (
                        <Avatar className="size-10">
                          <Avatar.Fallback>
                            {service.selectedEmployee.first_name.slice(0, 2)}
                          </Avatar.Fallback>
                        </Avatar>
                      ) : (
                        <div className="size-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                          <User size={18} className="text-stone-400" />
                        </div>
                      )}
                      <div className="text-left">
                        <p className="text-sm text-stone-500 dark:text-stone-400">Mutaxassis</p>
                        <p className="font-medium text-stone-900 dark:text-stone-100">
                          {service.selectedEmployee
                            ? getEmployeeFullName(service.selectedEmployee)
                            : "Tanlang"}
                        </p>
                      </div>
                    </div>
                    {loadingEmployees[service.id] ? (
                      <Spinner size="sm" />
                    ) : (
                      <ChevronDown
                        size={20}
                        className={`text-stone-400 transition-transform ${activeServiceIndex === index && isStylistExpanded ? "rotate-180" : ""
                          }`}
                      />
                    )}
                  </button>

                  {/* Employees List - Filtered by availability at selected time */}
                  <AnimatePresence initial={false}>
                    {activeServiceIndex === index && isStylistExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="overflow-hidden"
                      >
                        <div className="divide-y divide-stone-100 dark:divide-stone-800 bg-stone-50 dark:bg-stone-950">
                          {employeeErrors[service.id] && (
                            <p className="px-4 py-3 text-sm text-red-500">
                              {employeeErrors[service.id]}
                            </p>
                          )}
                          {!employeeErrors[service.id] && availableEmployees.length === 0 && (
                            <p className="px-4 py-3 text-sm text-stone-500">
                              Bu vaqtda bo'sh mutaxassis yo'q
                            </p>
                          )}
                          {availableEmployees.map((employee) => (
                            <button
                              key={employee.id}
                              type="button"
                              onClick={() => handleEmployeeSelect(service.id, employee)}
                              className="w-full px-4 py-3 flex items-center justify-between hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="size-10">
                                  <Avatar.Fallback>
                                    {employee.first_name.slice(0, 2)}
                                  </Avatar.Fallback>
                                </Avatar>
                                <div className="text-left">
                                  <p className="font-medium text-stone-900 dark:text-stone-100">
                                    {getEmployeeFullName(employee)}
                                  </p>
                                  <p className="text-sm text-stone-500 dark:text-stone-400">
                                    {employee.position} · {formatPrice(employee.service_price)} so'm
                                  </p>
                                </div>
                              </div>
                              <div
                                className={`size-5 rounded-full border-2 flex items-center justify-center ${service.selectedEmployee?.id === employee.id
                                  ? "border-primary bg-primary"
                                  : "border-stone-300 dark:border-stone-600"
                                  }`}
                              >
                                {service.selectedEmployee?.id === employee.id && (
                                  <Check size={12} className="text-white" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          );
        })}

        {/* Add More Services Button */}
        <div className="bg-white dark:bg-stone-900 mt-2">
          <button
            type="button"
            onClick={() => navigate(`/booking/add-service?salonId=${salonId}`)}
            className="px-4 py-3 text-sm font-semibold text-primary w-full text-left"
          >
            + Boshqa xizmat qo'shish
          </button>
        </div>

        {/* Service Location */}
        <div className="bg-white dark:bg-stone-900 mt-2">
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
                  Xizmat joyi
                  {serviceLocation === "home" && (
                    <span className="text-primary"> · +{formatPrice(homeServiceFee)} so'm</span>
                  )}
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
                  <button
                    type="button"
                    onClick={() => {
                      setServiceLocation("salon");
                      setIsLocationExpanded(false);
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3"
                  >
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className="font-medium text-stone-900 dark:text-stone-100">Salonda</h4>
                      <p className="text-sm text-stone-500 dark:text-stone-400">
                        Salonga tashrif buyuring
                      </p>
                    </div>
                    <div
                      className={`size-5 shrink-0 rounded-full border-2 flex items-center justify-center ${serviceLocation === "salon"
                        ? "border-primary bg-primary"
                        : "border-stone-300 dark:border-stone-600"
                        }`}
                    >
                      {serviceLocation === "salon" && <Check size={12} className="text-white" />}
                    </div>
                  </button>

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
                    <div
                      className={`size-5 shrink-0 rounded-full border-2 flex items-center justify-center ${serviceLocation === "home"
                        ? "border-primary bg-primary"
                        : "border-stone-300 dark:border-stone-600"
                        }`}
                    >
                      {serviceLocation === "home" && <Check size={12} className="text-white" />}
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Payment Method */}
        <div className="bg-white dark:bg-stone-900 mt-2">
          <div className="w-full px-4 pr-5 py-4 flex items-center">
            <div className="flex items-center gap-3">
              <div className="size-12 shrink-0 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                <Banknote size={22} className="text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm text-stone-500 dark:text-stone-400">To'lov usuli</p>
                <p className="font-semibold text-stone-900 dark:text-stone-100">Naqd pul</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Bottom Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800">
          <Button
            className="w-full py-6 bg-primary text-white font-semibold rounded-2xl disabled:opacity-50"
            isDisabled={!isReadyToBook() || isSubmitting}
            onPress={handleConfirmBooking}
          >
            {isSubmitting ? (
              <Spinner size="sm" color="current" />
            ) : isReadyToBook() ? (
              <span className="flex items-center gap-2">
                <Check size={18} />
                Tasdiqlash — {formatPrice(totalPrice)} so'm
              </span>
            ) : pendingServices.length > 0 ? (
              `${pendingServices.length} ta xizmat uchun mutaxassis va vaqt tanlang`
            ) : (
              "Sana va vaqtni tanlang"
            )}
          </Button>
        </div>

        {/* Auth Dialog - shows when user tries to book without being logged in */}
        <AuthDialog
          isOpen={isAuthDialogOpen}
          onClose={() => {
            setIsAuthDialogOpen(false);
            setPendingBookingConfirm(false);
          }}
          onSuccess={handleAuthSuccess}
          title="Kirish kerak"
          subtitle="Buyurtmani tasdiqlash uchun telefon raqamingizni kiriting"
        />
      </div>
    </AppLayout>
  );
}
