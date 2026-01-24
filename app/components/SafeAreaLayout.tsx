import { useEffect, useState, useRef, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { useSignal, viewport, mainButton, backButton } from "@tma.js/sdk-react";
import { Logo } from "./icons/Logo";

// Global store for safe area values - persists across navigation
const globalSafeArea = { top: 0, bottom: 0, initialized: false };
const globalContentSafeArea = { top: 0, bottom: 0, initialized: false };

// Try to restore from localStorage on module load (client-side only)
if (typeof window !== "undefined") {
  try {
    const stored = localStorage.getItem("tma-safe-area");
    if (stored) {
      const parsed = JSON.parse(stored);
      globalSafeArea.top = parsed.top ?? 0;
      globalSafeArea.bottom = parsed.bottom ?? 0;
      globalSafeArea.initialized = true;
    }
    const storedContent = localStorage.getItem("tma-content-safe-area");
    if (storedContent) {
      const parsed = JSON.parse(storedContent);
      globalContentSafeArea.top = parsed.top ?? 0;
      globalContentSafeArea.bottom = parsed.bottom ?? 0;
      globalContentSafeArea.initialized = true;
    }
  } catch {
    // Ignore errors
  }
}

interface MainButtonConfig {
  /** Button text */
  text: string;
  /** Click handler */
  onClick: () => void;
  /** Whether to show loader (default: false) */
  isLoading?: boolean;
  /** Whether button is enabled (default: true) */
  isEnabled?: boolean;
  /** Background color (default: #f97316) */
  bgColor?: string;
  /** Text color (default: #ffffff) */
  textColor?: string;
}

interface SafeAreaLayoutProps {
  children: ReactNode;
  /** Background color for top safe area overlay */
  topColor?: string;
  /** Background color for bottom safe area overlay */
  bottomColor?: string;
  /** Whether to show top overlay (default: true) */
  showTop?: boolean;
  /** Whether to show bottom overlay (default: true) */
  showBottom?: boolean;
  showLogo?: boolean;
  removeContnetPadding?: boolean;
  /** Additional className for the container */
  className?: string;
  /** Main button configuration - if provided, shows the Telegram Main Button */
  mainButton?: MainButtonConfig;
  /** Whether to show back button (default: false) */
  back?: boolean;
  /** Optional custom back handler. If not provided, defaults to navigate(-1) */
  onBack?: () => void;
}

export function SafeAreaLayout({
  children,
  topColor = "bg-white",
  bottomColor = "bg-white",
  showTop = true,
  showBottom = true,
  className = "",
  removeContnetPadding = false,
  showLogo = false,
  mainButton: mainButtonConfig,
  back = false,
  onBack,
}: SafeAreaLayoutProps) {
  const navigate = useNavigate();
  const safeAreaInsets = useSignal(viewport.safeAreaInsets);
  const contentSafeAreaInsets = useSignal(viewport.contentSafeAreaInsets);

  // Track ready state
  const [isReady, setIsReady] = useState(globalSafeArea.initialized);

  // Track stable values in state (not ref) to trigger re-renders
  const [stableSafeArea, setStableSafeArea] = useState(() =>
    globalSafeArea.initialized
      ? { top: globalSafeArea.top, bottom: globalSafeArea.bottom }
      : null
  );
  const [stableContentSafeArea, setStableContentSafeArea] = useState(() =>
    globalContentSafeArea.initialized
      ? { top: globalContentSafeArea.top, bottom: globalContentSafeArea.bottom }
      : null
  );

  useEffect(() => {
    // Store safe area values when they become available
    if (safeAreaInsets && (safeAreaInsets.top !== undefined || safeAreaInsets.bottom !== undefined)) {
      const values = {
        top: safeAreaInsets.top ?? 0,
        bottom: safeAreaInsets.bottom ?? 0,
      };

      // Update global store and localStorage
      globalSafeArea.top = values.top;
      globalSafeArea.bottom = values.bottom;
      globalSafeArea.initialized = true;
      try {
        localStorage.setItem("tma-safe-area", JSON.stringify(values));
      } catch {
        // Ignore errors
      }

      // Only set stable values once (to prevent changes on scroll)
      if (!stableSafeArea) {
        setStableSafeArea(values);
      }
      setIsReady(true);
    }
  }, [safeAreaInsets, stableSafeArea]);

  useEffect(() => {
    if (contentSafeAreaInsets && (contentSafeAreaInsets.top !== undefined || contentSafeAreaInsets.bottom !== undefined)) {
      const values = {
        top: contentSafeAreaInsets.top ?? 0,
        bottom: contentSafeAreaInsets.bottom ?? 0,
      };

      globalContentSafeArea.top = values.top;
      globalContentSafeArea.bottom = values.bottom;
      globalContentSafeArea.initialized = true;
      try {
        localStorage.setItem("tma-content-safe-area", JSON.stringify(values));
      } catch {
        // Ignore errors
      }

      if (!stableContentSafeArea) {
        setStableContentSafeArea(values);
      }
    }
  }, [contentSafeAreaInsets, stableContentSafeArea]);

  // Use stable state values or global fallback
  const safeAreaValue = stableSafeArea ?? { top: globalSafeArea.top, bottom: globalSafeArea.bottom };
  const contentSafeAreaValue = stableContentSafeArea ?? { top: globalContentSafeArea.top, bottom: globalContentSafeArea.bottom };

  // Handle Telegram back button
  useEffect(() => {
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
  }, [back, onBack, navigate]);

  // Keep onClick ref up to date to avoid re-mounting button
  const onClickRef = useRef(mainButtonConfig?.onClick);
  useEffect(() => {
    onClickRef.current = mainButtonConfig?.onClick;
  }, [mainButtonConfig?.onClick]);

  // Setup Main Button
  useEffect(() => {
    if (!mainButtonConfig) return;

    if (mainButton.mount.isAvailable()) {
      mainButton.mount();
    }

    if (mainButton.setParams.isAvailable()) {
      mainButton.setParams({
        text: mainButtonConfig.text,
        bgColor: (mainButtonConfig.bgColor ?? "#f97316") as `#${string}`,
        textColor: (mainButtonConfig.textColor ?? "#ffffff") as `#${string}`,
        isVisible: true,
        isEnabled: mainButtonConfig.isEnabled ?? true,
      });
    }

    // Add click handler that uses ref
    const removeListener = mainButton.onClick(() => {
      onClickRef.current?.();
    });

    return () => {
      removeListener();
      if (mainButton.setParams.isAvailable()) {
        mainButton.setParams({ isVisible: false });
      }
      if (mainButton.isMounted()) {
        mainButton.unmount();
      }
    };
  }, [mainButtonConfig?.text, mainButtonConfig?.bgColor, mainButtonConfig?.textColor, mainButtonConfig?.isEnabled]);

  // Update loader state separately to avoid re-mounting
  useEffect(() => {
    if (!mainButtonConfig) return;

    if (mainButton.setParams.isAvailable()) {
      mainButton.setParams({ isLoaderVisible: mainButtonConfig.isLoading ?? false });
    }
  }, [mainButtonConfig?.isLoading]);

  // Don't render children until safe area values are ready
  if (!isReady) {
    return null;
  }

  return (
    <div className={`relative flex flex-col h-screen ${className}`}>
      {/* Top safe area overlay */}
      {showTop && safeAreaValue.top > 0 && (
        <div
          className={`${topColor} fixed top-0 left-0 w-full z-50 backdrop-blur-sm`}
          style={{ height: safeAreaValue.top }}
        />
      )}

      {/* Bottom safe area overlay */}
      {showBottom && safeAreaValue.bottom > 0 && (
        <div
          className={`${bottomColor} fixed bottom-0 left-0 w-full z-5000`}
          style={{ height: safeAreaValue.bottom }}
        />
      )}

      {/* Main content with safe area padding */}
      <div
        className="bg-background flex-1 flex flex-col overflow-y-auto relative"
        style={{
          paddingTop: safeAreaValue.top + (removeContnetPadding ? 0 : contentSafeAreaValue.top),
          paddingBottom: safeAreaValue.bottom,
        }}
      >
        {showLogo && (
          <div className="sticky top-0 z-40 bg-background py-3">
            <Logo />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

/** Hook to get stable safe area values that don't change on scroll */
export function useSafeArea() {
  const safeAreaInsets = useSignal(viewport.safeAreaInsets);

  const [stableSafeArea, setStableSafeArea] = useState(() =>
    globalSafeArea.initialized
      ? { top: globalSafeArea.top, bottom: globalSafeArea.bottom }
      : null
  );

  useEffect(() => {
    if (safeAreaInsets && (safeAreaInsets.top !== undefined || safeAreaInsets.bottom !== undefined)) {
      const values = {
        top: safeAreaInsets.top ?? 0,
        bottom: safeAreaInsets.bottom ?? 0,
      };

      globalSafeArea.top = values.top;
      globalSafeArea.bottom = values.bottom;
      globalSafeArea.initialized = true;
      try {
        localStorage.setItem("tma-safe-area", JSON.stringify(values));
      } catch {
        // Ignore errors
      }

      if (!stableSafeArea) {
        setStableSafeArea(values);
      }
    }
  }, [safeAreaInsets, stableSafeArea]);

  return stableSafeArea ?? { top: globalSafeArea.top, bottom: globalSafeArea.bottom };
}
