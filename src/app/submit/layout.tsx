import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

const TITLE = "Submit a Skill, MCP or Agent";
const DESCRIPTION =
  "Publish your Claude Skill, MCP server or Agent. Paste a GitHub URL and we turn verified setup metadata into a simple install experience.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/submit" },
  openGraph: { images: [DEFAULT_OG_IMAGE], title: TITLE, description: DESCRIPTION, url: "/submit" },
};

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
