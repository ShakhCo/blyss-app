import { useEffect } from "react";
import { useLocationStore } from "~/stores/location";
import { Logo } from "~/components/icons/Logo";

interface LocationProviderProps {
  children: React.ReactNode;
}

const LOCATION_CACHE_MS = 60 * 60 * 1000; // 1 hour

/**
 * LocationProvider - Handles location fetching and hydration
 * Note: This component does NOT check authentication - it only manages location state
 */
export function LocationProvider({ children }: LocationProviderProps) {
  const hasHydrated = useLocationStore((state) => state._hasHydrated);
  const location = useLocationStore((state) => state.location);
  const lastUpdated = useLocationStore((state) => state.last_updated);
  const fetchLocation = useLocationStore((state) => state.fetchLocation);
  const fetchIpLocation = useLocationStore((state) => state.fetchIpLocation);

  // Only fetch after Zustand has hydrated from localStorage
  useEffect(() => {
    if (!hasHydrated) return;
    fetchIpLocation();
  }, [hasHydrated, fetchIpLocation]);

  useEffect(() => {
    if (!hasHydrated) return;

    const isStale = !lastUpdated || Date.now() - lastUpdated > LOCATION_CACHE_MS;
    if (!location || isStale) {
      fetchLocation();
    }
  }, [hasHydrated, location, lastUpdated, fetchLocation]);

  // Show loading while hydrating
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-between py-10">
        <div></div>
        <Logo width={180} height={80} />
        <div className="text-stone-600 text-sm">
          <div className="flex items-center justify-center space-x-2">
            <div className="bg-primary/50 h-2.5 w-2.5 animate-bounce rounded-full [animation-delay:-0.3s]"></div>
            <div className="bg-primary/50 h-2.5 w-2.5 animate-bounce rounded-full [animation-delay:-0.13s]"></div>
            <div className="bg-primary/50 h-2.5 w-2.5 animate-bounce rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
