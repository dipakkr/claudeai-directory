import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community — Claude AI Discussions & Forum",
  description:
    "Join the Claude AI community. Ask questions, share tips, discuss use cases, and connect with other Claude developers.",
  alternates: { canonical: "/community" },
  openGraph: {
    title: "Community — Claude AI Discussions & Forum",
    description:
      "Join the Claude AI community. Ask questions, share tips, and connect with other developers.",
    url: "/community",
  },
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
