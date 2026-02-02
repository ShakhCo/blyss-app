import { type PropsWithChildren, useEffect, useState, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { backButton, useSignal, viewport } from "@tma.js/sdk-react";
import { Logo } from "./icons/Logo";
import { BottomNav } from "./BottomNav";
import { useBottomNavStore } from "~/stores/bottomNav";
import { useScrollRestoration } from "~/hooks/useScrollRestoration";
import { SafeAreaProvider } from "~/contexts/safe-area";
import { useSafeAreaValues } from "~/hooks/useSafeAreaValues";
import { Map } from "lucide-react";

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
  const isBottomNavVisible = useBottomNavStore((state) => state.isVisible);
  const scrollRef = useScrollRestoration();

  const { safeAreaValue } = useSafeAreaValues()

  // Scroll direction tracking for Map button
  const [isMapButtonVisible, setIsMapButtonVisible] = useState(true);
  const lastScrollY = useRef(0);

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

  // Calculate bottom nav height: h-16 (64px) + safe area bottom + margin
  const bottomNavHeight = 64 + (safeAreaValue.bottom || 10) + 12;

  // Track scroll direction
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      const currentScrollY = scrollElement.scrollTop;
      const scrollDiff = currentScrollY - lastScrollY.current;

      // Only trigger if scrolled more than 5px to avoid jitter
      if (Math.abs(scrollDiff) > 5) {
        if (scrollDiff > 0) {
          // Scrolling down - hide button
          setIsMapButtonVisible(false);
        } else {
          // Scrolling up - show button
          setIsMapButtonVisible(true);
        }
        lastScrollY.current = currentScrollY;
      }
    };

    scrollElement.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, [scrollRef]);

  if (removeHeader) {
    return (
      <SafeAreaProvider value={safeAreaValue}>
        <div className="h-screen flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
          <BottomNav />
        </div>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider value={safeAreaValue}>
      <div className="h-screen flex flex-col bg-gray-950 overflow-hidden">
        {/* Fixed Header with Safe Area */}
        <div
          className="shrink-0 z-50 bg-gray-950"
          style={{ paddingTop: safeAreaValue.top }}
        >
          <div className="pb-3">
            <Logo />
            {/* <div className="text-white text-center font-medium text-sm pt-2">
              {locationText}
            </div> */}
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


        {/* Floating Map Button */}
        {isBottomNavVisible && (
          <div
            className="fixed left-0 right-0 z-40 flex justify-center pointer-events-none transition-all duration-300 ease-out"
            style={{
              bottom: bottomNavHeight,
              opacity: isMapButtonVisible ? 1 : 0,
              transform: isMapButtonVisible ? "translateY(0)" : "translateY(20px)",
            }}
          >
            <button
              onClick={() => navigate("/map")}
              className="flex items-center gap-2 bg-primary border border-primary/10 text-white px-4 py-3 rounded-full shadow-xl text-base pointer-events-auto"
            >
              <Map size={22} strokeWidth={1.3} />
              Map
            </button>
          </div>
        )}

        {/* Fixed Footer with Safe Area (BottomNav handles its own padding) */}
        <BottomNav />
      </div>
    </SafeAreaProvider>
  );
}
