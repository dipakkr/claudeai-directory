import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchApi } from "@/lib/api-server";
import type { PublicProfile, Thread, Reply } from "@/types";
import ThreadDetail from "./ThreadDetailClient";
import { BreadcrumbSchema, DiscussionForumPostingSchema } from "@/components/seo/JsonLd";
import { pageTitle, plainText, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { isIndexable, postTitle as titleOf } from "@/lib/feed";
import { ViewTracker } from "@/components/tracking/ViewTracker";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.claudeai.directory";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const thread = await fetchApi<Thread>(`/community/threads/${id}`);
  if (!thread) return { title: "Post Not Found", robots: { index: false } };

  const title = titleOf(thread);
  const description = plainText(thread.body || "").slice(0, 160) || "A post on the Claude AI Directory community feed.";
  return {
    title: pageTitle(title),
    description,
    alternates: { canonical: `/feed/${id}` },
    robots: isIndexable(thread) ? undefined : { index: false, follow: true },
    openGraph: { images: [DEFAULT_OG_IMAGE], title, description, url: `/feed/${id}`, type: "article" },
  };
}

export default async function FeedPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [thread, replies] = await Promise.all([
    fetchApi<Thread>(`/community/threads/${id}`),
    fetchApi<Reply[]>(`/community/threads/${id}/replies`),
  ]);
  if (!thread) notFound();

  // Sidebar context: the author's public profile, and related posts that
  // share a tag (falling back to the newest posts).
  const firstTag = thread.tags?.[0];
  const [authorProfile, tagged, latest] = await Promise.all([
    thread.author_username ? fetchApi<PublicProfile>(`/users/${thread.author_username}`) : Promise.resolve(null),
    firstTag ? fetchApi<Thread[]>(`/community/threads?tag=${encodeURIComponent(firstTag)}&limit=6`) : Promise.resolve(null),
    fetchApi<Thread[]>(`/community/threads?limit=6`),
  ]);
  const seen = new Set([id]);
  const related = [...(tagged ?? []), ...(latest ?? [])]
    .filter((t) => (seen.has(t.id) ? false : (seen.add(t.id), true)))
    .slice(0, 5);

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Feed", url: `${SITE_URL}/feed` },
          { name: titleOf(thread), url: `${SITE_URL}/feed/${id}` },
        ]}
      />
      <DiscussionForumPostingSchema
        title={titleOf(thread)}
        body={thread.body}
        url={`${SITE_URL}/feed/${id}`}
        datePublished={thread.created_at}
        author={thread.author}
        comments={(replies ?? []).map((r) => ({
          body: r.body,
          author: r.author,
          datePublished: r.created_at,
        }))}
      />
      <ViewTracker type="thread" id={id} />
      <ThreadDetail
        id={id}
        initialThread={thread}
        initialReplies={replies ?? undefined}
        authorProfile={authorProfile}
        related={related}
      />
    </>
  );
}
