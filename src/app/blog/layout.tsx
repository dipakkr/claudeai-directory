import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Articles, tutorials, and guides about Claude AI, MCP servers, prompt engineering, and building with AI.",
  openGraph: {
    title: "Blog | Claude Directory",
    description:
      "Articles, tutorials, and guides about Claude AI, MCP servers, prompt engineering, and building with AI.",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
