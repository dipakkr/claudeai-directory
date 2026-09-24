import Link from "next/link";
import { ArrowRight, FileText, Heart } from "lucide-react";

import { fetchApi } from "@/lib/api-server";
import type { FeedTweetPage } from "@/types";

const OUTBOUND_REL = "nofollow ugc noopener noreferrer";

function compact(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

/** Homepage strip of the best recent posts from /feed. Renders nothing if the feed is empty or down. */
export default async function HomeFeed() {
  const data = await fetchApi<FeedTweetPage>("/feed/tweets?sort=top&limit=6", { revalidate: 300 });
  const tweets = data?.items ?? [];
  if (tweets.length === 0) return null;

  return (
    <section aria-labelledby="feed-heading" className="mx-auto mt-16 max-w-[840px] px-4 md:px-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="feed-heading" className="text-2xl leading-tight text-foreground">
            Worth reading
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">The best posts about Claude from X, picked by the community.</p>
        </div>
        <Link href="/feed" className="hidden shrink-0 items-center gap-1 text-sm text-foreground hover:underline sm:inline-flex">
          Open the feed <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tweets.map((tweet) => {
          const article = tweet.article?.title ? tweet.article : null;
          return (
            <a
              key={tweet.id}
              href={tweet.url}
              target="_blank"
              rel={OUTBOUND_REL}
              className="group flex flex-col rounded-2xl border border-border bg-card p-4 transition-colors hover:border-[var(--cad-line-hover)]"
            >
              <span className="flex items-center gap-2">
                {tweet.author.avatar && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={tweet.author.avatar} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-6 w-6 rounded-full object-cover" />
                )}
                <span className="min-w-0 truncate text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{tweet.author.name}</span> @{tweet.author.screen_name}
                </span>
              </span>
              {article ? (
                <span className="mt-3">
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    Article
                  </span>
                  <span className="mt-1 line-clamp-2 block text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
                    {article.title}
                  </span>
                </span>
              ) : (
                <span className="mt-3 line-clamp-3 text-sm leading-6 text-foreground">{tweet.text}</span>
              )}
              <span className="mt-auto inline-flex items-center gap-1 pt-3 text-xs text-muted-foreground">
                <Heart className="h-3 w-3" />
                {compact(tweet.likes ?? 0)}
              </span>
            </a>
          );
        })}
      </div>

      <Link href="/feed" className="mt-4 inline-flex items-center gap-1 text-sm text-foreground hover:underline sm:hidden">
        Open the feed <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
