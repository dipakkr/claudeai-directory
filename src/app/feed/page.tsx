"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronUp,
  Wrench,
  Server,
  FileText,
  Briefcase,
  Rocket,
  BookOpen,
  LinkIcon,
  Newspaper,
} from "lucide-react";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import { useFeed, useUpvoteFeedItem } from "@/hooks/use-feed";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import type { FeedItem } from "@/types";

const typeConfig: Record<string, { label: string; icon: typeof Wrench; href: (id: string) => string; color: string }> = {
  skill: { label: "Skill", icon: Wrench, href: (id) => `/skills/${id}`, color: "text-blue-500" },
  mcp: { label: "MCP", icon: Server, href: (slug) => `/mcp/${slug}`, color: "text-green-500" },
  prompt: { label: "Prompt", icon: FileText, href: (id) => `/prompts/${id}`, color: "text-purple-500" },
  job: { label: "Job", icon: Briefcase, href: (id) => `/jobs/${id}`, color: "text-orange-500" },
  showcase: { label: "Show", icon: Rocket, href: (id) => `/showcase/${id}`, color: "text-pink-500" },
  blog: { label: "Blog", icon: BookOpen, href: (id) => `/resources/${id}`, color: "text-yellow-600" },
  post: { label: "Post", icon: LinkIcon, href: (id) => `/feed#${id}`, color: "text-emerald-500" },
  news: { label: "News", icon: Newspaper, href: () => "#", color: "text-red-500" },
};

const typeFilters = [
  { label: "All", key: undefined },
  { label: "News", key: "news" },
  { label: "Posts", key: "post" },
];

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

function FeedRow({ item, rank }: { item: FeedItem; rank: number }) {
  const config = typeConfig[item.type] || typeConfig.post;
  const Icon = config.icon;
  const { isAuthenticated } = useAuth();
  const upvote = useUpvoteFeedItem();
  const router = useRouter();

  const handleUpvote = () => {
    if (!isAuthenticated) {
      toast.error("Sign in to upvote", {
        action: { label: "Sign in", onClick: () => router.push("/login") },
      });
      return;
    }
    upvote.mutate(
      { type: item.type, id: item.id },
      { onError: () => toast.error("Already upvoted") }
    );
  };

  const titleHref = (item.type === "post" || item.type === "news") && item.url
    ? item.url
    : config.href(item.id);
  const isExternal = (item.type === "post" || item.type === "news") && item.url;

  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="text-xs text-muted-foreground/50 w-5 text-right pt-0.5 shrink-0 font-mono">
        {rank}.
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {isExternal ? (
            <a
              href={titleHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-foreground hover:underline truncate"
            >
              {item.title}
            </a>
          ) : (
            <Link
              href={titleHref}
              className="text-sm font-medium text-foreground hover:underline truncate"
            >
              {item.title}
            </Link>
          )}
          <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${config.color} shrink-0`}>
            <Icon className="h-2.5 w-2.5" />
            {config.label}
          </span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
          {item.description}
        </p>
        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground/60">
          {item.author && <span>{typeof item.author === "object" ? (item.author as { name?: string }).name : item.author}</span>}
          {item.author && <span>·</span>}
          <span>{timeAgo(item.created_at)}</span>
        </div>
      </div>
      <button
        onClick={handleUpvote}
        className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5 hover:text-primary transition-colors group"
      >
        <ChevronUp className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
        <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">{item.points}</span>
      </button>
    </div>
  );
}

export default function FeedPage() {
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const { data: items, isLoading } = useFeed({
    limit: 50,
    type: typeFilter,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-10">
          <PageBreadcrumb items={[{ label: "Feed" }]} />
          <h1 className="text-2xl font-semibold text-foreground mb-1">Latest</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Everything new across the Claude ecosystem.
          </p>

          {/* Type filter pills */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto">
            {typeFilters.map((filter) => (
              <button
                key={filter.label}
                onClick={() => setTypeFilter(filter.key)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  typeFilter === filter.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Feed list */}
          <div className="rounded-lg border border-border bg-card">
            {isLoading ? (
              <div className="divide-y divide-border">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 py-2.5 px-4">
                    <Skeleton className="h-4 w-5 mt-0.5" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-6" />
                  </div>
                ))}
              </div>
            ) : (items ?? []).length > 0 ? (
              <div className="divide-y divide-border px-4">
                {(items ?? []).map((item, i) => (
                  <FeedRow key={`${item.type}-${item.id}`} item={item} rank={i + 1} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="text-sm text-muted-foreground">No items yet.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
