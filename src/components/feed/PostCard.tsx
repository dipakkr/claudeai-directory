"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, Link2, MessageSquare } from "lucide-react";
import { UpvoteCount, UpvoteIcon } from "@/components/feed/UpvoteMotion";
import { toast } from "sonner";

import UserMarkdown from "@/components/shared/UserMarkdown";
import { DiscussionAvatar, timeAgo } from "@/components/discussion/Discussion";
import { LinkPreviewCard } from "@/components/feed/LinkPreviewCard";
import { PostMenu } from "@/components/feed/PostMenu";
import { useSignIn } from "@/components/auth/SignInDialog";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { track } from "@/lib/analytics";
import { formatPlainPost } from "@/lib/format-post";
import { useCreateReply, useReplies } from "@/hooks/use-community";
import type { Thread } from "@/types";

const SITE_URL = "https://www.claudeai.directory";
const LONG_POST = 420; // characters before "See more"

const action =
  "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-muted-foreground transition-[color,background-color,transform] duration-150 hover:bg-[var(--cad-control)] hover:text-foreground";

function Upvote({ post, voted: initialVoted }: { post: Thread; voted: boolean }) {
  const { requireAuth } = useSignIn();
  const queryClient = useQueryClient();
  const [state, setState] = useState<{ voted: boolean; count: number } | null>(null);
  const voted = state?.voted ?? initialVoted;
  const count = state?.count ?? post.upvotes ?? 0;
  const [busy, setBusy] = useState(false);
  // Replays the animation; positive = last change was an upvote.
  const [bump, setBump] = useState(0);
  const [wentUp, setWentUp] = useState(true);

  const click = () =>
    requireAuth("upvote", async ({ resumed }) => {
      if (busy) return;
      // Just signed in: the upvote is a toggle, so don't undo an earlier one.
      if (resumed) {
        const mine = await api.get<string[]>("/community/my-thread-votes", { ids: post.id });
        if (mine.includes(post.id)) {
          setState({ voted: true, count });
          return;
        }
      }
      setBusy(true);
      // Optimistic: flip and animate now, settle with the server's count.
      setState({ voted: !voted, count: count + (voted ? -1 : 1) });
      setWentUp(!voted);
      setBump((b) => b + 1);
      try {
        const result = await api.post<{ voted: boolean; upvotes: number }>(`/community/threads/${post.id}/upvote`);
        setState({ voted: result.voted, count: result.upvotes });
        void queryClient.invalidateQueries({ queryKey: ["community", "post-votes"] });
      } catch {
        setState({ voted, count });
        toast.error("Could not save your upvote");
      } finally {
        setBusy(false);
      }
    });

  return (
    <button
      type="button"
      onClick={() => void click()}
      aria-pressed={voted}
      className={`${action} active:scale-95 ${voted ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary" : ""}`}
    >
      <UpvoteIcon voted={voted} bump={bump} />
      {voted ? "Upvoted" : "Upvote"}
      {count > 0 && <UpvoteCount count={count} bump={bump} up={wentUp} />}
    </button>
  );
}

function InlineComments({ post, onCount }: { post: Thread; onCount: (n: number) => void }) {
  const { data: replies, isLoading } = useReplies(post.id);
  const createReply = useCreateReply(post.id);
  const { user } = useAuth();
  const { requireAuth } = useSignIn();
  const [body, setBody] = useState("");

  const topLevel = (replies ?? []).filter((r) => !r.parent_id);
  const shown = topLevel.slice(-3);

  const submit = () =>
    requireAuth("comment", async () => {
      const text = body.trim();
      if (!text) return;
      try {
        await createReply.mutateAsync({ body: text });
        track("community_posted", { kind: "reply" });
        setBody("");
        onCount((replies?.length ?? 0) + 1);
      } catch {
        toast.error("Could not post your comment");
      }
    });

  return (
    <div className="border-t border-border px-4 pb-4 pt-3 sm:px-5">
      {isLoading ? (
        <p className="py-2 text-xs text-muted-foreground">Loading comments...</p>
      ) : (
        <>
          {topLevel.length > shown.length && (
            <Link href={`/feed/${post.id}#comments`} className="mb-2 inline-block text-xs font-medium text-muted-foreground hover:text-foreground">
              View all {replies?.length} comments
            </Link>
          )}
          <ul className="space-y-3">
            {shown.map((r) => (
              <li key={r.id} className="flex gap-2.5">
                <DiscussionAvatar src={r.author_avatar} name={r.author} size="sm" />
                <div className="min-w-0 flex-1 rounded-[4px] bg-[var(--cad-control)] px-3 py-2">
                  <div className="flex items-baseline gap-1.5 text-[13px]">
                    {r.author_username ? (
                      <Link href={`/u/${r.author_username}`} className="font-semibold text-foreground hover:underline">
                        {r.author}
                      </Link>
                    ) : (
                      <span className="font-semibold text-foreground">{r.author}</span>
                    )}
                    <span className="text-xs text-muted-foreground">{timeAgo(r.created_at)}</span>
                  </div>
                  <div className="mt-0.5 text-[13.5px] leading-6 text-foreground/90 [&_.prose]:text-[13.5px]">
                    <UserMarkdown compact>{r.body}</UserMarkdown>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      <form
        className="mt-3 flex items-start gap-2.5"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        {user && <DiscussionAvatar src={user.avatar} name={user.name || user.username || "You"} size="sm" />}
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-border bg-background pl-4 pr-1.5 focus-within:border-[var(--cad-line-hover)]">
          <input
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Add a comment..."
            maxLength={2000}
            aria-label="Add a comment"
            className="h-9 min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {body.trim() && (
            <button type="submit" disabled={createReply.isPending} className="h-7 rounded-full bg-primary px-3 text-xs font-medium text-primary-foreground disabled:opacity-60">
              {createReply.isPending ? "Posting" : "Post"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export function PostCard({ post, voted, onDeleted }: { post: Thread; voted: boolean; onDeleted?: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [replyCount, setReplyCount] = useState<number | null>(null);
  const replies = replyCount ?? post.replies ?? 0;
  const long = post.body.length > LONG_POST;
  const body = long && !expanded ? `${post.body.slice(0, LONG_POST).replace(/\s+\S*$/, "")}...` : post.body;
  const url = `${SITE_URL}/feed/${post.id}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy the link");
    }
  };

  return (
    <article className="overflow-hidden rounded-[6px] border border-border bg-card">
      <div className="px-4 pt-4 sm:px-5">
        <header className="flex items-start gap-3">
          <DiscussionAvatar src={post.author_avatar} name={post.author} />
          <div className="min-w-0 flex-1">
            {post.author_username ? (
              <Link href={`/u/${post.author_username}`} className="text-sm font-semibold text-foreground hover:underline">
                {post.author}
              </Link>
            ) : (
              <span className="text-sm font-semibold text-foreground">{post.author}</span>
            )}
            <p className="truncate text-xs text-muted-foreground">
              {post.author_headline ? `${post.author_headline} · ` : ""}
              <Link href={`/feed/${post.id}`} className="hover:underline">
                {timeAgo(post.created_at)}
              </Link>
            </p>
          </div>
          <PostMenu postId={post.id} authorUsername={post.author_username} onDeleted={() => onDeleted?.(post.id)} />
        </header>

        {post.title && (
          <h2 className="mt-3 text-[17px] font-semibold leading-snug text-foreground">
            <Link href={`/feed/${post.id}`} className="hover:underline">
              {post.title}
            </Link>
          </h2>
        )}
        <div className="mt-2 text-[14.5px] leading-[1.6] text-foreground/90 [&_.prose]:text-[14.5px] [&_.prose]:leading-[1.6]">
          <UserMarkdown compact>{formatPlainPost(body)}</UserMarkdown>
          {long && !expanded && (
            <button type="button" onClick={() => setExpanded(true)} className="mt-1 text-sm font-medium text-muted-foreground hover:text-foreground">
              See more
            </button>
          )}
        </div>

        {post.link_url && (
          <div className="mt-3">
            <LinkPreviewCard url={post.link_url} preview={post.link_preview} />
          </div>
        )}

        {post.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-[var(--cad-control)] px-2.5 py-0.5 text-xs text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <footer className="mt-2 flex items-center gap-0.5 px-2 pb-2 sm:px-3">
        <Upvote post={post} voted={voted} />
        <button type="button" onClick={() => setCommentsOpen((open) => !open)} aria-expanded={commentsOpen} className={action}>
          <MessageSquare className="h-4 w-4" />
          Comment
          {replies > 0 && <span className="tabular-nums">{replies}</span>}
        </button>
        <button type="button" onClick={() => void copyLink()} className={action}>
          <Link2 className="h-4 w-4" />
          Share
        </button>
        {(post.views ?? 0) > 0 && (
          <span className="ml-auto inline-flex items-center gap-1 pr-2 text-xs text-muted-foreground" title="Views">
            <Eye className="h-3.5 w-3.5" />
            {post.views.toLocaleString()}
          </span>
        )}
      </footer>

      {commentsOpen && <InlineComments post={post} onCount={setReplyCount} />}
    </article>
  );
}
