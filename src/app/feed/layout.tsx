import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Latest — New Skills, MCP Servers, Prompts & More",
  description:
    "Stay up to date with the latest additions across the Claude ecosystem. New MCP servers, skills, prompts, jobs, and community projects.",
  alternates: { canonical: "/feed" },
  openGraph: {
    title: "Latest — New Skills, MCP Servers, Prompts & More",
    description:
      "Stay up to date with the latest additions across the Claude ecosystem.",
    url: "/feed",
  },
};

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
