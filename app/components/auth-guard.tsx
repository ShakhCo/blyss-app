import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useUserStore, isAuthenticated } from "~/stores/user-store";

const PUBLIC_ROUTES = ["/onboarding", "/login", "/logout"];

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUserStore((state) => state.user);
  const [isHydrated, setIsHydrated] = useState(false);

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    location.pathname.startsWith(route)
  );

  // Wait for zustand persist to hydrate from localStorage
  useEffect(() => {
    const unsubscribe = useUserStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    // Check if already hydrated
    if (useUserStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    return unsubscribe;
  }, []);

  // Handle auth redirect after hydration
  useEffect(() => {
    if (!isHydrated) return;

    const authenticated = isAuthenticated(user);

    if (!authenticated && !isPublicRoute) {
      navigate("/onboarding/introduction", { replace: true });
    }
  }, [user, isPublicRoute, navigate, isHydrated]);

  // Show nothing while hydrating
  if (!isHydrated) {
    return null;
  }

  // Allow public routes regardless of auth state
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Block unauthenticated users from protected routes
  if (!isAuthenticated(user)) {
    return null;
  }

  return <>{children}</>;
}
