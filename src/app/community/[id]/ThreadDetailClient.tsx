"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronUp } from "lucide-react";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import UserMarkdown from "@/components/shared/UserMarkdown";
import { useThread, useReplies, useCreateReply } from "@/hooks/use-community";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import type { Reply, Thread } from "@/types";

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

export default function ThreadDetail({
  id,
  initialThread,
  initialReplies,
}: {
  id: string;
  initialThread?: Thread;
  initialReplies?: Reply[];
}) {
  const { data: thread, isLoading: threadLoading } = useThread(id, initialThread);
  const { data: replies, isLoading: repliesLoading } = useReplies(id, initialReplies);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-10">
          <PageBreadcrumb items={[
            { label: "Community", href: "/community" },
            { label: thread?.title || "..." },
          ]} />

          {threadLoading ? (
            <div className="flex gap-8">
              <div className="flex-1 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-32 w-full" />
              </div>
              <div className="hidden lg:block w-72 shrink-0">
                <Skeleton className="h-48 rounded-xl" />
              </div>
            </div>
          ) : thread ? (
            <div className="flex gap-8">
              {/* Main content */}
              <div className="flex-1 min-w-0">
                {/* Thread header */}
                <h1 className="text-2xl font-normal leading-tight text-foreground mb-3 sm:text-3xl">
                  {thread.title}
                </h1>

                <div className="flex items-center gap-2 mb-4">
                  <AuthorAvatar src={thread.author_avatar} author={thread.author} className="h-6 w-6 text-[10px]" />
                  <AuthorName
                    author={thread.author}
                    username={thread.author_username}
                    className="text-sm font-medium text-foreground"
                  />
                  <span className="text-xs text-muted-foreground">{timeAgo(thread.created_at)}</span>
                </div>

                {thread.tags && thread.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {thread.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Thread body */}
                <div className="rounded-lg border border-border bg-card p-5 mb-8">
                  <UserMarkdown>{thread.body}</UserMarkdown>
                </div>

                {/* Replies */}
                <div className="mb-6">
                  <h2 className="font-sans text-sm font-semibold text-foreground mb-1">
                    {thread.replies} {thread.replies === 1 ? "Reply" : "Replies"}
                  </h2>
                </div>

                {/* Reply form */}
                <div className="mb-6">
                  <ReplyForm threadId={id} />
                </div>

                {/* Reply list */}
                {repliesLoading ? (
                  <div className="divide-y divide-border">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="py-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-7 w-7 rounded-full" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : (replies ?? []).length > 0 ? (
                  <div className="divide-y divide-border">
                    {(() => {
                      const { nodes, byId } = buildReplyTree(replies ?? []);
                      return nodes.map(({ reply, children }) => (
                        <div key={reply.id}>
                          <ReplyCard reply={reply} threadId={id} />
                          {children.length > 0 && (
                            <div className="ml-4 sm:ml-8 border-l border-border/80 pl-3.5 transition-colors hover:border-border">
                              {children.map((child) => {
                                const directParent =
                                  child.parent_id && child.parent_id !== reply.id
                                    ? byId.get(child.parent_id)
                                    : undefined;
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
                  <div className="py-8 text-center">
                    <p className="text-xs text-muted-foreground">No replies yet. Be the first!</p>
                  </div>
                )}
              </div>

              {/* Right sidebar */}
              <div className="hidden lg:block w-72 shrink-0">
                <div className="sticky top-20 space-y-4">
                  {/* Back to community */}
                  <div className="rounded-xl border border-border bg-card p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-2">Community</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      Browse more discussions and connect with others.
                    </p>
                    <Link href="/community">
                      <Button variant="outline" className="w-full text-sm">
                        All Discussions
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Thread not found.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
