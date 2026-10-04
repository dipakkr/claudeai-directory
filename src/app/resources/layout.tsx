import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "Claude AI Resources: Tools, Templates and Utilities" },
  description:
    "Discover resources, tools, templates, and utilities for working with Claude AI. Community-curated and regularly updated.",
  alternates: { canonical: "/resources" },
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    title: "Resources: Claude AI Tools, Templates & Utilities",
    description:
      "Discover resources, tools, templates, and utilities for working with Claude AI.",
    url: "/resources",
  },
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
