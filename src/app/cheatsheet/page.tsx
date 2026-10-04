import type { Metadata } from "next";
import CheatsheetClient from "./CheatsheetClient";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Claude Code Cheatsheet: Complete Reference",
  alternates: { canonical: "/cheatsheet" },
  description:
    "Complete Claude Code reference: keyboard shortcuts, slash commands, MCP servers, hooks, subagents, permissions, and more.",
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    title: "Claude Code Cheatsheet: Complete Reference",
    description:
      "Complete Claude Code reference: keyboard shortcuts, slash commands, MCP servers, hooks, subagents, permissions, and more.",
    url: "https://www.claudeai.directory/cheatsheet",
    siteName: "Claude AI Directory",
    type: "website",
  },
  twitter: {
    images: [DEFAULT_OG_IMAGE.url],
    card: "summary_large_image",
    title: "Claude Code Cheatsheet | Complete Reference Guide",
    description:
      "Complete Claude Code reference: keyboard shortcuts, slash commands, MCP servers, hooks, subagents, permissions, and more.",
  },
};

export default function CheatsheetPage() {
  return <CheatsheetClient />;
}
