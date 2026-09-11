import type { Metadata } from "next";

const TITLE = "Claude MCP Servers: Discover and Install MCPs";
const DESCRIPTION =
  "Discover MCP servers for Claude Code. Explore popular community MCPs and copy verified install commands for development, data and productivity tools.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/mcp" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/mcp" },
};

export default function MCPLayout({ children }: { children: React.ReactNode }) {
  return children;
}
