import { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router";
import { motion } from "framer-motion";
import { SlidePanel } from "~/components/SlidePanel";
import type { SalonContext } from "./salon";

export default function SalonGallery() {
  const { salon } = useOutletContext<SalonContext>();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const startXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const containerWidthRef = useRef(0);

  const images = salon.gallery;
  const isOpen = selectedImageIndex !== null;

  const closeModal = () => {
    setSelectedImageIndex(null);
    setDragX(0);
  };

  const goToNext = () => {
    if (selectedImageIndex !== null && selectedImageIndex < images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
    setDragX(0);
  };

  const goToPrev = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
    setDragX(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    isDraggingRef.current = true;
    containerWidthRef.current = window.innerWidth;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;

    // Limit drag at edges
    if (selectedImageIndex === 0 && diff > 0) {
      setDragX(diff * 0.3); // Resistance at start
    } else if (selectedImageIndex === images.length - 1 && diff < 0) {
      setDragX(diff * 0.3); // Resistance at end
    } else {
      setDragX(diff);
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    const threshold = containerWidthRef.current * 0.2; // 20% of screen width

    if (dragX < -threshold && selectedImageIndex !== null && selectedImageIndex < images.length - 1) {
      goToNext();
    } else if (dragX > threshold && selectedImageIndex !== null && selectedImageIndex > 0) {
      goToPrev();
    } else {
      setDragX(0);
    }
  };

  // Handle keyboard navigation for gallery
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        goToNext();
      } else if (event.key === "ArrowLeft") {
        goToPrev();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, selectedImageIndex, images.length]);

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

      {/* Photo Viewer Modal */}
      <SlidePanel
        isOpen={isOpen}
        onClose={closeModal}
        showHeader={false}
        className="bg-black"
      >
        {selectedImageIndex !== null && (
          <>
            {/* Image Carousel */}
            <div
              className="absolute inset-0 flex items-center overflow-hidden"
              onClick={closeModal}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <motion.div
                className="flex items-center"
                initial={false}
                animate={{ x: `calc(${dragX}px - ${selectedImageIndex * 100}vw)` }}
                transition={{
                  duration: isDraggingRef.current ? 0 : 0.3,
                  ease: [0.32, 0.72, 0, 1]
                }}
                style={{ width: `${images.length * 100}vw` }}
              >
                {images.map((img, index) => (
                  <div
                    key={index}
                    className="w-screen h-screen flex items-center justify-center shrink-0 px-0 relative"
                  >
                    <img
                      src={img}
                      alt=""
                      className="max-w-full max-h-[70vh] object-contain"
                      onClick={closeModal}
                    />
                    {/* Left overlay - go to previous */}
                    <div
                      className="absolute left-0 top-0 bottom-24 w-[25%] bg-transparent z-10 cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                    />
                    {/* Right overlay - go to next */}
                    <div
                      className="absolute right-0 top-0 bottom-24 w-[25%] bg-transparent z-10 cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); goToNext(); }}
                    />
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Image counter - centered above image */}
            <div className="absolute top-[calc(15vh-24px)] left-0 right-0 z-30 flex justify-center">
              <div className="px-3 py-1 rounded-full bg-black/50 text-white text-sm">
                {selectedImageIndex + 1}/{images.length}
              </div>
            </div>

            {/* Thumbnail strip */}
            <div
              className="absolute bottom-4 left-0 right-0 z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex gap-2 justify-center overflow-x-auto scrollbar-hide py-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setDragX(0);
                    }}
                    className={`shrink-0 size-12 rounded overflow-hidden transition-all ${
                      index === selectedImageIndex
                        ? "ring-2 ring-white scale-105"
                        : "opacity-50 hover:opacity-75"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </SlidePanel>
    </>
  );
}
