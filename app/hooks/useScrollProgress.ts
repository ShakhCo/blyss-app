import { useState, useEffect, useRef, type RefObject } from "react";

export interface UseScrollProgressOptions {
  containerSelector?: string;
}

export interface UseScrollProgressResult {
  ref: RefObject<HTMLDivElement | null>;
  scrollProgress: number;
}

export function useScrollProgress(
  options: UseScrollProgressOptions = {}
): UseScrollProgressResult {
  const { containerSelector = ".overflow-y-auto" } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [endPosition, setEndPosition] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const calculateEndPosition = () => {
      const rect = element.getBoundingClientRect();
      const scrollContainer = element.closest(containerSelector);
      if (scrollContainer) {
        const containerRect = scrollContainer.getBoundingClientRect();
        const scrollTop = scrollContainer.scrollTop;
        const endPx = rect.bottom - containerRect.top + scrollTop;
        setEndPosition(endPx);
      }
    };

    calculateEndPosition();

    const scrollContainer = element.closest(containerSelector);
    const handleScroll = () => {
      if (scrollContainer && endPosition > 0) {
        const scrollTop = scrollContainer.scrollTop;
        const progress = Math.min(1, scrollTop / endPosition);
        setScrollProgress(progress);
      }
    };

    scrollContainer?.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", calculateEndPosition);

    return () => {
      scrollContainer?.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", calculateEndPosition);
    };
  }, [containerSelector, endPosition]);

  return { ref, scrollProgress };
}
