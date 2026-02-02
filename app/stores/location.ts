import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useUserStore } from "./user";

interface Location {
  lat: number;
  lon: number;
}

interface LocationState {
  location: Location | null;
  last_updated: number | null;
  ip_location_sent: number | null;
  isLoading: boolean;
  error: string | null;
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
const trackLocation = async (lat: number, lon: number) => {
  try {
    const user = getTelegramUser();
    await fetch("/api/track-location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lon, user }),
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
      ip_location_sent: null,
      isLoading: false,
      error: null,

      // Fetch IP-based location from Google (called on page load, cached for 1 hour)
      fetchIpLocation: async () => {
        const state = get();

        // Skip if sent within cache interval (1 hour)
        if (state.ip_location_sent && Date.now() - state.ip_location_sent < LOCATION_CACHE_MS) {
          return;
        }

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

          // Store IP location as fallback (if no precise location yet)
          if (!state.location) {
            set({
              location: { lat, lon: lng },
              last_updated: Date.now(),
            });
          }

          // Send to server API and update cache timestamp
          await trackLocation(lat, lng);
          set({ ip_location_sent: Date.now() });
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

          const { latitude, longitude } = position.coords;

          set({
            location: { lat: latitude, lon: longitude },
            last_updated: Date.now(),
            isLoading: false,
            error: null,
          });
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
        ip_location_sent: state.ip_location_sent,
      }),
    }
  )
);
