import type { Metadata } from "next";
import CheatsheetClient from "./CheatsheetClient";

export const metadata: Metadata = {
  title: "Claude Code Cheatsheet | Complete Reference Guide",
  description:
    "Complete Claude Code reference: keyboard shortcuts, slash commands, MCP servers, hooks, subagents, permissions, and more.",
  openGraph: {
    title: "Claude Code Cheatsheet | Complete Reference Guide",
    description:
      "Complete Claude Code reference: keyboard shortcuts, slash commands, MCP servers, hooks, subagents, permissions, and more.",
    url: "https://www.claudeai.directory/cheatsheet",
    siteName: "ClaudeAI Directory",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Claude Code Cheatsheet | Complete Reference Guide",
    description:
      "Complete Claude Code reference: keyboard shortcuts, slash commands, MCP servers, hooks, subagents, permissions, and more.",
  },
};

export default function CheatsheetPage() {
  return <CheatsheetClient />;
}
