import { useState, useEffect } from "react";
import { useOutletContext, useNavigate, useBlocker, useParams } from "react-router";
import { Modal, Button } from "@heroui/react";
import { Clock, Star } from "lucide-react";
import { bookingCart } from "~/stores/booking";
import type { SalonContext } from "./salon";

// Import service icons
import scissorIcon from "~/assets/icons/scissor.png";
import makeupIcon from "~/assets/icons/makeup.png";
import massageIcon from "~/assets/icons/massage.png";
import creamIcon from "~/assets/icons/cream.png";
import pluckingIcon from "~/assets/icons/plucking.png";

// Map category names to icons
const categoryIcons: Record<string, string> = {
  "Soch": scissorIcon,
  "Tirnoq": pluckingIcon,
  "Yuz": makeupIcon,
  "Spa": massageIcon,
  "Teri": creamIcon,
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
  const { id } = useParams();
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
      <div className="">
        <div className="h-[6px] bg-stone-50" />
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
                  className="px-4 py-4 flex items-center justify-between gap-3"
                >
                  <button
                    type="button"
                    className="flex-1 min-w-0 text-left"
                  >
                    <h4 className="font-semibold text-stone-900 dark:text-stone-100">
                      {service.name}
                    </h4>
                    <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                      {service.duration} · {service.price} so'm
                    </p>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookService(service);
                    }}
                    type="button"
                    className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-full hover:bg-primary/90 transition-colors active:scale-[0.98]"
                  >
                    Band qilish
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Service Detail Modal */}
      <Modal.Container
        isOpen={isModalOpen}
        onOpenChange={(open) => !open && closeServiceModal()}
        placement="bottom"
        backdropClassName="data-[exiting]:duration-400"
        className="data-[entering]:duration-300 data-[exiting]:duration-400 data-[entering]:animate-in data-[entering]:slide-in-from-bottom-full data-[entering]:fade-in-0 data-[entering]:ease-fluid-out data-[exiting]:animate-out data-[exiting]:slide-out-to-bottom-full data-[exiting]:opacity-100 data-[exiting]:ease-out-quart"
      >
        <Modal.Dialog className="sm:max-w-md mb-0 sm:min-h-[90vh]">
          {({ close }) => (
            <>
              <Modal.CloseTrigger />
              {selectedService && (
                <>
                  <Modal.Header className="flex-row items-center gap-4 pb-2">
                    <div className="size-14 shrink-0 bg-stone-100 dark:bg-stone-800 rounded-2xl flex items-center justify-center">
                      <img
                        src={categoryIcons[selectedService.category] || scissorIcon}
                        alt={selectedService.category}
                        className="size-8 object-contain"
                      />
                    </div>
                    <div>
                      <Modal.Heading className="text-lg">
                        {selectedService.name}
                      </Modal.Heading>
                      <p className="text-sm text-stone-500 dark:text-stone-400">
                        {selectedService.category}
                      </p>
                    </div>
                  </Modal.Header>

                  <Modal.Body className="py-4">
                    {/* Service Details */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between py-3 border-b border-stone-100 dark:border-stone-800">
                        <div className="flex items-center gap-3 text-stone-600 dark:text-stone-400">
                          <Clock size={18} />
                          <span>Davomiyligi</span>
                        </div>
                        <span className="font-medium text-stone-900 dark:text-stone-100">
                          {selectedService.duration}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-stone-100 dark:border-stone-800">
                        <div className="flex items-center gap-3 text-stone-600 dark:text-stone-400">
                          <Star size={18} />
                          <span>Narxi</span>
                        </div>
                        <span className="font-bold text-lg text-primary">
                          {selectedService.price} so'm
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                      Professional xizmat ko'rsatish. Tajribali mutaxassislar tomonidan amalga oshiriladi. Yuqori sifatli materiallar ishlatiladi.
                    </p>
                  </Modal.Body>

                  <Modal.Footer className="pt-2">
                    <Button
                      className="w-full py-6 bg-primary text-white font-semibold rounded-2xl"
                      onPress={() => handleBookService(selectedService)}
                    >
                      Band qilish — {selectedService.price} so'm
                    </Button>
                  </Modal.Footer>
                </>
              )}
            </>
          )}
        </Modal.Dialog>
      </Modal.Container>
    </>
  );
}
