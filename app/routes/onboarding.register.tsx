import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { hapticFeedback, popup, useLaunchParams } from "@tma.js/sdk-react";
import axios from "axios";
import { useOnboardingStore } from "~/stores/onboarding-store";
import { SafeAreaLayout } from "~/components/SafeAreaLayout";

interface RegisterResponse {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  telegram_id: number;
}

interface RegisterError {
  error_code: string;
  error?: string;
  message?: string;
}

async function registerUser(data: {
  first_name: string;
  last_name: string;
  phone_number: string;
  telegram_id: number;
}): Promise<{ data?: RegisterResponse; error?: RegisterError }> {
  try {
    const response = await axios.post<RegisterResponse>(
      "https://api.blyss.uz/users/register/",
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

async function sendOtp(phone_number: string): Promise<{ success: boolean; error?: string }> {
  try {
    await axios.post("https://api.blyss.uz/otp/send", { phone_number });
    return { success: true };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      const errorData = err.response.data as { message?: string; error?: string };
      return { success: false, error: errorData.message || errorData.error || "OTP yuborishda xatolik" };
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
  return [{ title: "Ro'yxatdan o'tish - BLYSS" }];
}

export default function Register() {
  const navigate = useNavigate();
  const { data, setData } = useOnboardingStore();
  const launchParams = useLaunchParams();

  // Get user data from Telegram init data
  const tgUser = launchParams.tgWebAppData?.user;
  const telegramId = tgUser?.id;
  const initialFirstName = typeof tgUser?.first_name === "string" ? tgUser.first_name : "";
  const initialLastName = typeof tgUser?.last_name === "string" ? tgUser.last_name : "";

  // Phone number from store (saved when redirected from login with USER_NOT_FOUND)
  const phoneNumber = data?.phone_number;

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [activeField, setActiveField] = useState<"firstName" | "lastName" | null>(null);
  const [shake, setShake] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);

  // Focus first name input on mount (only if empty)
  useEffect(() => {
    if (!firstName) {
      firstNameRef.current?.focus();
    }
  }, []);

  const triggerShakeOnly = useCallback(() => {
    triggerErrorHaptic();
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (isLoading) return;

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedFirstName) {
      triggerShakeOnly();
      return;
    }

    // If no phone number in store, navigate to phone number step
    if (!phoneNumber || !telegramId) {
      setData({
        first_name: trimmedFirstName,
        last_name: trimmedLastName,
      });
      navigate("/login");
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUser({
        first_name: trimmedFirstName,
        last_name: trimmedLastName,
        phone_number: phoneNumber,
        telegram_id: telegramId,
      });

      if (result.error) {
        showErrorPopup(result.error.message || result.error.error || "Ro'yxatdan o'tishda xatolik");
        setIsLoading(false);
        return;
      }

      if (result.data) {
        // Send OTP after successful registration
        const otpResult = await sendOtp(result.data.phone_number);
        if (!otpResult.success) {
          showErrorPopup(otpResult.error || "OTP yuborishda xatolik");
          setIsLoading(false);
          return;
        }

        setData({
          id: result.data.id,
          first_name: result.data.first_name,
          last_name: result.data.last_name,
          phone_number: result.data.phone_number,
          telegram_id: result.data.telegram_id,
        });
        navigate("/onboarding/confirm-phone-number");
      }
    } catch (err) {
      showErrorPopup(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  }, [firstName, lastName, phoneNumber, telegramId, isLoading, setData, navigate, triggerShakeOnly]);

  const isFormValid = firstName.trim().length > 0;

  return (
    <SafeAreaLayout
      back
      topColor="bg-white"
      bottomColor="bg-white"
      className="h-screen overflow-hidden"
      mainButton={{
        text: "Davom etish",
        onClick: handleSubmit,
        isEnabled: isFormValid && !isLoading,
        isLoading,
      }}
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Title and subtitle */}
        <div className="px-4 mb-6 pt-4">
          <h1 className="text-2xl font-semibold text-stone-900">
            Ro'yxatdan o'tish
          </h1>
          <p className="text-stone-500 mt-2 text-sm">
            Ismingiz va familiyangizni kiriting
          </p>
        </div>

        {/* Form fields */}
        <div className={`px-4 space-y-6 flex-1 ${shake ? "animate-shake" : ""}`}>
          {/* First name input */}
          <div className="relative">
            <div className="absolute -top-2.5 left-3 px-1 z-10 bg-white">
              <span className={`text-sm ${activeField === "firstName" || firstName ? "text-primary" : "text-stone-500"}`}>
                Ism
              </span>
            </div>
            <input
              ref={firstNameRef}
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onFocus={() => setActiveField("firstName")}
              onBlur={() => setActiveField(null)}
              placeholder="Ismingiz"
              className={`w-full h-14 px-4 border rounded-lg outline-none transition-colors ${activeField === "firstName" || firstName
                  ? "border-primary"
                  : "border-stone-300"
                } text-stone-900 placeholder:text-stone-400`}
            />
          </div>

          {/* Last name input */}
          <div className="relative">
            <div className="absolute -top-2.5 left-3 px-1 z-10 bg-white">
              <span className={`text-sm ${activeField === "lastName" || lastName ? "text-primary" : "text-stone-500"}`}>
                Familiya
              </span>
            </div>
            <input
              ref={lastNameRef}
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onFocus={() => setActiveField("lastName")}
              onBlur={() => setActiveField(null)}
              placeholder="Familiyangiz"
              className={`w-full h-14 px-4 border rounded-lg outline-none transition-colors ${activeField === "lastName" || lastName
                  ? "border-primary"
                  : "border-stone-300"
                } text-stone-900 placeholder:text-stone-400`}
            />
          </div>

        </div>
      </div>
    </SafeAreaLayout>
  );
}
