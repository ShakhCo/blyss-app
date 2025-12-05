import { useNavigate, useOutletContext } from "react-router";
import { backButton } from "@tma.js/sdk-react";
import { type PropsWithChildren, useEffect, useRef } from "react";
import { Logo } from "./icons/Logo";
import Lenis from "lenis";

type TmaContext = {
  tmaReady: boolean;
};

export function Page({
  children,
  back = true,
  onBack,
}: PropsWithChildren<{
  /**
   * True if it is allowed to go back from this page.
   */
  back?: boolean;
  /**
   * Optional custom back handler. If not provided, defaults to navigate(-1).
   */
  onBack?: () => void;
}>) {
  const navigate = useNavigate();
  const { tmaReady } = useOutletContext<TmaContext>() || { tmaReady: false };
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const lenis = new Lenis({
      wrapper: scrollContainerRef.current,
      content: scrollContainerRef.current.firstElementChild as HTMLElement,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

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

  return (
    <main
      className="min-h-screen relative bg-stone-900"
      style={{
        // paddingTop: "var(--tg-safe-area-inset-top, 0px)",
        paddingBottom: "var(--tg-safe-area-inset-bottom, 0px)",
        // paddingLeft: "var(--tg-safe-area-inset-left, 0px)",
        // paddingRight: "var(--tg-safe-area-inset-right, 0px)",
      }}
    >
      <div className="fixed top-0 left-0 right-0 z-999 bg-stone-900 pt-10">
        <div className="pb-2">
          <Logo />
          <div className="text-white text-center font-medium text-sm pt-2">
            Rakat boshi, Toshkent
          </div>
        </div>
      </div>

      <div className="fixed top-30 left-0 right-0 h-[calc(100vh-5.25rem)] bg-stone-900">
        <div className="h-full bg-white rounded-t-3xl overflow-hidden">
          <div
            ref={scrollContainerRef}
            className="h-full overflow-y-auto scrollbar-hide"
          >
            <div>{children}</div>
          </div>
        </div>
      </div>

    </main>
  );
}
