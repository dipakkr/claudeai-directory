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
import { MessageSquare, Plus, Users, Search, Tag, ArrowRight } from "lucide-react";
import { useThreads, useCreateThread } from "@/hooks/use-community";
import { useSignIn } from "@/components/auth/SignInDialog";
import { toast } from "sonner";
import type { Thread } from "@/types";
import { track } from "@/lib/analytics";

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
          track("community_posted", { kind: "discussion", tag: tags[0] });
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

export default function CommunityClient({
  initialThreads,
  initialSearch = "",
}: {
  initialThreads: Thread[];
  initialSearch?: string;
}) {
  const [search, setSearch] = useState(initialSearch);
  const [activeTag, setActiveTag] = useState<string | undefined>(undefined);
  // Only seed the query with server data for the default (unfiltered) view so a
  // search/tag change refetches instead of showing the initial list.
  const isInitialView = search === initialSearch && !activeTag;
  const { data: threads, isLoading } = useThreads(
    { search: search || undefined, tag: activeTag },
    isInitialView ? initialThreads : undefined
  );
  const { requireAuth } = useSignIn();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleNewThread = () =>
    void requireAuth("start a discussion", () => setDialogOpen(true), { afterOnboarding: true });

  return (
    <div className="cad-shell flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-3 px-8 pb-[34px] pt-[60px]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[62ch]">
              <h1 className="text-[clamp(32px,4vw,42px)] font-medium leading-[1.08]">Claude Forum &amp; Community</h1>
              <p className="mt-3 text-base leading-[1.6] text-muted-foreground">
                Ask questions, share workflows, and connect with people building with Claude.
              </p>
            </div>
            <Button size="sm" onClick={handleNewThread} className="text-sm gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              New Thread
            </Button>
          </div>

          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search discussions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-[10px] border border-border bg-card py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-[var(--cad-line-hover)] focus:outline-none"
            />
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTag(undefined)}
              className={`cad-chip whitespace-nowrap px-3.5 text-[13px] ${
                !activeTag
                  ? "cad-chip-active"
                  : "bg-card hover:border-primary hover:text-primary"
              }`}
            >
              All
            </button>
            {popularTags.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTag(activeTag === t ? undefined : t)}
                className={`cad-chip whitespace-nowrap px-3.5 text-[13px] ${
                  activeTag === t
                    ? "cad-chip-active"
                    : "bg-card hover:border-primary hover:text-primary"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

        </div>

        <div className="mx-auto flex max-w-[1180px] gap-8 px-8 pb-[88px]">
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
                      className="group flex items-start gap-3.5 py-[18px] transition-opacity hover:opacity-80"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--cad-chip)] text-sm font-medium text-[var(--cad-accent-hover)]">
                        {thread.author[0]?.toUpperCase()}
                      </div>
                      <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-[17px] font-medium leading-snug text-foreground">
                            {thread.title}
                          </h3>
                          {thread.body && (
                            <p className="mt-1.5 line-clamp-2 text-[14.5px] leading-[1.55] text-muted-foreground">
                              {thread.body}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-2">
                            {thread.tags && thread.tags.length > 0 && (
                              <div className="flex items-center gap-1">
                                {thread.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-2">
                            <span>{thread.author}</span>
                            <span className="text-border">·</span>
                            <span>{timeAgo(thread.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-[var(--cad-raised)] px-2.5 py-1 text-xs text-muted-foreground">
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
                <div className="cad-card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Community Guidelines</h3>
                  </div>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li>Be respectful and constructive</li>
                    <li>Share knowledge and help others</li>
                    <li>No spam or self-promotion</li>
                    <li>Stay on topic: Claude &amp; AI</li>
                  </ul>
                </div>

                <div className="cad-card p-5">
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
                            ? "bg-foreground text-background"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="cad-card p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Start a discussion</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Ask questions, share ideas, or start a conversation.
                  </p>
                  <Button variant="outline" className="w-full text-sm" onClick={handleNewThread}>
                    New Thread
                  </Button>
                </div>

                <Link
                  href="/members"
                  className="cad-card group flex items-center justify-between p-5"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">Meet the Members</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Browse everyone in the community.
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" />
                </Link>
              </div>
            </div>
        </div>
      </main>
      <Footer />
      <NewThreadDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
