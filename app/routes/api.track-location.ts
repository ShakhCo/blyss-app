import type { Route } from "./+types/api.track-location";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const GOOGLE_GEOLOCATION_API_KEY = process.env.GOOGLE_GEOLOCATION_API_KEY;

interface LocationRequest {
  lat: number;
  lon: number;
  accuracy?: number; // in meters
  user?: {
    id: string | number;
    firstName?: string;
    lastName?: string;
    username?: string;
  };
}

async function reverseGeocode(lat: number, lon: number) {
  if (!GOOGLE_GEOLOCATION_API_KEY) return null;

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${GOOGLE_GEOLOCATION_API_KEY}`
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data.status !== "OK" || !data.results?.length) return null;

    const components = data.results[0].address_components || [];
    const getComponent = (type: string) =>
      components.find((c: { types: string[]; long_name: string }) => c.types.includes(type))?.long_name || "";

    return {
      street: getComponent("route") || getComponent("street_address"),
      city: getComponent("locality") || getComponent("administrative_area_level_2"),
      region: getComponent("administrative_area_level_1"),
      country: getComponent("country"),
      formatted: data.results[0].formatted_address || "",
    };
  } catch {
    return null;
  }
}

async function sendToTelegram(lat: number, lon: number, accuracy?: number, user?: LocationRequest["user"]) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return;
  }

  const address = await reverseGeocode(lat, lon);

  let message = `📍 New visitor location:\n\n`;

  if (user) {
    message += `👤 User:\n`;
    if (user.firstName) message += `Name: ${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}\n`;
    if (user.username) message += `Username: @${user.username}\n`;
    if (user.id) message += `ID: ${user.id}\n`;
    message += `\n`;
  }

  message += `📍 Coordinates:\nLat: ${lat}\nLon: ${lon}\n`;
  if (accuracy !== undefined) {
    message += `Accuracy: ±${Math.round(accuracy)}m\n`;
  }

  if (address) {
    message += `\n📌 Address:\n`;
    if (address.street) message += `Street: ${address.street}\n`;
    if (address.city) message += `City: ${address.city}\n`;
    if (address.region) message += `Region: ${address.region}\n`;
    if (address.country) message += `Country: ${address.country}\n`;
    if (address.formatted) message += `\nFull: ${address.formatted}\n`;
  }

  message += `\n🗺 Maps: https://www.google.com/maps?q=${lat},${lon}`;

  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
    }),
  });
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { lat, lon, accuracy, user } = (await request.json()) as LocationRequest;

    if (typeof lat !== "number" || typeof lon !== "number") {
      return Response.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    await sendToTelegram(lat, lon, accuracy, user);

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function loader() {
  return Response.json({ status: "OK" });
}
