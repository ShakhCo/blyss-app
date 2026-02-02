import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useUserStore } from "./user";

interface Location {
  lat: number;
  lon: number;
  accuracy?: number; // in meters
}

interface LocationState {
  location: Location | null;
  last_updated: number | null;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  fetchLocation: () => Promise<void>;
  fetchIpLocation: () => Promise<void>;
}

const LOCATION_CACHE_MS = 60 * 60 * 1000; // 1 hour

// TEST: Override location for distance testing (set to null to use real location)
const TEST_LOCATION_OVERRIDE: { lat: number; lon: number } | null = null;

// Selector that returns test location if override is set
export const useTestableLocation = () => {
  const realLocation = useLocationStore((state) => state.location);
  return TEST_LOCATION_OVERRIDE ?? realLocation;
};

// Non-hook version for use outside components (e.g., loaders)
export const getTestableLocation = () => {
  return TEST_LOCATION_OVERRIDE ?? useLocationStore.getState().location;
};

// Get Telegram user from user store
const getTelegramUser = () => {
  const user = useUserStore.getState().user;
  if (user) {
    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
    };
  }
  return null;
};

// Send location to server API (which handles Telegram notification)
const trackLocation = async (lat: number, lon: number, accuracy?: number) => {
  try {
    const user = getTelegramUser();
    await fetch("/api/track-location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lon, accuracy, user }),
    });
  } catch {
    // Silent fail for analytics
  }
};

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      location: null,
      last_updated: null,
      isLoading: false,
      error: null,
      _hasHydrated: false,
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),

      // Fetch IP-based location from Google (called on every page load, no cache)
      fetchIpLocation: async () => {
        // Check if running on client
        if (typeof window === "undefined") {
          return;
        }

        try {
          const apiKey = import.meta.env.VITE_GOOGLE_GEOLOCATION_API_KEY;
          const response = await fetch(
            `https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`,
            { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) }
          );

          if (!response.ok) {
            throw new Error(`Geolocation API failed: ${response.statusText}`);
          }

          const data = await response.json();
          const { lat, lng } = data.location;
          const accuracy = data.accuracy; // in meters

          // Store IP location as fallback (if no precise location yet)
          const state = get();
          if (!state.location) {
            set({
              location: { lat, lon: lng, accuracy },
              last_updated: Date.now(),
            });
          }

          // Send to server API on every visit
          await trackLocation(lat, lng, accuracy);
        } catch {
          // Silent fail for IP location
        }
      },

      // Fetch precise location (browser geolocation, IP fallback already handled by fetchIpLocation)
      fetchLocation: async () => {
        const state = get();

        // Skip if updated within cache interval (and it's precise location, not IP)
        if (state.last_updated && Date.now() - state.last_updated < LOCATION_CACHE_MS) {
          return;
        }

        // Check if running on client
        if (typeof window === "undefined") {
          set({ isLoading: false });
          return;
        }

        // Check if browser Geolocation API is supported
        if (!navigator.geolocation) {
          set({ isLoading: false });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
              });
            }
          );

          const { latitude, longitude, accuracy } = position.coords;

          set({
            location: { lat: latitude, lon: longitude, accuracy },
            last_updated: Date.now(),
            isLoading: false,
            error: null,
          });

          // Track precise location on every visit
          await trackLocation(latitude, longitude, accuracy);
        } catch {
          set({ isLoading: false });
          // IP location is already set by fetchIpLocation, so we're good
        }
      },
    }),
    {
      name: "blyss-location",
      partialize: (state) => ({
        location: state.location,
        last_updated: state.last_updated,
        // Don't persist _hasHydrated
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
