import { ExternalLink } from "lucide-react";
import type { LinkPreview } from "@/types";

/** The link shared in a post: preview card when we have one, else the bare link. */
/** "/launches/{slug}" when the link points at one of our launch pages, else null. */
function launchPath(href: string): string | null {
  try {
    const u = new URL(href);
    const m = u.pathname.match(/^\/launches\/([a-z0-9-]+)\/?$/i);
    return m && /(^|\.)claudeai\.directory$|^localhost$/.test(u.hostname) && m[1] !== "submit" ? `/launches/${m[1]}` : null;
  } catch {
    return null;
  }
}

export function LinkPreviewCard({ url, preview }: { url: string; preview?: LinkPreview | null }) {
  const href = preview?.url || url;
  const launch = launchPath(href);
  if (launch) {
    // Our own launch: the generated "launched on Claude AI Directory" card, large, as an internal link.
    return (
      <a href={launch} className="group block overflow-hidden rounded-[6px] border border-border bg-card transition-colors hover:border-[var(--cad-line-hover)]">
        {/* eslint-disable-next-line @next/next/no-img-element -- our own generated launch card */}
        <img src={`${launch}/opengraph-image`} alt={preview?.title ? `${preview.title} launched on Claude AI Directory` : "Launch card"} width={1200} height={630} loading="lazy" className="aspect-[1200/630] w-full object-cover" />
      </a>
    );
  }
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
      className="group flex overflow-hidden rounded-[4px] border border-border bg-card transition-colors hover:border-[var(--cad-line-hover)]"
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
