import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guides — Step-by-Step Claude AI Tutorials",
  description:
    "In-depth, step-by-step guides for building with Claude AI. Learn prompt engineering, MCP integration, and advanced techniques.",
  alternates: { canonical: "/guides" },
  openGraph: {
    title: "Guides — Step-by-Step Claude AI Tutorials",
    description:
      "In-depth, step-by-step guides for building with Claude AI.",
    url: "/guides",
  },
};

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
