"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/** Counts page views for the public /stats page. No cookies, no personal data. */
export function VisitBeacon() {
  const pathname = usePathname();
  useEffect(() => {
    // Local previews share the production database: don't count them.
    if (["localhost", "127.0.0.1"].includes(window.location.hostname)) return;
    try {
      navigator.sendBeacon(`${API_BASE}/stats/hit`);
    } catch {
      // Beacons are best effort.
    }
  }, [pathname]);
  return null;
}
