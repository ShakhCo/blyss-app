import { AppLayout } from "~/components/AppLayout";
import type { Route } from "./+types/orders";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Buyurtmalarim - Blyss" },
    { name: "description", content: "Sizning buyurtmalaringiz" },
  ];
}

export default function Orders() {
  return (
    <AppLayout back>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Buyurtmalarim</h1>
        <p className="text-stone-500">
          Bu yerda barcha buyurtmalaringizni ko'rishingiz mumkin.
        </p>
      </div>
    </AppLayout>
  );
}
