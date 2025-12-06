import { useState, useEffect } from "react";
import { useOutletContext, useNavigate, useBlocker } from "react-router";
import { Button } from "@heroui/react";
import { bookingCart } from "~/stores/booking";
import { BottomSheet } from "~/components/BottomSheet";
import type { SalonContext } from "./salon";

// Import service icons
import scissorIcon from "~/assets/icons/scissor.png";
import makeupIcon from "~/assets/icons/makeup.png";
import massageIcon from "~/assets/icons/massage.png";
import creamIcon from "~/assets/icons/cream.png";
import pluckingIcon from "~/assets/icons/plucking.png";
import shavingBrushIcon from "~/assets/icons/shaving-brush.png";

// Map category names to icons
const categoryIcons: Record<string, string> = {
  "Soch": scissorIcon,
  "Tirnoq": pluckingIcon,
  "Yuz": makeupIcon,
  "Spa": massageIcon,
  "Teri": creamIcon,
  "Soqol": shavingBrushIcon,
};

type ServiceType = {
  id: string;
  name: string;
  duration: string;
  price: string;
  category: string;
};

export default function SalonServices() {
  const { salon } = useOutletContext<SalonContext>();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openServiceModal = (service: ServiceType) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const closeServiceModal = () => {
    setIsModalOpen(false);
  };

  const handleBookService = (service: ServiceType) => {
    closeServiceModal();
    bookingCart.clear();
    bookingCart.setSalon(salon.id, salon.name);
    bookingCart.addService(service);
    navigate(`/booking?salonId=${salon.id}&serviceId=${service.id}`);
  };

  // Block back navigation when modal is open
  const blocker = useBlocker(isModalOpen);

  useEffect(() => {
    if (blocker.state === "blocked") {
      closeServiceModal();
      blocker.reset();
    }
  }, [blocker]);

  // Group services by category
  const servicesByCategory = salon.services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, typeof salon.services>);

  return (
    <>
      <div className="pt-2">
        {/* <div className="h-[6px] bg-stone-50" /> */}
        {Object.entries(servicesByCategory).map(([category, services]) => (
          <div key={category} className="border-b-6 border-stone-50 dark:border-stone-800">
            {/* Category Header */}
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="size-12 shrink-0 bg-stone-100 dark:bg-stone-800 rounded-2xl flex items-center justify-center">
                <img
                  src={categoryIcons[category] || scissorIcon}
                  alt={category}
                  className="size-7 object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-stone-900 dark:text-stone-100">{category}</span>
                <span className="text-sm text-stone-400">{services.length} ta xizmat</span>
              </div>
            </div>

            {/* Services List */}
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => openServiceModal(service)}
                  className="px-4 py-2 flex items-center justify-between gap-3"
                >
                  <button
                    type="button"
                    className="flex-1 min-w-0 text-left"
                  >
                    <h4 className="font-semibold text-stone-900 dark:text-stone-100">
                      {service.name}
                    </h4>
                    <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                      {service.price} so'm · {service.duration}
                    </p>
                  </button>
                  <Button size="sm" onClick={(e) => {
                    e.stopPropagation();
                    handleBookService(service);
                  }}>
                    Band qilish
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <BottomSheet
          isOpen={isModalOpen}
          onClose={closeServiceModal}
          title={selectedService.name}
          subtitle={selectedService.category}
          icon={
            <img
              src={categoryIcons[selectedService.category] || scissorIcon}
              alt={selectedService.category}
              className="size-7 object-contain"
            />
          }
          footer={
            <Button
              className="w-full py-6 bg-primary text-white font-semibold rounded-2xl"
              onPress={() => handleBookService(selectedService)}
            >
              Band qilish — {selectedService.price} so'm
            </Button>
          }
        >
          {/* Service Details */}
          <div className="grid grid-cols-1 gap-4 py-4">
            <div>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-1">Davomiyligi</p>
              <p className="font-semibold text-stone-900 dark:text-white">
                {selectedService.duration}
              </p>
            </div>
            <div>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-1">Narxi</p>
              <p className="font-bold text-lg text-primary">
                {selectedService.price} so'm
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-stone-900 dark:text-white mb-2">
              Xizmat haqida
            </h3>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
              Professional xizmat ko'rsatish. Tajribali mutaxassislar tomonidan amalga oshiriladi. Yuqori sifatli materiallar ishlatiladi.
            </p>
          </div>
        </BottomSheet>
      )}
    </>
  );
}
