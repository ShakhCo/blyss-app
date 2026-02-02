export async function loader() {
  return Response.json({
    googleGeolocationApiKey: process.env.GOOGLE_GEOLOCATION_API_KEY || null,
  });
}
