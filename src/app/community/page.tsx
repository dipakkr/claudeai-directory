import type { Metadata } from "next";
import { fetchApi } from "@/lib/api-server";
import type { Thread } from "@/types";
import { CollectionPageSchema } from "@/components/seo/JsonLd";
import CommunityClient from "./CommunityClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.claudeai.directory";

export const metadata: Metadata = {
  title: "Claude Forum & Community — Discussions, Questions & Answers",
  description:
    "Join the Claude AI community forum. Ask questions, share prompts and workflows, and connect with people building with Claude, Claude Code, and MCP.",
  alternates: { canonical: "/community" },
  openGraph: {
    title: "Claude Forum & Community",
    description:
      "Ask questions, share workflows, and connect with people building with Claude.",
    url: "/community",
  },
};

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);

  const qsStr = qs.toString();
  const initialThreads =
    (await fetchApi<Thread[]>(`/community/threads?limit=30${qsStr ? `&${qsStr}` : ""}`)) ?? [];

  return (
    <>
      <CollectionPageSchema
        name="Claude Forum & Community"
        description="Discussions, questions, and answers from people building with Claude AI."
        url={`${SITE_URL}/community`}
      />
      <CommunityClient initialThreads={initialThreads} initialSearch={params.search ?? ""} />
    </>
  );
}
