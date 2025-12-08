import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useUserStore } from "~/stores/user-store";
import { useLocationStore } from "~/stores/location";
import { useBookingStore, useBookingCartStore } from "~/stores/booking";

const PUBLIC_ROUTES = ["/register"];

interface TmaUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

function clearAllStores() {
  // Clear all persisted stores
  useUserStore.getState().clearUser();
  useLocationStore.persist.clearStorage();
  useBookingStore.persist.clearStorage();
  useBookingCartStore.persist.clearStorage();
}

function validateAuth(
  user: { _id: string; telegram_id: number } | null,
  tmaUser: TmaUser | null
): boolean {
  // Check if user has _id
  if (!user?._id) {
    return false;
  }

  // Check if we have TMA user
  if (!tmaUser?.id) {
    return false;
  }

  // Check if telegram_id matches
  if (user.telegram_id !== tmaUser.id) {
    return false;
  }

  return true;
}

interface AuthGuardProps {
  children: React.ReactNode;
  tmaUser: TmaUser;
}

export function AuthGuard({ children, tmaUser }: AuthGuardProps) {
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const isPublicRoute = PUBLIC_ROUTES.some((route) =>
      location.pathname.startsWith(route)
    );

    const valid = validateAuth(user, tmaUser);

    if (!valid && !isPublicRoute) {
      // Clear all stores and redirect to register
      clearAllStores();
      navigate("/register", { replace: true });
    }

    setIsAuthed(valid);
    setIsValidating(false);
  }, [user, tmaUser, location.pathname, navigate]);

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    location.pathname.startsWith(route)
  );

  // Show nothing while validating
  if (isValidating) {
    return null;
  }

  if (!isAuthed && !isPublicRoute) {
    return null;
  }

  return <>{children}</>;
}
