import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useUserStore, isAuthenticated } from "~/stores/user-store";

const PUBLIC_ROUTES = ["/register"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthed = isAuthenticated(user);

  useEffect(() => {
    const isPublicRoute = PUBLIC_ROUTES.some((route) =>
      location.pathname.startsWith(route)
    );

    if (!isAuthed && !isPublicRoute) {
      navigate("/register", { replace: true });
    }
  }, [isAuthed, location.pathname, navigate]);

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    location.pathname.startsWith(route)
  );

  if (!isAuthed && !isPublicRoute) {
    return null;
  }

  return <>{children}</>;
}
