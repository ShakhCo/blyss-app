import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { hapticFeedback, popup, useLaunchParams } from "@tma.js/sdk-react";
import { registerUser, login } from "~/lib/api-client";
import { useOnboardingStore } from "~/stores/onboarding-store";
import { useUserStore } from "~/stores/user-store";
import { SafeAreaLayout } from "~/components/SafeAreaLayout";

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
  return [{ title: "Ro'yxatdan o'tish - BLYSS" }];
}

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, setData } = useOnboardingStore();
  const { setUser, setTokens } = useUserStore();
  const launchParams = useLaunchParams();

  // Get otp_id from navigation state (passed from confirm-phone-number)
  const otp_id = location.state?.otp_id as string | undefined;

  // Get user data from Telegram init data
  const tgUser = launchParams.tgWebAppData?.user;
  const telegramId = tgUser?.id;
  const initialFirstName = typeof tgUser?.first_name === "string" ? tgUser.first_name : "";
  const initialLastName = typeof tgUser?.last_name === "string" ? tgUser.last_name : "";

  // Phone number from store
  const phoneNumber = data?.phone_number;

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [activeField, setActiveField] = useState<"firstName" | "lastName" | null>(null);
  const [shake, setShake] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);

  // Redirect to login if no phone number or otp_id
  useEffect(() => {
    if (!phoneNumber || !otp_id) {
      navigate("/login", { replace: true });
    }
  }, [phoneNumber, otp_id, navigate]);

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

    if (!trimmedFirstName || !phoneNumber || !otp_id) {
      triggerShakeOnly();
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Register user with otp_id
      const registerResult = await registerUser({
        otp_id,
        user_type: "user",
        first_name: trimmedFirstName,
        last_name: trimmedLastName,
        telegram_id: telegramId ?? null,
      });

      if (registerResult.error) {
        showErrorPopup(registerResult.error.error || "Ro'yxatdan o'tishda xatolik");
        setIsLoading(false);
        return;
      }

      // Step 2: Login to get tokens
      const loginResult = await login({
        otp_id,
        phone_number: phoneNumber,
        user_type: "user",
      });

      if (loginResult.error) {
        showErrorPopup(loginResult.error.error || "Login qilishda xatolik");
        setIsLoading(false);
        return;
      }

      // Step 3: Save user and tokens, navigate to home
      if (loginResult.data) {
        const { user, access_token, refresh_token, expires_at } = loginResult.data;

        setUser(user);
        setTokens(access_token, refresh_token, expires_at);
        triggerSuccessHaptic();

        // Clear onboarding data
        setData({
          first_name: trimmedFirstName,
          last_name: trimmedLastName,
          phone_number: phoneNumber,
        });

        navigate("/", { replace: true });
      }
    } catch (err) {
      showErrorPopup(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  }, [firstName, lastName, phoneNumber, otp_id, telegramId, isLoading, setData, navigate, triggerShakeOnly, setUser, setTokens]);

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
          <p className="text-stone-500 mt-2 text-base">
            Ismingiz va familiyangizni kiriting
          </p>
        </div>

        {/* Form fields */}
        <div className={`px-4 space-y-4 flex-1 ${shake ? "animate-shake" : ""}`}>
          {/* First name input */}
          <div className="relative">
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
