"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, Users, Search, Eye, Tag } from "lucide-react";
import { useThreads, useCreateThread } from "@/hooks/use-community";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const popularTags = ["API", "Agents", "Prompting", "MCP", "Code Generation", "RAG", "Production", "Benchmarks"];

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

function NewThreadDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const createThread = useCreateThread();
  const router = useRouter();

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("Please fill in title and body");
      return;
    }
    createThread.mutate(
      { title: title.trim(), body: body.trim(), tags },
      {
        onSuccess: (thread) => {
          toast.success("Thread created!");
          setTitle("");
          setBody("");
          setTags([]);
          onOpenChange(false);
          router.push(`/community/${thread.id}`);
        },
        onError: () => toast.error("Failed to create thread"),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Start a new discussion</DialogTitle>
          <DialogDescription>
            Share a question, idea, or start a conversation with the community.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="thread-title" className="text-xs">Title</Label>
            <Input
              id="thread-title"
              placeholder="e.g., How do you handle long conversations with Claude?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="thread-body" className="text-xs">Body</Label>
            <Textarea
              id="thread-body"
              placeholder="Share details, context, or your question..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="text-sm min-h-[120px]"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Tags (up to 5)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                className="text-sm flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={addTag}>Add</Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t) => (
                  <Badge
                    key={t}
                    variant="secondary"
                    className="text-xs cursor-pointer"
                    onClick={() => setTags(tags.filter((x) => x !== t))}
                  >
                    {t} &times;
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <Button type="submit" className="w-full text-sm" disabled={createThread.isPending}>
            {createThread.isPending ? "Creating..." : "Create Thread"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CommunityPage() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | undefined>(undefined);
  const { data: threads, isLoading } = useThreads({
    search: search || undefined,
    tag: activeTag,
  });
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleNewThread = () => {
    if (!isAuthenticated) {
      toast.error("Sign in to start a discussion", {
        action: { label: "Sign in", onClick: () => router.push("/login") },
      });
      return;
    }
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-2">Community</h1>
              <p className="text-sm text-muted-foreground">Discussions from Claude enthusiasts</p>
            </div>
            <Button size="sm" onClick={handleNewThread} className="text-sm gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              New Thread
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search discussions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Tag filters */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto">
            <button
              onClick={() => setActiveTag(undefined)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap ${
                !activeTag
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {popularTags.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTag(activeTag === t ? undefined : t)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap ${
                  activeTag === t
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Two-column layout */}
          <div className="flex gap-8">
            {/* Thread list */}
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="divide-y divide-border border-t border-border">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="py-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  ))}
                </div>
              ) : (threads ?? []).length > 0 ? (
                <div className="divide-y divide-border border-t border-border">
                  {(threads ?? []).map((thread) => (
                    <Link
                      key={thread.id}
                      href={`/community/${thread.id}`}
                      className="group block py-4 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {thread.title}
                          </h3>
                          {thread.body && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {thread.body}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {thread.tags && thread.tags.length > 0 && (
                              <div className="flex items-center gap-1">
                                {thread.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-2">
                            <span className="h-4 w-4 rounded-full bg-muted flex items-center justify-center text-[9px] font-medium text-muted-foreground shrink-0">
                              {thread.author[0]?.toUpperCase()}
                            </span>
                            <span>{thread.author}</span>
                            <span className="text-border">·</span>
                            <span>{timeAgo(thread.created_at)}</span>
                            {thread.views > 0 && (
                              <>
                                <span className="text-border">·</span>
                                <span className="flex items-center gap-0.5">
                                  <Eye className="h-3 w-3" />
                                  {thread.views}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 bg-muted/50 rounded-full px-2.5 py-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{thread.replies}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No discussions found.</p>
                </div>
              )}
            </div>

            {/* Right sidebar */}
            <div className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-20 space-y-4">
                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Community Guidelines</h3>
                  </div>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li>Be respectful and constructive</li>
                    <li>Share knowledge and help others</li>
                    <li>No spam or self-promotion</li>
                    <li>Stay on topic — Claude & AI</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Popular Topics</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {popularTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setActiveTag(activeTag === tag ? undefined : tag)}
                        className={`px-2 py-0.5 rounded-full text-[11px] transition-colors ${
                          activeTag === tag
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Start a discussion</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Ask questions, share ideas, or start a conversation.
                  </p>
                  <Button variant="outline" className="w-full text-sm" onClick={handleNewThread}>
                    New Thread
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <NewThreadDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
