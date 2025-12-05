import { useEffect, useState, useRef, useCallback, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { useBlocker } from "react-router";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function BottomSheet({ isOpen, onClose, children }: BottomSheetProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Block navigation when modal is open
  const blocker = useBlocker(isOpen && shouldAnimate);

  useEffect(() => {
    if (blocker.state === "blocked") {
      onClose();
      blocker.reset();
    }
  }, [blocker, onClose]);

  // Single effect to handle all state transitions
  useEffect(() => {
    // Always clear pending timer first
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }

    if (isOpen) {
      // OPENING: Use flushSync to force synchronous state updates
      // This ensures the DOM is updated before we trigger the animation
      flushSync(() => {
        setDragY(0);
        setIsDragging(false);
        setIsVisible(true);
        setShouldAnimate(false);
      });

      // Now trigger the animation after DOM has updated
      requestAnimationFrame(() => {
        setShouldAnimate(true);
      });
    } else {
      // CLOSING: Animate out, then hide
      setShouldAnimate(false);
      setDragY(0);

      animationTimerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 300);
    }

    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, [isOpen]);

  // Body scroll lock
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    e.stopPropagation();
    const currentY = e.touches[0].clientY;
    const diff = currentY - dragStartY.current;
    if (diff > 0) {
      setDragY(diff);
    }
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    if (dragY > 50) {
      onClose();
    } else {
      setDragY(0);
    }
  }, [dragY, onClose]);

  // Don't render anything if not visible
  if (!isVisible) return null;

  // Determine if we're in closing state
  const isClosing = !isOpen && isVisible;

  // Calculate backdrop opacity
  const backdropOpacity = shouldAnimate ? Math.max(0, 0.5 - dragY / 400) : 0;

  // Only allow backdrop clicks when fully open and not closing
  const allowBackdropClick = isOpen && shouldAnimate && !isDragging;

  let transform: string;
  if (dragY > 0) {
    transform = `translateY(${dragY}px)`;
  } else if (shouldAnimate) {
    transform = "translateY(0)";
  } else {
    transform = "translateY(100%)";
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black z-50 ${
          isDragging ? "" : "transition-opacity duration-300"
        } ${!allowBackdropClick ? "pointer-events-none" : ""}`}
        style={{ opacity: backdropOpacity }}
        onClick={allowBackdropClick ? onClose : undefined}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-stone-900 rounded-t-3xl ${
          isDragging ? "" : "transition-transform duration-300 ease-out"
        } ${isClosing ? "pointer-events-none" : "touch-none"}`}
        style={{ transform }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
          <div className="w-10 h-1 bg-stone-300 dark:bg-stone-700 rounded-full" />
        </div>
        <div className="px-5 pb-8">
          {children}
        </div>
      </div>
    </>
  );
}
