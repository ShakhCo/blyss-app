import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
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
  route("test", "routes/test.tsx"),
] satisfies RouteConfig;
