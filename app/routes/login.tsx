import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { hapticFeedback, popup } from "@tma.js/sdk-react";
import { ArrowRight } from "lucide-react";
import { sendOtp } from "~/lib/api-client";
import { useOnboardingStore } from "~/stores/onboarding-store";
import { useI18nStore } from "~/stores/i18n-store";
import { SafeAreaLayout } from "~/components/SafeAreaLayout";
import { Button } from "~/components/Button";
import { LanguageSelector } from "~/components/LanguageSelector";

function triggerErrorHaptic() {
  if (hapticFeedback.notificationOccurred.isAvailable()) {
    hapticFeedback.notificationOccurred("error");
  }
}

function showErrorPopup(message: string, title: string) {
  triggerErrorHaptic();
  if (popup.show.isAvailable()) {
    popup.show({
      title,
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
  const { t } = useI18nStore();

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

  // Format phone for display: 90 123 45 67
  const formatPhoneDisplay = (phone: string) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 0) return "";
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7)}`;
  };

  const handleSubmit = useCallback(async () => {
    if (isLoading) return;

    const cleanedPhone = phoneNumber.replace(/\D/g, "");
    if (!cleanedPhone || cleanedPhone.length !== 9) {
      triggerShakeOnly();
      return;
    }

    const fullPhoneNumber = `998${cleanedPhone}`;
    setIsLoading(true);

    try {
      const result = await sendOtp({
        phone_number: fullPhoneNumber,
        user_type: "user",
      });

      if (result.error) {
        const errorKey = `error.${result.error.error_code?.toLowerCase() || 'loginError'}`;
        const errorMessage = t(errorKey) || t('error.loginError');
        showErrorPopup(errorMessage, t('error.title'));
        setIsLoading(false);
        return;
      }

      if (result.data?.sms_sent) {
        // Save phone number and proceed to OTP verification
        setData({ phone_number: fullPhoneNumber });
        navigate("/onboarding/confirm-phone-number");
      }
    } catch (err) {
      showErrorPopup(err instanceof Error ? err.message : t('error.unknownError'), t('error.title'));
    } finally {
      setIsLoading(false);
    }
  }, [phoneNumber, isLoading, navigate, setData, triggerShakeOnly, t]);

  return (
    <SafeAreaLayout>
      <div className="flex flex-col flex-1 h-full">
        {/* Language Selector */}
        <div className="px-4 my-2 flex justify-end">
          <LanguageSelector />
        </div>

        {/* Title and subtitle */}
        <div className="px-4 mb-6 pt-2">
          <h1 className="text-2xl font-semibold text-stone-900">
            {t('login.title')}
          </h1>
          <p className="text-stone-500 mt-1 text-base">
            {t('login.subtitle')}
          </p>
        </div>

        {/* Form fields */}
        <div className="px-4 space-y-4">
          {/* Phone number input */}
          <div className={`relative ${shake ? "animate-shake" : ""}`}>
            <div className="flex items-center bg-stone-100 rounded-xl overflow-hidden">
              <div className="flex items-center pl-4 pr-3 border-r border-stone-300 h-14">
                <span className="text-stone-900 font-medium text-base">{t('login.countryCode')}</span>
              </div>
              <input
                type="tel"
                value={phoneNumber ? formatPhoneDisplay(phoneNumber) : ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 9) {
                    setPhoneNumber(value);
                  }
                }}
                placeholder={t('login.phonePlaceholder')}
                className="flex-1 px-4 py-3 bg-transparent text-base outline-none placeholder:text-stone-400"
                inputMode="numeric"
              />
            </div>
          </div>

          {/* Submit button */}
          <div className="mt-6">
            <Button onClick={handleSubmit}
              disabled={isLoading} fullWidth border="full" size="lg">
              {isLoading ? (
                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {t('login.continue')}
                  <ArrowRight size={18} />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />
      </div>
    </SafeAreaLayout>
  );
}
