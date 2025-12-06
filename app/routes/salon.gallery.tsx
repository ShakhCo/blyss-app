import { useState, useEffect } from "react";
import { useOutletContext } from "react-router";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import type { SalonContext } from "./salon";

export default function SalonGallery() {
  const { salon } = useOutletContext<SalonContext>();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState(0);

  const images = salon.gallery;

  const closeModal = () => {
    setSelectedImageIndex(null);
  };

  const goToNext = () => {
    if (selectedImageIndex !== null && selectedImageIndex < images.length - 1) {
      setDirection(1);
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const goToPrev = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setDirection(-1);
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    const velocity = 500;

    if (info.offset.x < -threshold || info.velocity.x < -velocity) {
      // Swiped left -> go to next
      goToNext();
    } else if (info.offset.x > threshold || info.velocity.x > velocity) {
      // Swiped right -> go to prev
      goToPrev();
    }
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedImageIndex !== null) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "auto";
      };
    }
  }, [selectedImageIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      } else if (event.key === "ArrowRight") {
        goToNext();
      } else if (event.key === "ArrowLeft") {
        goToPrev();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedImageIndex, images.length]);

  // Image slide variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <>
      {/* Image Grid */}
      <div className="p-0">
        <div className="grid grid-cols-3 gap-0.5">
          {images.map((img, index) => (
            <div
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className="aspect-square overflow-hidden cursor-pointer"
            >
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
              />
            </div>
          ))}
        </div>

        {/* Empty state */}
        {images.length === 0 && (
          <div className="py-12 text-center text-stone-500 dark:text-stone-400">
            Rasmlar yo'q
          </div>
        )}
      </div>

      {/* Simple Modal */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/90"
              onClick={() => closeModal()}
            />

            {/* Image - centered with swipe */}
            <div
              className="absolute inset-0 flex items-center justify-center overflow-hidden"
              onClick={() => closeModal()}
            >
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.img
                  key={selectedImageIndex}
                  src={images[selectedImageIndex]}
                  alt=""
                  className="max-w-full max-h-[70vh] object-contain"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onDragEnd={handleDragEnd}
                  onClick={(e) => e.stopPropagation()}
                />
              </AnimatePresence>
            </div>

            {/* Thumbnail strip */}
            <div
              className="absolute bottom-4 left-0 right-0 px-4 z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex gap-2 justify-center overflow-x-auto scrollbar-hide py-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`shrink-0 size-12 rounded-lg overflow-hidden transition-all ${
                      index === selectedImageIndex
                        ? "ring-2 ring-white scale-110"
                        : "opacity-50 hover:opacity-75"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
