import type { Metadata } from "next";

const TITLE = "Submit a Skill, MCP or Agent";
const DESCRIPTION =
  "Publish your Claude Skill, MCP server or Agent. Paste a GitHub URL and we turn verified setup metadata into a simple install experience.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/submit" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/submit" },
};

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
