"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const sections = new Set(["skills", "mcp", "agents", "plugins", "launches"]);

/** Private first-party measurement. Do not send sponsor delivery to public analytics. */
export function useSponsorTracking(campaignId: string, position: number, surface: "desktop" | "mobile") {
  const pathname = usePathname();
  const ref = useRef<HTMLAnchorElement>(null);
  const view = useMemo(() => ({ pathname, id: crypto.randomUUID(), seen: new Set<string>() }), [pathname]);
  const send = useCallback((event: "impressions" | "clicks") => {
    const key = `${campaignId}:${position}:${surface}:${event}`;
    if (view.seen.has(key)) return;
    view.seen.add(key);
    const section = view.pathname.split("/")[1];
    const payload = { event, campaign_id: campaignId, position, surface, view_id: view.id,
      page: view.pathname === "/" ? "home" : sections.has(section) ? section : "other" };
    try {
      void fetch(`${API_BASE}/sponsors/events`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), keepalive: true,
      }).catch(() => {});
    } catch { /* Measurement must never interrupt navigation. */ }
  }, [campaignId, position, surface, view]);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    let visible = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const update = () => {
      clearTimeout(timer);
      if (visible && document.visibilityState === "visible") {
        timer = setTimeout(() => send("impressions"), 1000);
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
      update();
    }, { threshold: [0, 0.5] });
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [send]);

  return { ref, onClick: () => send("clicks"), onAuxClick: (event: { button: number }) => {
    if (event.button === 1) send("clicks");
  } };
}
