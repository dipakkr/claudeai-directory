"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { LessonArticle, LessonArticleFooter, LessonArticleHeader } from "@/components/learn/LessonArticle";
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
  // Frequently CMS markdown includes the title as an H1 at the very start.
  // We strip it here since we are rendering the lesson.title manually above.
  const cleanContent = lesson.content.replace(/^\s*#\s+[^\n]+[\r\n]*/, '').trimStart();

  return (
    <LessonArticle>
      <LessonArticleHeader
        crumbs={[
          { label: "Guides", href: "/guides" },
          { label: lesson.guide_title, href: `/guides/${guideSlug}` },
          { label: lesson.chapter_title },
        ]}
        title={lesson.title}
        minutes={lesson.estimated_time}
        sectionTitle={lesson.chapter_title}
      />

      {/* Markdown content */}
      <article className="guide-prose">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
          {cleanContent}
        </ReactMarkdown>
      </article>

      <LessonArticleFooter
        isCompleted={isCompleted}
        canTrack={isAuthenticated}
        onToggleComplete={onToggleComplete}
        isToggling={isToggling}
        prev={
          lesson.prev_lesson
            ? { title: lesson.prev_lesson.title, href: `/guides/${guideSlug}/${lesson.prev_lesson.id}` }
            : null
        }
        next={
          lesson.next_lesson
            ? { title: lesson.next_lesson.title, href: `/guides/${guideSlug}/${lesson.next_lesson.id}` }
            : null
        }
      />
    </LessonArticle>
  );
}
