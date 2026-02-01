import { type PropsWithChildren, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { backButton, useSignal, viewport } from "@tma.js/sdk-react";
import { Logo } from "./icons/Logo";
import { BottomNav } from "./BottomNav";
import { useBottomNavStore } from "~/stores/bottomNav";
import { useScrollRestoration } from "~/hooks/useScrollRestoration";
import { SafeAreaProvider } from "~/contexts/safe-area";

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

  // Get safe area insets from Telegram viewport
  const safeAreaInsets = useSignal(viewport.safeAreaInsets);
  const safeAreaValue = {
    top: safeAreaInsets?.top ?? 0,
    bottom: safeAreaInsets?.bottom ?? 0,
    left: safeAreaInsets?.left ?? 0,
    right: safeAreaInsets?.right ?? 0,
  };

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
      <div className="max-w-lg mx-auto h-screen flex flex-col bg-gray-950 overflow-hidden">
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

        {/* Fixed Footer with Safe Area (BottomNav handles its own padding) */}
        <BottomNav />
      </div>
    </SafeAreaProvider>
  );
}
