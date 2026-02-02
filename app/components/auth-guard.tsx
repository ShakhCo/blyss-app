import { useLocationStore } from "~/stores/location";
import { Logo } from "~/components/icons/Logo";

interface LocationProviderProps {
  children: React.ReactNode;
}

/**
 * LocationProvider - Handles location hydration
 * Location fetching is now done in home.tsx on page mount
 */
export function LocationProvider({ children }: LocationProviderProps) {
  const hasHydrated = useLocationStore((state) => state._hasHydrated);

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
