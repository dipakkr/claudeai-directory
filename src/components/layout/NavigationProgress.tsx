"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Thin coral bar at the top while the next page loads, so a click on any internal link
 * gives instant feedback (pages are server-rendered and can take a moment).
 * Starts on an internal link click, finishes when the URL changes.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  // Start on clicks that will navigate within the site.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      window.clearInterval(timer.current);
      setVisible(true);
      setWidth(12);
      // Creep towards 90% until the page arrives.
      timer.current = window.setInterval(() => setWidth((w) => (w < 90 ? w + (90 - w) * 0.12 : w)), 200);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Finish when the route has changed.
  useEffect(() => {
    window.clearInterval(timer.current);
    const done = window.setTimeout(() => setWidth((w) => (w > 0 ? 100 : 0)), 0);
    const hide = window.setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 250);
    return () => {
      window.clearTimeout(done);
      window.clearTimeout(hide);
    };
  }, [pathname, search]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5">
      <div
        className="h-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.7)] transition-[width,opacity] duration-200 ease-out"
        style={{ width: `${width}%`, opacity: visible ? 1 : 0 }}
      />
    </div>
  );
}
