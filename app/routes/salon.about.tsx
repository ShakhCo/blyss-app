import { useOutletContext } from "react-router";
import { MapPin, Clock, Phone } from "lucide-react";
import type { SalonContext } from "./salon";

export default function SalonAbout() {
  const { salon } = useOutletContext<SalonContext>();

  return (
    <div className="p-4 space-y-6">
      {/* Description */}
      <div>
        <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">
          Salon haqida 5
        </h3>
        <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-line">
          {salon.description}
        </p>
      </div>

      {/* Contact Info */}
      <div>
        <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-3">
          Aloqa
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-stone-600 dark:text-stone-300">
            <div className="size-10 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center">
              <MapPin size={18} className="text-primary" />
            </div>
            <span className="text-sm">{salon.address}</span>
          </div>
          <div className="flex items-center gap-3 text-stone-600 dark:text-stone-300">
            <div className="size-10 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center">
              <Clock size={18} className="text-primary" />
            </div>
            <div>
              <span className="text-sm">{salon.workingHours}</span>
              <span className="text-xs text-green-500 font-medium ml-2">Ochiq</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-stone-600 dark:text-stone-300">
            <div className="size-10 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center">
              <Phone size={18} className="text-primary" />
            </div>
            <span className="text-sm">{salon.phone}</span>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div>
        <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-3">
          Qulayliklar
        </h3>
        <div className="flex flex-wrap gap-2">
          {salon.amenities.map((amenity) => (
            <span
              key={amenity}
              className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 rounded-full text-sm text-stone-600 dark:text-stone-300"
            >
              {amenity}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
