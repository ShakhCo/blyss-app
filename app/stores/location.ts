import { create } from "zustand";
import { persist } from "zustand/middleware";
import { locationManager } from "@tma.js/sdk-react";

interface LocationData {
  street: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  lat: number | null;
  lon: number | null;
  lastUpdated: number | null;
}

interface LocationState extends LocationData {
  isLoading: boolean;
  error: string | null;
  hasHydrated: boolean;
  setLocation: (data: Partial<LocationData>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasHydrated: (hydrated: boolean) => void;
  needsRefresh: () => boolean;
  fetchLocation: () => Promise<void>;
}

const ONE_HOUR_MS = 60 * 60 * 1000;
const FIVE_MINUTE_MS = 5 * 60 * 1000;

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      // Location data
      street: null,
      city: null,
      region: null,
      country: null,
      lat: null,
      lon: null,
      lastUpdated: null,

      // UI state
      isLoading: false,
      error: null,
      hasHydrated: false,

      // Actions
      setLocation: (data) =>
        set((state) => ({
          ...state,
          ...data,
          lastUpdated: Date.now(),
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      needsRefresh: () => {
        const { lastUpdated } = get();
        if (!lastUpdated) return true;
        return Date.now() - lastUpdated > FIVE_MINUTE_MS;
      },

      fetchLocation: async () => {
        const state = get();

        // Skip if recently updated (within 1 hour)
        if (!state.needsRefresh()) {
          return;
        }

        // Check if running on client
        if (typeof window === "undefined") {
          set({ error: "Location not supported", isLoading: false });
          return;
        }

        // Check if Telegram Location Manager is supported
        if (!locationManager.isSupported()) {
          set({ error: "Location not supported", isLoading: false });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          // Mount the location manager to retrieve settings from Telegram
          if (!locationManager.isMounted()) {
            await locationManager.mount();
          }

          // Request location using Telegram's Location Manager
          const location = await locationManager.requestLocation();

          if (!location) {
            set({ error: "Could not get location", isLoading: false });
            return;
          }

          const { latitude, longitude } = location;

          // Reverse geocode using OpenStreetMap Nominatim API (in Uzbek)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=uz`
          );
          const data = await response.json();

          const street =
            data.address?.road ||
            data.address?.street ||
            data.address?.neighbourhood ||
            null;
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.district ||
            null;
          const region = data.address?.state || data.address?.region || null;
          const country = data.address?.country || null;

          set({
            street,
            city,
            region,
            country,
            lat: latitude,
            lon: longitude,
            lastUpdated: Date.now(),
            isLoading: false,
            error: null,
          });
        } catch (err) {
          let errorMessage = "Could not get location";

          if (err instanceof Error) {
            errorMessage = err.message || errorMessage;
          }

          set({ error: errorMessage, isLoading: false });
        }
      },
    }),
    {
      name: "blyss-location",
      partialize: (state) => ({
        street: state.street,
        city: state.city,
        region: state.region,
        country: state.country,
        lat: state.lat,
        lon: state.lon,
        lastUpdated: state.lastUpdated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Selector to compute display name (use this in components)
export const selectDisplayName = (state: LocationState): string => {
  const parts = [state.street, state.city].filter(Boolean);
  if (parts.length > 0) return parts.join(", ");
  if (state.lat && state.lon)
    return `${state.lat.toFixed(2)}, ${state.lon.toFixed(2)}`;
  return "Location unavailable";
};
