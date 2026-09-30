import { ExternalLink } from "lucide-react";
import type { LinkPreview } from "@/types";

/** The link shared in a post: preview card when we have one, else the bare link. */
export function LinkPreviewCard({ url, preview }: { url: string; preview?: LinkPreview | null }) {
  const href = preview?.url || url;
  let host = preview?.site || "";
  try {
    host ||= new URL(href).hostname.replace(/^www\./, "");
  } catch {
    host ||= href;
  }
  // User-submitted link: nofollow + ugc, per Google's guidance for user content.
  const rel = "nofollow ugc noopener noreferrer";
  if (!preview?.title) {
    return (
      <a href={href} target="_blank" rel={rel} className="inline-flex max-w-full items-center gap-1.5 truncate text-sm text-[var(--cad-link)] hover:underline">
        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{host}</span>
      </a>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel={rel}
      className="group flex overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-[var(--cad-line-hover)]"
    >
      {preview.image && (
        // eslint-disable-next-line @next/next/no-img-element -- remote og:image from the linked site
        <img src={preview.image} alt="" loading="lazy" referrerPolicy="no-referrer" className="hidden h-auto w-40 shrink-0 object-cover sm:block" />
      )}
      <span className="min-w-0 flex-1 px-4 py-3">
        <span className="block text-xs text-muted-foreground">{host}</span>
        <span className="mt-0.5 block truncate text-sm font-medium text-foreground group-hover:text-primary">{preview.title}</span>
        {preview.description && <span className="mt-0.5 line-clamp-2 block text-[13px] leading-5 text-muted-foreground">{preview.description}</span>}
      </span>
    </a>
  );
}
