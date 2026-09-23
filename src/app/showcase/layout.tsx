import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Claude App Showcase: MCP Apps, Agents & Workflows",
  description:
    "Explore apps launched by Claude community builders. Meet the makers, read their product descriptions and share feedback, or submit your own app.",
  alternates: { canonical: "/showcase" },
  openGraph: {
    title: "Claude App Showcase: MCP Apps, Agents & Workflows",
    description:
      "Explore apps launched by Claude community builders. Meet the makers and share feedback on their products.",
    url: "/showcase",
  },
};

export default function ShowcaseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
