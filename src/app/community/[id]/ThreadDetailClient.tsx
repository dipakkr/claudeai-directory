"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight, ChevronUp, Eye, Github, Globe, Link2, Linkedin, MessageSquare, PenSquare, Share2, UserRound } from "lucide-react";
import UserMarkdown from "@/components/shared/UserMarkdown";
import { useThread, useReplies, useCreateReply, useCommunityVotes, useCommunityUpvote } from "@/hooks/use-community";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { formatPlainPost } from "@/lib/format-post";
import { countryName } from "@/lib/profile-options";
import type { PublicProfile, Reply, Thread } from "@/types";

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 2592000)}mo ago`;
}

function AuthorAvatar({
  src,
  author,
  className,
}: {
  src?: string | null;
  author: string;
  className: string;
}) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote, user-provided avatar
      <img
        src={src}
        alt=""
        className={`${className} rounded-full object-cover`}
        onError={() => setFailed(true)}
        // Catches the case where the image already failed before this ref attached
        // (e.g. cached 404), so onError alone would never fire.
        ref={(el) => {
          if (el && el.complete && el.naturalWidth === 0) setFailed(true);
        }}
      />
    );
  }
  return <span className={`${className} flex items-center justify-center rounded-full bg-muted font-medium text-muted-foreground`}>{author[0]?.toUpperCase()}</span>;
}

function AuthorName({
  author,
  username,
  className,
}: {
  author: string;
  username?: string;
  className?: string;
}) {
  if (username) {
    return (
      <Link href={`/u/${username}`} className={`${className ?? ""} hover:underline`}>
        {author}
      </Link>
    );
  }
  return <span className={className}>{author}</span>;
}

// ─── Reddit-style threading (2 visible levels) ────────────────────
// Replies deeper than one level are flattened under their top-level
// ancestor, with an "@author" chip pointing at the direct parent.

interface ReplyNode {
  reply: Reply;
  children: Reply[];
}

function buildReplyTree(replies: Reply[]): { nodes: ReplyNode[]; byId: Map<string, Reply> } {
  const byId = new Map(replies.map((r) => [r.id, r]));
  const childrenOf = new Map<string, Reply[]>();
  const topLevel: Reply[] = [];

  for (const r of replies) {
    if (!r.parent_id || !byId.has(r.parent_id)) {
      topLevel.push(r);
      continue;
    }
    // Walk up to the top-level ancestor (flattens depth > 2).
    let ancestor = byId.get(r.parent_id)!;
    while (ancestor.parent_id && byId.has(ancestor.parent_id)) {
      ancestor = byId.get(ancestor.parent_id)!;
    }
    const bucket = childrenOf.get(ancestor.id) ?? [];
    bucket.push(r);
    childrenOf.set(ancestor.id, bucket);
  }

  return {
    nodes: topLevel.map((reply) => ({ reply, children: childrenOf.get(reply.id) ?? [] })),
    byId,
  };
}

/* ---------- votes ---------- */

interface VoteContext {
  voted: Set<string>;
  onVote: (type: "thread" | "reply", id: string) => Promise<{ voted: boolean; upvotes: number } | null>;
}

function VoteButton({
  type,
  id,
  count,
  ctx,
  size = "sm",
}: {
  type: "thread" | "reply";
  id: string;
  count: number;
  ctx: VoteContext;
  size?: "sm" | "lg";
}) {
  const [state, setState] = useState<{ voted: boolean; count: number } | null>(null);
  const voted = state?.voted ?? ctx.voted.has(id);
  const shown = state?.count ?? count;
  const [busy, setBusy] = useState(false);

  const click = async () => {
    if (busy) return;
    setBusy(true);
    const result = await ctx.onVote(type, id);
    if (result) setState({ voted: result.voted, count: result.upvotes });
    setBusy(false);
  };

  if (size === "lg") {
    return (
      <button
        type="button"
        onClick={click}
        aria-pressed={voted}
        className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors ${
          voted ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/60"
        }`}
      >
        <ChevronUp className="h-4 w-4" strokeWidth={2.5} />
        {voted ? "Upvoted" : "Upvote"}
        <span className={`tabular-nums ${voted ? "" : "text-muted-foreground"}`}>{shown}</span>
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={click}
      aria-pressed={voted}
      className={`inline-flex items-center gap-1 font-medium transition-colors ${voted ? "text-primary" : "hover:text-foreground"}`}
    >
      <ChevronUp className="h-3.5 w-3.5" strokeWidth={2.5} />
      {voted ? "Upvoted" : "Upvote"}
      {shown > 0 && <span className="tabular-nums">({shown})</span>}
    </button>
  );
}

/* ---------- comments ---------- */

function Byline({
  author,
  username,
  headline,
  created,
  small,
}: {
  author: string;
  username?: string;
  headline?: string | null;
  created: string;
  small?: boolean;
}) {
  return (
    <div className={`flex flex-wrap items-baseline gap-x-1.5 ${small ? "text-[13px]" : "text-sm"}`}>
      <AuthorName author={author} username={username} className="font-semibold text-foreground" />
      {headline && <span className="text-muted-foreground">{headline}</span>}
      <span className="text-xs text-muted-foreground/80">· {timeAgo(created)}</span>
    </div>
  );
}

function ReplyCard({
  reply,
  threadId,
  nested,
  replyingToAuthor,
  votes,
}: {
  reply: Reply;
  threadId: string;
  nested?: boolean;
  replyingToAuthor?: string;
  votes: VoteContext;
}) {
  const [composerOpen, setComposerOpen] = useState(false);
  const shareReply = async () => {
    await navigator.clipboard.writeText(`${SITE_URL}/community/${threadId}#${reply.id}`);
    toast.success("Link to comment copied");
  };
  const avatar = nested ? "h-7 w-7 text-[11px]" : "h-9 w-9 text-xs";
  return (
    <div id={reply.id} className={`scroll-mt-24 ${nested ? "pt-4" : "py-5"}`}>
      <div className="flex items-start gap-3">
        <AuthorAvatar src={reply.author_avatar} author={reply.author} className={`${avatar} shrink-0`} />
        <div className="min-w-0 flex-1">
          <Byline author={reply.author} username={reply.author_username} headline={reply.author_headline} created={reply.created_at} small={nested} />
          <div className="mt-1.5">
            {replyingToAuthor && <span className="mr-1 text-sm font-medium text-primary">@{replyingToAuthor}</span>}
            <UserMarkdown compact>{reply.body}</UserMarkdown>
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            <VoteButton type="reply" id={reply.id} count={reply.upvotes ?? 0} ctx={votes} />
            <button type="button" onClick={() => setComposerOpen((v) => !v)} className="inline-flex items-center gap-1 font-medium hover:text-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              {composerOpen ? "Cancel" : "Reply"}
            </button>
            <button type="button" onClick={shareReply} className="inline-flex items-center gap-1 font-medium hover:text-foreground">
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
          </div>
          {composerOpen && (
            <div className="mt-3">
              <ReplyForm threadId={threadId} parentId={reply.id} compact autoFocus onPosted={() => setComposerOpen(false)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReplyForm({
  threadId,
  parentId,
  compact,
  autoFocus,
  onPosted,
}: {
  threadId: string;
  parentId?: string;
  compact?: boolean;
  autoFocus?: boolean;
  onPosted?: () => void;
}) {
  const [body, setBody] = useState("");
  const [focused, setFocused] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const createReply = useCreateReply(threadId);

  const promptSignIn = () =>
    toast.error("Sign in to comment", { action: { label: "Sign in", onClick: () => router.push("/login") } });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return promptSignIn();
    if (!body.trim()) return;
    createReply.mutate(
      { body: body.trim(), ...(parentId ? { parent_id: parentId } : {}) },
      {
        onSuccess: () => {
          setBody("");
          setFocused(false);
          toast.success(parentId ? "Reply posted" : "Comment posted");
          onPosted?.();
        },
        onError: () => toast.error("Could not post. Try again."),
      },
    );
  };

  const expanded = compact || focused || body.length > 0;

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-3">
      {!compact &&
        (user?.avatar ? (
          <AuthorAvatar src={user.avatar} author={user.name || user.username} className="h-9 w-9 shrink-0 text-xs" />
        ) : (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
            <UserRound className="h-4 w-4" />
          </span>
        ))}
      <div className="min-w-0 flex-1 rounded-2xl border border-border bg-card transition-colors focus-within:border-primary/50">
        <Textarea
          placeholder={parentId ? "Write a reply..." : "What do you think?"}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onFocus={() => (isAuthenticated ? setFocused(true) : promptSignIn())}
          readOnly={!isAuthenticated}
          autoFocus={autoFocus}
          rows={expanded ? 3 : 1}
          className="min-h-0 resize-none border-0 bg-transparent px-4 py-3 text-sm shadow-none focus-visible:ring-0"
        />
        {expanded && (
          <div className="flex items-center justify-between border-t border-border px-3 py-2">
            <span className="text-xs text-muted-foreground">Markdown supported</span>
            <button
              type="submit"
              disabled={createReply.isPending || !body.trim()}
              className="inline-flex h-8 items-center rounded-full bg-foreground px-4 text-xs font-medium text-background transition-colors hover:bg-foreground/85 disabled:opacity-40"
            >
              {createReply.isPending ? "Posting..." : parentId ? "Reply" : "Comment"}
            </button>
          </div>
        )}
      </div>
    </form>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function roleOf(profile?: PublicProfile | null) {
  if (!profile?.profession) return "";
  return profile.profession === "Other" && profile.profession_detail ? profile.profession_detail : profile.profession;
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border px-5 py-4 first:border-t-0">
      <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
      <div className="mt-2.5">{children}</div>
    </section>
  );
}

const iconButton =
  "inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground";

function ShareButtons({ title, url }: { title: string; url: string }) {
  const copy = async () => {
    await navigator.clipboard.writeText(url);
    toast.success("Link copied");
  };
  return (
    <div className="-ml-1.5 flex items-center gap-1">
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={iconButton}
        aria-label="Share on X"
        title="Share on X"
      >
        <XIcon className="h-3.5 w-3.5" />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={iconButton}
        aria-label="Share on LinkedIn"
        title="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </a>
      <button type="button" onClick={copy} className={iconButton} aria-label="Copy link" title="Copy link">
        <Link2 className="h-4 w-4" />
      </button>
    </div>
  );
}

const SITE_URL = "https://www.claudeai.directory";

export default function ThreadDetail({
  id,
  initialThread,
  initialReplies,
  authorProfile,
  related = [],
}: {
  id: string;
  initialThread?: Thread;
  initialReplies?: Reply[];
  authorProfile?: PublicProfile | null;
  related?: Thread[];
}) {
  const { data: thread, isLoading: threadLoading } = useThread(id, initialThread);
  const { data: replies, isLoading: repliesLoading } = useReplies(id, initialReplies);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { data: myVotes } = useCommunityVotes(id, isAuthenticated);
  const upvote = useCommunityUpvote(id);
  const votes: VoteContext = {
    voted: new Set(myVotes ?? []),
    onVote: async (type, targetId) => {
      if (!isAuthenticated) {
        toast.error("Sign in to upvote", { action: { label: "Sign in", onClick: () => router.push("/login") } });
        return null;
      }
      try {
        return await upvote.mutateAsync({ type, id: targetId });
      } catch {
        toast.error("Could not save your upvote");
        return null;
      }
    },
  };
  const replyCount = replies?.length ?? thread?.replies ?? 0;
  const role = roleOf(authorProfile);
  const country = countryName(authorProfile?.country);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[1120px] px-4 pb-16 pt-8 md:px-8 md:pt-10">

          {threadLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : thread ? (
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
              <article className="min-w-0">
                <Link href="/community" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Discussions
                </Link>

                <div className="mt-6 flex items-center gap-3">
                  <AuthorAvatar src={thread.author_avatar} author={thread.author} className="h-10 w-10 text-sm" />
                  <Byline author={thread.author} username={thread.author_username} headline={thread.author_headline || role} created={thread.created_at} />
                </div>

                <h1 className="mt-4 text-balance font-sans text-[1.75rem] font-bold leading-tight tracking-tight text-foreground md:text-[2rem]">
                  {thread.title}
                </h1>

                <div className="mt-5 max-w-[72ch] text-[15px] [&_.prose]:text-[15px] [&_.prose]:leading-7 [&_blockquote]:border-l-primary/60 [&_blockquote]:not-italic [&_blockquote_p]:before:content-none [&_blockquote_p]:after:content-none [&_h3]:mt-8 [&_h3]:text-lg [&_li]:my-1">
                  <UserMarkdown>{formatPlainPost(thread.body)}</UserMarkdown>
                </div>

                {thread.tags && thread.tags.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-1.5">
                    {thread.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-2 border-y border-border py-4">
                  <VoteButton type="thread" id={thread.id} count={thread.upvotes ?? 0} ctx={votes} size="lg" />
                  <a href="#comments" className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground hover:border-[var(--cad-line-hover)]">
                    <MessageSquare className="h-4 w-4" />
                    Comment
                    <span className="tabular-nums text-muted-foreground">{replyCount}</span>
                  </a>
                  <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground" title="Views">
                    <Eye className="h-3.5 w-3.5" />
                    {thread.views ?? 0} views
                  </span>
                </div>

                <section id="comments" className="mt-8 scroll-mt-24">
                  <ReplyForm threadId={id} />

                  <h2 className="mt-8 font-sans text-sm font-semibold text-foreground">
                    {replyCount === 0 ? "Comments" : `${replyCount} ${replyCount === 1 ? "comment" : "comments"}`}
                  </h2>

                  {repliesLoading ? (
                    <div className="mt-4 space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (replies ?? []).length > 0 ? (
                    <div className="divide-y divide-border">
                      {(() => {
                        const { nodes, byId } = buildReplyTree(replies ?? []);
                        return nodes.map(({ reply, children }) => (
                          <div key={reply.id} className="py-1">
                            <ReplyCard reply={reply} threadId={id} votes={votes} />
                            {children.length > 0 && (
                              <div className="mb-4 ml-[18px] border-l-2 border-border pl-6">
                                {children.map((child) => {
                                  const directParent =
                                    child.parent_id && child.parent_id !== reply.id ? byId.get(child.parent_id) : undefined;
                                  return (
                                    <ReplyCard
                                      key={child.id}
                                      reply={child}
                                      threadId={id}
                                      nested
                                      replyingToAuthor={directParent?.author}
                                      votes={votes}
                                    />
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ));
                      })()}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">
                      No comments yet. Be the first to share what you think with {thread.author.split(" ")[0]}.
                    </p>
                  )}
                </section>
              </article>

              <aside className="space-y-3 lg:sticky lg:top-24">
                <div className="overflow-hidden rounded-2xl border border-border bg-card">
                  <SidebarSection title="Posted by">
                    <div className="flex items-center gap-3">
                      <AuthorAvatar src={thread.author_avatar} author={thread.author} className="h-10 w-10 text-sm" />
                      <div className="min-w-0 flex-1">
                        <AuthorName author={thread.author} username={thread.author_username} className="block truncate text-sm font-semibold text-foreground" />
                        <p className="truncate text-xs text-muted-foreground">
                          {[role, country].filter(Boolean).join(" · ") ||
                            (authorProfile?.created_at
                              ? `Member since ${new Date(authorProfile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
                              : "Community member")}
                        </p>
                      </div>
                    </div>
                    {authorProfile?.bio && <p className="mt-3 text-sm leading-6 text-foreground/80">{authorProfile.bio}</p>}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="-ml-1.5 flex items-center gap-1">
                        {authorProfile?.twitter && (
                          <a href={`https://x.com/${authorProfile.twitter}`} target="_blank" rel="nofollow ugc noopener noreferrer" className={iconButton} aria-label="X profile">
                            <XIcon className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {authorProfile?.github && (
                          <a href={`https://github.com/${authorProfile.github}`} target="_blank" rel="nofollow ugc noopener noreferrer" className={iconButton} aria-label="GitHub profile">
                            <Github className="h-4 w-4" />
                          </a>
                        )}
                        {authorProfile?.linkedin && (
                          <a href={authorProfile.linkedin} target="_blank" rel="nofollow ugc noopener noreferrer" className={iconButton} aria-label="LinkedIn profile">
                            <Linkedin className="h-4 w-4" />
                          </a>
                        )}
                        {authorProfile?.website && (
                          <a href={authorProfile.website} target="_blank" rel="nofollow ugc noopener noreferrer" className={iconButton} aria-label="Website">
                            <Globe className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      {thread.author_username && (
                        <Link href={`/u/${thread.author_username}`} className="inline-flex items-center gap-1 text-xs font-medium text-foreground hover:text-primary">
                          View profile
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </SidebarSection>

                  <SidebarSection title="Share">
                    <ShareButtons title={thread.title} url={`${SITE_URL}/community/${id}`} />
                  </SidebarSection>

                  {related.length > 0 && (
                    <SidebarSection title="More discussions">
                      <ul className="-mx-2">
                        {related.map((item) => (
                          <li key={item.id}>
                            <Link href={`/community/${item.id}`} className="group block rounded-lg px-2 py-2 transition-colors hover:bg-background">
                              <span className="line-clamp-2 text-sm leading-5 text-foreground group-hover:text-primary">{item.title}</span>
                              <span className="mt-0.5 block text-xs text-muted-foreground">
                                {item.replies} {item.replies === 1 ? "reply" : "replies"} · {timeAgo(item.created_at)}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <Link href="/community" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
                        All discussions
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </SidebarSection>
                  )}
                </div>

                <Link
                  href="/community"
                  className="flex items-center gap-3 rounded-2xl border border-primary/25 bg-primary/[0.06] px-4 py-3.5 transition-colors hover:border-primary/40"
                >
                  <PenSquare className="h-4 w-4 shrink-0 text-primary" />
                  <span className="text-sm">
                    <span className="block font-medium text-foreground">Start a discussion</span>
                    <span className="block text-xs text-muted-foreground">Ask a question or share what you built.</span>
                  </span>
                </Link>
              </aside>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
              <p className="text-sm font-medium text-foreground">This discussion was not found.</p>
              <Link href="/community" className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-3.5 w-3.5" />
                All discussions
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
