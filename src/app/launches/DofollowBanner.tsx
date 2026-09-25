import Link from "next/link";
import { ArrowRight, Link2 } from "lucide-react";

/**
 * "List free, get a dofollow link". True only because launch pages drop
 * rel=nofollow on the website link once the maker's badge is verified.
 */
export function DofollowBanner({ cta = true }: { cta?: boolean }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-primary/30 bg-[linear-gradient(100deg,rgba(217,119,87,0.14),rgba(217,119,87,0.04)_60%,transparent)] px-5 py-4 sm:flex-row sm:items-center">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <Link2 className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium text-foreground">List your app free and get a dofollow backlink</p>
        <p className="mt-0.5 text-[13px] leading-relaxed text-[var(--cad-desc)]">
          Add the Claude AI Directory badge to your site. Once we verify it, your launch page links to your website with a
          dofollow link.
        </p>
      </div>
      {cta && (
        <Link
          href="/launches/submit"
          className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-[13.5px] font-medium text-white transition-opacity hover:opacity-90"
        >
          Launch your app
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
