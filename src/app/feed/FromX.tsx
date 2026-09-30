import Link from "next/link";

import { ContributeTweetDialog } from "@/components/feed/ContributeTweetDialog";
import { TweetCard } from "@/components/feed/TweetCard";
import { fetchApi } from "@/lib/api-server";
import type { FeedTweetPage } from "@/types";

const PAGE_SIZE = 20;

export type FromXParams = { view?: string; source?: string; page?: string };
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

function normalize(params: FromXParams) {
  const view: View = params.view === "top" || params.view === "articles" ? params.view : "latest";
  const source = params.source === "curated" || params.source === "community" ? params.source : undefined;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  return { view, source, page };
}

/** The "From X" tab: the best tweets about Claude, curated plus community picks. */
export async function FromX({ params }: { params: FromXParams }) {
  const { view, source, page } = normalize(params);

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
    const qs = new URLSearchParams({ tab: "x" });
    if (merged.view !== "latest") qs.set("view", merged.view);
    if (merged.source) qs.set("source", merged.source);
    if (merged.page > 1) qs.set("page", String(merged.page));
    return `/feed?${qs}`;
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="Tweet views" className="flex items-center gap-1.5">
          {VIEWS.map((item) => (
            <Link
              key={item.id}
              href={href({ view: item.id })}
              aria-current={view === item.id ? "page" : undefined}
              className={`cad-chip px-3.5 text-[13px] ${view === item.id ? "cad-chip-active" : "bg-card hover:text-foreground"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
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
              <Link href="/feed?tab=x" className="underline underline-offset-4 hover:text-foreground">
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
    </>
  );
}
