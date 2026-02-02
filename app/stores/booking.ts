import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Employee, TimeSlot } from "~/lib/booking-api";
import type { MultilingualText } from "~/lib/business-api";

export interface BookingService {
  id: string;
  name: string;
  nameMultilingual?: MultilingualText;
  duration: string;
  durationMinutes?: number;
  price: string;
  priceNumber?: number;
  category: string;
}

// Extended service with employee and time selection
export interface BookingServiceWithSelection extends BookingService {
  selectedEmployee?: Employee | null;
  selectedTime?: string | null; // "HH:mm" format
}

export interface Booking {
  id: string;
  salonId: string;
  salonName: string;
  services: BookingService[];
  date: string; // ISO date string
  time: string; // e.g., "14:00"
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string; // ISO date string
}

// Cart state for the booking flow (selected services before confirming)
interface BookingCartState {
  salonId: string | null;
  salonName: string | null;
  selectedServices: BookingServiceWithSelection[];
  selectedDate: string | null; // "YYYY-MM-DD"
  availableSlots: TimeSlot[];
  isLoadingSlots: boolean;

  // Actions
  setSalon: (salonId: string, salonName: string) => void;
  addService: (service: BookingService) => void;
  removeService: (serviceId: string) => void;
  updateServiceEmployee: (serviceId: string, employee: Employee | null) => void;
  updateServiceTime: (serviceId: string, time: string | null) => void;
  setSelectedDate: (date: string | null) => void;
  setAvailableSlots: (slots: TimeSlot[]) => void;
  setIsLoadingSlots: (loading: boolean) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalDuration: () => number;
  isReadyToBook: () => boolean;
  getFirstServiceStartTime: () => string | null;
}

interface BookingState {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, "id" | "createdAt">) => string;
  removeBooking: (id: string) => void;
  updateBookingStatus: (id: string, status: Booking["status"]) => void;
  getBookingById: (id: string) => Booking | undefined;
  getBookingsBySalon: (salonId: string) => Booking[];
  getUpcomingBookings: () => Booking[];
  getPastBookings: () => Booking[];
  clearAllBookings: () => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      bookings: [],

      addBooking: (bookingData) => {
        const id = crypto.randomUUID();
        const newBooking: Booking = {
          ...bookingData,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          bookings: [...state.bookings, newBooking],
        }));
        return id;
      },

      removeBooking: (id) => {
        set((state) => ({
          bookings: state.bookings.filter((b) => b.id !== id),
        }));
      },

      updateBookingStatus: (id, status) => {
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === id ? { ...b, status } : b
          ),
        }));
      },

      getBookingById: (id) => {
        return get().bookings.find((b) => b.id === id);
      },

      getBookingsBySalon: (salonId) => {
        return get().bookings.filter((b) => b.salonId === salonId);
      },

      getUpcomingBookings: () => {
        const now = new Date();
        return get()
          .bookings.filter((b) => {
            const bookingDate = new Date(`${b.date}T${b.time}`);
            return bookingDate >= now && b.status !== "cancelled";
          })
          .sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA.getTime() - dateB.getTime();
          });
      },

      getPastBookings: () => {
        const now = new Date();
        return get()
          .bookings.filter((b) => {
            const bookingDate = new Date(`${b.date}T${b.time}`);
            return bookingDate < now || b.status === "cancelled";
          })
          .sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateB.getTime() - dateA.getTime(); // Most recent first
          });
      },

      clearAllBookings: () => {
        set({ bookings: [] });
      },
    }),
    {
      name: "blyss-bookings", // localStorage key
    }
  )
);

// Convenience functions for imperative usage
export const bookingStore = {
  addBooking: (booking: Omit<Booking, "id" | "createdAt">) =>
    useBookingStore.getState().addBooking(booking),
  removeBooking: (id: string) => useBookingStore.getState().removeBooking(id),
  updateStatus: (id: string, status: Booking["status"]) =>
    useBookingStore.getState().updateBookingStatus(id, status),
  getById: (id: string) => useBookingStore.getState().getBookingById(id),
  getBySalon: (salonId: string) =>
    useBookingStore.getState().getBookingsBySalon(salonId),
  getUpcoming: () => useBookingStore.getState().getUpcomingBookings(),
  getPast: () => useBookingStore.getState().getPastBookings(),
  clear: () => useBookingStore.getState().clearAllBookings(),
};

// Cart store for booking flow - manages selected services before confirming
export const useBookingCartStore = create<BookingCartState>()(
  persist(
    (set, get) => ({
      salonId: null,
      salonName: null,
      selectedServices: [],
      selectedDate: null,
      availableSlots: [],
      isLoadingSlots: false,

      setSalon: (salonId, salonName) => {
        set({ salonId, salonName });
      },

      addService: (service) => {
        set((state) => {
          // Don't add duplicate services
          if (state.selectedServices.some((s) => s.id === service.id)) {
            return state;
          }
          const extendedService: BookingServiceWithSelection = {
            ...service,
            selectedEmployee: null,
            selectedTime: null,
          };
          return {
            selectedServices: [...state.selectedServices, extendedService],
          };
        });
      },

      removeService: (serviceId) => {
        set((state) => ({
          selectedServices: state.selectedServices.filter((s) => s.id !== serviceId),
        }));
      },

      updateServiceEmployee: (serviceId, employee) => {
        set((state) => ({
          selectedServices: state.selectedServices.map((s) =>
            s.id === serviceId
              ? { ...s, selectedEmployee: employee }
              : s
          ),
        }));
      },

      updateServiceTime: (serviceId, time) => {
        set((state) => ({
          selectedServices: state.selectedServices.map((s) =>
            s.id === serviceId
              ? { ...s, selectedTime: time }
              : s
          ),
        }));
      },

      setSelectedDate: (date) => {
        set({ selectedDate: date });
      },

      setAvailableSlots: (slots) => {
        set({ availableSlots: slots });
      },

      setIsLoadingSlots: (loading) => {
        set({ isLoadingSlots: loading });
      },

      clearCart: () => {
        set({
          salonId: null,
          salonName: null,
          selectedServices: [],
          selectedDate: null,
          availableSlots: [],
          isLoadingSlots: false,
        });
      },

      getTotalPrice: () => {
        return get().selectedServices.reduce((total, service) => {
          // Use employee price if available, otherwise use service price
          if (service.selectedEmployee) {
            return total + service.selectedEmployee.service_price;
          }
          // Parse price string like "50,000" to number
          const priceNum = service.priceNumber || parseInt(service.price.replace(/[^0-9]/g, ""), 10) || 0;
          return total + priceNum;
        }, 0);
      },

      getTotalDuration: () => {
        return get().selectedServices.reduce((total, service) => {
          // Use employee duration if available, otherwise use service duration
          if (service.selectedEmployee) {
            return total + service.selectedEmployee.service_duration_minutes;
          }
          return total + (service.durationMinutes || 0);
        }, 0);
      },

      isReadyToBook: () => {
        const state = get();
        if (!state.salonId || !state.selectedDate || state.selectedServices.length === 0) {
          return false;
        }
        // Check all services have employee and time selected
        return state.selectedServices.every(
          (s) => s.selectedEmployee && s.selectedTime
        );
      },

      getFirstServiceStartTime: () => {
        const services = get().selectedServices;
        if (services.length === 0) return null;

        // Find the earliest time among all selected services
        const times = services
          .map((s) => s.selectedTime)
          .filter((t): t is string => t !== null && t !== undefined);

        if (times.length === 0) return null;

        return times.sort()[0];
      },
    }),
    {
      name: "blyss-booking-cart",
    }
  )
);

// Convenience functions for cart
export const bookingCart = {
  setSalon: (salonId: string, salonName: string) =>
    useBookingCartStore.getState().setSalon(salonId, salonName),
  addService: (service: BookingService) =>
    useBookingCartStore.getState().addService(service),
  removeService: (serviceId: string) =>
    useBookingCartStore.getState().removeService(serviceId),
  updateServiceEmployee: (serviceId: string, employee: Employee | null) =>
    useBookingCartStore.getState().updateServiceEmployee(serviceId, employee),
  updateServiceTime: (serviceId: string, time: string | null) =>
    useBookingCartStore.getState().updateServiceTime(serviceId, time),
  setSelectedDate: (date: string | null) =>
    useBookingCartStore.getState().setSelectedDate(date),
  setAvailableSlots: (slots: TimeSlot[]) =>
    useBookingCartStore.getState().setAvailableSlots(slots),
  setIsLoadingSlots: (loading: boolean) =>
    useBookingCartStore.getState().setIsLoadingSlots(loading),
  clear: () => useBookingCartStore.getState().clearCart(),
  getTotal: () => useBookingCartStore.getState().getTotalPrice(),
  getTotalDuration: () => useBookingCartStore.getState().getTotalDuration(),
  getServices: () => useBookingCartStore.getState().selectedServices,
  getSalonId: () => useBookingCartStore.getState().salonId,
  isReadyToBook: () => useBookingCartStore.getState().isReadyToBook(),
  getFirstServiceStartTime: () => useBookingCartStore.getState().getFirstServiceStartTime(),
};

// UI state store for booking page expandable sections
interface BookingUIState {
  isStylistExpanded: boolean;
  isLocationExpanded: boolean;
  isServicesExpanded: boolean;
  isCalendarExpanded: boolean;
  isTimeExpanded: boolean;
  isPaymentExpanded: boolean;
  activeServiceIndex: number; // Which service we're selecting employee/time for
  setExpanded: (section: keyof Omit<BookingUIState, "setExpanded" | "resetUI" | "setActiveServiceIndex" | "activeServiceIndex">, value: boolean) => void;
  setActiveServiceIndex: (index: number) => void;
  resetUI: () => void;
}

const defaultUIState = {
  isStylistExpanded: false,
  isLocationExpanded: false,
  isServicesExpanded: true,
  isCalendarExpanded: true,
  isTimeExpanded: true,
  isPaymentExpanded: false,
  activeServiceIndex: 0,
};

export const useBookingUIStore = create<BookingUIState>()((set) => ({
  ...defaultUIState,

  setExpanded: (section, value) => {
    set({ [section]: value });
  },

  setActiveServiceIndex: (index) => {
    set({ activeServiceIndex: index });
  },

  resetUI: () => {
    set(defaultUIState);
  },
}));

// Convenience functions for UI store
export const bookingUI = {
  setExpanded: (section: keyof Omit<BookingUIState, "setExpanded" | "resetUI" | "setActiveServiceIndex" | "activeServiceIndex">, value: boolean) =>
    useBookingUIStore.getState().setExpanded(section, value),
  setActiveServiceIndex: (index: number) =>
    useBookingUIStore.getState().setActiveServiceIndex(index),
  reset: () => useBookingUIStore.getState().resetUI(),
};
