import crypto from "crypto";
import type { Route } from "./+types/api.generate-hmac";

const API_SECRET = process.env.API_SECRET || "";

function generateHmac(data: string): string {
  return crypto.createHmac("sha256", API_SECRET).update(data).digest("hex");
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { body, timestamp } = await request.json();

    if (!timestamp) {
      return Response.json({ error: "Missing timestamp" }, { status: 400 });
    }

    const message = (body || "") + timestamp;
    const signature = generateHmac(message);

    return Response.json({ signature, timestamp });
  } catch (error) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function loader() {
  return Response.json({ status: "OK" });
}
