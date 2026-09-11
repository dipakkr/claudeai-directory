import Link from "next/link";
import { ArrowRight, Bot, Server, Sparkles } from "lucide-react";
import DirectoryList from "@/components/directory/DirectoryList";
import RecentlyViewed from "@/components/directory/RecentlyViewed";
import type { DirectoryItem, SortKey } from "@/lib/directory";

interface HomeContentProps {
  items: DirectoryItem[];
  orders: Record<SortKey, string[]>;
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

export default function HomeContent({ items, orders }: HomeContentProps) {
  const count = (type: DirectoryItem["type"]) => items.filter((i) => i.type === type).length;

  return (
    <>
      <section className="mx-auto max-w-[1180px] px-4 pb-12 pt-16 text-center md:px-8 md:pt-24">
        <h1 className="mx-auto max-w-[19ch] text-balance text-[clamp(40px,6.2vw,68px)] font-normal leading-[1.04] text-foreground">
          Discover the best resources for <em className="text-primary">Claude</em>
        </h1>
        <p className="mx-auto mt-6 max-w-[52ch] text-pretty text-[16px] leading-relaxed text-muted-foreground md:text-[17px]">
          Discover community-built Claude Skills, MCP servers and Agents. Find what is trending or publish something you
          built.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2.5">
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
      </section>

      <section className="mx-auto max-w-[840px] px-4 md:px-8">
        <DirectoryList items={items} orders={orders} showTypeFilter feedId="trending" />
      </section>

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
