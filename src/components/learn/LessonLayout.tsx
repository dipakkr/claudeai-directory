"use client";

import type { ReactNode } from "react";
import Header from "@/components/layout/Header";
import { Skeleton } from "@/components/ui/skeleton";

// Shared reading layout for guide lessons and course lessons: sticky left
// sidebar (outline + progress), centered article, optional right-hand TOC,
// optional fixed bottom bar.
export function LessonLayout({
  sidebar,
  children,
  bottomBar,
}: {
  /** Sidebar content, or null while it is still loading. */
  sidebar: ReactNode | null;
  children: ReactNode;
  bottomBar?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex flex-1">
        {/* Left sidebar — sticky, scrolls independently */}
        <aside className="hidden md:block w-72 shrink-0 border-r border-border">
          <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
            {sidebar ?? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-4 w-1/2 mt-4" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            )}
          </div>
        </aside>

        {/* Main content area */}
        <main className={`flex-1 min-w-0 ${bottomBar ? "pb-20" : ""}`}>
          <div className="flex gap-8 px-6 py-8 max-w-5xl mx-auto">{children}</div>
        </main>
      </div>

      {bottomBar}
    </div>
  );
}

export function LessonSkeleton() {
  return (
    <div className="flex-1 min-w-0 max-w-3xl space-y-4">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-3 w-32" />
      <div className="mt-8 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
