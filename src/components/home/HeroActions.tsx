"use client";

import { Search } from "lucide-react";

import { useCommandMenu } from "@/components/layout/CommandMenu";
import { useAuth } from "@/lib/auth";
import { compactNumber } from "@/lib/directory";

/** The hero's main action: a search field that opens the site search (⌘K). */
export function HeroSearch() {
  const { open } = useCommandMenu();
  return (
    <div className="mx-auto mt-8 w-full max-w-[560px]">
      <button
        type="button"
        onClick={open}
        className="flex h-12 w-full cursor-text items-center gap-3 rounded-full border border-border bg-card px-5 text-left text-[15px] text-muted-foreground shadow-sm transition-colors hover:border-[var(--cad-line-hover)]"
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="flex-1 truncate">Search Skills, MCPs and Agents...</span>
        <kbd className="hidden rounded border border-border px-1.5 font-mono text-[11px] sm:inline">⌘K</kbd>
      </button>
    </div>
  );
}

/** Non-interactive community text below the hero. */
export function HeroJoin({ total }: { total: number }) {
  const { isAuthenticated } = useAuth();

  // Product decision: show "1k+" until the real count passes it.
  const builders = total >= 1000 ? `${compactNumber(total)}+` : "1k+";
  const label = isAuthenticated ? "Meet the builders" : `Join ${builders} builders`;

  return (
    <p className="mx-auto mt-7 w-fit max-w-full text-sm text-foreground">
      {label}
    </p>
  );
}
