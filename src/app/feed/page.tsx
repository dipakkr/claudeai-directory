import type { Metadata } from "next";
import Link from "next/link";
import { AtSign, BookOpen, Briefcase, Flame, Home, PenSquare, Rocket, Users } from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import { CollectionPageSchema } from "@/components/seo/JsonLd";
import { FeedClient } from "@/components/feed/FeedClient";
import { FEED_PAGE_SIZE } from "@/lib/feed";
import { fetchApi } from "@/lib/api-server";
import type { PublicProfile, ShowcaseProject, Thread } from "@/types";
import { FeedSidebar } from "@/components/feed/FeedSidebar";
import { rankedLaunches } from "@/lib/home-community";
import { FromX, type FromXParams } from "./FromX";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.claudeai.directory";
const TITLE = "Claude Community Feed & Forum";
const DESCRIPTION =
  "Posts, questions and discussions from people building with Claude, Claude Code and MCP. Share what you built, ask the community, and see the best tweets about Claude.";

type Params = FromXParams & { tab?: string };
type Tab = "latest" | "popular" | "x";

const TABS: { id: Tab; label: string; href: string }[] = [
  { id: "latest", label: "Latest", href: "/feed" },
  { id: "popular", label: "Popular", href: "/feed?tab=popular" },
  { id: "x", label: "From X", href: "/feed?tab=x" },
];

function tabOf(params: Params): Tab {
  if (params.tab === "popular" || params.tab === "x") return params.tab;
  // Old tweet-feed links (?view=top, ?source=community) land on the X tab.
  if (params.view || params.source) return "x";
  return "latest";
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<Params> }): Promise<Metadata> {
  const params = await searchParams;
  const filtered = Object.values(params).some(Boolean);
  return {
    title: { absolute: TITLE },
    description: DESCRIPTION,
    alternates: { canonical: "/feed" },
    // Only the default view is indexable. Tab, filter and page URLs are not.
    robots: filtered ? { index: false, follow: true } : undefined,
    openGraph: { title: TITLE, description: DESCRIPTION, url: "/feed" },
  };
}

const TAB_ICONS: Record<Tab, typeof Home> = { latest: Home, popular: Flame, x: AtSign };

const MORE_LINKS = [
  { href: "/launches", label: "Launches", icon: Rocket },
  { href: "/members", label: "Members", icon: Users },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/guides", label: "Guides", icon: BookOpen },
];

function LeftNav({ tab }: { tab: Tab }) {
  const item = "flex h-8 items-center gap-2.5 rounded-[4px] px-2.5 text-[13px] transition-colors";
  return (
    <aside className="hidden lg:sticky lg:top-24 lg:block">
      <nav aria-label="Feed" className="space-y-0.5">
        {TABS.map((t) => {
          const Icon = TAB_ICONS[t.id];
          const active = tab === t.id;
          return (
            <Link
              key={t.id}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={`${item} ${active ? "bg-card font-medium text-foreground ring-1 ring-border" : "text-muted-foreground hover:bg-card hover:text-foreground"}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </Link>
          );
        })}
      </nav>
      <div className="my-3 border-t border-border" />
      <nav aria-label="Explore" className="space-y-0.5">
        {MORE_LINKS.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={`${item} text-muted-foreground hover:bg-card hover:text-foreground`}>
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        ))}
      </nav>
      <Link
        href={tab === "x" ? "/feed#compose" : "#compose"}
        className="mt-4 flex h-8 items-center justify-center gap-2 rounded-full bg-primary text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        <PenSquare className="h-3.5 w-3.5" />
        Write a post
      </Link>
    </aside>
  );
}

export default async function FeedPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const tab = tabOf(params);
  const sort = tab === "popular" ? "popular" : "latest";
  // Posts change often; the API caches in redis and clears on every write.
  const [postsData, showcase, membersData] = await Promise.all([
    tab === "x" ? Promise.resolve([]) : fetchApi<Thread[]>(`/community/threads?sort=${sort}&limit=${FEED_PAGE_SIZE}`, { revalidate: 0 }),
    fetchApi<ShowcaseProject[]>("/showcase?limit=100"),
    fetchApi<{ members: PublicProfile[]; total: number }>("/users?per_page=8"),
  ]);
  const posts = postsData ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <CollectionPageSchema name={TITLE} description={DESCRIPTION} url={`${SITE_URL}/feed`} />
      <Header />
      <main className="flex-1">
        {/* Peerlist-style: nav on the left, the feed centred, context on the right. */}
        <div className="mx-auto grid max-w-[1240px] gap-8 px-4 pb-16 pt-6 md:px-8 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-start xl:grid-cols-[180px_minmax(0,620px)_300px] xl:justify-center">
          <LeftNav tab={tab} />

          <div className="min-w-0">
            <PageBreadcrumb items={[{ label: "Feed" }]} />
            <h1 className="mt-1 text-[22px] font-semibold leading-tight tracking-tight text-foreground">Community Feed</h1>
            <p className="mt-1 text-sm text-muted-foreground">What people are building, asking and sharing about Claude.</p>

            {/* Below lg the left nav is hidden, so the tabs sit above the feed. */}
            <nav aria-label="Feed" className="mt-5 flex items-center gap-6 border-b border-border lg:hidden">
              {TABS.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={tab === item.id ? "page" : undefined}
                  className={`-mb-px border-b-2 pb-3 text-sm transition-colors ${
                    tab === item.id ? "border-foreground font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-5">
              {tab === "x" ? (
                <FromX params={params} />
              ) : (
                // key: switching tabs remounts the list with that tab's posts
                <FeedClient key={sort} initialPosts={posts} sort={sort} />
              )}
            </div>
          </div>

          <FeedSidebar launches={rankedLaunches(showcase ?? []).slice(0, 6)} members={membersData?.members ?? []} memberTotal={membersData?.total ?? 0} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
