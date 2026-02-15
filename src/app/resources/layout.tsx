import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resources — Claude AI Tools, Templates & Utilities",
  description:
    "Discover resources, tools, templates, and utilities for working with Claude AI. Community-curated and regularly updated.",
  alternates: { canonical: "/resources" },
  openGraph: {
    title: "Resources — Claude AI Tools, Templates & Utilities",
    description:
      "Discover resources, tools, templates, and utilities for working with Claude AI.",
    url: "/resources",
  },
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
