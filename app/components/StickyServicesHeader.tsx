import { ServiceChip } from "./ServiceChip";

export interface Service {
  id: string;
  name: string;
  icon: string;
  badge?: string | null;
}

export interface StickyServicesHeaderProps {
  mainServices: Service[];
  secondaryServices: Service[];
  scrollProgress: number;
  onServiceClick?: (service: Service) => void;
}

export function StickyServicesHeader({
  mainServices,
  secondaryServices,
  scrollProgress,
  onServiceClick,
}: StickyServicesHeaderProps) {
  // Calculate sticky header animation values based on scroll progress
  // Header starts appearing at 70% scroll and is fully visible at 100%
  const headerProgress = Math.max(0, Math.min(1, (scrollProgress - 0.7) / 0.3));

  // Smooth easing function for more natural feel
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
  const easedProgress = easeOutCubic(headerProgress);

  // Interpolated values for smooth animation
  const headerOpacity = easedProgress;
  const headerScale = 0.9 + easedProgress * 0.1; // 0.9 to 1

  return (
    <div
      className="fixed left-0 right-0 pt-2 z-[500] px-2 top-30 pb-2 sm:top-24 rounded-t-3xl overflow-hidden origin-top"
      style={{
        opacity: headerOpacity,
        pointerEvents: headerProgress > 0.5 ? "auto" : "none",
        transform: `scaleY(${headerScale})`,
        transition:
          "opacity 200ms ease-out, transform 250ms ease-out",
      }}
    >
      <div className="absolute inset-0 -z-10 pointer-events-none
  bg-gradient-to-b 
  from-white/95 via-white/95 to-transparent
  dark:from-stone-900/95 dark:via-stone-900/95
" />

      <div className="relative bg-white dark:bg-stone-800 border-b backdrop-blur-md overflow-hidden shadow-xs rounded-[2.5rem] z-10">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white dark:from-stone-800 to-transparent rounded-l-[2.5rem] z-10 pointer-events-none" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white dark:from-stone-800 to-transparent rounded-r-[2.5rem] z-10 pointer-events-none" />

        <div className="flex overflow-x-scroll items-center gap-2 px-2 py-2 scrollbar-hide">
          {mainServices.map((service) => (
            <ServiceChip
              key={service.id}
              icon={service.icon}
              name={service.name}
              onClick={() => onServiceClick?.(service)}
            />
          ))}
          <div className="shrink-0 h-6 w-[1px] bg-stone-200 dark:bg-stone-600" />
          {secondaryServices.map((service) => (
            <ServiceChip
              key={service.id}
              icon={service.icon}
              name={service.name}
              onClick={() => onServiceClick?.(service)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
