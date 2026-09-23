"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ArrowRight, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Reply, Thread } from "@/types";

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
  const groups = [
    { id: "recent", label: "Recent", items: threads },
    { id: "replies", label: "With replies", items: threads.filter(t => t.replies > 0) },
    { id: "unanswered", label: "Needs a reply", items: threads.filter(t => t.replies === 0) },
  ];
  return (
    <section id="community" aria-labelledby="community-heading" className="mx-auto mt-16 max-w-[840px] scroll-mt-24 px-4 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="community-heading" className="text-2xl text-foreground">Questions from the community</h2>
        <Link href="/community" className="inline-flex items-center gap-2 py-2 text-sm text-foreground underline underline-offset-4">Join the discussion <ArrowRight className="h-4 w-4" /></Link>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Selected Claude discussions from member profiles. Replies are community advice, not verified solutions.</p>
      <Tabs defaultValue="recent" className="mt-5">
        <TabsList aria-label="Community discussions" className="h-auto max-w-full flex-wrap justify-start gap-1 rounded-none bg-transparent p-0">
          {groups.map(group => <TabsTrigger key={group.id} value={group.id} className="rounded-none border-b-2 border-transparent px-3 py-3 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none">{group.label}</TabsTrigger>)}
        </TabsList>
        {groups.map(group => <TabsContent key={group.id} value={group.id}>
          {group.items.length ? <div className="divide-y divide-border border-y border-border">
            {group.items.slice(0, 4).map(thread => <article key={thread.id} className="py-5">
              <div className="flex items-start gap-3">
                <MemberAvatar src={thread.author_avatar} name={thread.author || thread.author_username || "Member"} />
                <div className="min-w-0 flex-1">
                  <Link href={`/community/${encodeURIComponent(thread.id)}`} className="block break-words text-base font-medium leading-6 text-foreground hover:underline">{thread.title}</Link>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <Link href={`/u/${encodeURIComponent(thread.author_username!)}`} className="hover:underline">{thread.author?.includes("@") ? thread.author_username : thread.author || thread.author_username}</Link>
                    <time dateTime={thread.created_at}>{new Date(thread.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}</time>
                    <span className="inline-flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{thread.replies} {thread.replies === 1 ? "reply" : "replies"}</span>
                  </div>
                  <Excerpt text={thread.body} />
                  {replies[thread.id] && <div className="mt-3 border-l-2 border-border pl-3 text-sm leading-6">
                    <p className="text-xs font-medium text-foreground">Reply from {replies[thread.id].author?.includes("@") ? "a member" : replies[thread.id].author || "a member"}</p>
                    <Excerpt text={replies[thread.id].body} />
                    <Link href={`/community/${encodeURIComponent(thread.id)}`} className="mt-1 inline-block text-xs text-foreground underline underline-offset-4">Read the full conversation</Link>
                  </div>}
                </div>
              </div>
            </article>)}
          </div> : <p role="status" className="border-t border-border py-8 text-sm text-muted-foreground">{unavailable ? "Discussions are temporarily unavailable." : "No matching discussions in this selection yet."} <Link href="/community" className="text-foreground underline">Visit the community</Link>.</p>}
        </TabsContent>)}
      </Tabs>
    </section>
  );
}
