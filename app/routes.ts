import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  route("api/generate-hmac", "routes/api.generate-hmac.ts"),
  route("api/track-location", "routes/api.track-location.ts"),
  route("api/track-visit", "routes/api.track-visit.ts"),
  route("onboarding/register", "routes/onboarding.register.tsx"),
  route("onboarding/confirm-phone-number", "routes/onboarding.confirm-phone-number.tsx"),
  route("login", "routes/login.tsx"),
  route("logout", "routes/logout.tsx"),
  index("routes/home.tsx"),
  route("search", "routes/search.tsx"),
  route("orders", "routes/orders.tsx"),
  route("messages", "routes/messages.tsx"),
  route("chat/:id", "routes/chat.tsx"),
  route("salon/:id", "routes/salon.tsx"),
  route("booking", "routes/booking.tsx"),
  route("booking/add-service", "routes/booking-add-service.tsx"),
  route("map", "routes/map.tsx"),
  route("profile", "routes/profile.tsx"),
] satisfies RouteConfig;

