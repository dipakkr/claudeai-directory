import type { Metadata } from "next";

const TITLE = "Claude Code Plugins: Browse and Install Plugins";
const DESCRIPTION =
  "Find Claude Code plugins that bundle skills, agents, commands and MCP servers. Browse by category and copy the install command.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/plugins" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/plugins" },
};

export default function PluginsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
