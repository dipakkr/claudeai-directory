import type { Metadata } from "next";
import { fetchApi } from "@/lib/api-server";
import type { Thread } from "@/types";
import ThreadDetail from "./ThreadDetailClient";
import { BreadcrumbSchema } from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://claudeai.directory";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const thread = await fetchApi<Thread>(`/community/threads/${id}`);

  if (!thread) {
    return { title: "Discussion Not Found" };
  }

  const title = thread.title;
  const description = thread.body?.slice(0, 160) || "Community discussion on Claude Directory";

  return {
    title,
    description,
    alternates: { canonical: `/community/${id}` },
    openGraph: { title, description, url: `/community/${id}` },
  };
}

export default async function CommunityThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const thread = await fetchApi<Thread>(`/community/threads/${id}`);

  return (
    <>
      {thread && (
        <BreadcrumbSchema
          items={[
            { name: "Home", url: SITE_URL },
            { name: "Community", url: `${SITE_URL}/community` },
            { name: thread.title, url: `${SITE_URL}/community/${id}` },
          ]}
        />
      )}
      <ThreadDetail params={params} />
    </>
  );
}
