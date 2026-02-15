import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn Claude AI — Guides, Tutorials & Resources",
  description:
    "Guides, tutorials, and resources to level up your AI development skills with Claude. From beginner to advanced.",
  alternates: { canonical: "/learn" },
  openGraph: {
    title: "Learn Claude AI — Guides, Tutorials & Resources",
    description:
      "Guides, tutorials, and resources to level up your AI development skills with Claude.",
    url: "/learn",
  },
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
