import { useEffect, useState, useCallback } from "react";
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
import { useUserStore } from "~/stores/user-store";

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

export function meta({}: Route.MetaArgs) {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch employees for each selected service
  useEffect(() => {
    async function fetchEmployeesForServices() {
      if (!salonId || selectedServices.length === 0) return;

      const dateStr = selectedDate || undefined;

      for (const service of selectedServices) {
        if (employeesPerService[service.id] || loadingEmployees[service.id]) {
          continue;
        }

        setLoadingEmployees((prev) => ({ ...prev, [service.id]: true }));

        try {
          const result = await getEmployeesForService(salonId, service.id, dateStr);
          setEmployeesPerService((prev) => ({
            ...prev,
            [service.id]: result.employees,
          }));
        } catch (err) {
          console.error(`Failed to fetch employees for service ${service.id}:`, err);
        } finally {
          setLoadingEmployees((prev) => ({ ...prev, [service.id]: false }));
        }
      }
    }

    fetchEmployeesForServices();
  }, [salonId, selectedServices, selectedDate]);

  // Fetch available slots when date and employee are selected
  const fetchAvailableSlots = useCallback(
    async (service: BookingServiceWithSelection) => {
      if (!salonId || !selectedDate || !service.selectedEmployee) return;

      setIsLoadingSlots(true);

      try {
        const result = await getAvailableSlots(salonId, {
          date: selectedDate,
          service_id: service.id,
          employee_id: service.selectedEmployee.id,
          duration_minutes: service.selectedEmployee.service_duration_minutes,
        });

        setAvailableSlots(result.slots);
      } catch (err) {
        console.error("Failed to fetch available slots:", err);
        setAvailableSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    },
    [salonId, selectedDate]
  );

  // Auto-fetch slots when employee is selected
  useEffect(() => {
    const activeService = selectedServices[activeServiceIndex];
    if (activeService?.selectedEmployee && selectedDate) {
      fetchAvailableSlots(activeService);
    }
  }, [activeServiceIndex, selectedServices, selectedDate]);

  useEffect(() => {
    bottomNav.hide();
    return () => bottomNav.show();
  }, []);

  // Calculate total price
  const homeServiceFee = 30000;
  const totalPrice = getTotalPrice() + (serviceLocation === "home" ? homeServiceFee : 0);
  const formatPrice = (price: number) => price.toLocaleString("uz-UZ");

  // Handle date selection
  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    // Clear time selections when date changes
    selectedServices.forEach((service) => {
      updateServiceTime(service.id, null);
    });
    setAvailableSlots([]);
    setIsCalendarExpanded(false);
    setIsTimeExpanded(true);
  };

  // Handle employee selection for a service
  const handleEmployeeSelect = (serviceId: string, employee: Employee) => {
    updateServiceEmployee(serviceId, employee);
    // Clear time when employee changes
    updateServiceTime(serviceId, null);
    setIsStylistExpanded(false);

    // Auto-expand time section if date is selected
    if (selectedDate) {
      setIsTimeExpanded(true);
    }
  };

  // Handle time selection for a service
  const handleTimeSelect = (serviceId: string, time: string) => {
    updateServiceTime(serviceId, time);
    setIsTimeExpanded(false);

    // Move to next service if there are more
    const currentIndex = selectedServices.findIndex((s) => s.id === serviceId);
    if (currentIndex < selectedServices.length - 1) {
      setActiveServiceIndex(currentIndex + 1);
      setIsStylistExpanded(true);
    }
  };

  // Handle booking confirmation
  const handleConfirmBooking = async () => {
    if (!isReadyToBook() || !salonId || !selectedDate) return;

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
        customer_name: user?.first_name
          ? `${user.first_name} ${user.last_name || ""}`.trim()
          : "Guest",
        customer_phone: user?.phone_number || "",
        customer_telegram_id: user?.telegram_id || null,
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

  // Get active service for employee/time selection
  const activeService = selectedServices[activeServiceIndex] || selectedServices[0];

  // Check if date has any available slots (simplified check)
  const isDateUnavailable = (date: Date): boolean => {
    // For now, just check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Get services that still need employee/time selection
  const pendingServices = selectedServices.filter(
    (s) => !s.selectedEmployee || !s.selectedTime
  );
  const completedServices = selectedServices.filter(
    (s) => s.selectedEmployee && s.selectedTime
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
        <div className="bg-white dark:bg-stone-900 px-4 py-3 border-b border-stone-100 dark:border-stone-800">
          <h1 className="font-semibold text-stone-900 dark:text-stone-100">{salonName}</h1>
        </div>

        {/* Progress indicator for multi-service */}
        {selectedServices.length > 1 && (
          <div className="bg-white dark:bg-stone-900 px-4 py-3 border-b border-stone-100 dark:border-stone-800">
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {completedServices.length} / {selectedServices.length} xizmat sozlandi
            </p>
            <div className="flex gap-1 mt-2">
              {selectedServices.map((service, index) => (
                <button
                  key={service.id}
                  onClick={() => setActiveServiceIndex(index)}
                  className={`flex-1 h-1 rounded-full transition-colors ${
                    service.selectedEmployee && service.selectedTime
                      ? "bg-green-500"
                      : index === activeServiceIndex
                      ? "bg-primary"
                      : "bg-stone-200 dark:bg-stone-700"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Date Selection */}
        <div className="bg-white dark:bg-stone-900 mt-2">
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
                    ? new Date(selectedDate).toLocaleDateString("uz-UZ", {
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
                    onChange={handleDateSelect}
                    isDateUnavailable={isDateUnavailable}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Services with Employee & Time Selection */}
        {selectedServices.map((service, index) => (
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

            {/* Employee Selection */}
            <button
              type="button"
              onClick={() => {
                setActiveServiceIndex(index);
                setIsStylistExpanded(activeServiceIndex === index ? !isStylistExpanded : true);
              }}
              className="w-full px-4 py-3 flex items-center justify-between border-b border-stone-100 dark:border-stone-800"
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
                  className={`text-stone-400 transition-transform ${
                    activeServiceIndex === index && isStylistExpanded ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>

            {/* Employees List */}
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
                    {employeesPerService[service.id]?.length === 0 && (
                      <p className="px-4 py-3 text-sm text-stone-500">
                        Bu xizmat uchun mutaxassis topilmadi
                      </p>
                    )}
                    {employeesPerService[service.id]?.map((employee) => (
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
                          className={`size-5 rounded-full border-2 flex items-center justify-center ${
                            service.selectedEmployee?.id === employee.id
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

            {/* Time Selection */}
            {service.selectedEmployee && selectedDate && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setActiveServiceIndex(index);
                    setIsTimeExpanded(activeServiceIndex === index ? !isTimeExpanded : true);
                    if (!isTimeExpanded || activeServiceIndex !== index) {
                      fetchAvailableSlots(service);
                    }
                  }}
                  className="w-full px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                      <Clock size={18} className="text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-stone-500 dark:text-stone-400">Vaqt</p>
                      <p className="font-medium text-stone-900 dark:text-stone-100">
                        {service.selectedTime || "Tanlang"}
                      </p>
                    </div>
                  </div>
                  {isLoadingSlots && activeServiceIndex === index ? (
                    <Spinner size="sm" />
                  ) : (
                    <ChevronDown
                      size={20}
                      className={`text-stone-400 transition-transform ${
                        activeServiceIndex === index && isTimeExpanded ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {activeServiceIndex === index && isTimeExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="overflow-hidden"
                    >
                      <div className="flex gap-2 overflow-x-auto px-4 pb-4 pt-2 scrollbar-hide">
                        {availableSlots.length === 0 && !isLoadingSlots && (
                          <p className="text-sm text-stone-500 py-2">
                            Bo'sh vaqt yo'q. Boshqa sanani tanlang.
                          </p>
                        )}
                        {availableSlots.map(({ time, available_employees }) => {
                          const isAvailable = available_employees.includes(
                            service.selectedEmployee!.id
                          );
                          const isSelected = service.selectedTime === time;

                          return (
                            <motion.button
                              key={time}
                              type="button"
                              onClick={() => {
                                if (isAvailable) {
                                  handleTimeSelect(service.id, time);
                                }
                              }}
                              disabled={!isAvailable}
                              initial={false}
                              animate={{ scale: isSelected ? 1.05 : 1 }}
                              className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                                isSelected
                                  ? "bg-primary text-white"
                                  : isAvailable
                                  ? "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                                  : "bg-stone-100 dark:bg-stone-800 text-stone-300 dark:text-stone-600 cursor-not-allowed"
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
              </>
            )}
          </div>
        ))}

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
                      className={`size-5 shrink-0 rounded-full border-2 flex items-center justify-center ${
                        serviceLocation === "salon"
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
                      className={`size-5 shrink-0 rounded-full border-2 flex items-center justify-center ${
                        serviceLocation === "home"
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
              <Spinner size="sm" color="white" />
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
      </div>
    </AppLayout>
  );
}
