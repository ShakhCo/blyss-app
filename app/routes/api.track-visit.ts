import type { Route } from "./+types/api.track-visit";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

interface VisitRequest {
  user?: {
    id: string | number;
    firstName?: string;
    lastName?: string;
    username?: string;
  };
}

async function sendToTelegram(user?: VisitRequest["user"]) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return;
  }

  const timestamp = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Tashkent",
    dateStyle: "medium",
    timeStyle: "short",
  });

  let message = `🚀 Mini app opened\n\n`;
  message += `🕐 Time: ${timestamp}\n`;

  if (user) {
    message += `\n👤 User:\n`;
    if (user.firstName) message += `Name: ${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}\n`;
    if (user.username) message += `Username: @${user.username}\n`;
    if (user.id) message += `ID: ${user.id}\n`;
  } else {
    message += `\n👤 User: Anonymous\n`;
  }

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
    const { user } = (await request.json()) as VisitRequest;

    await sendToTelegram(user);

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function loader() {
  return Response.json({ status: "OK" });
}
