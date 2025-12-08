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
  const [isScrolled, setIsScrolled] = useState(false);
  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const isAtTopRef = useRef(true);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setDragY(0);
    }, 300);
  };

  // Drag handle touch handlers
  const handleDragHandleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    startYRef.current = e.touches[0].clientY;
    isDraggingRef.current = true;
  };

  const handleDragHandleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isDraggingRef.current) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;
    if (diff > 0) {
      setDragY(diff);
    }
  };

  const handleDragHandleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    isDraggingRef.current = false;
    if (dragY > 100) {
      handleClose();
    } else {
      setDragY(0);
    }
  };

  // Content area touch handlers - only drag when at top
  const handleContentTouchStart = (e: React.TouchEvent) => {
    const scrollTop = contentRef.current?.scrollTop ?? 0;
    isAtTopRef.current = scrollTop <= 0;
    if (isAtTopRef.current) {
      startYRef.current = e.touches[0].clientY;
      isDraggingRef.current = false; // Will be set to true in move if dragging down
    }
  };

  const handleContentTouchMove = (e: React.TouchEvent) => {
    if (!isAtTopRef.current) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;

    // Only start dragging if swiping down while at top
    if (diff > 0) {
      isDraggingRef.current = true;
      setDragY(diff);
      e.preventDefault(); // Prevent scroll when dragging
    }
  };

  const handleContentTouchEnd = () => {
    if (isDraggingRef.current && dragY > 100) {
      handleClose();
    } else {
      setDragY(0);
    }
    isDraggingRef.current = false;
  };

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setDragY(0);
      setIsClosing(false);
      setIsScrolled(false);
    }
  }, [isOpen]);

  // Handle scroll to show/hide header shadow
  const handleScroll = () => {
    const scrollTop = contentRef.current?.scrollTop ?? 0;
    setIsScrolled(scrollTop > 0);
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = "auto";
      };
    }
  }, [isOpen]);

  // Handle Telegram back button and close button
  useEffect(() => {
    if (!isOpen) return;

    let cleanupBack: (() => void) | undefined;
    let cleanupClose: (() => void) | undefined;

    import("@tma.js/sdk-react").then(({ backButton, closingBehavior }) => {
      // Handle back button - close the modal
      const handleBackClick = () => {
        handleClose();
      };

      backButton.onClick(handleBackClick);
      cleanupBack = () => {
        backButton.offClick(handleBackClick);
      };

      // Enable close confirmation when modal is open
      // This prevents accidental app close and shows confirmation
      if (closingBehavior.enableConfirmation.isAvailable()) {
        closingBehavior.enableConfirmation();
        cleanupClose = () => {
          if (closingBehavior.disableConfirmation.isAvailable()) {
            closingBehavior.disableConfirmation();
          }
        };
      }
    });

    return () => {
      cleanupBack?.();
      cleanupClose?.();
    };
  }, [isOpen]);

  // Handle browser back button via popstate
  useEffect(() => {
    if (!isOpen) return;

    // Push a state when modal opens
    window.history.pushState({ bottomSheet: true }, "");

    const handlePopState = () => {
      handleClose();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isClosing ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/50"
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
            className="max-w-lg mx-auto absolute bottom-0 left-0 right-0 flex flex-col bg-white dark:bg-stone-900 rounded-t-3xl overflow-hidden"
            style={{ maxHeight }}
          >
            {/* Drag Handle */}
            {showDragHandle && (
              <div
                className="shrink-0 flex justify-center py-3 cursor-grab active:cursor-grabbing"
                onTouchStart={handleDragHandleTouchStart}
                onTouchMove={handleDragHandleTouchMove}
                onTouchEnd={handleDragHandleTouchEnd}
              >
                <div className="w-10 h-1 bg-stone-300 dark:bg-stone-600 rounded-full" />
              </div>
            )}

            {/* Header */}
            {(title || icon || showCloseButton) && (
              <div className={`shrink-0 flex items-center justify-between px-4 pb-1 transition-shadow duration-200 ${isScrolled ? 'shadow-xs' : ''}`}>
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
            <div
              ref={contentRef}
              className="flex-1 overflow-auto px-4 pb-6"
              onScroll={handleScroll}
              onTouchStart={handleContentTouchStart}
              onTouchMove={handleContentTouchMove}
              onTouchEnd={handleContentTouchEnd}
            >
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
