import { useEffect, useState } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light" data-theme="light">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <Meta />
        <Links />
      </head>
      <body className="bg-background text-foreground">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export interface TmaUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export interface TmaContext {
  tmaReady: boolean;
  user: TmaUser | null;
}

export default function App() {
  const [tmaReady, setTmaReady] = useState(false);
  const [user, setUser] = useState<TmaUser | null>(null);

  useEffect(() => {
    // Initialize TMA SDK only on client side
    import("@tma.js/sdk-react").then(async ({ init, backButton, retrieveLaunchParams, viewport, swipeBehavior }) => {
      try {
        init();
        backButton.mount();

        // Mount viewport and bind CSS variables for safe area
        if (viewport.mount.isAvailable()) {
          await viewport.mount();
        }

        // Expand viewport to full height
        if (viewport.expand.isAvailable()) {
          viewport.expand();
        }

        // Request fullscreen if available for better safe area detection
        if (viewport.requestFullscreen?.isAvailable?.()) {
          await viewport.requestFullscreen();
        }

        // Bind CSS variables for viewport dimensions and safe area insets
        if (viewport.bindCssVars.isAvailable()) {
          viewport.bindCssVars();
        }

        // Mount swipeBehavior and disable vertical swipes to prevent app from closing when scrolling on iOS
        if (swipeBehavior.mount.isAvailable()) {
          swipeBehavior.mount();
        }
        if (swipeBehavior.disableVertical.isAvailable()) {
          swipeBehavior.disableVertical();
        }

        // Retrieve user data
        const params = retrieveLaunchParams();
        const tgUser = params?.tgWebAppData?.user;
        if (tgUser) {
          setUser({
            id: tgUser.id,
            first_name: tgUser.first_name,
            last_name: tgUser.last_name,
            username: tgUser.username,
            photo_url: tgUser.photo_url,
          });
        }
      } catch (e) {
        // Not in Telegram context, continue without user data
        console.log("TMA init error:", e);
      }
      setTmaReady(true);
    });
  }, []);

  // Show loading state until TMA is initialized
  if (!tmaReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 border-3 border-white/20 border-t-white rounded-full animate-spin" />
          <span className="text-white/60 text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  return user ? <AppContent tmaReady={tmaReady} user={user} /> : <div></div>;
}

function AppContent({ tmaReady, user }: { tmaReady: boolean; user: TmaUser }) {
  const navigation = useNavigation();
  const isNavigating = navigation.state === "loading";

  return (
    <>
      {/* Global loading bar */}
      <div
        className="fixed top-0 left-0 right-0 h-0.5 z-[9999] overflow-hidden"
        style={{
          opacity: isNavigating ? 1 : 0,
          transition: "opacity 150ms ease-out",
        }}
      >
        <div
          className="h-full bg-primary"
          style={{
            animation: isNavigating ? "loading-bar 1s ease-in-out infinite" : "none",
          }}
        />
      </div>

      <Outlet context={{ tmaReady, user } as TmaContext} />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
