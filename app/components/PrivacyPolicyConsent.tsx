import { useEffect } from "react";
import { useI18nStore } from "~/stores/i18n-store";
import { useUserStore } from "~/stores/user";
import { useLocationStore } from "~/stores/location";
import { Logo } from "./icons/Logo";
import { Button } from "./Button";

export function PrivacyPolicyConsent() {
  const { t } = useI18nStore();
  const acceptPrivacyPolicy = useUserStore((state) => state.acceptPrivacyPolicy);
  const fetchIpLocation = useLocationStore((state) => state.fetchIpLocation);

  // Call Google geolocation API immediately on mount
  useEffect(() => {
    fetchIpLocation();
  }, [fetchIpLocation]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="flex-1 flex flex-col items-center justify-center">
        <Logo width={160} height={70} />
        <p className="mt-4 text-stone-500 text-center">
          {t("privacy.appDescription")}
        </p>
      </div>

      <div className="w-full pb-8">
        <Button
          fullWidth
          size="lg"
          onClick={acceptPrivacyPolicy}
        >
          {t("privacy.continue")}
        </Button>
        <p className="mt-4 text-xs text-stone-400 text-center">
          {t("privacy.termsAgreement")}
        </p>
      </div>
    </div>
  );
}
