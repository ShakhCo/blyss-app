import { type PropsWithChildren, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { backButton, useSignal, viewport } from "@tma.js/sdk-react";
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

  // Get safe area insets from Telegram viewport
  const safeAreaInsets = useSignal(viewport.safeAreaInsets);

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

  if (removeHeader) {
    return (
      <div>
        {children}
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto h-screen flex flex-col bg-stone-900 overflow-hidden">
      {/* Fixed Header with Safe Area */}
      <div
        className="shrink-0 z-50 bg-stone-900"
        style={{ paddingTop: safeAreaInsets?.top ?? 0 }}
      >
        <div className="py-3">
          <Logo />
          <div className="text-white text-center font-medium text-sm pt-2">
            {locationText}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full bg-white dark:bg-stone-900 rounded-t-3xl overflow-hidden">
          <div
            ref={scrollRef}
            className={`h-full overflow-y-auto scrollbar-hide ${isBottomNavVisible ? 'pb-20' : ''}`}
          >
            {children}
          </div>
        </div>
      </div>

      {/* Fixed Footer with Safe Area (BottomNav handles its own padding) */}
      <BottomNav />
    </div>
  );
}
