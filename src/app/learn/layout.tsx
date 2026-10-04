import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "Learn Claude AI: Guides, Tutorials and Resources" },
  description:
    "Guides, tutorials, and resources to level up your AI development skills with Claude. From beginner to advanced.",
  alternates: { canonical: "/learn" },
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    title: "Learn Claude AI: Guides, Tutorials & Resources",
    description:
      "Guides, tutorials, and resources to level up your AI development skills with Claude.",
    url: "/learn",
  },
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
