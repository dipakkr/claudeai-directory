import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Jobs — Find Engineering, Product & AI/ML Roles",
  description:
    "Browse AI jobs across engineering, product, design, marketing, and AI/ML. Find roles at companies building with Claude and large language models.",
  alternates: { canonical: "/jobs" },
  openGraph: {
    title: "AI Jobs — Find Engineering, Product & AI/ML Roles",
    description:
      "Browse AI jobs across engineering, product, design, marketing, and AI/ML.",
    url: "/jobs",
  },
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
