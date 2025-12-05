import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

// Store scroll positions by pathname
const scrollPositions = new Map<string, number>();

export function useScrollRestoration() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const pathnameRef = useRef(location.pathname);

  // Save scroll position before navigating away
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      scrollPositions.set(pathnameRef.current, container.scrollTop);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Restore scroll position when pathname changes
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    // Update the pathname ref
    pathnameRef.current = location.pathname;

    // Restore saved position or scroll to top
    const savedPosition = scrollPositions.get(location.pathname);

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      if (savedPosition !== undefined) {
        container.scrollTop = savedPosition;
      } else {
        container.scrollTop = 0;
      }
    });
  }, [location.pathname]);

  return scrollRef;
}
