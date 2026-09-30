import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import { CollectionPageSchema } from "@/components/seo/JsonLd";
import { FeedClient } from "@/components/feed/FeedClient";
import { FEED_PAGE_SIZE } from "@/lib/feed";
import { fetchApi } from "@/lib/api-server";
import type { Thread } from "@/types";
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

function Sidebar() {
  return (
    <aside className="hidden space-y-3 lg:sticky lg:top-24 lg:block">
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">About the feed</h2>
        <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
          A place for people building with Claude. Share what you shipped, a workflow that works, or a question you are stuck on.
        </p>
        <ul className="mt-3 space-y-1.5 text-[13px] text-muted-foreground">
          <li>Be useful and specific</li>
          <li>Show your work, not just a link</li>
          <li>No spam or repeated self-promotion</li>
        </ul>
      </div>
      <Link href="/members" className="group flex items-center justify-between rounded-2xl border border-border bg-card p-5 transition-colors hover:border-[var(--cad-line-hover)]">
        <span>
          <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Users className="h-4 w-4 text-primary" />
            Meet the members
          </span>
          <span className="mt-1 block text-[13px] text-muted-foreground">See who is building with Claude.</span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-muted-foreground" />
      </Link>
      <Link href="/launches" className="group flex items-center justify-between rounded-2xl border border-border bg-card p-5 transition-colors hover:border-[var(--cad-line-hover)]">
        <span>
          <span className="text-sm font-semibold text-foreground">Launched something?</span>
          <span className="mt-1 block text-[13px] text-muted-foreground">List it on Launches to get upvotes and a link.</span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-muted-foreground" />
      </Link>
    </aside>
  );
}

export default async function FeedPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const tab = tabOf(params);
  const sort = tab === "popular" ? "popular" : "latest";
  // Posts change often; the API caches in redis and clears on every write.
  const posts =
    tab === "x" ? [] : ((await fetchApi<Thread[]>(`/community/threads?sort=${sort}&limit=${FEED_PAGE_SIZE}`, { revalidate: 0 })) ?? []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <CollectionPageSchema name={TITLE} description={DESCRIPTION} url={`${SITE_URL}/feed`} />
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[1120px] px-4 pb-16 pt-8 md:px-8 md:pt-10">
          <PageBreadcrumb items={[{ label: "Feed" }]} />
          <div className="mt-2">
            <h1 className="text-[clamp(26px,3.2vw,34px)] font-semibold leading-tight tracking-tight text-foreground">Community Feed</h1>
            <p className="mt-1.5 text-[15px] text-muted-foreground">What people are building, asking and sharing about Claude.</p>
          </div>

          <nav aria-label="Feed" className="mt-6 flex items-center gap-6 border-b border-border">
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

          <div className="mt-6">
            {tab === "x" ? (
              <FromX params={params} />
            ) : (
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
                {/* key: switching tabs remounts the list with that tab's posts */}
                <FeedClient key={sort} initialPosts={posts} sort={sort} />
                <Sidebar />
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
