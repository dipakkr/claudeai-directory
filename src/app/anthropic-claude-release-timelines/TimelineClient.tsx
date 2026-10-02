"use client";

// Tiny client islands for the timeline page. Everything else is server-rendered.
import { useState } from "react";
import { Check, Link2 } from "lucide-react";

/** Copies a URL to the clipboard. */
export function CopyLinkButton({ url, label = "Copy link", className = "" }: { url: string; label?: string; className?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 1800);
  };
  return (
    <button type="button" onClick={copy} className={className} aria-label={`${label}: ${url}`}>
      {state === "copied" ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
      {state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : label}
    </button>
  );
}

/**
 * Filter chips. Entries are all server-rendered; this only flips data-filter on
 * the list and CSS (rendered by the page) hides non-matching rows.
 */
export function FilterBar({ targetId, options }: { targetId: string; options: { value: string; label: string; count: number }[] }) {
  const [active, setActive] = useState("all");
  const pick = (value: string) => {
    setActive(value);
    document.getElementById(targetId)?.setAttribute("data-filter", value);
  };
  return (
    <div role="toolbar" aria-label="Filter timeline" className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = active === o.value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => pick(o.value)}
            className={`inline-flex h-8 items-center gap-1.5 rounded-[6px] border px-3 text-[13px] transition-colors ${
              on ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-[var(--cad-line-hover)] hover:text-foreground"
            }`}
          >
            {o.label}
            <span className={`font-mono text-[11px] ${on ? "text-background/70" : "text-muted-foreground"}`}>{o.count}</span>
          </button>
        );
      })}
    </div>
  );
}
