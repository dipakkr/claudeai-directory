import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Bot, Server, Sparkles } from "lucide-react";
import DirectoryList from "@/components/directory/DirectoryList";
import RecentlyViewed from "@/components/directory/RecentlyViewed";
import CoursesSection from "@/components/home/CoursesSection";
import { compactNumber, type DirectoryItem, type SortKey } from "@/lib/directory";
import type { PublicProfile } from "@/types";

interface HomeContentProps {
  items: DirectoryItem[];
  orders: Record<SortKey, string[]>;
  launches: ReactNode;
  community: ReactNode;
  members: PublicProfile[];
  memberCount: number;
}

const BROWSE = [
  {
    type: "skill" as const,
    href: "/skills",
    title: "Claude Skills",
    body: "Folders of instructions and scripts that teach Claude a specific job.",
    Icon: Sparkles,
  },
  {
    type: "mcp" as const,
    href: "/mcp",
    title: "MCP Servers",
    body: "Connect Claude Code to your tools, data and services.",
    Icon: Server,
  },
  {
    type: "agent" as const,
    href: "/agents",
    title: "Claude Agents",
    body: "Specialized subagents for reviewing, testing, debugging and more.",
    Icon: Bot,
  },
];

function HeroMemberStrip({ members, total }: { members: PublicProfile[]; total: number }) {
  const preview = members.slice(0, 8);
  if (preview.length === 0) return null;

  const remaining = Math.max(0, total - preview.length);

  return (
    <Link
      href="/members"
      aria-label="Meet Claude community members"
      className="mx-auto mt-7 flex w-fit max-w-full items-center justify-center transition-opacity hover:opacity-85"
    >
      <span className="flex -space-x-2">
        {preview.map((member) => {
          const label = member.name || member.username;
          return (
            <span
              key={member.id}
              title={label}
              className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-background bg-muted text-[12px] font-medium text-muted-foreground ring-1 ring-border"
            >
              {member.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element -- member avatars are remote user-provided URLs
                <img src={member.avatar} alt="" className="h-full w-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
              ) : (
                label[0]?.toUpperCase()
              )}
            </span>
          );
        })}
      </span>
      {remaining > 0 && (
        <span className="ml-3 shrink-0 text-sm text-muted-foreground">
          {/* Product decision: show "1k+" until the real count passes it. */}
          {remaining >= 1000 ? `+${compactNumber(remaining)}` : "1k+"} more
        </span>
      )}
    </Link>
  );
}

export default function HomeContent({ items, orders, launches, community, members, memberCount }: HomeContentProps) {
  const count = (type: DirectoryItem["type"]) => items.filter((i) => i.type === type).length;

  return (
    <>
      <section className="mx-auto max-w-[1180px] px-4 pb-12 pt-10 text-center md:px-8 md:pt-14">
        <h1 className="mx-auto max-w-[19ch] text-balance text-[40px] font-normal leading-[1.04] text-foreground md:text-[60px]">
          Discover the best resources for <em className="text-primary">Claude</em>
        </h1>
        <p className="mx-auto mt-6 max-w-[52ch] text-pretty text-[16px] leading-relaxed text-muted-foreground md:text-[17px]">
          Discover community-built Claude Skills, MCP servers and Agents. Find what is trending or publish something you
          built.
        </p>
        <HeroMemberStrip members={members} total={memberCount} />
        <div className="mt-7 flex flex-wrap justify-center gap-2.5">
          <a
            href="#trending"
            className="inline-flex h-10 items-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/85"
          >
            Explore Trending
          </a>
          <Link
            href="/submit"
            className="inline-flex h-10 items-center rounded-full border border-border px-5 text-sm text-foreground transition-colors hover:border-[var(--cad-line-hover)]"
          >
            Submit a Resource
          </Link>
        </div>
        <nav aria-label="Explore the community" className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <a href="#launches" className="py-2 hover:text-foreground">App launches</a>
          <a href="#community" className="py-2 hover:text-foreground">Community Q&amp;A</a>
          <Link href="/members" className="py-2 hover:text-foreground">Meet the builders</Link>
        </nav>
      </section>

      <section className="mx-auto max-w-[840px] px-4 md:px-8">
        <DirectoryList items={items} orders={orders} showTypeFilter hideSearch feedId="trending" pageSize={8} />
      </section>

      <CoursesSection />

      {launches}

      {community}

      <section className="mx-auto mt-10 max-w-[840px] px-4 md:px-8">
        <RecentlyViewed />
      </section>

      <section className="mx-auto mt-20 max-w-[840px] px-4 md:px-8">
        <div className="grid gap-3 sm:grid-cols-3">
          {BROWSE.map(({ type, href, title, body, Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col rounded-xl border border-border p-5 transition-colors hover:border-[var(--cad-line-hover)]"
            >
              <span className="flex items-center justify-between">
                <Icon className="h-4 w-4 text-primary" />
                <span className="font-mono text-[12px] text-muted-foreground">{count(type)}</span>
              </span>
              <span className="mt-4 text-[15px] text-foreground group-hover:text-primary">{title}</span>
              <span className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{body}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-[840px] px-4 md:px-8">
        <div className="flex flex-col items-start gap-5 rounded-xl border border-border bg-card/40 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[15px] text-foreground">Built something for Claude?</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Publish your Skill, MCP or Agent and make it easy to discover and install.
            </p>
          </div>
          <Link
            href="/submit"
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/85"
          >
            Submit a Resource
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </>
  );
}
