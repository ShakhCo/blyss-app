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
  telegram_location: Location | null;
  google_geolocation: Location | null;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  fetchLocation: () => Promise<void>;
  fetchGoogleGeolocation: () => Promise<void>;
}

// TEST: Override location for distance testing (set to null to use real location)
const TEST_LOCATION_OVERRIDE: { lat: number; lon: number } | null = null;

// Selector that returns the best available location (telegram > google > null)
export const useTestableLocation = () => {
  const telegramLocation = useLocationStore((state) => state.telegram_location);
  const googleLocation = useLocationStore((state) => state.google_geolocation);

  if (TEST_LOCATION_OVERRIDE) return TEST_LOCATION_OVERRIDE;
  if (telegramLocation) return { lat: telegramLocation.lat, lon: telegramLocation.lon };
  if (googleLocation) return { lat: googleLocation.lat, lon: googleLocation.lon };
  return null;
};

// Non-hook version for use outside components (e.g., loaders)
export const getTestableLocation = () => {
  if (TEST_LOCATION_OVERRIDE) return TEST_LOCATION_OVERRIDE;
  const state = useLocationStore.getState();
  if (state.telegram_location) return { lat: state.telegram_location.lat, lon: state.telegram_location.lon };
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
      telegram_location: null,
      google_geolocation: null,
      isLoading: false,
      error: null,
      _hasHydrated: false,
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),

      // Main location fetch function - always requests fresh location from Telegram
      fetchLocation: async () => {
        console.log("[Location] fetchLocation called");

        // Check if running on client
        if (typeof window === "undefined") {
          console.log("[Location] SSR - skipping");
          return;
        }

        set({ isLoading: true, error: null });

        try {
          // Import Telegram SDK locationManager
          const { locationManager } = await import("@tma.js/sdk-react");

          // Check if locationManager is supported
          if (!locationManager.isSupported()) {
            console.log("[Location] Telegram locationManager not supported, falling back to Google");
            set({ isLoading: false });
            await get().fetchGoogleGeolocation();
            return;
          }

          // Mount locationManager if not already mounted
          if (!locationManager.isMounted()) {
            if (locationManager.mount.isAvailable()) {
              console.log("[Location] Mounting Telegram locationManager...");
              await locationManager.mount();
            } else {
              console.log("[Location] Telegram locationManager mount not available, falling back to Google");
              set({ isLoading: false });
              await get().fetchGoogleGeolocation();
              return;
            }
          }

          // Request fresh location from Telegram (no caching)
          console.log("[Location] Requesting fresh Telegram location...");
          const location = await locationManager.requestLocation();

          if (!location) {
            console.log("[Location] Telegram location request returned null");

            // Try to open settings to ask user for permission
            if (locationManager.openSettings.isAvailable()) {
              console.log("[Location] Opening location settings for user to enable permission...");
              locationManager.openSettings();
            }

            // Fall back to Google Geolocation
            set({ isLoading: false });
            await get().fetchGoogleGeolocation();
            return;
          }

          const { latitude, longitude, horizontal_accuracy } = location;
          console.log("[Location] Telegram location received:", { latitude, longitude, horizontal_accuracy });

          set({
            telegram_location: {
              lat: latitude,
              lon: longitude,
              accuracy: horizontal_accuracy ?? undefined,
              last_updated: Date.now(),
            },
            isLoading: false,
            error: null,
          });

          // Send to tracking
          await trackLocation(latitude, longitude, horizontal_accuracy ?? undefined);
        } catch (error) {
          console.log("[Location] Telegram location denied or failed", error);

          try {
            // Try to open settings to ask user for permission
            const { locationManager } = await import("@tma.js/sdk-react");
            if (locationManager.isSupported() && locationManager.openSettings.isAvailable()) {
              console.log("[Location] Opening location settings for user to enable permission...");
              locationManager.openSettings();
            }
          } catch (settingsError) {
            console.log("[Location] Could not open settings", settingsError);
          }

          set({ isLoading: false });

          // Fall back to Google Geolocation
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
        telegram_location: state.telegram_location,
        google_geolocation: state.google_geolocation,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
