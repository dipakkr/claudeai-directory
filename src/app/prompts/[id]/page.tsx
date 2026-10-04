import type { Metadata } from "next";
import { fetchApi } from "@/lib/api-server";
import type { Prompt } from "@/types";
import PromptDetailClient from "./PromptDetailClient";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.claudeai.directory";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const prompt = await fetchApi<Prompt>(`/prompts/${id}`);

  if (!prompt) {
    return { title: "Prompt Not Found" };
  }

  const title = prompt.title;
  const description = prompt.description?.slice(0, 160) || `${prompt.title}: a Claude AI prompt`;

  return {
    title,
    description,
    alternates: { canonical: `/prompts/${id}` },
    openGraph: {
      images: [DEFAULT_OG_IMAGE],
      title,
      description,
      url: `/prompts/${id}`,
      type: "article",
    },
    twitter: {
      images: [DEFAULT_OG_IMAGE.url],
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prompt = await fetchApi<Prompt>(`/prompts/${id}`);

  return <PromptDetailClient prompt={prompt} id={id} />;
}
