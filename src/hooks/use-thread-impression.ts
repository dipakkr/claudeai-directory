"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

/** Viewable feed cards share the server's daily dedupe with detail visits. */
export function useThreadImpression(id: string) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || !("IntersectionObserver" in window)) return;
    // Local previews often point at production data.
    if (["localhost", "127.0.0.1"].includes(location.hostname)) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let visible = false;
    let sent = false;
    const cancel = () => { clearTimeout(timer); timer = undefined; };
    const update = () => {
      cancel();
      if (!visible || sent || document.visibilityState !== "visible") return;
      timer = setTimeout(() => {
        if (!visible || document.visibilityState !== "visible") return;
        const key = `cad_thread_impression:${new Date().toISOString().slice(0, 10)}:${id}`;
        try {
          if (sessionStorage.getItem(key)) { sent = true; return; }
          sessionStorage.setItem(key, "1");
        } catch { /* Server dedupe still applies when storage is unavailable. */ }
        sent = true;
        track("thread_impression", { resource_type: "thread", resource_id: id });
        observer.disconnect();
      }, 1000);
    };
    // Very tall/expanded posts qualify when half a viewport of the card is visible.
    const ratio = Math.min(0.5, window.innerHeight / Math.max(element.getBoundingClientRect().height, 1) / 2);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= ratio;
      update();
    }, { threshold: [0, ratio] });
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    return () => {
      cancel();
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [id]);
  return ref;
}
