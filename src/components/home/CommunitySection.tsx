"use client";

import Link from "next/link";
import { ArrowUpRight, MessageSquare, PenLine, Users, Lock, MessagesSquare } from "lucide-react";
import { useThreads } from "@/hooks/use-community";
import { Skeleton } from "@/components/ui/skeleton";
import type { Thread, PublicProfile } from "@/types";

function timeAgo(dateStr: string): string {
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((Date.now() - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 2592000)}mo ago`;
}

const steps = [
  {
    icon: MessagesSquare,
    title: "Ask",
    desc: "Post a question about Claude, Claude Code, prompts, or MCP.",
  },
  {
    icon: PenLine,
    title: "Answer",
    desc: "Share what's worked for you and help others get unstuck.",
  },
  {
    icon: Users,
    title: "Connect",
    desc: "Follow the people building the things you want to build.",
  },
];

interface CommunitySectionProps {
  initialThreads?: Thread[];
  members?: PublicProfile[];
  memberCount?: number;
}

const CommunitySection = ({ initialThreads, members = [], memberCount = 0 }: CommunitySectionProps) => {
  const { data: threads, isLoading } = useThreads({ limit: 6 }, initialThreads);
  const list = (threads ?? []).slice(0, 6);
  const avatars = members.slice(0, 6);
  const remaining = Math.max(0, memberCount - avatars.length);

  return (
    <section className="cad-section cad-section-rule">
      <div className="container max-w-6xl">
        {/* Section heading */}
        <div className="mb-7 flex items-end justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              The Claude community
            </div>
            <h2 className="text-2xl font-medium text-foreground md:text-3xl">
              Ask questions. Share what works. Meet the builders.
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
              A community-run forum for people building with Claude — open to read, free to join.
            </p>
          </div>
          <Link
            href="/community"
            className="hidden shrink-0 items-center gap-1 text-sm text-muted-foreground hover:text-primary sm:inline-flex"
          >
            Open the forum <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live discussions */}
          <div className="cad-card overflow-hidden lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <h3 className="text-sm font-semibold text-foreground">Recent discussions</h3>
              <Link href="/community" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            {isLoading && list.length === 0 ? (
              <div className="divide-y divide-border">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-5 py-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                ))}
              </div>
            ) : list.length > 0 ? (
              <div className="divide-y divide-border">
                {list.map((thread) => (
                  <Link
                    key={thread.id}
                    href={`/community/${thread.id}`}
                    className="group flex items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="line-clamp-1 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                        {thread.title}
                      </h4>
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className="h-4 w-4 rounded-full bg-muted flex items-center justify-center text-[9px] font-medium">
                          {thread.author[0]?.toUpperCase()}
                        </span>
                        <span>{thread.author}</span>
                        <span className="text-border">·</span>
                        <span>{timeAgo(thread.created_at)}</span>
                        {thread.tags?.[0] && (
                          <>
                            <span className="text-border">·</span>
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">{thread.tags[0]}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="mt-0.5 flex shrink-0 items-center gap-1 rounded-full bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      <span>{thread.replies}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-5 py-12 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-3">Be the first to start a discussion.</p>
                <Link href="/community" className="text-sm text-primary hover:underline">Start a thread →</Link>
              </div>
            )}
          </div>

          {/* How it works + locked members */}
          <div className="space-y-6">
            <div className="cad-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">How it works</h3>
              <div className="space-y-4">
                {steps.map((s) => (
                  <div key={s.title} className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] border border-border bg-[var(--cad-raised)]">
                      <s.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground">{s.title}</div>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Locked members teaser — identity gated, content stays open */}
            <div className="cad-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Meet the builders</h3>
              </div>
              {avatars.length > 0 && (
                <div className="flex items-center mb-3">
                  <div className="flex -space-x-2">
                    {avatars.map((m) => (
                      <span
                        key={m.id}
                        className="h-8 w-8 rounded-full ring-2 ring-card bg-muted flex items-center justify-center text-[11px] font-medium text-muted-foreground overflow-hidden"
                        title={m.name || m.username}
                      >
                        {m.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.avatar} alt="" className="h-8 w-8 object-cover" />
                        ) : (
                          (m.name || m.username || "?")[0]?.toUpperCase()
                        )}
                      </span>
                    ))}
                  </div>
                  {remaining > 0 && (
                    <span className="ml-2 text-xs text-muted-foreground">+{remaining} more</span>
                  )}
                </div>
              )}
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                {memberCount > 0
                  ? `${memberCount.toLocaleString()} people are building with Claude here. Sign in to see profiles and connect.`
                  : "Sign in to see member profiles and connect with people building with Claude."}
              </p>
              <Link
                href="/signup"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Lock className="h-3.5 w-3.5" />
                Join to connect
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
