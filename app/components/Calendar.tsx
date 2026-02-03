import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function getMonthWeeks(year: number, month: number) {
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

const monthNames = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"
];

export const Calendar = ({ value, onChange, isDateUnavailable }: CalendarProps) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Max date is 60 days from now
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 60);

  // Current viewing month
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  // Find the first available date
  const findFirstAvailableDate = (): Date => {
    const current = new Date(today);
    const limitDate = new Date(today);
    limitDate.setDate(today.getDate() + 60);

    while (current <= limitDate) {
      const hasNoTimeSlots = isDateUnavailable?.(current) ?? false;
      if (!hasNoTimeSlots) {
        return current;
      }
      current.setDate(current.getDate() + 1);
    }
    return today;
  };

  const firstAvailableDate = useMemo(() => findFirstAvailableDate(), []);
  const defaultDateStr = formatDate(firstAvailableDate);

  const [internalValue, setInternalValue] = useState<string | undefined>(
    value ?? defaultDateStr
  );

  const selectedValue = value ?? internalValue;

  const weeks = useMemo(() => getMonthWeeks(viewYear, viewMonth), [viewYear, viewMonth]);

  const handleSelect = (day: Date) => {
    const dateStr = formatDate(day);
    setInternalValue(dateStr);
    onChange?.(dateStr);
  };

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Check if we can go to previous month (not before current month)
  const canGoPrev = viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  // Check if we can go to next month (not after max date's month)
  const canGoNext = viewYear < maxDate.getFullYear() ||
    (viewYear === maxDate.getFullYear() && viewMonth < maxDate.getMonth());

  return (
    <div className="w-full">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goToPrevMonth}
          disabled={!canGoPrev}
          className={`p-2 rounded-lg ${canGoPrev ? "hover:bg-stone-100 dark:hover:bg-stone-800" : "opacity-30 cursor-not-allowed"}`}
        >
          <ChevronLeft size={20} className="text-stone-600 dark:text-stone-400" />
        </button>
        <h3 className="font-semibold text-stone-900 dark:text-stone-100">
          {monthNames[viewMonth]} {viewYear}
        </h3>
        <button
          type="button"
          onClick={goToNextMonth}
          disabled={!canGoNext}
          className={`p-2 rounded-lg ${canGoNext ? "hover:bg-stone-100 dark:hover:bg-stone-800" : "opacity-30 cursor-not-allowed"}`}
        >
          <ChevronRight size={20} className="text-stone-600 dark:text-stone-400" />
        </button>
      </div>

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
              const isCurrentMonth = day.getMonth() === viewMonth;
              const isPast = day < today;
              const isFuture = day > maxDate;
              const hasNoTimeSlots = isDateUnavailable?.(day) ?? false;
              const isDisabled = isPast || isFuture || hasNoTimeSlots || !isCurrentMonth;

              return (
                <motion.button
                  key={j}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelect(day)}
                  initial={false}
                  animate={{
                    scale: isSelected ? 1.05 : 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 600,
                    damping: 10,
                  }}
                  className={`
                    h-10 flex items-center justify-center rounded-xl text-sm
                    ${!isCurrentMonth
                      ? "bg-transparent text-stone-200 dark:text-stone-700 cursor-not-allowed"
                      : isDisabled
                        ? "bg-transparent text-stone-300 dark:text-stone-600 cursor-not-allowed"
                        : isSelected
                          ? "bg-primary text-white font-semibold shadow-sm"
                          : isToday
                            ? "bg-primary/20 text-primary font-semibold"
                            : "bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700"
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
