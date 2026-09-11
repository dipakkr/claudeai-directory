import type { Metadata } from "next";

const TITLE = "Claude Agents: Discover Agents for Claude Code";
const DESCRIPTION =
  "Discover community-built Claude Agents for coding, testing, debugging, research and other Claude Code workflows.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/agents" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/agents" },
};

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
