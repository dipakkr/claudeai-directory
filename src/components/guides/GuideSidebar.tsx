"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle, Lock } from "lucide-react";
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
      <div className="px-4 pt-3 pb-1">
        <Link
          href="/guides"
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          All Guides
        </Link>
      </div>

      {/* Guide title + progress */}
      <div className="px-4 pb-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground mb-1 line-clamp-2">
          {guide.title}
        </h2>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Progress</span>
          <span>
            {completedCount} / {guide.total_lessons} lessons
          </span>
        </div>
        <Progress value={progressPct} className="h-1.5" />
      </div>

      {/* Chapters + Lessons */}
      <ScrollArea className="flex-1">
        <div className="py-3 px-3 space-y-4">
          {guide.chapters.map((chapter, idx) => (
            <div key={chapter.id}>
              <div className="flex items-center gap-2 px-1 mb-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Module {idx + 1}
                </span>
                <span className="flex-1 h-px bg-border" />
              </div>
              <p className="text-xs font-medium text-foreground px-1 mb-2">
                {chapter.title}
              </p>
              <div className="space-y-0.5">
                {chapter.lessons.map((lesson) => {
                  const isActive = lesson.id === currentLessonId;
                  const isCompleted = completedSet.has(lesson.id);
                  const isLocked =
                    !lesson.is_free && !guide.is_free && !isProUser;

                  return (
                    <Link
                      key={lesson.id}
                      href={`/guides/${guide.id}/${lesson.id}`}
                      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      ) : isLocked ? (
                        <Lock className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 shrink-0" />
                      )}
                      <span className="truncate">{lesson.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
