import type { Metadata } from "next";
import Catalog from "./Catalog";

export const metadata: Metadata = {
  title: "Skills marketplace | Claude Directory Studio",
  description: "Browse outputs from skills tested by Claude Directory. Explore the generated work, workflow, dependencies and testing notes.",
  alternates: { canonical: "/studio" },
};

export default function StudioPage() {
  return <Catalog />;
}
