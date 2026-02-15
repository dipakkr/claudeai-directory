import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Showcase — Projects Built with Claude AI",
  description:
    "Discover projects and apps built with Claude by developers and the community. Get inspired and share your own work.",
  alternates: { canonical: "/showcase" },
  openGraph: {
    title: "Community Showcase — Projects Built with Claude AI",
    description:
      "Discover projects and apps built with Claude by developers and the community.",
    url: "/showcase",
  },
};

export default function ShowcaseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
