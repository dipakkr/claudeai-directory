import type { Metadata } from "next";

import SubmitLaunchClient from "./SubmitLaunchClient";

export const metadata: Metadata = {
  title: "Launch Your Claude App",
  description:
    "Get a public page for the app, MCP server, skill or agent you built with Claude. Paste your link, add a badge and collect upvotes and feedback from builders.",
  alternates: { canonical: "/launches/submit" },
  openGraph: {
    title: "Launch Your Claude App",
    description: "Get a public page for what you built with Claude and collect upvotes and feedback.",
    url: "/launches/submit",
  },
};

export default function SubmitLaunchPage() {
  return <SubmitLaunchClient />;
}
