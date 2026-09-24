"use client";

import { useEffect } from "react";
import { track, type ProductEvent } from "@/lib/analytics";

// Internal links worth counting wherever they appear.
const RULES: { pattern: RegExp; event: ProductEvent; props: (m: RegExpMatchArray) => Record<string, string> }[] = [
  { pattern: /^\/u\/([^/?#]+)\/?$/, event: "user_profile_clicked", props: (m) => ({ username: decodeURIComponent(m[1]) }) },
];

/** Where on the page the click happened: nearest data-placement, else section id, else the page path. */
function placementOf(el: Element): string {
  const marked = el.closest("[data-placement]")?.getAttribute("data-placement");
  if (marked) return marked;
  const section = el.closest("section[id], aside[id], section[aria-labelledby]");
  const id = section?.id || section?.getAttribute("aria-labelledby");
  return id ? `${window.location.pathname}#${id}` : window.location.pathname;
}

/**
 * Counts clicks on member profile links from anywhere on the site, so every avatar
 * and byline is covered without wiring each one. Event list:
 * docs/ANALYTICS_EVENTS.md.
 */
export function KeyClickTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link) return;
      let url: URL;
      try {
        url = new URL(link.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      for (const rule of RULES) {
        const match = url.pathname.match(rule.pattern);
        if (match) {
          track(rule.event, { ...rule.props(match), placement: placementOf(link) });
          return;
        }
      }
    };
    // Capture phase: runs even if a handler below stops propagation.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
