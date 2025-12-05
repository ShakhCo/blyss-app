import { Link } from "react-router";
import type { Route } from "./+types/test";
import { Button } from "@heroui/react";
import { Page } from "~/components/Page";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Test Page" },
    { name: "description", content: "Test page" },
  ];
}

export default function Test() {
  return (
    <Page>
      <div className="p-4 pt-20">
        <h1 className="text-2xl font-bold mb-4">Test Page</h1>
        <Link to="/" className="text-blue-500 hover:underline">
          Go to Home
        </Link>

        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="tertiary">Tertiary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="danger-soft">Danger Soft</Button>
        </div>
      </div>
    </Page>
  );
}
