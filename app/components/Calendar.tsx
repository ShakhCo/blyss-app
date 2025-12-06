import { motion } from "framer-motion";
import { useState } from "react";

export function getMonthWeeks(year: number, month: number) {
  // SAME AS YOUR FUNCTION
  const weeks: Date[][] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const getWeekday = (d: Date) => (d.getDay() + 6) % 7;

  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - getWeekday(firstDay));

  const end = new Date(lastDay);
  end.setDate(lastDay.getDate() + (6 - getWeekday(lastDay)));

  let current = new Date(start);

  while (current <= end) {
    const week: Date[] = [];

    for (let i = 0; i < 7; i++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    weeks.push(week);
  }

  return weeks;
}

type CalendarProps = {
  value?: string;
  onChange?: (date: string) => void;
  /**
   * Function to check if a date has no available time slots.
   * Returns true if the date should be disabled (no time slots available).
   */
  isDateUnavailable?: (date: Date) => boolean;
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const Calendar = ({ value, onChange, isDateUnavailable }: CalendarProps) => {
  const today = new Date();

  const limitDate = new Date();
  limitDate.setDate(today.getDate() + 14);

  // Find the first available date
  const findFirstAvailableDate = (): Date => {
    const current = new Date(today);
    while (current <= limitDate) {
      const isPast = current < today && current.toDateString() !== today.toDateString();
      const hasNoTimeSlots = isDateUnavailable?.(current) ?? false;
      if (!isPast && !hasNoTimeSlots) {
        return current;
      }
      current.setDate(current.getDate() + 1);
    }
    return today; // Fallback to today if no available dates
  };

  const firstAvailableDate = findFirstAvailableDate();
  const defaultDateStr = formatDate(firstAvailableDate);

  const [internalValue, setInternalValue] = useState<string | undefined>(
    value ?? defaultDateStr
  );

  const selectedValue = value ?? internalValue;

  const weeks = getMonthWeeks(2025, 11);

  const handleSelect = (day: Date) => {
    const dateStr = formatDate(day);
    setInternalValue(dateStr);
    onChange?.(dateStr);
  };

  return (
    <div className="w-full">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center text-sm font-medium text-stone-500 mb-2">
        {["Du", "Se", "Cho", "Pay", "Ju", "Sha", "Yak"].map((d) => (
          <div key={d} className={d === "Sha" || d === "Yak" ? "text-red-500" : ""}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar weeks */}
      <div className="space-y-1">
        {weeks.map((week, i) => (
          <div key={i} className="grid grid-cols-7 gap-1">
            {week.map((day, j) => {
              const dateStr = formatDate(day);
              const isSelected = selectedValue === dateStr;
              const isToday = day.toDateString() === today.toDateString();
              const isPast = day < today && !isToday;
              const hasNoTimeSlots = isDateUnavailable?.(day) ?? false;
              const isDisabled = isPast || day > limitDate || hasNoTimeSlots;

              return (
                <motion.button
                  key={j}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelect(day)}
                  initial={false}
                  animate={{
                    scale: isSelected ? 1.05 : 1,
                    opacity: isSelected ? 1 : 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 600,
                    damping: 10,
                  }}
                  className={`
                    h-10 flex items-center justify-center rounded-xl text-sm
                    ${isDisabled
                      ? "bg-transparent text-stone-300 cursor-not-allowed"
                      : isSelected
                        ? "bg-primary text-white font-semibold shadow-sm"
                        : isToday
                          ? "bg-primary/20 text-primary font-semibold"
                          : "bg-stone-100 text-stone-800 hover:bg-stone-200"
                    }
                  `}
                >
                  {day.getDate()}
                </motion.button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
