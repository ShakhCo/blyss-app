import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  route("onboarding/introduction", "routes/onboarding.introduction.tsx"),
  route("onboarding/register", "routes/onboarding.register.tsx"),
  route("onboarding/confirm-phone-number", "routes/onboarding.confirm-phone-number.tsx"),
  route("login", "routes/login.tsx"),
  route("logout", "routes/logout.tsx"),
  index("routes/home.tsx"),
  route("search", "routes/search.tsx"),
  route("orders", "routes/orders.tsx"),
  route("messages", "routes/messages.tsx"),
  route("chat/:id", "routes/chat.tsx"),
  route("salon/:id", "routes/salon.tsx", [
    index("routes/salon.services.tsx"),
    route("gallery", "routes/salon.gallery.tsx"),
    route("reviews", "routes/salon.reviews.tsx"),
    route("about", "routes/salon.about.tsx"),
  ]),
  route("booking", "routes/booking.tsx"),
  route("booking/add-service", "routes/booking-add-service.tsx"),
  route("map", "routes/map.tsx"),
  route("profile", "routes/profile.tsx"),
] satisfies RouteConfig;
