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

function shouldTrack(link: HTMLAnchorElement): boolean {
  if (link.dataset.utmTracked === "true" || !isExternalHttpHref(link.href)) {
    return false;
  }

  try {
    return new URL(link.href).origin !== window.location.origin;
  } catch {
    return false;
  }
}

function trackExternalLinks() {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="http://"], a[href^="https://"]').forEach((link) => {
    if (!shouldTrack(link)) {
      return;
    }

    link.href = withUtmParams(link.href, {
      medium: link.dataset.utmMedium || "outbound_link",
      campaign: link.dataset.utmCampaign || "sitewide_referral",
      content: linkContent(link),
    });
    link.dataset.utmTracked = "true";
  });
}

export function ExternalLinkTracker() {
  useEffect(() => {
    trackExternalLinks();

    let frame = 0;
    const observer = new MutationObserver(() => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(trackExternalLinks);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return null;
}
