import { useEffect } from "react";
import { useNavigate } from "react-router";
import { logout } from "~/lib/api-client";
import { useUserStore } from "~/stores/user-store";
import { useLocationStore } from "~/stores/location";
import { useBookingStore, useBookingCartStore } from "~/stores/booking";
import { Logo } from "~/components/icons/Logo";

export function meta() {
  return [{ title: "Chiqish - BLYSS" }];
}

export default function Logout() {
  const navigate = useNavigate();
  const clearUser = useUserStore((state) => state.clearUser);
  const access_token = useUserStore((state) => state.access_token);

  useEffect(() => {
    const performLogout = async () => {
      // Call logout endpoint if we have a token
      if (access_token) {
        try {
          await logout();
        } catch {
          // Ignore logout errors, proceed with local cleanup
        }
      }

      // Clear all stores
      clearUser();
      useLocationStore.persist.clearStorage();
      useBookingStore.persist.clearStorage();
      useBookingCartStore.persist.clearStorage();

      // Redirect to introduction after a short delay
      setTimeout(() => {
        navigate("/onboarding/introduction", { replace: true });
      }, 500);
    };

    performLogout();
  }, [access_token, clearUser, navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <Logo width={180} height={80} />
      <div className="size-8 mt-10 border-3 border-stone-900/20 border-t-primary rounded-full animate-spin" />
      <p className="mt-4 text-stone-500">Chiqish...</p>
    </div>
  );
}
