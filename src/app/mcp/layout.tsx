import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MCP Servers — Claude AI Connectors Directory",
  description:
    "Browse and discover Model Context Protocol (MCP) servers to connect Claude AI to your favorite tools, databases, and workflows.",
  alternates: { canonical: "/mcp" },
  openGraph: {
    title: "MCP Servers — Claude AI Connectors Directory",
    description:
      "Browse and discover MCP servers to connect Claude AI to your favorite tools, databases, and workflows.",
    url: "/mcp",
  },
};

export default function MCPLayout({ children }: { children: React.ReactNode }) {
  return children;
}
