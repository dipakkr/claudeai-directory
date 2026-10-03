"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useAuth } from "@/lib/auth";

/** Shown only to the maker of a launch without a dofollow link: what it means and how to fix it. */
export function OwnerNofollowNotice({ slug, authorId }: { slug: string; authorId?: string }) {
  const { user } = useAuth();
  if (!user || user.id !== authorId) return null;
  return (
    <div className="mt-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Only you see this</p>
      <div className="mt-2 flex flex-col gap-3 rounded-[12px] border border-primary/30 bg-primary/[0.05] px-4 py-4 sm:flex-row sm:items-center sm:gap-5 sm:px-5">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium text-foreground">
            Your link is <span className="font-mono text-primary">nofollow</span>
          </p>
          <p className="mt-1 text-[13.5px] leading-6 text-muted-foreground">
            It passes no SEO value to your site, and your launch is listed below launches with a dofollow link. Add our badge to your
            site for free, or pay $19 once instead.
          </p>
        </div>
        <Link
          href={`/launches/submit?finish=${encodeURIComponent(slug)}`}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Get the dofollow link
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
