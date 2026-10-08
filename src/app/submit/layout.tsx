import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

const TITLE = "Submit to Claude Directory";
const DESCRIPTION =
  "Submit your Claude Skill, MCP server or Agent to Claude Directory. Paste a GitHub URL, check the details we detect, and get listed free with a working install command.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/submit" },
  openGraph: { images: [DEFAULT_OG_IMAGE], title: TITLE, description: DESCRIPTION, url: "/submit" },
};

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
