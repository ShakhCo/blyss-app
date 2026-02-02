import { useEffect } from "react";
import { mainButton, miniApp } from "@tma.js/sdk-react";
import { useI18nStore } from "~/stores/i18n-store";
import { useUserStore } from "~/stores/user";
import { useSafeAreaValues } from "~/hooks/useSafeAreaValues";
import { Logo } from "./icons/Logo";

export function PrivacyPolicyConsent() {
  const { t } = useI18nStore();
  const acceptPrivacyPolicy = useUserStore((state) => state.acceptPrivacyPolicy);
  const { safeAreaValue, contentAreaValue } = useSafeAreaValues();

  const handleAccept = () => {
    acceptPrivacyPolicy();
  };

  const handleDecline = () => {
    // Close the Telegram Mini App
    if (miniApp.close.isAvailable()) {
      miniApp.close();
    }
  };

  // Setup Telegram Main Button for Accept
  useEffect(() => {
    if (mainButton.mount.isAvailable()) {
      mainButton.mount();
    }

    if (mainButton.setParams.isAvailable()) {
      mainButton.setParams({
        text: t("privacy.accept"),
        bgColor: "#f97316" as `#${string}`,
        textColor: "#ffffff" as `#${string}`,
        isVisible: true,
        isEnabled: true,
      });
    }

    const removeListener = mainButton.onClick(handleAccept);

    return () => {
      removeListener();
      if (mainButton.setParams.isAvailable()) {
        mainButton.setParams({ isVisible: false });
      }
      if (mainButton.isMounted()) {
        mainButton.unmount();
      }
    };
  }, [t]);

  return (
    <div
      style={{ paddingTop: safeAreaValue.top }}
      className="bg-stone-900 min-h-screen flex flex-col"
    >
      <div
        style={{ paddingTop: contentAreaValue.top }}
        className="flex-1 bg-white rounded-t-3xl flex flex-col"
      >
        <div className="flex-1 flex flex-col items-center px-6 py-8">
          <Logo width={120} height={50} />

          <div className="mt-8 text-center">
            <h1 className="text-2xl font-bold text-stone-900">
              {t("privacy.title")}
            </h1>
            <p className="mt-2 text-stone-500">
              {t("privacy.subtitle")}
            </p>
          </div>

          <div className="mt-8 p-6 bg-stone-50 rounded-2xl w-full">
            <p className="text-stone-700 leading-relaxed">
              {t("privacy.content")}
            </p>
          </div>

          <div className="mt-auto w-full pt-8 pb-4">
            <button
              onClick={handleDecline}
              className="w-full py-3 text-stone-500 text-sm"
            >
              {t("privacy.decline")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
