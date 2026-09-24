import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Write for the blog",
  description: "Submit an article about Claude, Claude Code, MCP servers, Skills or Agents to the Claude Directory blog.",
  alternates: { canonical: "/blog/submit" },
  // A form, not content. Keep it out of the index.
  robots: { index: false, follow: true },
};

export default function BlogSubmitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
