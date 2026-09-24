import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark } from "lucide-react";

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

type Params = { sort?: string; source?: string; bookmarked?: string; page?: string };

function normalize(params: Params) {
  const sort = params.sort === "top" ? "top" : "latest";
  const source = params.source === "curated" || params.source === "community" ? params.source : undefined;
  const bookmarked = params.bookmarked === "1";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  return { sort, source, bookmarked, page };
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
  const { sort, source, bookmarked, page } = normalize(await searchParams);

  const query = new URLSearchParams({ sort, skip: String((page - 1) * PAGE_SIZE), limit: String(PAGE_SIZE) });
  if (source) query.set("source", source);
  if (bookmarked) query.set("highly_bookmarked", "true");
  // No Next data cache: the API caches in redis and clears it on every write,
  // so a tweet someone just added shows up on refresh.
  const data = (await fetchApi<FeedTweetPage>(`/feed/tweets?${query}`, { revalidate: 0 })) ?? { items: [], total: 0 };
  const hasMore = page * PAGE_SIZE < data.total;

  const href = (next: Partial<{ sort: string; source?: string; bookmarked: boolean; page: number }>) => {
    const merged = { sort, source, bookmarked, page: 1, ...next };
    const params = new URLSearchParams();
    if (merged.sort !== "latest") params.set("sort", merged.sort);
    if (merged.source) params.set("source", merged.source);
    if (merged.bookmarked) params.set("bookmarked", "1");
    if (merged.page > 1) params.set("page", String(merged.page));
    const qs = params.toString();
    return qs ? `/feed?${qs}` : "/feed";
  };

  const pill = (active: boolean) =>
    `inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium transition-colors ${
      active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-card hover:text-foreground"
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[1200px] px-4 pb-16 pt-8 md:px-8 md:pt-10">
          <div className="flex items-center justify-between gap-4 [&_nav]:mb-0">
            <PageBreadcrumb items={[{ label: "Feed" }]} />
            <ContributeTweetDialog />
          </div>
          <h1 className="sr-only">The best tweets about Claude, Claude Code, MCP and Agents</h1>

          <nav aria-label="Feed filters" className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div className="flex items-center gap-1 rounded-full border border-border p-1">
              <Link href={href({ sort: "latest" })} className={pill(sort === "latest")} aria-current={sort === "latest" ? "page" : undefined}>
                Latest
              </Link>
              <Link href={href({ sort: "top" })} className={pill(sort === "top")} aria-current={sort === "top" ? "page" : undefined}>
                Top
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <Link href={href({ source: undefined })} className={pill(!source)}>
                All
              </Link>
              <Link href={href({ source: "curated" })} className={pill(source === "curated")}>
                Curated
              </Link>
              <Link href={href({ source: "community" })} className={pill(source === "community")}>
                Community
              </Link>
              <Link
                href={href({ bookmarked: !bookmarked })}
                className={`${pill(bookmarked)} ${bookmarked ? "" : "border border-border"}`}
                aria-pressed={bookmarked}
              >
                <Bookmark className="h-3.5 w-3.5" />
                Highly bookmarked
              </Link>
            </div>
          </nav>

          {data.items.length > 0 ? (
            // Masonry via CSS columns: tweets vary a lot in height, so a row grid
            // would leave big gaps. Order runs down each column.
            <div className="mt-6 gap-4 sm:columns-2 lg:columns-3">
              {data.items.map((tweet) => (
                <div key={tweet.id} className="mb-4 break-inside-avoid">
                  <TweetCard tweet={tweet} />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
              <p className="text-sm font-medium text-foreground">No tweets here yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {source || bookmarked ? (
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
                  {sort === "top" ? "More" : "Older"}
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
