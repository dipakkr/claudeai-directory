"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Eye, ChevronUp, Clock } from "lucide-react";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import { useThread, useReplies, useCreateReply } from "@/hooks/use-community";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import type { Reply } from "@/types";

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

function ReplyCard({ reply }: { reply: Reply }) {
  return (
    <div className="py-4">
      <div className="flex items-start gap-3">
        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[11px] font-medium text-muted-foreground shrink-0 mt-0.5">
          {reply.author_avatar ? (
            <img src={reply.author_avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
          ) : (
            reply.author[0]?.toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1.5">
            <span className="font-medium text-foreground">{reply.author}</span>
            <span className="text-border">·</span>
            <span>{timeAgo(reply.created_at)}</span>
          </div>
          <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
            {reply.body}
          </div>
          {reply.upvotes > 0 && (
            <div className="flex items-center gap-1 mt-2 text-[11px] text-muted-foreground">
              <ChevronUp className="h-3 w-3" />
              <span>{reply.upvotes}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReplyForm({ threadId }: { threadId: string }) {
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
      { body: body.trim() },
      {
        onSuccess: () => {
          setBody("");
          toast.success("Reply posted!");
        },
        onError: () => toast.error("Failed to post reply"),
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder={isAuthenticated ? "Write a reply..." : "Sign in to reply..."}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="text-sm min-h-[80px]"
        disabled={!isAuthenticated}
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" className="text-sm" disabled={createReply.isPending || !isAuthenticated}>
          {createReply.isPending ? "Posting..." : "Reply"}
        </Button>
      </div>
    </form>
  );
}

export default function ThreadDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: thread, isLoading: threadLoading } = useThread(id);
  const { data: replies, isLoading: repliesLoading } = useReplies(id);

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
                <h1 className="text-xl font-semibold text-foreground mb-3">
                  {thread.title}
                </h1>

                <div className="flex items-center gap-2 mb-4">
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                    {thread.author_avatar ? (
                      <img src={thread.author_avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
                    ) : (
                      thread.author[0]?.toUpperCase()
                    )}
                  </div>
                  <span className="text-sm font-medium text-foreground">{thread.author}</span>
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
                  <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {thread.body}
                  </div>
                </div>

                {/* Replies */}
                <div className="mb-6">
                  <h2 className="text-sm font-semibold text-foreground mb-1">
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
                    {(replies ?? []).map((reply) => (
                      <ReplyCard key={reply.id} reply={reply} />
                    ))}
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
