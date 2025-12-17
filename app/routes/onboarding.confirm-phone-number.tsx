import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { hapticFeedback } from "@tma.js/sdk-react";
import axios from "axios";
import { useOnboardingStore } from "~/stores/onboarding-store";
import { useUserStore, type UserData } from "~/stores/user-store";

interface VerifyOtpResponse {
  message: string;
  is_verified: boolean;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    telegram_id: number;
    is_verified: boolean;
  };
}

interface VerifyOtpError {
  error_code: string;
  message: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_OTP: "Noto'g'ri kod",
  OTP_EXPIRED: "Noto'g'ri kod",
  VALIDATION_ERROR: "Xatolik yuz berdi",
  INTERNAL_ERROR: "Xatolik yuz berdi",
};

async function verifyOtp(data: {
  user_id: string;
  otp_code: string;
}): Promise<{ data?: VerifyOtpResponse; error?: VerifyOtpError }> {
  try {
    const response = await axios.post<VerifyOtpResponse>(
      "https://api.blyss.uz/otp/verify",
      data
    );
    return { data: response.data };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      return { error: err.response.data as VerifyOtpError };
    }
    throw err;
  }
}

function triggerErrorHaptic() {
  if (hapticFeedback.notificationOccurred.isAvailable()) {
    hapticFeedback.notificationOccurred("error");
  }
}

function triggerHeavyHaptic() {
  if (hapticFeedback.impactOccurred.isAvailable()) {
    hapticFeedback.impactOccurred("heavy");
  }
}

function triggerSuccessHaptic() {
  if (hapticFeedback.notificationOccurred.isAvailable()) {
    hapticFeedback.notificationOccurred("success");
  }
}

export function meta() {
  return [{ title: "Tasdiqlash - BLYSS" }];
}

function OtpInput({
  value,
  onChange,
  length = 5,
  disabled = false,
  successIndexes = [],
}: {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  successIndexes?: number[];
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const activeIndex = Math.min(value.length, length - 1);

  useEffect(() => {
    if (!disabled) {
      inputRefs.current[activeIndex]?.focus();
    }
  }, [activeIndex, disabled]);

  // Blur all inputs when disabled
  useEffect(() => {
    if (disabled) {
      inputRefs.current.forEach((input) => input?.blur());
    }
  }, [disabled]);

  const handleChange = (index: number, digit: string) => {
    if (disabled) return;
    if (!/^\d*$/.test(digit)) return;

    const newValue = value.split("");
    newValue[index] = digit;
    const updatedValue = newValue.join("").slice(0, length);
    onChange(updatedValue);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "Backspace") {
      e.preventDefault();
      if (value.length > 0) {
        onChange(value.slice(0, -1));
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) return;
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(pastedData);
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length }).map((_, index) => {
        const isActive = index === activeIndex && !disabled;
        const isFilled = index < value.length;
        const isSuccess = successIndexes.includes(index);

        return (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ""}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled || !isActive}
            className={`size-14 text-center text-2xl font-bold rounded-2xl transition-all duration-200 focus:outline-none disabled:cursor-default text-stone-900 ${
              isSuccess
                ? "bg-stone-100 ring-2 ring-green-500 animate-success-wave"
                : isActive
                  ? "bg-white ring-2 ring-primary/40"
                  : isFilled
                    ? "bg-stone-100"
                    : "bg-stone-50"
            }`}
          />
        );
      })}
    </div>
  );
}

export default function OnboardingConfirmPhoneNumber() {
  const navigate = useNavigate();
  const { data, clearData } = useOnboardingStore();
  const setUser = useUserStore((state) => state.setUser);

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successIndexes, setSuccessIndexes] = useState<number[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const isVerifyingRef = useRef(false);

  // Redirect to register on mount if no data
  useEffect(() => {
    if (!data) {
      navigate("/onboarding/register", { replace: true });
    }
  }, []); // Only run on mount

  // Auto-submit when 5 characters are entered
  useEffect(() => {
    if (otp.length === 5 && !isVerifyingRef.current && !isLoading) {
      handleVerifyOtp(otp);
    }
  }, [otp]);

  const handleVerifyOtp = async (otpCode: string) => {
    if (isVerifyingRef.current) return;
    isVerifyingRef.current = true;

    setError(null);

    if (!data?.id) {
      setError("Foydalanuvchi ma'lumotlari topilmadi");
      triggerHeavyHaptic();
      isVerifyingRef.current = false;
      return;
    }

    setIsLoading(true);

    try {
      const result = await verifyOtp({
        user_id: data.id,
        otp_code: otpCode,
      });

      if (result.error) {
        const errorMessage = ERROR_MESSAGES[result.error.error_code] || result.error.message || "Tasdiqlashda xatolik";
        setError(errorMessage);
        triggerHeavyHaptic();
        setIsLoading(false);
        setOtp("");
        isVerifyingRef.current = false;
        return;
      }

      if (result.data?.user) {
        // Save verified user to persistent user store
        setUser(result.data.user);

        // Mark as success BEFORE clearing data to prevent redirect
        setIsSuccess(true);

        // Clear onboarding data
        clearData();

        // Success haptic
        triggerSuccessHaptic();

        // Wave animation with green border - stagger from left to right
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            setSuccessIndexes((prev) => [...prev, i]);
          }, i * 120);
        }

        // Navigate to home after animation completes
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 5 * 120 + 600);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
      triggerHeavyHaptic();
      setIsLoading(false);
      setOtp("");
      isVerifyingRef.current = false;
    }
  };

  const handleBack = () => {
    navigate("/onboarding/register");
  };

  const handleResendOtp = () => {
    // TODO: Call resend OTP API
    console.log("Resend OTP");
  };

  // Don't render if no data (unless we're showing success animation)
  if (!data && !isSuccess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with back button */}
      <div className="px-4 pt-12 pb-6">
        <button
          type="button"
          onClick={handleBack}
          className="size-10 rounded-full bg-stone-100 flex items-center justify-center"
        >
          <ArrowLeft size={20} className="text-stone-600" />
        </button>
      </div>

      {/* Content */}
      <div className="px-6 flex-1 flex flex-col">
        <h1 className="text-2xl font-bold text-stone-900">
          Tasdiqlash kodi
        </h1>
        <p className="text-stone-500 mt-2">
          +{data?.phone_number} raqamiga SMS kod yubordik
        </p>

        {/* OTP Input */}
        <div className="mt-8">
          <OtpInput
            value={otp}
            onChange={(value) => {
              setOtp(value);
              setError(null);
            }}
            length={5}
            disabled={isLoading || successIndexes.length > 0}
            successIndexes={successIndexes}
          />
        </div>

        {/* Loading indicator */}
        {isLoading && successIndexes.length === 0 && (
          <div className="mt-6 flex justify-center">
            <div className="size-6 border-2 border-stone-200 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Resend hint */}
        {!isLoading && successIndexes.length === 0 && (
          <p className="text-center text-stone-400 text-sm mt-6">
            Kod kelmadimi?{" "}
            <button
              type="button"
              onClick={handleResendOtp}
              className="text-primary font-medium"
            >
              Qayta yuborish
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
