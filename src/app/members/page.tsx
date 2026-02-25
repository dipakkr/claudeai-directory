import type { Metadata } from "next";
import { Suspense } from "react";
import { serverFetch } from "@/lib/server/api";
import MembersClient from "./MembersClient";
import type { MembersResponse } from "@/hooks/use-members";

export const metadata: Metadata = {
  title: "Members — ClaudeAI Directory Community",
  description:
    "Meet the Claude AI community — builders, researchers, and enthusiasts. Browse member profiles, find collaborators, and discover what people are building.",
  openGraph: {
    title: "Members — ClaudeAI Directory Community",
    description:
      "Meet the people building with Claude AI. Browse member profiles and connect with the community.",
    url: "https://claudeai.directory/members",
    siteName: "ClaudeAI Directory",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Members — ClaudeAI Directory Community",
    description: "Meet the Claude AI community — builders, researchers, and enthusiasts.",
  },
  alternates: { canonical: "/members" },
};

export default async function MembersPage() {
  const data = (await serverFetch("/users?per_page=200").catch(
    () => null
  )) as MembersResponse | null;

  return (
    <Suspense>
      <MembersClient initialData={data} />
    </Suspense>
  );
}
