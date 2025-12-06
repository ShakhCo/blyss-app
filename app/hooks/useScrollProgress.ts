import { useState, useEffect, useRef, useCallback, type RefObject } from "react";

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

  const handleScroll = useCallback(() => {
    const element = ref.current;
    if (!element) return;

    const scrollContainer = element.closest(containerSelector) as HTMLElement | null;
    if (!scrollContainer) return;

    const rect = element.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();

    // Calculate how much of the element has scrolled past the container top
    const elementTop = rect.top - containerRect.top;
    const elementHeight = rect.height;

    // Progress is 0 when element is fully visible, 1 when scrolled past
    const progress = Math.max(0, Math.min(1, -elementTop / elementHeight));
    setScrollProgress(progress);
  }, [containerSelector]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const scrollContainer = element.closest(containerSelector);
    if (!scrollContainer) return;

    // Initial calculation
    handleScroll();

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [containerSelector, handleScroll]);

  return { ref, scrollProgress };
}
