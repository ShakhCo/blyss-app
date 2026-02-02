import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useUserStore } from "./user";

interface Location {
  lat: number;
  lon: number;
  accuracy?: number;
  last_updated: number;
}

interface LocationState {
  browser_location: Location | null;
  google_geolocation: Location | null;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  fetchLocation: () => Promise<void>;
  fetchGoogleGeolocation: () => Promise<void>;
}

const LOCATION_CACHE_MS = 60 * 60 * 1000; // 1 hour

// TEST: Override location for distance testing (set to null to use real location)
const TEST_LOCATION_OVERRIDE: { lat: number; lon: number } | null = null;

// Selector that returns the best available location (browser > google > null)
export const useTestableLocation = () => {
  const browserLocation = useLocationStore((state) => state.browser_location);
  const googleLocation = useLocationStore((state) => state.google_geolocation);

  if (TEST_LOCATION_OVERRIDE) return TEST_LOCATION_OVERRIDE;
  if (browserLocation) return { lat: browserLocation.lat, lon: browserLocation.lon };
  if (googleLocation) return { lat: googleLocation.lat, lon: googleLocation.lon };
  return null;
};

// Non-hook version for use outside components (e.g., loaders)
export const getTestableLocation = () => {
  if (TEST_LOCATION_OVERRIDE) return TEST_LOCATION_OVERRIDE;
  const state = useLocationStore.getState();
  if (state.browser_location) return { lat: state.browser_location.lat, lon: state.browser_location.lon };
  if (state.google_geolocation) return { lat: state.google_geolocation.lat, lon: state.google_geolocation.lon };
  return null;
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
    console.log("[Track] Sending location to API:", { lat, lon, accuracy, user });

    const response = await fetch("/api/track-location", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lon, accuracy, user }),
    });

    const result = await response.json();
    console.log("[Track] API response:", result);
  } catch (error) {
    console.error("[Track] Failed to send location:", error);
  }
};

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      browser_location: null,
      google_geolocation: null,
      isLoading: false,
      error: null,
      _hasHydrated: false,
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),

      // Main location fetch function - follows the priority flow
      fetchLocation: async () => {
        console.log("[Location] fetchLocation called");

        // Check if running on client
        if (typeof window === "undefined") {
          console.log("[Location] SSR - skipping");
          return;
        }

        const state = get();

        // Check if browser_location is fresh (within 1 hour)
        if (state.browser_location) {
          const age = Date.now() - state.browser_location.last_updated;
          if (age < LOCATION_CACHE_MS) {
            console.log("[Location] Browser location is fresh, using cached location");
            // Still send to Telegram for tracking
            await trackLocation(state.browser_location.lat, state.browser_location.lon, state.browser_location.accuracy);
            return;
          }
          console.log("[Location] Browser location is stale, requesting new location");
        }

        // Check if browser Geolocation API is supported
        if (!navigator.geolocation) {
          console.log("[Location] Browser geolocation not supported, falling back to Google");
          await get().fetchGoogleGeolocation();
          return;
        }

        set({ isLoading: true, error: null });

        try {
          console.log("[Location] Requesting browser location...");
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
          console.log("[Location] Browser location received:", { latitude, longitude, accuracy });

          set({
            browser_location: {
              lat: latitude,
              lon: longitude,
              accuracy,
              last_updated: Date.now(),
            },
            isLoading: false,
            error: null,
          });

          // Send to Telegram
          await trackLocation(latitude, longitude, accuracy);
        } catch (error) {
          console.log("[Location] Browser location denied or failed, falling back to Google");
          set({ isLoading: false });

          // User denied or error - fall back to Google Geolocation
          await get().fetchGoogleGeolocation();
        }
      },

      // Fetch IP-based location from Google Geolocation API
      fetchGoogleGeolocation: async () => {
        console.log("[Location] fetchGoogleGeolocation called");

        // Check if running on client
        if (typeof window === "undefined") {
          console.log("[Location] SSR - skipping");
          return;
        }

        try {
          // First, get the API key from server
          console.log("[Location] Fetching API key from server...");
          const configResponse = await fetch("/api/config");
          const config = await configResponse.json();

          if (!config.googleGeolocationApiKey) {
            console.error("[Location] No API key returned from server");
            return;
          }

          // Call Google Geolocation API from client (uses client's IP)
          console.log("[Location] Calling Google Geolocation API from client...");
          const response = await fetch(
            `https://www.googleapis.com/geolocation/v1/geolocate?key=${config.googleGeolocationApiKey}`,
            { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) }
          );

          if (!response.ok) {
            const errorData = await response.json();
            console.error("[Location] Google API failed:", response.status, errorData);
            return;
          }

          const data = await response.json();
          const { lat, lng } = data.location;
          const accuracy = data.accuracy;

          console.log("[Location] Google geolocation received:", { lat, lng, accuracy });

          set({
            google_geolocation: {
              lat,
              lon: lng,
              accuracy,
              last_updated: Date.now(),
            },
          });

          // Send to Telegram
          await trackLocation(lat, lng, accuracy);
        } catch (error) {
          console.error("[Location] fetchGoogleGeolocation failed:", error);
        }
      },
    }),
    {
      name: "blyss-location",
      partialize: (state) => ({
        browser_location: state.browser_location,
        google_geolocation: state.google_geolocation,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
