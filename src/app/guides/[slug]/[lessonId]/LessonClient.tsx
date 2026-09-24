"use client";

import { useParams } from "next/navigation";
import { LessonLayout, LessonSkeleton } from "@/components/learn/LessonLayout";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { useGuide, useGuideLesson, useGuideProgress, useCompleteLesson } from "@/hooks/use-guides";
import { GuideSidebar } from "@/components/guides/GuideSidebar";
import { GuideContent } from "@/components/guides/GuideContent";
import { GuideTOC } from "@/components/guides/GuideTOC";
import { GuidePaidOverlay } from "@/components/guides/GuidePaidOverlay";
import { GuideAccessBar } from "@/components/guides/GuideAccessBar";
import type { GuideDetail, GuideLesson } from "@/types";

interface LessonPageProps {
  initialLesson?: GuideLesson;
  initialGuide?: GuideDetail;
}

export default function LessonPage({ initialLesson, initialGuide }: LessonPageProps) {
  const { slug, lessonId } = useParams<{ slug: string; lessonId: string }>();
  const { user, isAuthenticated } = useAuth();

  const { data: guide, isLoading: guideLoading } = useGuide(slug, { initialData: initialGuide });
  const {
    data: lesson,
    isLoading: lessonLoading,
    isError: lessonError,
    error,
  } = useGuideLesson(slug, lessonId, { initialData: initialLesson });
  const { data: progress } = useGuideProgress(slug);
  const completeMutation = useCompleteLesson();

  const isCompleted = progress?.completed_lessons?.includes(lessonId) ?? false;
  const isProUser = user?.plan === "pro" || user?.plan === "premium" || user?.role === "admin";

  // Count locked lessons
  const lockedCount =
    guide && !isProUser
      ? guide.chapters.reduce(
        (acc, ch) =>
          acc +
          ch.lessons.filter((l) => !l.is_free && !guide.is_free).length,
        0
      )
      : 0;

  // Check if lesson is locked — either API returned 403 or client-side check
  const isApiLocked =
    lessonError && error instanceof ApiError && error.status === 403;
  const isClientLocked = (() => {
    if (!guide || isProUser) return false;
    for (const ch of guide.chapters) {
      const found = ch.lessons.find((l) => l.id === lessonId);
      if (found) return !found.is_free && !guide.is_free;
    }
    return false;
  })();
  const isPaidLocked = isApiLocked || (!lessonLoading && !lesson && isClientLocked);

  const handleToggleComplete = () => {
    if (!isAuthenticated) return;
    completeMutation.mutate({ guideSlug: slug, lessonId });
  };

  return (
    <LessonLayout
      sidebar={
        guideLoading || !guide ? null : (
          <GuideSidebar
            guide={guide}
            currentLessonId={lessonId}
            progress={progress ?? null}
            isProUser={isProUser}
          />
        )
      }
      bottomBar={
        // Sticky bottom bar for paid guides
        guide && !guide.is_free && lockedCount > 0 ? (
          <GuideAccessBar
            guideName={guide.title}
            price={guide.price}
            lockedCount={lockedCount}
          />
        ) : null
      }
    >
      {lessonLoading ? (
        <LessonSkeleton />
      ) : isPaidLocked ? (
        <GuidePaidOverlay
          guideTitle={guide?.title ?? "this guide"}
          price={guide?.price}
        />
      ) : lesson ? (
        <>
          <GuideContent
            lesson={lesson}
            guideSlug={slug}
            isCompleted={isCompleted}
            isAuthenticated={isAuthenticated}
            onToggleComplete={handleToggleComplete}
            isToggling={completeMutation.isPending}
          />
          <GuideTOC content={lesson.content} />
        </>
      ) : (
        <div className="flex-1 text-center py-16">
          <p className="text-sm text-muted-foreground">
            Lesson not found.
          </p>
        </div>
      )}
    </LessonLayout>
  );
}
