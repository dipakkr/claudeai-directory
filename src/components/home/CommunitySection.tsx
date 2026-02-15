"use client";

import Link from "next/link";
import { ArrowUpRight, MessageSquare, TrendingUp } from "lucide-react";
import { useThreads } from "@/hooks/use-community";
import { Skeleton } from "@/components/ui/skeleton";

const CommunitySection = () => {
  const { data: threads, isLoading } = useThreads({ limit: 5 });

  return (
    <section className="py-10">
      <div className="container max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium text-foreground">Recent Discussions</h2>
          <Link
            href="/community"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="divide-y divide-border border-t border-b border-border">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="py-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-40" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border border-t border-b border-border">
            {(threads ?? []).slice(0, 5).map((thread) => (
              <Link
                key={thread.id}
                href={`/community/${thread.id}`}
                className="group flex items-center justify-between gap-4 py-3.5 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm text-foreground group-hover:text-primary transition-colors truncate">
                    {thread.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1">
                    <span className="h-4 w-4 rounded-full bg-muted flex items-center justify-center text-[9px] font-medium text-muted-foreground">
                      {thread.author[0]?.toUpperCase()}
                    </span>
                    <span>{thread.author}</span>
                    <span className="text-border">·</span>
                    <span>{new Date(thread.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <MessageSquare className="h-3 w-3" />
                  <span>{thread.replies}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CommunitySection;
