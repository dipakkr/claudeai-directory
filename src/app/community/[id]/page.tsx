import type { Metadata } from "next";
import { fetchApi } from "@/lib/api-server";
import type { Thread, Reply } from "@/types";
import ThreadDetail from "./ThreadDetailClient";
import { BreadcrumbSchema, DiscussionForumPostingSchema } from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.claudeai.directory";

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
  const description = thread.body?.slice(0, 160) || "Community discussion on ClaudeAI Directory";

  return {
    title,
    description,
    alternates: { canonical: `/community/${id}` },
    openGraph: { title, description, url: `/community/${id}`, type: "article" },
  };
}

export default async function CommunityThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [thread, replies] = await Promise.all([
    fetchApi<Thread>(`/community/threads/${id}`),
    fetchApi<Reply[]>(`/community/threads/${id}/replies`),
  ]);

  return (
    <>
      {thread && (
        <>
          <BreadcrumbSchema
            items={[
              { name: "Home", url: SITE_URL },
              { name: "Community", url: `${SITE_URL}/community` },
              { name: thread.title, url: `${SITE_URL}/community/${id}` },
            ]}
          />
          <DiscussionForumPostingSchema
            title={thread.title}
            body={thread.body}
            url={`${SITE_URL}/community/${id}`}
            datePublished={thread.created_at}
            author={thread.author}
            views={thread.views}
            comments={(replies ?? []).map((r) => ({
              body: r.body,
              author: r.author,
              datePublished: r.created_at,
            }))}
          />
        </>
      )}
      <ThreadDetail
        id={id}
        initialThread={thread ?? undefined}
        initialReplies={replies ?? undefined}
      />
    </>
  );
}
