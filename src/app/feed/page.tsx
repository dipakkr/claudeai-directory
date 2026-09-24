import type { Metadata } from "next";
import Link from "next/link";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import { ContributeTweetDialog } from "@/components/feed/ContributeTweetDialog";
import { TweetCard } from "@/components/feed/TweetCard";
import { fetchApi } from "@/lib/api-server";
import type { FeedTweetPage } from "@/types";

const PAGE_SIZE = 20;
const TITLE = "Claude Feed: The Best Tweets About Claude and Claude Code";
const DESCRIPTION =
  "The latest and most bookmarked tweets about Claude, Claude Code, MCP and Agents. Curated by the Claude Directory team, with picks from the community.";

type Params = { view?: string; source?: string; page?: string };
type View = "latest" | "top" | "articles";

const VIEWS: { id: View; label: string }[] = [
  { id: "latest", label: "Latest" },
  { id: "top", label: "Top" },
  { id: "articles", label: "Articles" },
];

const SOURCES: { id?: "curated" | "community"; label: string }[] = [
  { label: "All" },
  { id: "curated", label: "Curated" },
  { id: "community", label: "Community" },
];

function normalize(params: Params) {
  const view: View = params.view === "top" || params.view === "articles" ? params.view : "latest";
  const source = params.source === "curated" || params.source === "community" ? params.source : undefined;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  return { view, source, page };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Params>;
}): Promise<Metadata> {
  const params = await searchParams;
  const filtered = Object.values(params).some(Boolean);
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: "/feed" },
    // Only the default view is indexable. Sort, filter and page URLs are not.
    robots: filtered ? { index: false, follow: true } : undefined,
    openGraph: { title: TITLE, description: DESCRIPTION, url: "/feed" },
  };
}

export default async function FeedPage({ searchParams }: { searchParams: Promise<Params> }) {
  const { view, source, page } = normalize(await searchParams);

  // Top ranks admin-flagged "highly bookmarked" tweets first, then by likes.
  const sort = view === "top" ? "top" : "latest";
  const query = new URLSearchParams({ sort, skip: String((page - 1) * PAGE_SIZE), limit: String(PAGE_SIZE) });
  if (source) query.set("source", source);
  if (view === "articles") query.set("articles", "true");
  // No Next data cache: the API caches in redis and clears it on every write,
  // so a tweet someone just added shows up on refresh.
  const data = (await fetchApi<FeedTweetPage>(`/feed/tweets?${query}`, { revalidate: 0 })) ?? { items: [], total: 0 };
  const hasMore = page * PAGE_SIZE < data.total;

  const href = (next: Partial<{ view: View; source?: string; page: number }>) => {
    const merged = { view, source, page: 1, ...next };
    const params = new URLSearchParams();
    if (merged.view !== "latest") params.set("view", merged.view);
    if (merged.source) params.set("source", merged.source);
    if (merged.page > 1) params.set("page", String(merged.page));
    const qs = params.toString();
    return qs ? `/feed?${qs}` : "/feed";
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[1200px] px-4 pb-16 pt-8 md:px-8 md:pt-10">
          <PageBreadcrumb items={[{ label: "Feed" }]} />
          <h1 className="sr-only">The best tweets about Claude, Claude Code, MCP and Agents</h1>

          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 sm:border-b sm:border-border">
            <nav aria-label="Feed views" className="-mb-px flex w-full items-center gap-6 border-b border-border sm:w-auto sm:border-b-0">
              {VIEWS.map((item) => (
                <Link
                  key={item.id}
                  href={href({ view: item.id })}
                  aria-current={view === item.id ? "page" : undefined}
                  className={`border-b-2 pb-3 text-sm transition-colors ${
                    view === item.id
                      ? "border-foreground font-medium text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            {/* On phones this row sits above the tabs so the tabs stay on the divider. */}
            <div className="order-first flex w-full items-center justify-between gap-4 sm:order-none sm:w-auto sm:justify-end sm:pb-3">
              <nav aria-label="Source" className="flex items-center gap-3 text-xs">
                {SOURCES.map((item) => (
                  <Link
                    key={item.label}
                    href={href({ source: item.id })}
                    aria-current={source === item.id ? "page" : undefined}
                    className={source === item.id ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <ContributeTweetDialog />
            </div>
          </div>

          {data.items.length > 0 ? (
            // Row grid: cards in a row share one height, footers line up.
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((tweet) => (
                <TweetCard key={tweet.id} tweet={tweet} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
              <p className="text-sm font-medium text-foreground">No tweets here yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {source || view === "articles" ? (
                  <Link href="/feed" className="underline underline-offset-4 hover:text-foreground">
                    Clear filters
                  </Link>
                ) : (
                  "Use Contribute to add the first one."
                )}
              </p>
            </div>
          )}

          {(page > 1 || hasMore) && (
            <div className="mt-8 flex items-center justify-between text-sm">
              {page > 1 ? (
                <Link href={href({ page: page - 1 })} className="rounded-full border border-border px-4 py-2 text-foreground hover:bg-card">
                  Newer
                </Link>
              ) : (
                <span />
              )}
              {hasMore && (
                <Link href={href({ page: page + 1 })} className="rounded-full border border-border px-4 py-2 text-foreground hover:bg-card">
                  {view === "top" ? "More" : "Older"}
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
