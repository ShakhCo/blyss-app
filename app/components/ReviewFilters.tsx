import { useState, useEffect } from "react";
import { useBlocker } from "react-router";
import { Check, ChevronDown } from "lucide-react";
import { BottomSheet } from "~/components/BottomSheet";
import type { Stylist } from "./ReviewCard";

type FilterType = "rating" | "service" | "stylist" | null;

export type RatingFilterValue = "all" | "high" | "low";

export interface ReviewFiltersState {
  rating: RatingFilterValue;
  service: string;
  stylist: string;
}

interface ReviewFiltersProps {
  services: string[];
  stylists: Stylist[];
  value: ReviewFiltersState;
  onChange: (filters: ReviewFiltersState) => void;
}

export function ReviewFilters({
  services,
  stylists,
  value,
  onChange,
}: ReviewFiltersProps) {
  const [openFilter, setOpenFilter] = useState<FilterType>(null);

  // Block back navigation when modal is open
  const blocker = useBlocker(openFilter !== null);

  useEffect(() => {
    if (blocker.state === "blocked") {
      setOpenFilter(null);
      blocker.reset();
    }
  }, [blocker]);

  const closeFilter = () => setOpenFilter(null);

  // Get display labels
  const getRatingLabel = () => {
    if (value.rating === "high") return "Eng yuqori";
    if (value.rating === "low") return "Eng past";
    return "Baho";
  };

  const getServiceLabel = () => {
    if (value.service === "all") return "Xizmat";
    return value.service;
  };

  const getStylistLabel = () => {
    if (value.stylist === "all") return "Usta";
    const stylist = stylists.find((s) => s.id === value.stylist);
    return stylist?.name || "Usta";
  };

  return (
    <>
      <div className="z-30 bg-white dark:bg-stone-900 px-4 py-">
        <div className="grid grid-cols-11 gap-2">
          <button
            type="button"
            onClick={() => setOpenFilter("rating")}
            className={`col-span-3 flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              value.rating !== "all"
                ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
                : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
            }`}
          >
            <span className="truncate">{getRatingLabel()}</span>
            <ChevronDown size={14} className="shrink-0 ml-1" />
          </button>

          <button
            type="button"
            onClick={() => setOpenFilter("service")}
            className={`col-span-4 flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              value.service !== "all"
                ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
                : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
            }`}
          >
            <span className="truncate">{getServiceLabel()}</span>
            <ChevronDown size={14} className="shrink-0 ml-1" />
          </button>

          <button
            type="button"
            onClick={() => setOpenFilter("stylist")}
            className={`col-span-4 flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              value.stylist !== "all"
                ? "bg-stone-900 text-white dark:bg-white dark:text-stone-900"
                : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
            }`}
          >
            <span className="truncate">{getStylistLabel()}</span>
            <ChevronDown size={14} className="shrink-0 ml-1" />
          </button>
        </div>
      </div>

      {/* Rating Filter BottomSheet */}
      <BottomSheet
        isOpen={openFilter === "rating"}
        onClose={closeFilter}
        title="Baho bo'yicha saralash"
        showCloseButton={false}
        maxHeight="auto"
      >
        <div className="py-2">
          {[
            { id: "high" as const, label: "Eng yuqori" },
            { id: "low" as const, label: "Eng past" },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onChange({ ...value, rating: option.id });
                closeFilter();
              }}
              className="w-full flex items-center justify-between px-2 py-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              <span className="text-base text-stone-900 dark:text-stone-100">
                {option.label}
              </span>
              {value.rating === option.id && (
                <Check size={18} className="text-primary" />
              )}
            </button>
          ))}
          {value.rating !== "all" && (
            <button
              type="button"
              onClick={() => {
                onChange({ ...value, rating: "all" });
                closeFilter();
              }}
              className="w-full mt-2 py-3 rounded-xl text-base font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              Tozalash
            </button>
          )}
        </div>
      </BottomSheet>

      {/* Service Filter BottomSheet */}
      <BottomSheet
        isOpen={openFilter === "service"}
        onClose={closeFilter}
        title="Xizmat bo'yicha filtrlash"
        showCloseButton={false}
        maxHeight="50vh"
      >
        <div className="py-2">
          {services.map((service) => (
            <button
              key={service}
              type="button"
              onClick={() => {
                onChange({ ...value, service });
                closeFilter();
              }}
              className="w-full flex items-center justify-between px-2 py-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              <span className="text-base text-stone-900 dark:text-stone-100">
                {service}
              </span>
              {value.service === service && (
                <Check size={18} className="text-primary" />
              )}
            </button>
          ))}
          {value.service !== "all" && (
            <button
              type="button"
              onClick={() => {
                onChange({ ...value, service: "all" });
                closeFilter();
              }}
              className="w-full mt-2 py-3 rounded-xl text-base font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              Tozalash
            </button>
          )}
        </div>
      </BottomSheet>

      {/* Stylist Filter BottomSheet */}
      <BottomSheet
        isOpen={openFilter === "stylist"}
        onClose={closeFilter}
        title="Usta bo'yicha filtrlash"
        showCloseButton={false}
        maxHeight="50vh"
      >
        <div className="py-2">
          {stylists.map((stylist) => (
            <button
              key={stylist.id}
              type="button"
              onClick={() => {
                onChange({ ...value, stylist: stylist.id });
                closeFilter();
              }}
              className="w-full flex items-center justify-between px-2 py-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <img
                  src={stylist.avatar}
                  alt={stylist.name}
                  className="size-12 rounded-full object-cover"
                />
                <div className="text-left">
                  <p className="text-base text-stone-900 dark:text-stone-100">
                    {stylist.name}
                  </p>
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    {stylist.role}
                  </p>
                </div>
              </div>
              {value.stylist === stylist.id && (
                <Check size={18} className="text-primary" />
              )}
            </button>
          ))}
          {value.stylist !== "all" && (
            <button
              type="button"
              onClick={() => {
                onChange({ ...value, stylist: "all" });
                closeFilter();
              }}
              className="w-full mt-2 py-3 rounded-xl text-base font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              Tozalash
            </button>
          )}
        </div>
      </BottomSheet>
    </>
  );
}
