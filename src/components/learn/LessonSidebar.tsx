"use client";

import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface LessonSidebarItem {
  id: string;
  title: string;
  href: string;
  completed: boolean;
  locked: boolean;
}

export interface LessonSidebarSection {
  id: string;
  title: string;
  items: LessonSidebarItem[];
}

export function LessonSidebar({
  backHref,
  backLabel,
  title,
  sections,
  currentItemId,
  completedCount,
  totalCount,
  footer,
}: {
  backHref: string;
  backLabel: string;
  title: string;
  sections: LessonSidebarSection[];
  currentItemId: string;
  completedCount: number;
  totalCount: number;
  footer?: ReactNode;
}) {
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Back link */}
      <div className="px-4 pt-4 pb-2">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          {backLabel}
        </Link>
      </div>

      {/* Title + progress */}
      <div className="px-4 pb-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground mb-3 leading-snug">{title}</h2>
        <Progress value={progressPct} className="h-1 mb-2" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            {completedCount} of {totalCount} lessons
          </span>
          {completedCount > 0 && (
            <span className="text-[11px] text-primary font-medium">{Math.round(progressPct)}%</span>
          )}
        </div>
      </div>

      {/* Lesson list */}
      <ScrollArea className="flex-1 min-w-0">
        <div className="py-3 px-2">
          {sections.map((section, sectionIdx) => {
            const showSectionLabel = section.items.length > 1;

            return (
              <Fragment key={section.id}>
                {/* Section label — only when it holds multiple lessons */}
                {showSectionLabel && (
                  <p
                    className={`text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 px-3 pb-1 ${
                      sectionIdx > 0 ? "pt-4" : "pt-2"
                    }`}
                  >
                    {section.title}
                  </p>
                )}

                {section.items.map((item) => {
                  const isActive = item.id === currentItemId;

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`group flex items-start gap-3 px-3 py-2 rounded-lg text-xs transition-all mb-0.5 ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      {/* Status icon */}
                      <span className="shrink-0 mt-[3px] w-3.5 flex items-center justify-center">
                        {item.completed ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        ) : item.locked ? (
                          <Lock className="h-3 w-3 text-muted-foreground/30" />
                        ) : isActive ? (
                          <span className="flex h-2 w-2 rounded-full bg-primary ring-[3px] ring-primary/20" />
                        ) : (
                          <span className="flex h-1.5 w-1.5 rounded-full bg-muted-foreground/25 group-hover:bg-muted-foreground/50 transition-colors" />
                        )}
                      </span>

                      {/* Lesson title */}
                      <span className={`flex-1 min-w-0 leading-snug break-words ${isActive ? "font-medium" : ""}`}>
                        {item.title}
                      </span>
                    </Link>
                  );
                })}
              </Fragment>
            );
          })}
          {footer}
        </div>
      </ScrollArea>
    </div>
  );
}
