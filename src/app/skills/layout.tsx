import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Claude Skills — Community-Built AI Capabilities",
  description:
    "Browse and install Claude skills shared by the community. Extend Claude's capabilities with reusable prompts, workflows, and coding patterns.",
  alternates: { canonical: "/skills" },
  openGraph: {
    title: "Claude Skills — Community-Built AI Capabilities",
    description:
      "Browse and install Claude skills shared by the community. Extend Claude's capabilities with reusable prompts and workflows.",
    url: "/skills",
  },
};

export default function SkillsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
