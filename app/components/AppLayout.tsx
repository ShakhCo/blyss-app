import { type PropsWithChildren, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { backButton } from "@tma.js/sdk-react";
import { Logo } from "./icons/Logo";
import { BottomNav } from "./BottomNav";
import { useLocationStore, selectDisplayName } from "~/stores/location";
import { useBottomNavStore } from "~/stores/bottomNav";
import { useScrollRestoration } from "~/hooks/useScrollRestoration";

type TmaContext = {
  tmaReady: boolean;
};

interface AppLayoutProps {
  /**
   * True if it is allowed to go back from this page.
   */
  back?: boolean;

  removeHeader?: boolean;
  /**
   * Optional custom back handler. If not provided, defaults to navigate(-1).
   */
  onBack?: () => void;
}

export function AppLayout({
  children,
  back = false,
  removeHeader = false,
  onBack,
}: PropsWithChildren<AppLayoutProps>) {
  const navigate = useNavigate();
  const { tmaReady } = useOutletContext<TmaContext>() || { tmaReady: false };
  const { isLoading, error, hasHydrated, fetchLocation } = useLocationStore();
  const displayName = useLocationStore(selectDisplayName);
  const isBottomNavVisible = useBottomNavStore((state) => state.isVisible);
  const scrollRef = useScrollRestoration();

  // Fetch location after hydration (only if needed - store handles the 1 hour check)
  useEffect(() => {
    if (hasHydrated) {
      fetchLocation();
    }
  }, [hasHydrated, fetchLocation]);

  // Handle Telegram back button
  useEffect(() => {
    if (!tmaReady) return;

    if (back) {
      backButton.show();
      return backButton.onClick(() => {
        if (onBack) {
          onBack();
        } else {
          navigate(-1);
        }
      });
    }
    backButton.hide();
  }, [back, onBack, navigate, tmaReady]);

  // Determine location text to display
  const locationText = !hasHydrated
    ? "Loading..."
    : isLoading
      ? "Fetching location..."
      : error
        ? error
        : displayName;

  return removeHeader ? (
    <div>
      {children}

      <BottomNav />
    </div>
  ) : (
    <div className="min-h-screen relative bg-stone-900">

      <div className="fixed top-0 left-0 right-0 z-999 bg-stone-900 pt-10 sm:pt-4">
        <div className="pb-2">
          <Logo />
          <div className="text-white text-center font-medium text-sm pt-2">
            {locationText}
          </div>
        </div>
      </div>

      <div className="fixed top-30 sm:top-24 left-0 right-0 h-[calc(100vh-7.5rem)] bg-stone-900">
        <div className="h-full bg-white dark:bg-stone-900 rounded-t-3xl overflow-hidden">
          <div
            ref={scrollRef}
            className={`h-full overflow-y-auto scrollbar-hide ${isBottomNavVisible ? 'pb-20' : ''}`}
          >
            {children}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
