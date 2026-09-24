"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ChevronUp, Eye, Link2, Linkedin, MessageSquare, PenSquare } from "lucide-react";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import UserMarkdown from "@/components/shared/UserMarkdown";
import { useThread, useReplies, useCreateReply } from "@/hooks/use-community";
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

function ReplyCard({
  reply,
  threadId,
  nested,
  replyingToAuthor,
}: {
  reply: Reply;
  threadId: string;
  nested?: boolean;
  replyingToAuthor?: string;
}) {
  const [composerOpen, setComposerOpen] = useState(false);
  return (
    <div className={nested ? "py-2.5" : "py-4"}>
      <div className="flex items-start gap-3">
        <div className={`${nested ? "h-6 w-6 text-[10px]" : "h-7 w-7 text-[11px]"} shrink-0 mt-0.5`}>
          <AuthorAvatar src={reply.author_avatar} author={reply.author} className={nested ? "h-6 w-6 text-[10px]" : "h-7 w-7 text-[11px]"} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1.5">
            <AuthorName
              author={reply.author}
              username={reply.author_username}
              className="font-medium text-foreground"
            />
            {replyingToAuthor && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">
                ↳ @{replyingToAuthor}
              </span>
            )}
            <span className="text-border">·</span>
            <span>{timeAgo(reply.created_at)}</span>
          </div>
          <UserMarkdown compact>{reply.body}</UserMarkdown>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
            {reply.upvotes > 0 && (
              <span className="flex items-center gap-1">
                <ChevronUp className="h-3 w-3" />
                {reply.upvotes}
              </span>
            )}
            <button
              type="button"
              onClick={() => setComposerOpen((v) => !v)}
              className="font-medium hover:text-foreground transition-colors"
            >
              {composerOpen ? "Cancel" : "Reply"}
            </button>
          </div>
          {composerOpen && (
            <div className="mt-3">
              <ReplyForm
                threadId={threadId}
                parentId={reply.id}
                compact
                autoFocus
                onPosted={() => setComposerOpen(false)}
              />
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
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const createReply = useCreateReply(threadId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Sign in to reply", {
        action: { label: "Sign in", onClick: () => router.push("/login") },
      });
      return;
    }
    if (!body.trim()) {
      toast.error("Please write a reply");
      return;
    }
    createReply.mutate(
      { body: body.trim(), ...(parentId ? { parent_id: parentId } : {}) },
      {
        onSuccess: () => {
          setBody("");
          toast.success("Reply posted!");
          onPosted?.();
        },
        onError: () => toast.error("Failed to post reply"),
      }
    );
  };

  if (!isAuthenticated && !compact) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-border bg-card/50 px-5 py-4">
        <p className="text-sm text-muted-foreground">Sign in to join the discussion and reply.</p>
        <Link href="/login" className="inline-flex h-9 items-center rounded-full bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/85">
          Sign in to reply
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        placeholder={isAuthenticated ? "Write a reply..." : "Sign in to reply..."}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className={compact ? "text-sm min-h-[60px]" : "text-sm min-h-[80px]"}
        disabled={!isAuthenticated}
        autoFocus={autoFocus}
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" className="text-sm" disabled={createReply.isPending || !isAuthenticated}>
          {createReply.isPending ? "Posting..." : "Reply"}
        </Button>
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

function SidebarCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function ShareButtons({ title, url }: { title: string; url: string }) {
  const copy = async () => {
    await navigator.clipboard.writeText(url);
    toast.success("Link copied");
  };
  const button =
    "inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-background text-sm text-foreground transition-colors hover:border-[var(--cad-line-hover)]";
  return (
    <div className="flex gap-2">
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={button}
        aria-label="Share on X"
      >
        <XIcon className="h-3.5 w-3.5" />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={button}
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </a>
      <button type="button" onClick={copy} className={button} aria-label="Copy link">
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
  const replyCount = replies?.length ?? thread?.replies ?? 0;
  const role = roleOf(authorProfile);
  const country = countryName(authorProfile?.country);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[1120px] px-4 pb-16 pt-8 md:px-8 md:pt-10">
          <PageBreadcrumb items={[{ label: "Community", href: "/community" }, { label: thread?.title || "..." }]} />

          {threadLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : thread ? (
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
              <article className="min-w-0">
                {thread.tags && thread.tags.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {thread.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <h1 className="text-balance text-3xl font-semibold leading-tight text-foreground md:text-[2.5rem]">{thread.title}</h1>

                <div className="mt-5 flex flex-wrap items-center gap-3 border-b border-border pb-6">
                  <AuthorAvatar src={thread.author_avatar} author={thread.author} className="h-10 w-10 text-sm" />
                  <div className="min-w-0">
                    <AuthorName author={thread.author} username={thread.author_username} className="text-sm font-semibold text-foreground" />
                    <p className="text-xs text-muted-foreground">
                      {[role, timeAgo(thread.created_at)].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5" title="Views">
                      <Eye className="h-3.5 w-3.5" />
                      {thread.views ?? 0}
                    </span>
                    <a href="#replies" className="inline-flex items-center gap-1.5 hover:text-foreground" title="Replies">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {replyCount}
                    </a>
                  </div>
                </div>

                <div className="mt-6 max-w-[72ch] text-[15px] [&_.prose]:text-[15px] [&_.prose]:leading-7 [&_blockquote]:border-l-primary/60 [&_blockquote]:not-italic [&_blockquote_p]:before:content-none [&_blockquote_p]:after:content-none [&_h3]:mt-8 [&_h3]:text-lg [&_li]:my-1">
                  <UserMarkdown>{formatPlainPost(thread.body)}</UserMarkdown>
                </div>

                <section id="replies" className="mt-12 scroll-mt-24 border-t border-border pt-8">
                  <h2 className="font-sans text-lg font-semibold text-foreground">
                    {replyCount === 0 ? "Replies" : `${replyCount} ${replyCount === 1 ? "reply" : "replies"}`}
                  </h2>

                  <div className="mt-4">
                    <ReplyForm threadId={id} />
                  </div>

                  {repliesLoading ? (
                    <div className="mt-6 space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (replies ?? []).length > 0 ? (
                    <div className="mt-4 divide-y divide-border">
                      {(() => {
                        const { nodes, byId } = buildReplyTree(replies ?? []);
                        return nodes.map(({ reply, children }) => (
                          <div key={reply.id}>
                            <ReplyCard reply={reply} threadId={id} />
                            {children.length > 0 && (
                              <div className="ml-4 border-l border-border/80 pl-3.5 transition-colors hover:border-border sm:ml-8">
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
                    <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-10 text-center">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <MessageSquare className="h-4 w-4" />
                      </span>
                      <p className="mt-3 text-sm font-medium text-foreground">No replies yet</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Be the first to reply to {thread.author.split(" ")[0]}. Questions and experiences both help.
                      </p>
                    </div>
                  )}
                </section>
              </article>

              <aside className="space-y-4 lg:sticky lg:top-24">
                <SidebarCard title="Posted by">
                  <div className="flex items-center gap-3">
                    <AuthorAvatar src={thread.author_avatar} author={thread.author} className="h-11 w-11 text-sm" />
                    <div className="min-w-0">
                      <AuthorName author={thread.author} username={thread.author_username} className="block truncate text-sm font-semibold text-foreground" />
                      {(role || country) && (
                        <p className="truncate text-xs text-muted-foreground">{[role, country].filter(Boolean).join(" · ")}</p>
                      )}
                    </div>
                  </div>
                  {authorProfile?.bio && <p className="mt-3 text-sm leading-6 text-muted-foreground">{authorProfile.bio}</p>}
                  {thread.author_username && (
                    <Link
                      href={`/u/${thread.author_username}`}
                      className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-full border border-border text-sm font-medium text-foreground hover:border-[var(--cad-line-hover)]"
                    >
                      View profile
                    </Link>
                  )}
                </SidebarCard>

                <SidebarCard title="Share this discussion">
                  <ShareButtons title={thread.title} url={`${SITE_URL}/community/${id}`} />
                </SidebarCard>

                {related.length > 0 && (
                  <SidebarCard title="More discussions">
                    <ul className="-my-1 divide-y divide-border">
                      {related.map((item) => (
                        <li key={item.id}>
                          <Link href={`/community/${item.id}`} className="group block py-2.5">
                            <span className="line-clamp-2 text-sm text-foreground group-hover:text-primary">{item.title}</span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {item.replies} {item.replies === 1 ? "reply" : "replies"} · {timeAgo(item.created_at)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </SidebarCard>
                )}

                <Link
                  href="/community"
                  className="flex items-center gap-3 rounded-2xl border border-primary/25 bg-primary/[0.06] p-4 transition-colors hover:border-primary/40"
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
