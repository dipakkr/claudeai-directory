import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Prompts — Copy-Ready AI Prompt Library",
  description:
    "Curated, copy-ready prompts for Claude AI. Find prompts for coding, writing, analysis, business, and creative tasks.",
  alternates: { canonical: "/prompts" },
  openGraph: {
    title: "AI Prompts — Copy-Ready AI Prompt Library",
    description:
      "Curated, copy-ready prompts for Claude AI. Find prompts for coding, writing, analysis, business, and creative tasks.",
    url: "/prompts",
  },
};

export default function PromptsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
