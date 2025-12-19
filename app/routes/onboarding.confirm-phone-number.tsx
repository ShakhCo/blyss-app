import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { hapticFeedback, popup } from "@tma.js/sdk-react";
import axios from "axios";
import { useOnboardingStore } from "~/stores/onboarding-store";
import { useUserStore } from "~/stores/user-store";
import { SafeAreaLayout } from "~/components/SafeAreaLayout";
import { NumericKeypad } from "~/components/NumericKeypad";

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

interface SendOtpResponse {
  message: string;
  user_id: string;
  sms_sent: boolean;
}

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

async function sendOtp(phone_number: string): Promise<{ data?: SendOtpResponse; error?: VerifyOtpError }> {
  try {
    const response = await axios.post<SendOtpResponse>(
      "https://api.blyss.uz/otp/send",
      { phone_number }
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

function triggerSuccessHaptic() {
  if (hapticFeedback.notificationOccurred.isAvailable()) {
    hapticFeedback.notificationOccurred("success");
  }
}

function showErrorPopup(message: string) {
  triggerErrorHaptic();
  if (popup.show.isAvailable()) {
    popup.show({
      title: "Xatolik",
      message,
      buttons: [{ id: "ok", type: "ok" }],
    });
  }
}

export function meta() {
  return [{ title: "Tasdiqlash - BLYSS" }];
}

// OTP Display component (not input, just display)
function OtpDisplay({
  value,
  length = 5,
  isSuccess = false,
  shake = false,
}: {
  value: string;
  length?: number;
  isSuccess?: boolean;
  shake?: boolean;
}) {
  return (
    <div className={`flex gap-3 justify-center ${shake ? "animate-shake" : ""}`}>
      {Array.from({ length }).map((_, index) => {
        const isFilled = index < value.length;
        const isActive = index === value.length && value.length < length;

        return (
          <div
            key={index}
            className={`size-14 flex items-center justify-center text-2xl font-bold rounded-2xl ${
              isSuccess
                ? "animate-success-wave bg-green-100 ring-2 ring-green-500"
                : isActive
                  ? "bg-white border-2 border-primary"
                  : isFilled
                    ? "bg-stone-100 border border-stone-200"
                    : "bg-stone-50 border border-stone-200"
            }`}
            style={isSuccess ? { animationDelay: `${index * 100}ms` } : undefined}
          >
            {value[index] ? (
              <span className={isSuccess ? "text-green-700" : "text-stone-900"}>{value[index]}</span>
            ) : (
              <span className="text-stone-300">•</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OnboardingConfirmPhoneNumber() {
  const navigate = useNavigate();
  const { data } = useOnboardingStore();
  const setUser = useUserStore((state) => state.setUser);

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [shake, setShake] = useState(false);
  const isVerifyingRef = useRef(false);

  // Redirect to login on mount if no data
  useEffect(() => {
    if (!data) {
      navigate("/login", { replace: true });
    }
  }, []);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Auto-submit when 5 characters are entered
  useEffect(() => {
    if (otp.length === 5 && !isVerifyingRef.current && !isLoading) {
      handleVerifyOtp(otp);
    }
  }, [otp]);

  const triggerShakeOnly = useCallback(() => {
    triggerErrorHaptic();
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  const handleVerifyOtp = async (otpCode: string) => {
    if (isVerifyingRef.current) return;
    isVerifyingRef.current = true;

    if (!data?.id) {
      triggerErrorHaptic();
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
        triggerShakeOnly();
        setIsLoading(false);
        setOtp("");
        isVerifyingRef.current = false;
        return;
      }

      if (result.data?.user) {
        setUser(result.data.user);
        setIsSuccess(true);
        triggerSuccessHaptic();

        // Navigate to home after wave animation completes (5 digits * 100ms delay + 400ms animation + buffer)
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1200);
      }
    } catch (err) {
      triggerShakeOnly();
      setIsLoading(false);
      setOtp("");
      isVerifyingRef.current = false;
    }
  };

  const handleKeyPress = (digit: string) => {
    if (otp.length < 5 && !isLoading && !isSuccess) {
      setOtp((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    if (!isLoading && !isSuccess) {
      setOtp((prev) => prev.slice(0, -1));
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0 || isResending || !data?.phone_number) return;

    setIsResending(true);

    try {
      const result = await sendOtp(data.phone_number);

      if (result.error) {
        showErrorPopup(result.error.message || "Kod yuborishda xatolik");
      } else {
        setResendCountdown(60);
        triggerSuccessHaptic();
      }
    } catch (err) {
      showErrorPopup("Kod yuborishda xatolik");
    } finally {
      setIsResending(false);
    }
  };

  // Format phone number for display
  const formatPhone = (phone: string) => {
    if (!phone) return "";
    // Format: +998 90 123 45 67
    const p = phone.replace(/\D/g, "");
    if (p.length === 12) {
      return `+${p.slice(0, 3)} ${p.slice(3, 5)} ${p.slice(5, 8)} ${p.slice(8, 10)} ${p.slice(10)}`;
    }
    return `+${p}`;
  };

  // Don't render if no data (unless showing success animation)
  if (!data && !isSuccess) {
    return null;
  }

  return (
    <SafeAreaLayout
      back
      topColor="bg-white"
      bottomColor="bg-white"
      className="h-screen overflow-hidden"
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Title and subtitle */}
        <div className="px-4 mb-6 pt-4">
          <h1 className="text-2xl font-semibold text-stone-900">
            Tasdiqlash kodi
          </h1>
          <p className="text-stone-500 mt-2 text-sm">
            {formatPhone(data?.phone_number || "")} raqamiga SMS kod yubordik
          </p>
        </div>

        {/* OTP Display */}
        <div className="px-4 flex-1">
          <OtpDisplay
            value={otp}
            length={5}
            isSuccess={isSuccess}
            shake={shake}
          />

          {/* Loading indicator */}
          {isLoading && !isSuccess && (
            <div className="mt-6 flex justify-center">
              <div className="size-6 border-2 border-stone-200 border-t-primary rounded-full animate-spin" />
            </div>
          )}


          {/* Resend hint */}
          {!isLoading && !isSuccess && (
            <p className="text-stone-400 text-sm mt-6">
              {resendCountdown > 0 ? (
                <>Kodni qayta yuborish: {resendCountdown}s</>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="text-primary text-sm font-medium disabled:opacity-50"
                >
                  {isResending ? "Yuborilmoqda..." : "Qayta yuborish uchun bosing"}
                </button>
              )}
            </p>
          )}
        </div>

        {/* Numeric Keypad */}
        {!isSuccess && (
          <NumericKeypad
            onKeyPress={handleKeyPress}
            onBackspace={handleBackspace}
          />
        )}
      </div>
    </SafeAreaLayout>
  );
}
