"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { api } from "@/lib/api";
import { selectedDiscussions } from "@/lib/home-community";
import ReactMarkdown from "react-markdown";
import { ArrowRight, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Reply, Thread } from "@/types";
import { postTitle } from "@/lib/feed";

const DISCUSSION_PAGE_SIZE = 5;
const FETCH_SIZE = 30;
type DiscussionTab = "recent" | "replies" | "unanswered";
const matchesTab = (thread: Thread, tab: DiscussionTab) => tab === "recent" || (tab === "replies" ? thread.replies > 0 : thread.replies === 0);

function MemberAvatar({ src, name }: { src?: string | null; name: string }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-background bg-muted text-[12px] font-medium text-muted-foreground ring-1 ring-border">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- member avatars are remote user-provided URLs
        <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
      ) : (
        name[0]?.toUpperCase()
      )}
    </span>
  );
}

function Excerpt({ text }: { text: string }) {
  return <div className="mt-2 line-clamp-2 break-words text-sm leading-6 text-muted-foreground">
    <ReactMarkdown allowedElements={["p", "strong", "em", "code"]} unwrapDisallowed skipHtml components={{ p: ({ children }) => <span>{children} </span> }}>{text.slice(0, 500)}</ReactMarkdown>
  </div>;
}

export default function HomeCommunity({ threads, replies, unavailable }: { threads: Thread[]; replies: Record<string, Reply>; unavailable: boolean }) {
  const [items, setItems] = useState(() => selectedDiscussions(threads));
  const [visible, setVisible] = useState<Record<DiscussionTab, number>>({ recent: DISCUSSION_PAGE_SIZE, replies: DISCUSSION_PAGE_SIZE, unanswered: DISCUSSION_PAGE_SIZE });
  const [hasMore, setHasMore] = useState(unavailable || threads.length === FETCH_SIZE);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<DiscussionTab | null>(null);
  const offset = useRef(threads.length);
  const loadingRef = useRef(false);

  const loadMore = async (tab: DiscussionTab) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setLoadError(null);
    const nextVisible = Math.min(visible[tab], items.filter(thread => matchesTab(thread, tab)).length) + DISCUSSION_PAGE_SIZE;
    let collected = items;
    let more = hasMore;
    try {
      // Buffer API pages, but reveal exactly five matching discussions per click.
      // Keep advancing through pages even when a selected tab has no matches.
      while (collected.filter(thread => matchesTab(thread, tab)).length < nextVisible && more) {
        const page = await api.get<Thread[]>("/community/threads", { sort: "mix", skip: offset.current, limit: FETCH_SIZE });
        offset.current += page.length;
        more = page.length === FETCH_SIZE;
        const seen = new Set(collected.map(thread => thread.id));
        collected = [...collected, ...selectedDiscussions(page).filter(thread => {
          if (seen.has(thread.id)) return false;
          seen.add(thread.id);
          return true;
        })];
        setItems(collected);
        setHasMore(more);
      }
      setVisible(current => ({ ...current, [tab]: nextVisible }));
    } catch {
      // Keep the current rows and cursor; the button retries the failed page.
      setLoadError(tab);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  const groups: { id: DiscussionTab; label: string; items: Thread[] }[] = [
    { id: "recent", label: "Recent", items },
    { id: "replies", label: "With replies", items: items.filter(t => matchesTab(t, "replies")) },
    { id: "unanswered", label: "Needs a reply", items: items.filter(t => matchesTab(t, "unanswered")) },
  ];
  return (
    <section id="community" aria-labelledby="community-heading" className="mx-auto mt-16 max-w-[1000px] scroll-mt-24 px-4 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="community-heading" className="text-2xl text-foreground">Community Discussion Forum</h2>
        <Link href="/feed" className="inline-flex items-center gap-2 py-2 text-sm text-foreground underline underline-offset-4">Join the discussion <ArrowRight className="h-4 w-4" /></Link>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Questions, projects, and ideas from people building with Claude.</p>
      <Tabs defaultValue="recent" className="mt-5">
        <TabsList aria-label="Community discussions" className="h-auto max-w-full flex-wrap justify-start gap-1 rounded-none bg-transparent p-0">
          {groups.map(group => <TabsTrigger key={group.id} value={group.id} className="rounded-none border-b-2 border-transparent px-3 py-3 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none">{group.label}</TabsTrigger>)}
        </TabsList>
        {groups.map(group => <TabsContent key={group.id} value={group.id}>
          {group.items.length ? <div className="divide-y divide-border border-y border-border">
            {group.items.slice(0, visible[group.id]).map(thread => <article key={thread.id} className="py-5">
              <div className="flex items-start gap-3">
                <MemberAvatar src={thread.author_avatar} name={thread.author || thread.author_username || "Member"} />
                <div className="min-w-0 flex-1">
                  <Link href={`/feed/${encodeURIComponent(thread.id)}`} className="block break-words text-base font-medium leading-6 text-foreground hover:underline">{postTitle(thread)}</Link>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <Link href={`/u/${encodeURIComponent(thread.author_username!)}`} className="hover:underline">{thread.author?.includes("@") ? thread.author_username : thread.author || thread.author_username}</Link>
                    <time dateTime={thread.created_at}>{new Date(thread.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}</time>
                    <span className="inline-flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{thread.replies} {thread.replies === 1 ? "reply" : "replies"}</span>
                  </div>
                  <Excerpt text={thread.body} />
                  {replies[thread.id] && <div className="mt-3 border-l-2 border-border pl-3 text-sm leading-6">
                    <p className="text-xs font-medium text-foreground">Reply from {replies[thread.id].author?.includes("@") ? "a member" : replies[thread.id].author || "a member"}</p>
                    <Excerpt text={replies[thread.id].body} />
                    <Link href={`/feed/${encodeURIComponent(thread.id)}`} className="mt-1 inline-block text-xs text-foreground underline underline-offset-4">Read the full conversation</Link>
                  </div>}
                </div>
              </div>
            </article>)}
          </div> : <p role="status" className="border-t border-border py-8 text-sm text-muted-foreground">{unavailable ? "Discussions are temporarily unavailable." : "No matching discussions in this selection yet."} <Link href="/feed" className="text-foreground underline">Visit the feed</Link>.</p>}
          {(group.items.length > visible[group.id] || hasMore) && (
            <div className="flex flex-col items-center gap-2 pt-5">
              {loadError === group.id && <p role="alert" className="text-sm text-muted-foreground">Could not load more discussions. Please try again.</p>}
              <button
                type="button"
                disabled={loading}
                onClick={() => void loadMore(group.id)}
                className="inline-flex h-9 items-center justify-center rounded-full border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              >
                {loading ? "Loading..." : loadError === group.id ? "Try again" : "Load more"}
              </button>
            </div>
          )}
        </TabsContent>)}
      </Tabs>
    </section>
  );
}
