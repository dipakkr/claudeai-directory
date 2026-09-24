import { formatDate, isoDate, wasUpdated } from "@/lib/blog";
import type { BlogPost } from "@/types";

// Date, updated date and reading time. Anything missing is left out.
export function PostMeta({ post, short = false, className = "" }: { post: BlogPost; short?: boolean; className?: string }) {
  const published = formatDate(post.published_at, short ? "short" : "long");
  const updated = wasUpdated(post) ? formatDate(post.updated_at, short ? "short" : "long") : null;
  const parts = [
    published ? (
      <time key="p" dateTime={isoDate(post.published_at)}>
        {published}
      </time>
    ) : null,
    updated && !short ? (
      <span key="u">
        Updated <time dateTime={isoDate(post.updated_at)}>{updated}</time>
      </span>
    ) : null,
    post.read_time ? <span key="r">{post.read_time} min read</span> : null,
  ].filter(Boolean);

  if (parts.length === 0) return null;
  return (
    <p className={`flex flex-wrap items-center gap-x-2 text-[13px] text-muted-foreground ${className}`}>
      {parts.map((part, i) => (
        <span key={i} className="inline-flex items-center gap-2">
          {i > 0 ? <span aria-hidden="true">·</span> : null}
          {part}
        </span>
      ))}
    </p>
  );
}

export function AuthorAvatar({ post, size = "md" }: { post: BlogPost; size?: "md" | "lg" }) {
  const box = size === "lg" ? "h-12 w-12 text-base" : "h-9 w-9 text-sm";
  if (post.author_avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={post.author_avatar} alt="" className={`${box} shrink-0 rounded-full border border-border object-cover`} />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`${box} inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-muted font-medium text-foreground`}
    >
      {(post.author || "?").trim().charAt(0).toUpperCase()}
    </span>
  );
}
