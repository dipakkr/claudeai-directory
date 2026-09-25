import type { Metadata } from "next";
import { fetchApi } from "@/lib/api-server";
import type { PublicProfile, Thread, Reply } from "@/types";
import ThreadDetail from "./ThreadDetailClient";
import { BreadcrumbSchema, DiscussionForumPostingSchema } from "@/components/seo/JsonLd";
import { pageTitle } from "@/lib/seo";

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
    title: pageTitle(title),
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

  // Sidebar context: the author's public profile, and related threads that
  // share a tag (falling back to the newest threads).
  const firstTag = thread?.tags?.[0];
  const [authorProfile, tagged, latest] = await Promise.all([
    thread?.author_username ? fetchApi<PublicProfile>(`/users/${thread.author_username}`) : Promise.resolve(null),
    firstTag ? fetchApi<Thread[]>(`/community/threads?tag=${encodeURIComponent(firstTag)}&limit=6`) : Promise.resolve(null),
    fetchApi<Thread[]>(`/community/threads?limit=6`),
  ]);
  const seen = new Set([id]);
  const related = [...(tagged ?? []), ...(latest ?? [])]
    .filter((t) => (seen.has(t.id) ? false : (seen.add(t.id), true)))
    .slice(0, 5);

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
        authorProfile={authorProfile}
        related={related}
      />
    </>
  );
}
