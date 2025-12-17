import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { retrieveLaunchParams, hapticFeedback } from "@tma.js/sdk-react";
import axios from "axios";
import { Logo } from "~/components/icons/Logo";
import { User, Phone, ArrowLeft } from "lucide-react";
import { useOnboardingStore } from "~/stores/onboarding-store";
import { useUserStore } from "~/stores/user-store";

interface RegisterResponse {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  telegram_id: number;
  is_verified: boolean;
}

interface RegisterError {
  error_code: string;
  message: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  EMPTY_BODY: "Ma'lumotlar to'liq emas",
  VALIDATION_ERROR: "Ma'lumotlar noto'g'ri kiritilgan",
  USER_ALREADY_REGISTERED: "Bu raqam allaqachon ro'yxatdan o'tgan",
  INVALID_OTP: "Kod noto'g'ri",
  OTP_EXPIRED: "Kod muddati tugagan",
  INTERNAL_ERROR: "Serverda xatolik yuz berdi",
};

async function registerUser(data: {
  telegram_id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
}): Promise<{ data?: RegisterResponse; error?: RegisterError }> {
  try {
    const response = await axios.post<RegisterResponse>(
      "https://api.blyss.uz/users/register",
      data
    );
    return { data: response.data };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      return { error: err.response.data as RegisterError };
    }
    throw err;
  }
}

export function meta() {
  return [{ title: "Ro'yxatdan o'tish - BLYSS" }];
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

type FieldName = "first_name" | "last_name" | "phone_number" | null;

export default function OnboardingRegister() {
  const navigate = useNavigate();
  const { setData } = useOnboardingStore();
  const setHasSeenIntroduction = useUserStore((state) => state.setHasSeenIntroduction);

  // Mark that user has seen introduction (persists forever)
  useEffect(() => {
    setHasSeenIntroduction();
  }, [setHasSeenIntroduction]);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shakeField, setShakeField] = useState<FieldName>(null);

  const setErrorWithHaptic = (message: string, field?: FieldName) => {
    setError(message);
    triggerErrorHaptic();

    if (field) {
      setShakeField(field);
      setTimeout(() => setShakeField(null), 500);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Remove any characters that are not + or digits
    value = value.replace(/[^+\d]/g, "");

    // Only allow + at the beginning
    if (value.includes("+")) {
      // Remove all + except if it's at position 0
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

    setFormData((prev) => ({ ...prev, phone_number: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.first_name.trim()) {
      setErrorWithHaptic("Ismingizni kiriting", "first_name");
      return;
    }
    if (!formData.last_name.trim()) {
      setErrorWithHaptic("Familiyangizni kiriting", "last_name");
      return;
    }
    if (!formData.phone_number.trim()) {
      setErrorWithHaptic("Telefon raqamingizni kiriting", "phone_number");
      return;
    }
    if (formData.phone_number.length !== 13) {
      setErrorWithHaptic("Telefon raqam to'liq emas", "phone_number");
      return;
    }

    // Get telegram_id from TMA launch params
    const launchParams = retrieveLaunchParams();
    const telegramId = launchParams.tgWebAppData?.user?.id;

    if (!telegramId) {
      setErrorWithHaptic("Telegram ma'lumotlari topilmadi");
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUser({
        telegram_id: telegramId,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone_number: formData.phone_number.replace("+", ""),
      });

      if (result.error) {
        const errorMessage = ERROR_MESSAGES[result.error.error_code] || result.error.message || "Ro'yxatdan o'tishda xatolik";
        setError(errorMessage);
        triggerHeavyHaptic();
        setIsLoading(false);
        return;
      }

      if (result.data) {
        // Store API response for OTP page
        setData(result.data);

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

  const handleBack = () => {
    navigate("/onboarding/introduction");
  };

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

      {/* Logo and Title */}
      <div className="px-6 mb-8">
        <div className="text-start flex items-center">
          <div className="inline-block">
            <Logo width={120} height={50} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-stone-900 mt-6">
          Ro'yxatdan o'tish
        </h1>
        <p className="text-stone-500 mt-2">
          Ma'lumotlaringizni kiriting
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 px-6 flex flex-col">
        <div className="space-y-4">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Ism
            </label>
            <div className={`relative ${shakeField === "first_name" ? "animate-shake" : ""}`}>
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <User size={20} className={shakeField === "first_name" ? "text-red-400" : "text-stone-400"} />
              </div>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Ismingiz"
                className={`w-full h-14 pl-12 pr-4 rounded-2xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all ${
                  shakeField === "first_name" ? "bg-red-50 ring-2 ring-red-300" : "bg-stone-50"
                }`}
              />
            </div>
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Familiya
            </label>
            <div className={`relative ${shakeField === "last_name" ? "animate-shake" : ""}`}>
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <User size={20} className={shakeField === "last_name" ? "text-red-400" : "text-stone-400"} />
              </div>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Familiyangiz"
                className={`w-full h-14 pl-12 pr-4 rounded-2xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all ${
                  shakeField === "last_name" ? "bg-red-50 ring-2 ring-red-300" : "bg-stone-50"
                }`}
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Telefon raqam
            </label>
            <div className={`relative ${shakeField === "phone_number" ? "animate-shake" : ""}`}>
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Phone size={20} className={shakeField === "phone_number" ? "text-red-400" : "text-stone-400"} />
              </div>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handlePhoneChange}
                placeholder="+998901234567"
                maxLength={13}
                className={`w-full h-14 pl-12 pr-4 rounded-2xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all ${
                  shakeField === "phone_number" ? "bg-red-50 ring-2 ring-red-300" : "bg-stone-50"
                }`}
              />
            </div>
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

        {/* Login Link */}
        <div className="pb-8 text-center">
          <p className="text-stone-500 text-sm">
            Hisobingiz bormi?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-primary font-medium"
            >
              Kirish
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
