"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import type { GuideLesson } from "@/types";

interface GuideContentProps {
  lesson: GuideLesson;
  guideSlug: string;
  isCompleted: boolean;
  isAuthenticated: boolean;
  onToggleComplete: () => void;
  isToggling: boolean;
}

export function GuideContent({
  lesson,
  guideSlug,
  isCompleted,
  isAuthenticated,
  onToggleComplete,
  isToggling,
}: GuideContentProps) {
  return (
    <div className="flex-1 min-w-0 max-w-3xl">
      {/* Breadcrumb */}
      <div className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
        <Link href="/guides" className="hover:text-foreground transition-colors">
          Guides
        </Link>
        <span>/</span>
        <Link
          href={`/guides/${guideSlug}`}
          className="hover:text-foreground transition-colors"
        >
          {lesson.guide_title}
        </Link>
        <span>/</span>
        <span className="text-foreground">{lesson.chapter_title}</span>
      </div>

      {/* Lesson header */}
      <h1 className="text-2xl font-semibold text-foreground mb-2">
        {lesson.title}
      </h1>
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-8">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {lesson.estimated_time} min read
        </span>
        <span>{lesson.chapter_title}</span>
      </div>

      {/* Markdown content */}
      <article className="guide-prose">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
          {lesson.content}
        </ReactMarkdown>
      </article>

      {/* Mark complete */}
      <div className="mt-10 pt-6 border-t border-border">
        {isAuthenticated ? (
          <Button
            variant={isCompleted ? "outline" : "default"}
            size="sm"
            onClick={onToggleComplete}
            disabled={isToggling}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-green-500" />
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
          <Link href="/login">
            <Button variant="outline" size="sm">
              Sign in to track progress
            </Button>
          </Link>
        )}
      </div>

      {/* Prev / Next */}
      <div className="mt-6 flex items-center justify-between">
        {lesson.prev_lesson ? (
          <Link
            href={`/guides/${guideSlug}/${lesson.prev_lesson.id}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="max-w-[200px] truncate">
              {lesson.prev_lesson.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
        {lesson.next_lesson ? (
          <Link
            href={`/guides/${guideSlug}/${lesson.next_lesson.id}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="max-w-[200px] truncate">
              {lesson.next_lesson.title}
            </span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
