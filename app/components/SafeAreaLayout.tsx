import { useEffect, useRef, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { mainButton, backButton } from "@tma.js/sdk-react";
import { useSafeAreaValues } from "~/hooks/useSafeAreaValues";
import { Logo } from "./icons/Logo";

interface MainButtonConfig {
  text: string;
  onClick: () => void;
  isLoading?: boolean;
  isEnabled?: boolean;
  bgColor?: string;
  textColor?: string;
}

interface SafeAreaLayoutProps {
  children: ReactNode;
  topColor?: string;
  bottomColor?: string;
  showTop?: boolean;
  showBottom?: boolean;
  showLogo?: boolean;
  removeContnetPadding?: boolean;
  className?: string;
  mainButton?: MainButtonConfig;
  back?: boolean;
  onBack?: () => void;
  title?: ReactNode;
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
  title,
}: SafeAreaLayoutProps) {
  const navigate = useNavigate();
  const { safeAreaValue, contentAreaValue } = useSafeAreaValues();

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
    <div
      style={{
        paddingTop: safeAreaValue.top,
      }}
      className="bg-stone-900 h-screen flex flex-col">
      <div
        style={{
          paddingTop: contentAreaValue.top,
        }}
        className="flex-1 bg-white rounded-t-3xl overflow-hidden">
        {children}
      </div>
    </div>
  )

  // When title is provided, use the header style with rounded content
  // if (title) {
  //   return (
  //     <div className={`flex-1 flex flex-col bg-stone-900 overflow-hidden ${className}`}>

  //       {/* Header with safe area */}
  //       <div style={{ paddingTop: safeAreaValue.top }} className="bg-stone-900">
  //         <div className="bg-white rounded-t-3xl h-6" />
  //       </div>

  //       {/* Main content */}
  //       <div
  //         className="flex-1 overflow-auto flex flex-col bg-white"
  //         style={{ paddingTop: contentAreaValue.top }}
  //       >
  //         {children}
  //       </div>

  //       {/* Bottom safe area */}
  //       {showBottom && safeAreaValue.bottom > 0 && (
  //         <div
  //           className="bg-white"
  //           style={{ height: safeAreaValue.bottom }}
  //         />
  //       )}
  //     </div>
  //   );
  // }

  // return (
  //   <div className={`relative flex flex-col h-screen ${className}`}>
  //     {/* Top safe area overlay */}
  //     {showTop && safeAreaValue.top > 0 && (
  //       <div
  //         className={`${topColor} fixed top-0 left-0 w-full z-50 backdrop-blur-sm`}
  //         style={{ height: safeAreaValue.top }}
  //       />
  //     )}

  //     {/* Bottom safe area overlay */}
  //     {showBottom && safeAreaValue.bottom > 0 && (
  //       <div
  //         className={`${bottomColor} fixed bottom-0 left-0 w-full z-5000`}
  //         style={{ height: safeAreaValue.bottom }}
  //       />
  //     )}

  //     {/* Main content with safe area padding */}
  //     <div
  //       className="bg-background flex-1 flex flex-col overflow-y-auto relative"
  //       style={{
  //         paddingTop: safeAreaValue.top + (removeContnetPadding ? 0 : contentAreaValue.top),
  //         paddingBottom: safeAreaValue.bottom,
  //       }}
  //     >
  //       {showLogo && (
  //         <div className="sticky top-0 z-40 bg-background py-3">
  //           <Logo />
  //         </div>
  //       )}
  //       {children}
  //     </div>
  //   </div>
  // );
}
