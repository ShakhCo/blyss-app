import { useEffect, useState, useRef } from "react";
import { useLocationStore } from "~/stores/location";
import { Logo } from "~/components/icons/Logo";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const fetchLocation = useLocationStore((state) => state.fetchLocation);
  const fetchIpLocation = useLocationStore((state) => state.fetchIpLocation);
  const [isHydrated, setIsHydrated] = useState(false);
  const hasFetchedLocationRef = useRef(false);

  // Wait for initial hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Fetch IP location once on page load (for analytics)
  useEffect(() => {
    if (!isHydrated) return;
    fetchIpLocation();
  }, [isHydrated, fetchIpLocation]);

  // Fetch precise user location for all visitors
  useEffect(() => {
    if (!isHydrated || hasFetchedLocationRef.current) return;

    hasFetchedLocationRef.current = true;
    console.log("[AuthGuard] Fetching location for visitor...");
    fetchLocation();
  }, [isHydrated, fetchLocation]);

  // Show brief loading screen while hydrating
  if (!isHydrated) {
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
