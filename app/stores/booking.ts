import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BookingService {
  id: string;
  name: string;
  duration: string;
  price: string;
  category: string;
}

export interface Booking {
  id: string;
  salonId: string;
  salonName: string;
  services: BookingService[]; // Changed from single service to array
  date: string; // ISO date string
  time: string; // e.g., "14:00"
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string; // ISO date string
}

// Cart state for the booking flow (selected services before confirming)
interface BookingCartState {
  salonId: string | null;
  salonName: string | null;
  selectedServices: BookingService[];
  addService: (service: BookingService) => void;
  removeService: (serviceId: string) => void;
  clearCart: () => void;
  setSalon: (salonId: string, salonName: string) => void;
  getTotalPrice: () => number;
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

      setSalon: (salonId, salonName) => {
        set({ salonId, salonName });
      },

      addService: (service) => {
        set((state) => {
          // Don't add duplicate services
          if (state.selectedServices.some((s) => s.id === service.id)) {
            return state;
          }
          return {
            selectedServices: [...state.selectedServices, service],
          };
        });
      },

      removeService: (serviceId) => {
        set((state) => ({
          selectedServices: state.selectedServices.filter((s) => s.id !== serviceId),
        }));
      },

      clearCart: () => {
        set({ salonId: null, salonName: null, selectedServices: [] });
      },

      getTotalPrice: () => {
        return get().selectedServices.reduce((total, service) => {
          // Parse price string like "50,000" to number
          const priceNum = parseInt(service.price.replace(/[^0-9]/g, ""), 10) || 0;
          return total + priceNum;
        }, 0);
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
  clear: () => useBookingCartStore.getState().clearCart(),
  getTotal: () => useBookingCartStore.getState().getTotalPrice(),
  getServices: () => useBookingCartStore.getState().selectedServices,
  getSalonId: () => useBookingCartStore.getState().salonId,
};

// UI state store for booking page expandable sections
interface BookingUIState {
  isStylistExpanded: boolean;
  isLocationExpanded: boolean;
  isServicesExpanded: boolean;
  isCalendarExpanded: boolean;
  isTimeExpanded: boolean;
  isPaymentExpanded: boolean;
  setExpanded: (section: keyof Omit<BookingUIState, "setExpanded" | "resetUI">, value: boolean) => void;
  resetUI: () => void;
}

const defaultUIState = {
  isStylistExpanded: false,
  isLocationExpanded: false,
  isServicesExpanded: false,
  isCalendarExpanded: true,
  isTimeExpanded: true,
  isPaymentExpanded: true,
};

export const useBookingUIStore = create<BookingUIState>()((set) => ({
  ...defaultUIState,

  setExpanded: (section, value) => {
    set({ [section]: value });
  },

  resetUI: () => {
    set(defaultUIState);
  },
}));

// Convenience functions for UI store
export const bookingUI = {
  setExpanded: (section: keyof Omit<BookingUIState, "setExpanded" | "resetUI">, value: boolean) =>
    useBookingUIStore.getState().setExpanded(section, value),
  reset: () => useBookingUIStore.getState().resetUI(),
};
