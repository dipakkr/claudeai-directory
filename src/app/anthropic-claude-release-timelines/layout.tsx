import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anthropic Claude Release Timeline",
  description:
    "A complete history of Anthropic and Claude AI — every model release, feature launch, research paper, funding round, and milestone from founding to today.",
  openGraph: {
    title: "Anthropic Claude Release Timeline | Claude Directory",
    description:
      "A complete history of Anthropic and Claude AI — every model release, feature launch, research paper, funding round, and milestone from founding to today.",
  },
};

export default function TimelineLayout({ children }: { children: React.ReactNode }) {
  return children;
}
