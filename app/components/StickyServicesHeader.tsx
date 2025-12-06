import { motion, AnimatePresence } from "framer-motion";

export interface Service {
  id: string;
  name: string;
  icon: string;
  badge?: string | null;
}

export interface StickyServicesHeaderProps {
  services: Service[];
  activeServiceId?: string;
  onServiceClick?: (service: Service) => void;
  isVisible?: boolean;
}

export function StickyServicesHeader({
  services,
  activeServiceId,
  onServiceClick,
  isVisible = false,
}: StickyServicesHeaderProps) {
  return (
    // Zero-height sticky container - never takes space in document flow
    <div className="sticky top-0 z-40 h-0 [perspective:1000px]">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10, rotateX: -15 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10, rotateX: -15 }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 25,
            }}
            style={{ transformOrigin: "top center" }}
            className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 shadow-sm"
          >
            <div className="flex overflow-x-auto scrollbar-hide">
              {services.map((service) => {
                const isActive = activeServiceId === service.id;
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => onServiceClick?.(service)}
                    className={`flex-shrink-0 border-r border-r-stone-100 px-4 py-3 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                      isActive
                        ? "text-primary"
                        : "text-stone-500 dark:text-stone-400"
                    }`}
                  >
                    <img
                      src={service.icon}
                      alt={service.name}
                      className="size-5 object-contain"
                    />
                    <span>{service.name}</span>
                    {service.badge && (
                      <span className="px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                        {service.badge}
                      </span>
                    )}
                    {isActive && (
                      <motion.span
                        layoutId="service-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
