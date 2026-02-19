import type { Metadata } from "next";
import { fetchApi } from "@/lib/api-server";
import type { Prompt } from "@/types";
import PromptDetailClient from "./PromptDetailClient";
import { BreadcrumbSchema, JsonLd } from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://claudeai.directory";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const prompt = await fetchApi<Prompt>(`/prompts/${slug}`);

  if (!prompt) {
    return { title: "Prompt Not Found | Claude Directory" };
  }

  const title = `${prompt.title} — Claude AI Prompt`;
  const description =
    prompt.description
      ? `${prompt.description.slice(0, 130)}${prompt.description.length > 130 ? "…" : ""} — A ${prompt.complexity || ""} ${prompt.category} prompt for Claude AI.`.trim()
      : `${prompt.title} — a curated ${prompt.category} prompt for Claude AI. Copy, paste, and get better results instantly.`;

  const keywords = [
    prompt.title,
    "Claude AI prompt",
    `${prompt.category} prompt`,
    "AI prompt template",
    "Claude prompt",
    ...prompt.tags,
    ...prompt.use_cases,
  ].filter(Boolean);

  return {
    title,
    description,
    keywords: keywords.join(", "),
    alternates: { canonical: `${SITE_URL}/prompts/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/prompts/${slug}`,
      siteName: "Claude Directory",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function PromptSchema({ prompt, slug }: { prompt: Prompt; slug: string }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: prompt.title,
        description: prompt.description,
        url: `${SITE_URL}/prompts/${slug}`,
        dateCreated: prompt.created_at,
        genre: prompt.category,
        keywords: [...prompt.tags, ...prompt.use_cases].join(", "),
        interactionStatistic: {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/LikeAction",
          userInteractionCount: prompt.upvotes,
        },
        publisher: { "@type": "Organization", name: "Claude Directory" },
        isPartOf: {
          "@type": "WebSite",
          name: "Claude Directory",
          url: SITE_URL,
        },
      }}
    />
  );
}

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const prompt = await fetchApi<Prompt>(`/prompts/${slug}`);

  return (
    <>
      {prompt && (
        <>
          <PromptSchema prompt={prompt} slug={slug} />
          <BreadcrumbSchema
            items={[
              { name: "Home", url: SITE_URL },
              { name: "Prompts", url: `${SITE_URL}/prompts` },
              { name: prompt.title, url: `${SITE_URL}/prompts/${slug}` },
            ]}
          />
        </>
      )}
      <PromptDetailClient params={params} />
    </>
  );
}
