import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useUserStore } from "~/stores/user-store";

export function meta() {
  return [{ title: "Welcome to BLYSS" }];
}

const onboardingSteps = [
  {
    titleParts: [
      { text: "Xizmatlarni ", highlight: false },
      { text: "oson bron qiling", highlight: true },
    ],
    description:
      "O'zbekistondagi birinchi sartaroshxona va go'zallik salonlari uchun onlayn bron qilish platformasi. Endi sevimli saloningizga qo'ng'iroq qilish shart emas.",
    image:
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&auto=format&fit=crop&q=80",
  },
  {
    titleParts: [
      { text: "Barcha salonlar ", highlight: false },
      { text: "bir joyda", highlight: true },
    ],
    description:
      "Minglab salonlar, ustalar, narxlar va haqiqiy mijozlar sharhlari. Xarita orqali yaqin atrofdagi salonlarni toping yoki reytingi eng yuqorilarini ko'ring.",
    image:
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&auto=format&fit=crop&q=80",
  },
  {
    titleParts: [
      { text: "Bron qiling ", highlight: false },
      { text: "24/7", highlight: true },
    ],
    description:
      "Kechasi soat 3 da ham, dam olish kunlari ham — istalgan vaqtda o'zingizga qulay soatni band qiling",
    image:
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=80",
  },
];

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex gap-2 items-center">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`size-2 rounded-full transition-all duration-300 ${
            index === currentStep ? "bg-primary" : "bg-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

export default function OnboardingIntroduction() {
  const navigate = useNavigate();
  const hasSeenIntroduction = useUserStore((state) => state.user_has_seen_introduction);
  const [currentStep, setCurrentStep] = useState(0);
  const [dragX, setDragX] = useState(0);
  const startXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const containerWidthRef = useRef(0);

  // Redirect to login if user has already seen introduction
  useEffect(() => {
    if (hasSeenIntroduction) {
      navigate("/login", { replace: true });
    }
  }, [hasSeenIntroduction, navigate]);

  const isLastStep = currentStep === onboardingSteps.length - 1;

  const handleComplete = () => {
    navigate("/login");
  };

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
    setDragX(0);
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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

    if (currentStep === 0 && diff > 0) {
      setDragX(diff * 0.3);
    } else if (currentStep === onboardingSteps.length - 1 && diff < 0) {
      setDragX(diff * 0.3);
    } else {
      setDragX(diff);
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    const threshold = containerWidthRef.current * 0.2;

    if (dragX < -threshold && currentStep < onboardingSteps.length - 1) {
      handleNext();
    } else if (dragX > threshold && currentStep > 0) {
      handlePrev();
    } else {
      setDragX(0);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Swipeable Image Carousel */}
      <div
        className="relative h-[55vh] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <motion.div
          className="flex h-full"
          initial={false}
          animate={{ x: `calc(${dragX}px - ${currentStep * 100}vw)` }}
          transition={{
            duration: isDraggingRef.current ? 0 : 0.3,
            ease: [0.32, 0.72, 0, 1],
          }}
          style={{ width: `${onboardingSteps.length * 100}vw` }}
        >
          {onboardingSteps.map((step, index) => (
            <div key={index} className="relative h-full shrink-0 w-screen">
              <img
                src={step.image}
                alt="Onboarding"
                className="absolute inset-0 w-full h-full object-cover object-center grayscale"
              />
            </div>
          ))}
        </motion.div>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </div>

      {/* Content container */}
      <div className="flex-1 bg-white pt-4 pb-8 flex flex-col relative overflow-hidden">
        {/* Swipeable Content */}
        <div className="w-screen overflow-hidden">
          <motion.div
            className="flex"
            initial={false}
            animate={{ x: `calc(${dragX}px - ${currentStep * 100}vw)` }}
            transition={{
              duration: isDraggingRef.current ? 0 : 0.3,
              ease: [0.32, 0.72, 0, 1],
            }}
            style={{ width: `${onboardingSteps.length * 100}vw` }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {onboardingSteps.map((step, index) => (
              <div
                key={index}
                className="w-screen shrink-0 flex flex-col items-center px-6"
              >
                <h1 className="text-2xl font-bold text-center leading-tight mb-4">
                  {step.titleParts.map((part, partIndex) => (
                    <span
                      key={partIndex}
                      className={part.highlight ? "text-primary" : "text-gray-900"}
                    >
                      {part.text}
                    </span>
                  ))}
                </h1>
                <p className="text-gray-500 text-base text-center leading-relaxed max-w-[300px]">
                  {step.description}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Step indicator */}
        <div className="mt-6 flex justify-center">
          <StepIndicator currentStep={currentStep} totalSteps={onboardingSteps.length} />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Button */}
        <div className="flex justify-center w-full px-6">
          {isLastStep ? (
            <button
              onClick={handleComplete}
              className="w-full max-w-[339px] bg-primary text-white font-bold py-4 px-6 rounded-full text-base"
            >
              Boshlash
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="size-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
