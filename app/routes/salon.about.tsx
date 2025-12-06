import { useState } from "react";
import { useOutletContext } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, Clock, ChevronDown } from "lucide-react";
import type { SalonContext } from "./salon";

// Day names in Uzbek matching the data
const dayNames = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];

export default function SalonAbout() {
  const { salon } = useOutletContext<SalonContext>();
  const [isHoursExpanded, setIsHoursExpanded] = useState(false);

  // Get current day name in Uzbek
  const today = new Date();
  const currentDayName = dayNames[today.getDay()];
  const todaySchedule = salon.weeklyHours.find((s) => s.day === currentDayName);

  return (
    <div className="pt-2">
      {/* Description Section */}
      <div className="border-b-6 border-stone-50 dark:border-stone-800">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="flex flex-col">
            <span className="font-semibold text-stone-900 dark:text-stone-100">Salon haqida</span>
            <span className="text-sm text-stone-400">Tavsif va ma'lumot</span>
          </div>
        </div>
        <div className="px-4 pb-4">
          <p className="text-stone-600 text-base dark:text-stone-400 leading-relaxed whitespace-pre-line">
            {salon.description}
          </p>
        </div>
      </div>

      {/* Contact Info Section */}
      <div className="border-b-6 border-stone-50 dark:border-stone-800">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="flex flex-col">
            <span className="font-semibold text-stone-900 dark:text-stone-100">Aloqa</span>
            <span className="text-sm text-stone-400">Manzil va telefon</span>
          </div>
        </div>
        <div className="divide-y divide-stone-100 dark:divide-stone-800">
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="size-10 shrink-0 bg-stone-50 dark:bg-stone-800/50 rounded-xl flex items-center justify-center">
              <MapPin size={18} className="text-primary" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-stone-400 dark:text-stone-500">Manzil</span>
              <span className="font-medium text-stone-900 dark:text-stone-100 truncate">{salon.address}</span>
            </div>
          </div>
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="size-10 shrink-0 bg-stone-50 dark:bg-stone-800/50 rounded-xl flex items-center justify-center">
              <Phone size={18} className="text-primary" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-stone-400 dark:text-stone-500">Telefon</span>
              <a href={`tel:${salon.phone}`} className="font-medium text-primary">{salon.phone}</a>
            </div>
          </div>
        </div>
      </div>

      {/* Working Hours Section */}
      <div className="border-b-6 border-stone-50 dark:border-stone-800">
        {/* Header - clickable to expand */}
        <button
          type="button"
          onClick={() => setIsHoursExpanded(!isHoursExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="size-10 shrink-0 bg-stone-50 dark:bg-stone-800/50 rounded-xl flex items-center justify-center">
              <Clock size={18} className="text-primary" />
            </div>
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-xs text-stone-400 dark:text-stone-500">Bugun · {currentDayName}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-stone-900 dark:text-stone-100">
                  {todaySchedule?.hours || salon.workingHours}
                </span>
                {todaySchedule?.isOpen && (
                  <span className="px-2 py-0.5 bg-green-100 dark:bg-green-500/20 rounded-full text-xs text-green-600 dark:text-green-400 font-medium">
                    Ochiq
                  </span>
                )}
                {todaySchedule && !todaySchedule.isOpen && (
                  <span className="px-2 py-0.5 bg-red-100 dark:bg-red-500/20 rounded-full text-xs text-red-600 dark:text-red-400 font-medium">
                    Yopiq
                  </span>
                )}
              </div>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isHoursExpanded ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <ChevronDown size={20} className="text-stone-400" />
          </motion.div>
        </button>

        {/* Expandable content */}
        <AnimatePresence initial={false}>
          {isHoursExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 border-t border-stone-100 dark:border-stone-800">
                <div className="pt-3 space-y-1">
                  {salon.weeklyHours.map((schedule) => {
                    const isToday = schedule.day === currentDayName;
                    return (
                      <div
                        key={schedule.day}
                        className={`flex items-center justify-between py-2 px-3 rounded-xl ${isToday ? "bg-primary/5" : ""}`}
                      >
                        <span className={`${isToday ? "font-medium text-primary" : "text-stone-600 dark:text-stone-400"}`}>
                          {schedule.day}
                          {isToday && <span className="text-xs ml-1">(bugun)</span>}
                        </span>
                        <span className={`font-medium ${schedule.isOpen ? (isToday ? "text-primary" : "text-stone-900 dark:text-stone-100") : "text-red-500 dark:text-red-400"}`}>
                          {schedule.hours}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Amenities Section */}
      <div className="border-b-6 border-stone-50 dark:border-stone-800">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="flex flex-col">
            <span className="font-semibold text-stone-900 dark:text-stone-100">Qulayliklar</span>
            <span className="text-sm text-stone-400">{salon.amenities.length} ta qulaylik</span>
          </div>
        </div>
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {salon.amenities.map((amenity) => (
              <span
                key={amenity}
                className="px-3 py-1 bg-stone-100 dark:bg-stone-800 rounded-xl text-sm font-medium text-stone-600 dark:text-stone-300"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div>
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="flex flex-col">
            <span className="font-semibold text-stone-900 dark:text-stone-100">Jamoa</span>
            <span className="text-sm text-stone-400">{salon.stylists.length} ta mutaxassis</span>
          </div>
        </div>
        <div className="divide-y divide-stone-100 dark:divide-stone-800">
          {salon.stylists.map((stylist) => (
            <div
              key={stylist.id}
              className="px-4 py-3 flex items-center gap-3"
            >
              <img
                src={stylist.avatar}
                alt={stylist.name}
                className="size-12 rounded-full object-cover"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-stone-900 dark:text-stone-100">{stylist.name}</span>
                <span className="text-sm text-stone-500 dark:text-stone-400">{stylist.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
