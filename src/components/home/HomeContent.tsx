"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import FeaturedResources from "@/components/home/FeaturedResources";
import MCPSection from "@/components/home/MCPSection";
import PromptsSection from "@/components/home/PromptsSection";
import UseCaseCarousel, { type UseCaseBundle } from "@/components/home/UseCaseCarousel";
import type { Stat, Skill, MCPServer, FeedItem, Prompt, Thread, PublicProfile } from "@/types";

interface HomeContentProps {
  initialStats: Stat[];
  initialFeaturedSkills: Skill[];
  initialMcpServers: MCPServer[];
  initialFeedItems: FeedItem[];
  initialPrompts: Prompt[];
  initialThreads: Thread[];
  communityMembers: PublicProfile[];
  memberCount: number;
  useCaseBundles?: UseCaseBundle[];
}

function initials(value?: string) {
  return (value || "?")
    .split(/\s|-/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function MemberAvatar({
  avatar,
  initials: fallback,
  label,
  opacity,
}: {
  avatar?: string;
  initials: string;
  label?: string;
  opacity: number;
}) {
  const [showImage, setShowImage] = useState(Boolean(avatar));

  return (
    <span
      className="flex h-[34px] w-[34px] items-center justify-center overflow-hidden rounded-full bg-[var(--cad-chip)] text-[11px] font-medium text-[var(--cad-accent-hover)]"
      style={{ opacity }}
      title={label}
    >
      {showImage && avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt="" className="h-full w-full object-cover" onError={() => setShowImage(false)} />
      ) : (
        fallback
      )}
    </span>
  );
}

function HomeInner(props: HomeContentProps) {
  const boards = useMemo(() => [
    {
      key: "questions",
      label: "Questions",
      cta: "All discussions",
      href: "/community",
      live: `${props.initialThreads.length.toLocaleString()} live`,
      items: props.initialThreads.slice(0, 3).map((thread) => ({
        mono: initials(thread.author),
        title: thread.title,
        meta: `${thread.tags?.[0] || "Claude"} · ${thread.replies} replies`,
        href: `/community/${thread.id}`,
      })),
    },
    {
      key: "mcp",
      label: "MCP",
      cta: "All MCP servers",
      href: "/mcp",
      live: `${props.initialMcpServers.length.toLocaleString()} listed`,
      items: props.initialMcpServers.slice(0, 3).map((server) => ({
        mono: initials(server.name),
        title: server.name,
        meta: `${server.category || "MCP"} · ${(server.capabilities?.tools?.length ?? 0).toLocaleString()} tools`,
        href: `/mcp/${server.slug || server.id}`,
      })),
    },
    {
      key: "skills",
      label: "Skills",
      cta: "All skills",
      href: "/skills",
      live: `${props.initialFeaturedSkills.length.toLocaleString()} featured`,
      items: props.initialFeaturedSkills.slice(0, 3).map((skill) => ({
        mono: initials(skill.title || skill.name),
        title: skill.title || skill.name,
        meta: `${skill.downloads.toLocaleString()} downloads`,
        href: `/skills/${skill.id}`,
      })),
    },
    {
      key: "prompts",
      label: "Prompts",
      cta: "All prompts",
      href: "/prompts",
      live: `${props.initialPrompts.length.toLocaleString()} shared`,
      items: props.initialPrompts.slice(0, 3).map((prompt) => ({
        mono: initials(prompt.title),
        title: prompt.title,
        meta: `${prompt.upvotes.toLocaleString()} upvotes`,
        href: `/prompts/${prompt.id}`,
      })),
    },
  ].filter((board) => board.items.length > 0), [props.initialThreads, props.initialMcpServers, props.initialFeaturedSkills, props.initialPrompts]);

  const [activeBoard, setActiveBoard] = useState(0);
  const board = boards[activeBoard] ?? boards[0];

  const peopleGrid = props.communityMembers.slice(0, 18).map((member, index) => ({
    id: member.id,
    mono: initials(member.name || member.username),
    avatar: member.avatar,
    label: member.name || member.username,
    dim: index > 11 ? 0.45 : 1,
  }));

  return (
    <>
      <section className="container pb-20 pt-12 md:pb-28 md:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.94fr)_minmax(390px,0.72fr)]">
          <div className="max-w-[720px]">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[13px] font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              The Claude AI Community Hub · 5k+ members
            </div>
            <h1 className="max-w-[12ch] text-balance text-[clamp(38px,8.5vw,48px)] font-medium leading-[1.04] text-foreground md:max-w-[14ch] md:text-[clamp(42px,4.6vw,56px)]">
              The Claude AI Community
            </h1>
            <p className="mt-5 max-w-[58ch] text-pretty text-[16px] leading-[1.7] text-muted-foreground md:text-[17px]">
              A focused Claude AI community for asking questions, comparing workflows,
              and finding the MCP servers, connectors, skills, and prompts builders
              are actually using.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/signup" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-[var(--cad-accent-hover)]">
                Join the community
              </Link>
              <Link href="/community" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-card px-5 text-sm font-medium text-foreground hover:border-primary hover:text-primary">
                Browse discussions
              </Link>
            </div>


            <Link href="/members" className="group mt-7 inline-flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {peopleGrid.slice(0, 6).map((person, index) => (
                  <span
                    key={`${person.id}-${index}`}
                    className="rounded-full ring-2 ring-background"
                  >
                    <MemberAvatar
                      avatar={person.avatar}
                      initials={person.mono}
                      label={person.label}
                      opacity={1}
                    />
                  </span>
                ))}
              </div>
              <span className="text-sm text-muted-foreground group-hover:text-foreground">
                <span className="font-semibold text-foreground">5k+ builders</span> already inside
              </span>
            </Link>
          </div>

          <aside className="relative overflow-hidden rounded-[18px] border border-border bg-card shadow-[0_18px_60px_var(--cad-shadow)]">
            <div className="flex items-center justify-between gap-3 border-b border-border bg-[var(--cad-raised)] px-5 py-4">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--cad-faint)]">Live board</div>
                <div className="mt-1 text-lg font-semibold">Claude builder activity</div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--cad-accent-soft)] px-3 py-1 text-xs font-medium text-[var(--cad-accent-hover)]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--cad-accent-hover)] opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--cad-accent-hover)]" />
                </span>
                Live
              </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-border px-3 pt-3">
              {boards.map((b, i) => (
                <button
                  key={b.key}
                  type="button"
                  onClick={() => setActiveBoard(i)}
                  className={`relative rounded-t-[8px] px-3 py-2 text-[13px] font-medium transition-colors ${
                    i === activeBoard ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {b.label}
                  {i === activeBoard && (
                    <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>

            {/* Active board */}
            <div className="flex min-h-[268px] flex-col p-4">
              <div className="mb-1 flex items-center gap-1.5 px-1 text-xs text-[var(--cad-faint)]">
                <span className="h-1 w-1 rounded-full bg-success" />
                {board.live}
              </div>
              <div className="space-y-0.5">
                {board.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center gap-3 rounded-[10px] p-2.5 hover:bg-[var(--cad-raised)]"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--cad-chip)] text-[11px] font-semibold text-[var(--cad-accent-hover)]">
                      {item.mono}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block line-clamp-1 text-sm font-medium group-hover:text-primary">{item.title}</span>
                      <span className="mt-0.5 block line-clamp-1 text-xs text-[var(--cad-faint)]">{item.meta}</span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 -translate-x-1 text-transparent transition-all group-hover:translate-x-0 group-hover:text-primary" />
                  </Link>
                ))}
              </div>
              <Link
                href={board.href}
                className="mt-auto flex items-center justify-center gap-1.5 rounded-[10px] border border-border py-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {board.cta}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Stats trust strip — uses the site's curated /stats figures. */}
      {props.initialStats.length > 0 && (
        <section className="border-y border-border bg-[var(--cad-raised)]">
          <div className="container grid grid-cols-2 gap-x-6 gap-y-8 py-10 sm:grid-cols-4 md:py-12">
            {props.initialStats.slice(0, 4).map((stat, i) => (
              <div key={stat.label || i} className="text-center sm:text-left">
                <div className="text-[clamp(28px,3.4vw,38px)] font-semibold leading-none text-foreground">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm font-medium text-foreground">{stat.label}</div>
                <div className="mt-0.5 text-[12px] leading-snug text-muted-foreground">{stat.description}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <FeaturedResources initialSkills={props.initialFeaturedSkills} />
      <MCPSection initialServers={props.initialMcpServers} />
      <PromptsSection initialPrompts={props.initialPrompts} />
      <UseCaseCarousel bundles={props.useCaseBundles ?? []} />
    </>
  );
}

function HomeSkeleton() {
  return (
    <div className="mx-auto max-w-[1180px] animate-pulse px-8 py-16">
      <div className="mx-auto mb-5 h-5 w-72 rounded bg-muted" />
      <div className="mx-auto mb-4 h-16 max-w-xl rounded bg-muted" />
      <div className="mx-auto mb-10 h-6 max-w-2xl rounded bg-muted" />
      <div className="h-16 rounded-[10px] border border-border bg-card" />
    </div>
  );
}

export default function HomeContent(props: HomeContentProps) {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeInner {...props} />
    </Suspense>
  );
}
