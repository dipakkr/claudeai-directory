"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/**
 * Counts a page view from the browser (bots and server renders don't count).
 * The API keeps one view per visitor per day.
 */
export function ViewTracker({ type, id }: { type: "launch" | "thread"; id: string }) {
  useEffect(() => {
    track("resource_viewed", { resource_type: type, resource_id: id });
  }, [type, id]);
  return null;
}
