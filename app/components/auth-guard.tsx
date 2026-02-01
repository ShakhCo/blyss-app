import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { useUserStore, isAuthenticated, isTokenExpired } from "~/stores/user-store";
import { getCurrentUser } from "~/lib/api-client";
import { Logo } from "~/components/icons/Logo";

const PUBLIC_ROUTES = ["/onboarding", "/login", "/logout"];

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const access_token = useUserStore((state) => state.access_token);
  const expires_at = useUserStore((state) => state.expires_at);
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const hasValidatedRef = useRef(false);

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

  // Validate token with /auth/me on initial load
  const validateToken = useCallback(async () => {
    if (!access_token || hasValidatedRef.current) return;

    hasValidatedRef.current = true;
    setIsValidating(true);

    try {
      const result = await getCurrentUser();

      if (result.data) {
        // Token is valid, update user data in store
        setUser(result.data);
      } else if (result.error) {
        // Token is invalid or expired, clear user
        clearUser();
      }
    } catch {
      // Any error, clear user
      clearUser();
    } finally {
      setIsValidating(false);
    }
  }, [access_token, setUser, clearUser]);

  // Validate token after hydration
  useEffect(() => {
    if (!isHydrated || !access_token) return;

    validateToken();
  }, [isHydrated, access_token, validateToken]);

  // Handle auth redirect after hydration
  useEffect(() => {
    if (!isHydrated || isValidating) return;

    const hasValidToken = isAuthenticated(access_token) && !isTokenExpired(expires_at);

    if (!hasValidToken && !isPublicRoute) {
      navigate("/login", { replace: true });
    }
  }, [access_token, expires_at, isPublicRoute, navigate, isHydrated, isValidating]);

  // Allow public routes to handle their own loading state (even during validation)
  // This prevents the AuthGuard loading screen from flashing on login/onboarding pages
  if (isPublicRoute && isHydrated) {
    return <>{children}</>;
  }

  // Show loading screen while hydrating or validating (only for protected routes)
  if (!isHydrated || (access_token && !hasValidatedRef.current)) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-between py-10">
        <div></div>
        <Logo width={180} height={80} />
        <div className="text-stone-600 text-sm">
          <div className="flex items-center justify-center space-x-2">
            <div className="bg-primary/50 h-2.5 w-2.5 animate-bounce rounded-full [animation-delay:-0.3s]"></div>
            <div className="bg-primary/50 h-2.5 w-2.5 animate-bounce rounded-full [animation-delay:-0.13s]"></div>
            <div className="bg-primary/50 h-2.5 w-2.5 animate-bounce rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  // Block unauthenticated users from protected routes
  if (!isAuthenticated(access_token) || isTokenExpired(expires_at)) {
    return null;
  }

  return <>{children}</>;
}
