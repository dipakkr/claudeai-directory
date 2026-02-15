"use client";

import { useParams } from "next/navigation";
import Header from "@/components/layout/Header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { useGuide, useGuideLesson, useGuideProgress, useCompleteLesson } from "@/hooks/use-guides";
import { GuideSidebar } from "@/components/guides/GuideSidebar";
import { GuideContent } from "@/components/guides/GuideContent";
import { GuideTOC } from "@/components/guides/GuideTOC";
import { GuidePaidOverlay } from "@/components/guides/GuidePaidOverlay";
import { GuideAccessBar } from "@/components/guides/GuideAccessBar";

export default function LessonPage() {
  const { slug, lessonId } = useParams<{ slug: string; lessonId: string }>();
  const { user, isAuthenticated } = useAuth();

  const { data: guide, isLoading: guideLoading } = useGuide(slug);
  const {
    data: lesson,
    isLoading: lessonLoading,
    isError: lessonError,
    error,
  } = useGuideLesson(slug, lessonId);
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
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex flex-1">
        {/* Left sidebar — sticky, scrolls independently */}
        <aside className="hidden md:block w-64 shrink-0 border-r border-border">
          <div className="sticky top-0 h-[calc(100vh-3.5rem)] overflow-y-auto">
            {guideLoading || !guide ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-4 w-1/2 mt-4" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <GuideSidebar
                guide={guide}
                currentLessonId={lessonId}
                progress={progress ?? null}
                isProUser={isProUser}
              />
            )}
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex-1 min-w-0">
          <div className="flex gap-8 px-6 py-8 max-w-5xl mx-auto">
            {lessonLoading ? (
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
          </div>
        </main>
      </div>

      {/* Sticky bottom bar for paid guides */}
      {guide && !guide.is_free && lockedCount > 0 && (
        <GuideAccessBar
          guideName={guide.title}
          price={guide.price}
          lockedCount={lockedCount}
        />
      )}
    </div>
  );
}
