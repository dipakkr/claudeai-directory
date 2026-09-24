import { Bookmark, BadgeCheck, FileText, Heart, MessageCircle, Pin, Play } from "lucide-react";
import type { ReactNode } from "react";

import type { FeedTweet } from "@/types";
import { TweetUpvote } from "./TweetUpvote";

const TOKEN = /(https?:\/\/[^\s]+|@\w{1,15}|#[\p{L}\p{N}_]+)/gu;
const OUTBOUND_REL = "nofollow ugc noopener noreferrer";

function compact(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function displayUrl(url: string) {
  const stripped = url.replace(/^https?:\/\/(www\.)?/, "");
  return stripped.length > 40 ? `${stripped.slice(0, 38)}...` : stripped;
}

/** Turn URLs, @mentions and #hashtags into links. */
function renderText(text: string): ReactNode[] {
  return text.split(TOKEN).map((part, index) => {
    if (!part) return null;
    const linkClass = "text-primary hover:underline";
    if (/^https?:\/\//.test(part)) {
      return (
        <a key={index} href={part} target="_blank" rel={OUTBOUND_REL} className={`${linkClass} break-all`}>
          {displayUrl(part)}
        </a>
      );
    }
    if (/^@\w{1,15}$/.test(part)) {
      return (
        <a key={index} href={`https://x.com/${part.slice(1)}`} target="_blank" rel={OUTBOUND_REL} className={linkClass}>
          {part}
        </a>
      );
    }
    if (/^#/.test(part)) {
      return (
        <a
          key={index}
          href={`https://x.com/hashtag/${encodeURIComponent(part.slice(1))}`}
          target="_blank"
          rel={OUTBOUND_REL}
          className={linkClass}
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

function Badge({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "primary" | "success" }) {
  const tones = {
    muted: "border-border text-muted-foreground",
    primary: "border-primary/30 bg-primary/10 text-primary",
    success: "border-success/30 bg-success/10 text-success",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function TweetCard({ tweet }: { tweet: FeedTweet }) {
  const { author } = tweet;
  const date = formatDate(tweet.tweeted_at);
  const media = tweet.media ?? [];
  const article = tweet.article?.title ? tweet.article : null;

  return (
    <article id={`tweet-${tweet.id}`} className="scroll-mt-24 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-[var(--cad-line-hover)]">
      <header className="flex items-start gap-3">
        <a href={`https://x.com/${author.screen_name}`} target="_blank" rel={OUTBOUND_REL} className="shrink-0">
          {author.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={author.avatar}
              alt=""
              width={44}
              height={44}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="h-11 w-11 rounded-full border border-border bg-background object-cover"
            />
          ) : (
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold text-muted-foreground">
              {(author.name || author.screen_name || "?").slice(0, 1).toUpperCase()}
            </span>
          )}
        </a>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1">
            <a
              href={`https://x.com/${author.screen_name}`}
              target="_blank"
              rel={OUTBOUND_REL}
              className="truncate text-sm font-semibold text-foreground hover:underline"
            >
              {author.name || author.screen_name}
            </a>
            {author.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-sky-500" aria-label="Verified on X" />}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            @{author.screen_name}
            {date && <> · {date}</>}
          </p>
        </div>
        <a
          href={tweet.url}
          target="_blank"
          rel={OUTBOUND_REL}
          aria-label="View on X"
          className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <XLogo className="h-4 w-4" />
        </a>
      </header>

      {(tweet.pinned || tweet.highly_bookmarked || tweet.source) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tweet.pinned && (
            <Badge tone="primary">
              <Pin className="h-3 w-3" />
              Pinned
            </Badge>
          )}
          {tweet.highly_bookmarked && (
            <Badge tone="success">
              <Bookmark className="h-3 w-3" />
              Highly bookmarked
            </Badge>
          )}
          <Badge>{tweet.source === "curated" ? "Curated" : `Community${tweet.added_by_name ? `, added by ${tweet.added_by_name}` : ""}`}</Badge>
        </div>
      )}

      {tweet.text && (
        <p className="mt-3 whitespace-pre-line break-words text-[15px] leading-relaxed text-foreground">{renderText(tweet.text)}</p>
      )}

      {article && (
        <a
          href={tweet.url}
          target="_blank"
          rel={OUTBOUND_REL}
          className="group mt-4 block overflow-hidden rounded-xl border border-border bg-background transition-colors hover:border-[var(--cad-line-hover)]"
        >
          {article.cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.cover}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              className="aspect-[5/2] w-full border-b border-border object-cover"
            />
          )}
          <div className="p-4">
            <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              <FileText className="h-3 w-3" />
              Article
            </span>
            <h3 className="mt-1.5 text-base font-semibold leading-snug text-foreground group-hover:text-primary">
              {article.title}
            </h3>
            {article.preview && (
              <p className="mt-1.5 line-clamp-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">{article.preview}</p>
            )}
            <span className="mt-3 inline-block text-xs font-medium text-foreground">Read the full article on X</span>
          </div>
        </a>
      )}

      {!article && media.length > 0 && (
        <a
          href={tweet.url}
          target="_blank"
          rel={OUTBOUND_REL}
          className={`mt-4 grid gap-1 overflow-hidden rounded-xl border border-border ${media.length > 1 ? "grid-cols-2" : ""}`}
        >
          {media.map((item, index) => (
            <span key={`${item.url}-${index}`} className="relative block bg-background">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt=""
                loading="lazy"
                referrerPolicy="no-referrer"
                className={`w-full object-cover ${media.length > 1 ? "aspect-square" : "max-h-[320px]"}`}
              />
              {item.type !== "photo" && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white">
                    <Play className="h-5 w-5 fill-current" />
                  </span>
                </span>
              )}
            </span>
          ))}
        </a>
      )}

      <footer className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <TweetUpvote id={tweet.id} initialCount={tweet.upvotes ?? 0} />
        <span className="inline-flex items-center gap-1" title="Likes on X">
          <Heart className="h-3.5 w-3.5" />
          {compact(tweet.likes ?? 0)}
        </span>
        <span className="inline-flex items-center gap-1" title="Replies on X">
          <MessageCircle className="h-3.5 w-3.5" />
          {compact(tweet.replies ?? 0)}
        </span>
        <a
          href={tweet.url}
          target="_blank"
          rel={OUTBOUND_REL}
          className="ml-auto inline-flex items-center gap-1 font-medium text-foreground hover:text-primary"
        >
          View on X
        </a>
      </footer>
    </article>
  );
}
