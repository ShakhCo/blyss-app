import { useState } from "react";
import { useNavigate } from "react-router";
import { hapticFeedback } from "@tma.js/sdk-react";
import axios from "axios";
import { Logo } from "~/components/icons/Logo";
import { Phone } from "lucide-react";
import { useOnboardingStore } from "~/stores/onboarding-store";

interface LoginResponse {
  message: string;
  user_id: string;
}

interface LoginError {
  error_code: string;
  message: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  USER_NOT_FOUND: "Bu raqam ro'yxatdan o'tmagan",
  VALIDATION_ERROR: "Telefon raqam noto'g'ri",
  INTERNAL_ERROR: "Serverda xatolik yuz berdi",
};

async function loginUser(phone_number: string): Promise<{ data?: LoginResponse; error?: LoginError }> {
  try {
    const response = await axios.post<LoginResponse>(
      "https://api.blyss.uz/users/login",
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

function triggerHeavyHaptic() {
  if (hapticFeedback.impactOccurred.isAvailable()) {
    hapticFeedback.impactOccurred("heavy");
  }
}

export function meta() {
  return [{ title: "Kirish - BLYSS" }];
}

export default function Login() {
  const navigate = useNavigate();
  const { setData } = useOnboardingStore();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const setErrorWithHaptic = (message: string, shouldShake = true) => {
    setError(message);
    triggerErrorHaptic();
    if (shouldShake) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Remove any characters that are not + or digits
    value = value.replace(/[^+\d]/g, "");

    // Only allow + at the beginning
    if (value.includes("+")) {
      const firstChar = value.charAt(0);
      const rest = value.slice(1).replace(/\+/g, "");
      value = (firstChar === "+" ? "+" : "") + rest;
    }

    // If user starts typing a digit without +, prepend +
    if (value.length > 0 && value.charAt(0) !== "+") {
      value = "+" + value;
    }

    // Limit to 13 characters (including +)
    value = value.slice(0, 13);

    setPhoneNumber(value);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phoneNumber.trim()) {
      setErrorWithHaptic("Telefon raqamingizni kiriting");
      return;
    }
    if (phoneNumber.length !== 13) {
      setErrorWithHaptic("Telefon raqam to'liq emas");
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginUser(phoneNumber.replace("+", ""));

      if (result.error) {
        const errorMessage = ERROR_MESSAGES[result.error.error_code] || result.error.message || "Kirishda xatolik";

        if (result.error.error_code === "USER_NOT_FOUND") {
          // User not registered, show error (they can use register link below)
          setErrorWithHaptic(errorMessage);
          setIsLoading(false);
          return;
        }

        setError(errorMessage);
        triggerHeavyHaptic();
        setIsLoading(false);
        return;
      }

      if (result.data) {
        // Store user_id and phone_number for OTP page
        setData({
          id: result.data.user_id,
          phone_number: phoneNumber.replace("+", ""),
        });

        // Navigate to OTP page
        navigate("/onboarding/confirm-phone-number");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
      triggerHeavyHaptic();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    navigate("/onboarding/introduction");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Logo and Title */}
      <div className="px-6 mb-8 pt-24">
        <div className="text-start flex items-center">
          <div className="inline-block">
            <Logo width={120} height={50} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-stone-900 mt-6">
          Kirish
        </h1>
        <p className="text-stone-500 mt-2">
          Telefon raqamingizni kiriting
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 px-6 flex flex-col">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Telefon raqam
          </label>
          <div className={`relative ${shake ? "animate-shake" : ""}`}>
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Phone size={20} className={shake ? "text-red-400" : "text-stone-400"} />
            </div>
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="+998901234567"
              maxLength={13}
              className={`w-full h-14 pl-12 pr-4 rounded-2xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all ${
                shake ? "bg-red-50 ring-2 ring-red-300" : "bg-stone-50"
              }`}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1 min-h-8" />

        {/* Submit Button */}
        <div className="pb-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white font-bold py-4 px-6 rounded-full text-base disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Yuklanmoqda...
              </>
            ) : (
              "Davom etish"
            )}
          </button>
        </div>

        {/* Register Link */}
        <div className="pb-8 text-center">
          <p className="text-stone-500 text-sm">
            Hisobingiz yo'qmi?{" "}
            <button
              type="button"
              onClick={handleRegister}
              className="text-primary font-medium"
            >
              Ro'yxatdan o'tish
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
