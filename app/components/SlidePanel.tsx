import { useEffect, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export interface SlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  showHeader?: boolean;
  showCloseButton?: boolean;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  style?: CSSProperties;
}

export function SlidePanel({
  isOpen,
  onClose,
  children,
  title,
  showHeader = true,
  showCloseButton = true,
  className = "",
  overlayClassName = "",
  contentClassName = "",
  style,
}: SlidePanelProps) {
  // Lock body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "auto";
      };
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`fixed inset-0 z-50 bg-white dark:bg-stone-900 flex flex-col ${className}`}
          style={style}
        >
          {/* Header */}
          {showHeader && (
            <div className="shrink-0 z-10 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center justify-between px-4 h-14">
                <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                  {title}
                </h2>
                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="size-10 flex items-center justify-center rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  >
                    <X size={24} className="text-stone-600 dark:text-stone-400" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className={`flex-1 overflow-y-auto ${contentClassName}`}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
