import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

const TITLE = "Claude MCP Servers Directory: Browse & Install MCPs";
const DESCRIPTION =
  "Find MCP servers for Claude Code and Claude Desktop. Browse categories, compare tools and copy install commands for developer, research and business workflows.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/mcp" },
  openGraph: { images: [DEFAULT_OG_IMAGE], title: TITLE, description: DESCRIPTION, url: "/mcp" },
};

export default function MCPLayout({ children }: { children: React.ReactNode }) {
  return children;
}
