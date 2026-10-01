"use client";

import { useEffect } from "react";

import { markLaunchVisited, sendMetric } from "@/lib/launch-visits";
const VISIBLE_RATIO = 0.5; // at least half the card on screen...
const VISIBLE_MS = 1000; // ...for one second
const FLUSH_MS = 4000;
const SEEN_KEY = "cad_launch_impressions";

/**
 * One observer for the whole site. Any element with
 *   data-launch-impression="<launch id>" data-surface="<where>"
 * counts as an impression once it has been at least half visible for a second.
 * Ids are batched and sent with one beacon every few seconds (and when the tab
 * is hidden). Each launch is sent once per tab session; the server also counts
 * each launch once per visitor per day.
 *
 * Elements with data-launch-click="<launch id>" report a website click and
 * unlock upvoting that launch (see UpvoteBox).
 */
export function LaunchImpressions() {
  useEffect(() => {
    // Website clicks: always remembered locally; sendMetric skips local previews.
    const onClick = (event: Event) => {
      const el = (event.target as Element | null)?.closest?.("[data-launch-click]");
      const id = el?.getAttribute("data-launch-click");
      if (id) markLaunchVisited(id);
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("auxclick", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("auxclick", onClick, true);
    };
  }, []);

  useEffect(() => {
    // Local previews share the production database: don't count them.
    if (["localhost", "127.0.0.1"].includes(window.location.hostname)) return;
    if (!("IntersectionObserver" in window)) return;

    let seen: Set<string>;
    try {
      seen = new Set(JSON.parse(sessionStorage.getItem(SEEN_KEY) || "[]"));
    } catch {
      seen = new Set();
    }
    const queue = new Map<string, Set<string>>(); // surface -> launch ids
    const timers = new Map<Element, number>();

    const flush = () => {
      for (const [surface, ids] of queue) {
        const list = [...ids];
        for (let i = 0; i < list.length; i += 50) sendMetric("/metrics/impressions", { surface, ids: list.slice(i, i + 50) });
      }
      queue.clear();
      try {
        sessionStorage.setItem(SEEN_KEY, JSON.stringify([...seen].slice(-500)));
      } catch {
        // Private mode: the server-side daily dedupe still applies.
      }
    };

    const count = (el: Element) => {
      const id = el.getAttribute("data-launch-impression");
      if (!id) return;
      const surface = el.getAttribute("data-surface") || "other";
      const key = `${surface}:${id}`;
      if (seen.has(key)) return;
      seen.add(key);
      if (!queue.has(surface)) queue.set(surface, new Set());
      queue.get(surface)!.add(id);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target;
          if (entry.isIntersecting && entry.intersectionRatio >= VISIBLE_RATIO) {
            if (!timers.has(el)) {
              timers.set(
                el,
                window.setTimeout(() => {
                  timers.delete(el);
                  count(el);
                  io.unobserve(el);
                }, VISIBLE_MS),
              );
            }
          } else if (timers.has(el)) {
            window.clearTimeout(timers.get(el));
            timers.delete(el);
          }
        }
      },
      { threshold: [0, VISIBLE_RATIO] },
    );

    const watch = (root: ParentNode) => {
      root.querySelectorAll?.("[data-launch-impression]").forEach((el) => io.observe(el));
    };
    watch(document);
    // Cards rendered later (client navigation, load more, streamed sections).
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            if (node.hasAttribute("data-launch-impression")) io.observe(node);
            watch(node);
          }
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    const interval = window.setInterval(flush, FLUSH_MS);
    const onHide = () => document.visibilityState === "hidden" && flush();
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);

    return () => {
      flush();
      window.clearInterval(interval);
      timers.forEach((t) => window.clearTimeout(t));
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
    };
  }, []);
  return null;
}
