import type { Metadata } from "next";

const TITLE = "Claude MCP Servers Directory: Browse & Install MCPs";
const DESCRIPTION =
  "Find MCP servers for Claude Code and Claude Desktop. Browse categories, compare tools and copy install commands for developer, research and business workflows.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/mcp" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/mcp" },
};

export default function MCPLayout({ children }: { children: React.ReactNode }) {
  return children;
}
