import { Suspense } from "react";
import type { Metadata } from "next";
import SetupClient from "./SetupClient";

export const metadata: Metadata = {
  title: "CLAUDE.md Generator — Claude Directory",
  description:
    "Generate a perfect CLAUDE.md for your project in seconds. Pick your stack, preferences, and behaviors — get a shareable, copy-ready config file for Claude Code.",
  openGraph: {
    title: "CLAUDE.md Generator — Claude Directory",
    description:
      "Generate a perfect CLAUDE.md for your project. Supports Next.js, FastAPI, Django, Rails, Go, Rust, and more.",
    url: "https://claudeai.directory/setup",
    siteName: "Claude Directory",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CLAUDE.md Generator — Claude Directory",
    description:
      "Generate a perfect CLAUDE.md for your project in seconds.",
  },
};

export default function SetupPage() {
  return (
    <Suspense>
      <SetupClient />
    </Suspense>
  );
}
