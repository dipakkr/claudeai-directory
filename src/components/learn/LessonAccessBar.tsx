"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

/** Fixed bottom bar prompting readers to unlock the remaining lessons. */
export function LessonAccessBar({
  lockedCount,
  subtitle,
  ctaLabel,
  ctaHref,
}: {
  lockedCount: number;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  if (lockedCount <= 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex items-center justify-between gap-3 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              Unlock {lockedCount} premium lesson{lockedCount > 1 ? "s" : ""}
            </p>
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <Link href={ctaHref} className="shrink-0">
          <Button size="sm">{ctaLabel}</Button>
        </Link>
      </div>
    </div>
  );
}
