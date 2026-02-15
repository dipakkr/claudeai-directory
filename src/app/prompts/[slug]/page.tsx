import type { Metadata } from "next";
import { fetchApi } from "@/lib/api-server";
import type { Prompt } from "@/types";
import PromptDetailClient from "./PromptDetailClient";
import { ArticleSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://claudeai.directory";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const prompt = await fetchApi<Prompt>(`/prompts/${slug}`);

  if (!prompt) {
    return { title: "Prompt Not Found" };
  }

  const title = prompt.title;
  const description =
    prompt.description?.slice(0, 160) || `${prompt.title} prompt for Claude AI`;

  return {
    title,
    description,
    alternates: { canonical: `/prompts/${slug}` },
    openGraph: {
      title,
      description,
      url: `/prompts/${slug}`,
      type: "article",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
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
          <ArticleSchema
            title={prompt.title}
            description={prompt.description}
            url={`${SITE_URL}/prompts/${slug}`}
            datePublished={prompt.created_at}
          />
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
