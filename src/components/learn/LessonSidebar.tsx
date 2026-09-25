"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ListChecks, Lock } from "lucide-react";
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
  // Chapters that hold one lesson show no header, so they don't take a number.
  const chapterNumbers = sections.map((_, i) => sections.slice(0, i + 1).filter((s) => s.items.length > 1).length);

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
            {completedCount} of {totalCount} lessons done
          </span>
          {completedCount > 0 && (
            <span className="text-[11px] text-primary font-medium">{Math.round(progressPct)}%</span>
          )}
        </div>
      </div>

      {/* Lesson list: numbered chapters, lessons on a thin timeline */}
      <ScrollArea className="flex-1 min-w-0">
        <div className="px-2 py-3">
          {sections.map((section, index) => {
              const labelled = section.items.length > 1;
              const chapterNo = chapterNumbers[index];
              const here = section.items.some((item) => item.id === currentItemId);
              const done = section.items.filter((item) => item.completed).length;

              return (
                <div key={section.id} className={labelled ? "mb-2" : ""}>
                  {labelled && (
                    <div className="flex items-center gap-2.5 px-2 pb-1 pt-2">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10.5px] font-medium tabular-nums ${
                          here ? "bg-primary/15 text-primary" : "bg-[var(--cad-control)] text-muted-foreground"
                        }`}
                      >
                        {chapterNo}
                      </span>
                      <span className={`min-w-0 flex-1 truncate text-[12.5px] font-medium ${here ? "text-foreground" : "text-foreground/75"}`}>
                        {section.title}
                      </span>
                      <span className="text-[11px] tabular-nums text-muted-foreground/70">
                        {done}/{section.items.length}
                      </span>
                    </div>
                  )}

                  <ul className="relative ml-[17px] border-l border-border">
                    {section.items.map((item) => {
                      const isActive = item.id === currentItemId;
                      const isQuiz = item.title === "Quiz" || /^check yourself/i.test(item.title);
                      return (
                        <li key={item.id}>
                          <Link
                            href={item.href}
                            aria-current={isActive ? "page" : undefined}
                            className={`group relative flex items-center gap-2 rounded-r-md py-[7px] pl-4 pr-2 text-[13px] leading-snug transition-colors ${
                              isActive
                                ? "bg-primary/10 font-medium text-foreground"
                                : "text-muted-foreground hover:bg-[var(--cad-control)]/60 hover:text-foreground"
                            }`}
                          >
                            {/* Marker sits on the timeline */}
                            <span className="absolute -left-[5px] top-1/2 flex h-[9px] w-[9px] -translate-y-1/2 items-center justify-center">
                              {item.completed ? (
                                <span className="flex h-[13px] w-[13px] items-center justify-center rounded-full bg-success text-background">
                                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                                </span>
                              ) : isActive ? (
                                <span className="h-[9px] w-[9px] rounded-full bg-primary ring-[3px] ring-primary/20" />
                              ) : (
                                <span className="h-[7px] w-[7px] rounded-full border border-muted-foreground/40 bg-background transition-colors group-hover:border-muted-foreground/70" />
                              )}
                            </span>
                            <span className="min-w-0 flex-1 break-words">{item.title}</span>
                            {item.locked ? (
                              <Lock className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                            ) : isQuiz ? (
                              <ListChecks className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" aria-label="Quiz" />
                            ) : null}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          {footer}
        </div>
      </ScrollArea>
    </div>
  );
}
