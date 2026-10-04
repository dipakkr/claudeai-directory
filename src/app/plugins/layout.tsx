import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

const TITLE = "Claude Plugins Marketplace: Browse and Install Plugins";
const DESCRIPTION =
  "Browse Claude plugins and every skill, agent, command and MCP server inside them. See what each plugin adds, then copy the install command for Claude Code.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/plugins" },
  openGraph: { images: [DEFAULT_OG_IMAGE], title: TITLE, description: DESCRIPTION, url: "/plugins" },
};

export default function PluginsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
