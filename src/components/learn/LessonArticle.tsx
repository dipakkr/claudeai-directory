"use client";

import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { SignInButton } from "@/components/auth/SignInDialog";

export interface LessonCrumb {
  label: string;
  href?: string;
}

export interface LessonLink {
  title: string;
  href: string;
}

/** Breadcrumb, title and reading meta shown above every lesson body. */
export function LessonArticleHeader({
  crumbs,
  title,
  minutes,
  sectionTitle,
}: {
  crumbs: LessonCrumb[];
  title: string;
  minutes: number;
  sectionTitle: string;
}) {
  return (
    <>
      {/* Breadcrumb */}
      <div className="text-xs text-muted-foreground mb-4 flex flex-wrap items-center gap-1.5">
        {crumbs.map((crumb, i) => (
          <Fragment key={`${crumb.label}-${i}`}>
            {i > 0 && <span>/</span>}
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-foreground transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-foreground">{crumb.label}</span>
            )}
          </Fragment>
        ))}
      </div>

      {/* Lesson header */}
      <h1 className="text-2xl font-semibold text-foreground mb-2">{title}</h1>
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-8">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {minutes} min read
        </span>
        <span>{sectionTitle}</span>
      </div>
    </>
  );
}

/** "Mark as complete" control plus previous/next lesson links. */
export function LessonArticleFooter({
  isCompleted,
  canTrack,
  onToggleComplete,
  isToggling = false,
  hideCompletion = false,
  prev,
  next,
  after,
}: {
  isCompleted: boolean;
  /** When false, a sign-in prompt replaces the completion toggle. */
  canTrack: boolean;
  onToggleComplete: () => void;
  isToggling?: boolean;
  hideCompletion?: boolean;
  prev: LessonLink | null;
  next: LessonLink | null;
  /** Shown in place of the next link on the final lesson. */
  after?: LessonLink | null;
}) {
  const forward = next ?? after ?? null;

  return (
    <>
      {/* Mark complete */}
      <div className="mt-10 pt-6 border-t border-border flex justify-end">
        {hideCompletion ? null : canTrack ? (
          <Button
            variant={isCompleted ? "outline" : "default"}
            size="sm"
            onClick={onToggleComplete}
            disabled={isToggling}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-success" />
                Completed
              </>
            ) : (
              <>
                <Circle className="mr-1.5 h-3.5 w-3.5" />
                Mark as Complete
              </>
            )}
          </Button>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <SignInButton reason="track your progress">Sign in to track progress</SignInButton>
          </Button>
        )}
      </div>

      {/* Prev / Next */}
      <div className="mt-6 flex items-center justify-between gap-4">
        {prev ? (
          <Link
            href={prev.href}
            className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4 shrink-0" />
            <span className="min-w-0 max-w-[200px] truncate">{prev.title}</span>
          </Link>
        ) : (
          <div />
        )}
        {forward ? (
          <Link
            href={forward.href}
            className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="min-w-0 max-w-[200px] truncate">{forward.title}</span>
            <ChevronRight className="h-4 w-4 shrink-0" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </>
  );
}

export function LessonArticle({ children }: { children: ReactNode }) {
  return <div className="flex-1 min-w-0 max-w-3xl">{children}</div>;
}
