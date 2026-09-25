"use client";

import { LessonSidebar } from "@/components/learn/LessonSidebar";
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

  return (
    <LessonSidebar
      backHref="/guides"
      backLabel="All Guides"
      title={guide.title}
      currentItemId={currentLessonId}
      completedCount={completedSet.size}
      totalCount={guide.total_lessons}
      sections={guide.chapters.map((chapter) => ({
        id: chapter.id,
        // Short sidebar label; the full title stays on the page and in search results.
        title: chapter.nav_title || chapter.title,
        items: chapter.lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.nav_title || lesson.title,
          href: `/guides/${guide.id}/${lesson.id}`,
          completed: completedSet.has(lesson.id),
          locked: !lesson.is_free && !guide.is_free && !isProUser,
        })),
      }))}
    />
  );
}
