import { useState, useEffect } from "react";
import { useOutletContext, useNavigate, useBlocker } from "react-router";
import { Button } from "@heroui/react";
import { bookingCart } from "~/stores/booking";
import { BottomSheet } from "~/components/BottomSheet";
import { useI18nStore } from "~/stores/i18n-store";
import type { SalonContext } from "./salon";

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
  const { t } = useI18nStore();
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

  return (
    <>
      <div className="pt-2">
        <div className="divide-y divide-stone-100 dark:divide-stone-800">
          {salon.services.map((service) => (
            <div
              key={service.id}
              onClick={() => openServiceModal(service)}
              className="px-4 py-3 flex items-center justify-between gap-3"
            >
              <button
                type="button"
                className="flex-1 min-w-0 text-left"
              >
                <h4 className="font-semibold text-stone-900 dark:text-stone-100">
                  {service.name}
                </h4>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                  {service.price} {t('common.currency')} · {service.duration}
                </p>
              </button>
              <Button size="sm" onPress={() => handleBookService(service)}>
                {t('salon.book')}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <BottomSheet
          isOpen={isModalOpen}
          onClose={closeServiceModal}
          title={selectedService.name}
          footer={
            <Button
              className="w-full py-6 bg-primary text-white font-semibold rounded-2xl"
              onPress={() => handleBookService(selectedService)}
            >
              {t('salon.book')} — {selectedService.price} {t('common.currency')}
            </Button>
          }
        >
          {/* Service Details */}
          <div className="grid grid-cols-1 gap-4 py-4">
            <div>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-1">{t('salon.duration')}</p>
              <p className="font-semibold text-stone-900 dark:text-white">
                {selectedService.duration}
              </p>
            </div>
            <div>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-1">{t('salon.price')}</p>
              <p className="font-bold text-lg text-primary">
                {selectedService.price} {t('common.currency')}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-stone-900 dark:text-white mb-2">
              {t('salon.aboutService')}
            </h3>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
              {t('salon.serviceDescription')}
            </p>
          </div>
        </BottomSheet>
      )}
    </>
  );
}
