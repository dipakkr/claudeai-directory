"use client";

import { Fragment } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { GuideDetail, GuideProgress } from "@/types";

interface GuideSidebarProps {
  guide: GuideDetail;
  currentLessonId: string;
  progress: GuideProgress | null;
  isProUser: boolean;
}

export function GuideSidebar({
  guide,
  currentLessonId,
  progress,
  isProUser,
}: GuideSidebarProps) {
  const completedSet = new Set(progress?.completed_lessons ?? []);
  const completedCount = completedSet.size;
  const progressPct =
    guide.total_lessons > 0
      ? (completedCount / guide.total_lessons) * 100
      : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Back link */}
      <div className="px-4 pt-4 pb-2">
        <Link
          href="/guides"
          className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          All Guides
        </Link>
      </div>

      {/* Guide title + progress */}
      <div className="px-4 pb-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground mb-3 leading-snug">
          {guide.title}
        </h2>
        <Progress value={progressPct} className="h-1 mb-2" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            {completedCount} of {guide.total_lessons} lessons
          </span>
          {completedCount > 0 && (
            <span className="text-[11px] text-primary font-medium">
              {Math.round(progressPct)}%
            </span>
          )}
        </div>
      </div>

      {/* Lesson list */}
      <ScrollArea className="flex-1 min-w-0">
        <div className="py-3 px-2">
          {guide.chapters.map((chapter, chIdx) => {
            const showChapterLabel = chapter.lessons.length > 1;

            return (
              <Fragment key={chapter.id}>
                {/* Chapter label — only when multiple lessons */}
                {showChapterLabel && (
                  <p
                    className={`text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 px-3 pb-1 ${
                      chIdx > 0 ? "pt-4" : "pt-2"
                    }`}
                  >
                    {chapter.title}
                  </p>
                )}

                {chapter.lessons.map((lesson) => {
                  const isActive = lesson.id === currentLessonId;
                  const isCompleted = completedSet.has(lesson.id);
                  const isLocked =
                    !lesson.is_free && !guide.is_free && !isProUser;

                  return (
                    <Link
                      key={lesson.id}
                      href={`/guides/${guide.id}/${lesson.id}`}
                      className={`group flex items-start gap-3 px-3 py-2 rounded-lg text-xs transition-all mb-0.5 ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      {/* Status icon */}
                      <span className="shrink-0 mt-[3px] w-3.5 flex items-center justify-center">
                        {isCompleted ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        ) : isLocked ? (
                          <Lock className="h-3 w-3 text-muted-foreground/30" />
                        ) : isActive ? (
                          <span className="flex h-2 w-2 rounded-full bg-primary ring-[3px] ring-primary/20" />
                        ) : (
                          <span className="flex h-1.5 w-1.5 rounded-full bg-muted-foreground/25 group-hover:bg-muted-foreground/50 transition-colors" />
                        )}
                      </span>

                      {/* Lesson title */}
                      <span className={`flex-1 min-w-0 leading-snug break-words ${isActive ? "font-medium" : ""}`}>
                        {lesson.title}
                      </span>
                    </Link>
                  );
                })}
              </Fragment>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
