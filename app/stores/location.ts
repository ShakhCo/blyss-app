import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Location {
  lat: number;
  lon: number;
}

interface LocationState {
  location: Location | null;
  last_updated: number | null;
  isLoading: boolean;
  error: string | null;
  fetchLocation: () => Promise<void>;
}

const ONE_HOUR_MS = 60 * 60 * 1000;

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      location: null,
      last_updated: null,
      isLoading: false,
      error: null,

      fetchLocation: async () => {
        const state = get();

        // Skip if updated within the last hour
        if (state.last_updated && Date.now() - state.last_updated < ONE_HOUR_MS) {
          console.log("[LocationStore] Skipping - updated within last hour");
          return;
        }

        // Check if running on client
        if (typeof window === "undefined") {
          set({ error: "Location not supported", isLoading: false });
          return;
        }

        // Check if browser Geolocation API is supported
        if (!navigator.geolocation) {
          set({ error: "Location not supported", isLoading: false });
          return;
        }

        console.log("[LocationStore] Requesting location from browser...");
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

          console.log("[LocationStore] Location fetched:", { latitude, longitude });
          set({
            location: { lat: latitude, lon: longitude },
            last_updated: Date.now(),
            isLoading: false,
            error: null,
          });
        } catch (err) {
          console.error("[LocationStore] Error:", err);
          let errorMessage = "Could not get location";

          if (err instanceof GeolocationPositionError) {
            switch (err.code) {
              case err.PERMISSION_DENIED:
                errorMessage = "Location permission denied";
                break;
              case err.POSITION_UNAVAILABLE:
                errorMessage = "Location unavailable";
                break;
              case err.TIMEOUT:
                errorMessage = "Location request timed out";
                break;
            }
          } else if (err instanceof Error) {
            errorMessage = err.message || errorMessage;
          }

          set({ error: errorMessage, isLoading: false });
        }
      },
    }),
    {
      name: "blyss-location",
      partialize: (state) => ({
        location: state.location,
        last_updated: state.last_updated,
      }),
    }
  )
);
