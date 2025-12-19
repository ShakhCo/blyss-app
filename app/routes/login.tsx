import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { hapticFeedback, popup } from "@tma.js/sdk-react";
import axios from "axios";
import { useOnboardingStore } from "~/stores/onboarding-store";
import { SafeAreaLayout } from "~/components/SafeAreaLayout";
import { NumericKeypad } from "~/components/NumericKeypad";

const MOBILE_BREAKPOINT = 640;

interface LoginResponse {
  message: string;
  user_id: string;
  sms_sent: boolean;
}

interface ValidationError {
  field: string;
  error: string;
}

interface LoginError {
  error_code: string;
  error?: string;
  message?: string;
  validation_errors?: ValidationError[];
}

const ERROR_MESSAGES: Record<string, string> = {
  USER_NOT_FOUND: "Bu raqam ro'yxatdan o'tmagan",
  VALIDATION_ERROR: "Telefon raqam noto'g'ri",
  INTERNAL_ERROR: "Serverda xatolik yuz berdi",
};

async function sendOtp(phone_number: string): Promise<{ data?: LoginResponse; error?: LoginError }> {
  try {
    const response = await axios.post<LoginResponse>(
      "https://api.blyss.uz/otp/send",
      { phone_number }
    );
    return { data: response.data };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      return { error: err.response.data as LoginError };
    }
    throw err;
  }
}

function triggerErrorHaptic() {
  if (hapticFeedback.notificationOccurred.isAvailable()) {
    hapticFeedback.notificationOccurred("error");
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
  return [{ title: "Kirish - BLYSS" }];
}

export default function Login() {
  const navigate = useNavigate();
  const { data, setData } = useOnboardingStore();

  // Pre-fill phone number from store (e.g., when returning from register page)
  const [phoneNumber, setPhoneNumber] = useState(() => {
    if (data?.phone_number && data.phone_number.startsWith("998")) {
      return data.phone_number.slice(3); // Remove 998 prefix
    }
    return "";
  });
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const triggerShakeOnly = useCallback(() => {
    triggerErrorHaptic();
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  // Format phone for display: 00 000 00 00
  const formatPhoneDisplay = (phone: string) => {
    if (!phone) return "";
    const p = phone.replace(/\D/g, "");
    if (p.length <= 2) return p;
    if (p.length <= 5) return `${p.slice(0, 2)} ${p.slice(2)}`;
    if (p.length <= 7) return `${p.slice(0, 2)} ${p.slice(2, 5)} ${p.slice(5)}`;
    return `${p.slice(0, 2)} ${p.slice(2, 5)} ${p.slice(5, 7)} ${p.slice(7)}`;
  };

  const handleKeyPress = (digit: string) => {
    if (phoneNumber.length < 9) {
      setPhoneNumber((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  };

  const handleSubmit = useCallback(async () => {
    if (isLoading) return;

    if (!phoneNumber.trim() || phoneNumber.length !== 9) {
      triggerShakeOnly();
      return;
    }

    const fullPhoneNumber = `998${phoneNumber}`;
    setIsLoading(true);

    try {
      const result = await sendOtp(fullPhoneNumber);

      if (result.error) {
        // If user not found, save phone and redirect to register page
        if (result.error.error_code === "USER_NOT_FOUND") {
          setData({ phone_number: fullPhoneNumber });
          setIsLoading(false);
          navigate("/onboarding/register");
          return;
        }

        let errorMessage: string;

        if (result.error.error_code === "VALIDATION_ERROR" && result.error.validation_errors?.length) {
          errorMessage = result.error.validation_errors[0].error;
        } else {
          errorMessage = ERROR_MESSAGES[result.error.error_code] || result.error.error || result.error.message || "Kirishda xatolik";
        }

        showErrorPopup(errorMessage);
        setIsLoading(false);
        return;
      }

      if (result.data) {
        setData({
          id: result.data.user_id,
          phone_number: fullPhoneNumber,
        });
        navigate("/onboarding/confirm-phone-number");
      }
    } catch (err) {
      showErrorPopup(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  }, [phoneNumber, isLoading, navigate, setData, triggerShakeOnly]);

  return (
    <SafeAreaLayout
      topColor="bg-black/20"
      bottomColor="bg-black/20"
      className="h-screen"
    >
      <div className="flex flex-col h-full overflow-y-auto">

        {/* Title and subtitle - centered */}
        <div className="px-4 mb-6 text- pt-4">
          <h1 className="text-2xl font-semibold text-stone-900">
            Kirish
          </h1>
          <p className="text-stone-500 mt-2 text-sm">
            Telefon raqamingizni kiriting
          </p>
        </div>

        {/* Form fields */}
        <div className="px-4 space-y-4 flex-1">
          {/* Phone number display */}
          <div className={`relative ${shake ? "animate-shake" : ""}`}>
            <div className="absolute -top-2.5 left-3 px-1 z-10 bg-white">
              <span className={`text-sm ${phoneNumber ? "text-primary" : "text-stone-500"}`}>
                Telefon raqam
              </span>
            </div>
            <div
              className={`flex items-center h-14 border rounded-lg ${phoneNumber ? "border-primary" : "border-stone-300"}`}
            >
              <div className="flex items-center pl-4 pr-3 border-r border-stone-300 h-8">
                <span className="text-stone-900 font-medium">+998</span>
              </div>
              <div className="flex-1 h-full px-3 flex items-center">
                {phoneNumber ? (
                  <span className="text-stone-900">{formatPhoneDisplay(phoneNumber)}</span>
                ) : (
                  <span className="text-stone-400">00 000 00 00</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Numeric Keypad */}
        <NumericKeypad
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </SafeAreaLayout>
  );
}
