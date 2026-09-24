"use client";

import { useEffect } from "react";
import { isExternalHttpHref, withUtmParams } from "@/lib/tracking";

function linkContent(link: HTMLAnchorElement): string {
  return (
    link.dataset.utmContent ||
    link.getAttribute("aria-label") ||
    link.textContent ||
    new URL(link.href).hostname
  );
}

// Links already tagged. Kept off the DOM so OpenPanel doesn't pick up a data-* flag.
const tagged = new WeakSet<HTMLAnchorElement>();

function shouldTrack(link: HTMLAnchorElement): boolean {
  if (tagged.has(link) || !isExternalHttpHref(link.href)) {
    return false;
  }

  try {
    return new URL(link.href).origin !== window.location.origin;
  } catch {
    return false;
  }
}

function tagLink(link: HTMLAnchorElement) {
  if (!shouldTrack(link)) return;
  link.href = withUtmParams(link.href, {
    medium: link.dataset.utmMedium || "outbound_link",
    campaign: link.dataset.utmCampaign || "sitewide_referral",
    content: linkContent(link),
  });
  tagged.add(link);
}

/**
 * Adds UTM params to outbound links at the moment they are used (mouse,
 * middle click, keyboard, or "copy link" menu), not on page load.
 *
 * Rewriting hrefs on load used to race React hydration: content that streams
 * in later (Suspense) was modified before React hydrated it, causing
 * hydration mismatch errors. Tagging on interaction touches the DOM only after
 * hydration, and every real visit still carries the UTM params.
 */
export function ExternalLinkTracker() {
  useEffect(() => {
    const onInteract = (event: Event) => {
      const target = event.target as Element | null;
      const link = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (link) tagLink(link);
    };

    const events = ["mousedown", "click", "auxclick", "contextmenu", "keydown"] as const;
    events.forEach((name) => document.addEventListener(name, onInteract, true));
    return () => events.forEach((name) => document.removeEventListener(name, onInteract, true));
  }, []);

  return null;
}
