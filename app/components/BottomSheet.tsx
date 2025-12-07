import { useState, useEffect, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  maxHeight?: string;
  showCloseButton?: boolean;
  showDragHandle?: boolean;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  maxHeight = "70vh",
  showCloseButton = true,
  showDragHandle = true,
}: BottomSheetProps) {
  const [dragY, setDragY] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setDragY(0);
    }, 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    startYRef.current = e.touches[0].clientY;
    isDraggingRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isDraggingRef.current) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;
    if (diff > 0) {
      setDragY(diff);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    isDraggingRef.current = false;
    if (dragY > 100) {
      handleClose();
    } else {
      setDragY(0);
    }
  };

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setDragY(0);
      setIsClosing(false);
    }
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";

      const preventScroll = (e: TouchEvent) => {
        e.preventDefault();
      };
      document.addEventListener("touchmove", preventScroll, { passive: false });

      return () => {
        document.body.style.overflow = "auto";
        document.body.style.touchAction = "auto";
        document.removeEventListener("touchmove", preventScroll);
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 touch-none"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isClosing ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/50 touch-none"
            onClick={handleClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: isClosing ? "100%" : dragY }}
            exit={{ y: "100%" }}
            transition={{
              duration: isClosing ? 0.3 : (dragY > 0 ? 0 : 0.3),
              ease: [0.32, 0.72, 0, 1]
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="max-w-lg mx-auto absolute bottom-0 left-0 right-0 flex flex-col bg-white dark:bg-stone-900 rounded-t-3xl overflow-hidden touch-none"
            style={{ maxHeight }}
          >
            {/* Drag Handle */}
            {showDragHandle && (
              <div className="shrink-0 flex justify-center py-3">
                <div className="w-10 h-1 bg-stone-300 dark:bg-stone-600 rounded-full" />
              </div>
            )}

            {/* Header */}
            {(title || icon || showCloseButton) && (
              <div className="shrink-0 flex items-center justify-between px-4 pb-3">
                <div className="flex items-center gap-3">
                  {icon && (
                    <div className="size-12 shrink-0 bg-stone-100 dark:bg-stone-800 rounded-2xl flex items-center justify-center">
                      {icon}
                    </div>
                  )}
                  {(title || subtitle) && (
                    <div>
                      {title && (
                        <h2 className="text-lg font-bold text-stone-900 dark:text-white">
                          {title}
                        </h2>
                      )}
                      {subtitle && (
                        <p className="text-sm text-stone-500 dark:text-stone-400">
                          {subtitle}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    type="button"
                    onClick={handleClose}
                    className="size-10 flex items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800"
                  >
                    <X size={20} className="text-stone-600 dark:text-stone-400" />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-auto px-4 pb-6">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="shrink-0 px-4 py-4 border-t border-stone-200 dark:border-stone-800">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
