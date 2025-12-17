import { useEffect } from "react";
import { useNavigate } from "react-router";
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

  useEffect(() => {
    // Clear all stores
    clearUser();
    useLocationStore.persist.clearStorage();
    useBookingStore.persist.clearStorage();
    useBookingCartStore.persist.clearStorage();

    // Redirect to login after a short delay
    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 500);
  }, [clearUser, navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <Logo width={180} height={80} />
      <div className="size-8 mt-10 border-3 border-stone-900/20 border-t-primary rounded-full animate-spin" />
      <p className="mt-4 text-stone-500">Chiqish...</p>
    </div>
  );
}
