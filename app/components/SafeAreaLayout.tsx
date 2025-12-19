import { useEffect, useRef, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { useSignal, viewport, mainButton, backButton } from "@tma.js/sdk-react";

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
  mainButton: mainButtonConfig,
  back = false,
  onBack,
}: SafeAreaLayoutProps) {
  const navigate = useNavigate();
  // Capture initial safe area values on mount to prevent shrinking on scroll
  const initialSafeAreaRef = useRef<{ top: number; bottom: number } | null>(null);
  const safeAreaInsets = useSignal(viewport.safeAreaInsets);
  const contentSafeAreaInsets = useSignal(viewport.contentSafeAreaInsets);

  useEffect(() => {
    if (initialSafeAreaRef.current === null && safeAreaInsets) {
      initialSafeAreaRef.current = {
        top: safeAreaInsets.top ?? 0,
        bottom: safeAreaInsets.bottom ?? 0,
      };
    }
  }, [safeAreaInsets]);

  const safeAreaValue = {
    top: initialSafeAreaRef.current?.top ?? safeAreaInsets?.top ?? 0,
    bottom: initialSafeAreaRef.current?.bottom ?? safeAreaInsets?.bottom ?? 0,
  };

  const contentSafeAreaValue = {
    top: contentSafeAreaInsets?.top ?? 0,
    bottom: contentSafeAreaInsets?.bottom ?? 0,
  };

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

  return (
    <div className={`relative flex flex-col ${className}`}>
      {/* Top safe area overlay */}
      {showTop && safeAreaValue.top > 0 && (
        <div
          className={`${topColor} fixed top-0 left-0 w-full z-50`}
          style={{ height: safeAreaValue.top }}
        />
      )}

      {/* Bottom safe area overlay */}
      {showBottom && safeAreaValue.bottom > 0 && (
        <div
          className={`${bottomColor} fixed bottom-0 left-0 w-full z-50`}
          style={{ height: safeAreaValue.bottom }}
        />
      )}

      {/* Main content with safe area padding */}
      <div
        className="bg-background flex-1 flex flex-col overflow-hidden"
        style={{
          paddingTop: safeAreaValue.top + contentSafeAreaValue.top,
          paddingBottom: safeAreaValue.bottom,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Hook to get stable safe area values that don't change on scroll */
export function useSafeArea() {
  const initialSafeAreaRef = useRef<{ top: number; bottom: number } | null>(null);
  const safeAreaInsets = useSignal(viewport.safeAreaInsets);

  useEffect(() => {
    if (initialSafeAreaRef.current === null && safeAreaInsets) {
      initialSafeAreaRef.current = {
        top: safeAreaInsets.top ?? 0,
        bottom: safeAreaInsets.bottom ?? 0,
      };
    }
  }, [safeAreaInsets]);

  return {
    top: initialSafeAreaRef.current?.top ?? safeAreaInsets?.top ?? 0,
    bottom: initialSafeAreaRef.current?.bottom ?? safeAreaInsets?.bottom ?? 0,
  };
}
