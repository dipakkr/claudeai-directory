"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

// Course lessons are static content with no account requirement, so completion
// is a per-browser convenience kept in localStorage. Reads and writes are
// wrapped because storage can throw (private windows, blocked site data).

const EVENT = "course-progress-change";
const storageKey = (slug: string) => `course-progress:${slug}`;

function read(slug: string): string {
  try {
    return window.localStorage.getItem(storageKey(slug)) ?? "";
  } catch {
    return "";
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

export function useCourseProgress(slug: string) {
  const raw = useSyncExternalStore(
    subscribe,
    () => read(slug),
    () => ""
  );

  const completed = useMemo(() => {
    try {
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : []);
    } catch {
      return new Set<string>();
    }
  }, [raw]);

  const toggle = useCallback(
    (lessonKey: string) => {
      const next = new Set(completed);
      if (next.has(lessonKey)) next.delete(lessonKey);
      else next.add(lessonKey);
      try {
        window.localStorage.setItem(storageKey(slug), JSON.stringify([...next]));
      } catch {
        // Storage unavailable: progress simply is not remembered.
      }
      window.dispatchEvent(new Event(EVENT));
    },
    [completed, slug]
  );

  return { completed, toggle };
}
