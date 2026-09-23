import type { Metadata } from "next";

const TITLE = "Claude Agents Directory: Browse Claude Code Agents";
const DESCRIPTION =
  "Find Claude Code agents for coding, testing, debugging, research and DevOps workflows. Browse community agents and reusable AI teammates for Claude.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/agents" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/agents" },
};

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
