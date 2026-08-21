import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connectors — Claude AI Directory",
  description:
    "Explore Claude connector workflows for tools like Gmail, Google Drive, Slack, Linear, Notion, and support team systems.",
  alternates: { canonical: "/connectors" },
  openGraph: {
    title: "Connectors — Claude AI Directory",
    description:
      "A guide to what people actually build with Claude connectors across inboxes, docs, CRM, design, and engineering tools.",
    url: "/connectors",
  },
};

export default function ConnectorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
