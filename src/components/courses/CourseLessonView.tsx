"use client";

import Link from "next/link";
import { Download, FileText, Lock } from "lucide-react";

import CourseInterestForm from "@/components/courses/CourseInterestForm";
import LockedLessonView from "@/components/courses/LockedLessonView";
import QuizQuestion from "@/components/courses/QuizQuestion";
import { LessonLayout } from "@/components/learn/LessonLayout";
import { LessonSidebar } from "@/components/learn/LessonSidebar";
import { LessonTOC, slugifyHeading, type LessonHeading } from "@/components/learn/LessonTOC";
import { LessonArticle, LessonArticleFooter, LessonArticleHeader, type LessonLink } from "@/components/learn/LessonArticle";
import { LessonAccessBar } from "@/components/learn/LessonAccessBar";
import { useCourseProgress } from "@/hooks/use-course-progress";
import { courseLessonHref } from "@/lib/course-links";
import type { Course } from "@/data/courses";
import type { LessonBlock, PlayerLesson } from "@/data/course-content";

/** Lesson titles and access per module, without lesson bodies. */
export interface CourseOutlineModule {
  id: string;
  title: string;
  free: boolean;
  lessons: { id: string; title: string }[];
}

// Progress keys include the module so generated lesson ids can never collide.
const progressKey = (moduleId: string, lessonId: string) => `${moduleId}/${lessonId}`;

export default function CourseLessonView({
  course,
  outline,
  moduleId,
  lesson,
}: {
  course: Course;
  outline: CourseOutlineModule[];
  moduleId: string;
  lesson: PlayerLesson;
}) {
  const { completed, toggle } = useCourseProgress(course.slug);

  const activeModule = outline.find((m) => m.id === moduleId)!;
  const locked = !activeModule.free;

  const flat = outline.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleId: m.id, locked: !m.free }))
  );
  const index = flat.findIndex((l) => l.moduleId === moduleId && l.id === lesson.id);
  const toLink = (entry: (typeof flat)[number] | undefined): LessonLink | null =>
    entry ? { title: entry.title, href: courseLessonHref(course.slug, entry.moduleId, entry.id) } : null;
  const prev = toLink(flat[index - 1]);
  const next = toLink(flat[index + 1]);
  const lockedCount = flat.filter((l) => l.locked).length;

  const key = progressKey(moduleId, lesson.id);
  const completedCount = flat.filter((l) => completed.has(progressKey(l.moduleId, l.id))).length;
  const headings = !locked && lesson.type === "lesson" ? lessonHeadings(lesson.blocks) : [];

  const sidebar = (
    <LessonSidebar
      backHref={`/courses/${course.slug}`}
      backLabel="Course overview"
      title={course.title}
      currentItemId={key}
      completedCount={completedCount}
      totalCount={flat.length}
      sections={outline.map((m) => ({
        id: m.id,
        title: m.title,
        items: m.lessons.map((l) => ({
          id: progressKey(m.id, l.id),
          title: l.title,
          href: courseLessonHref(course.slug, m.id, l.id),
          completed: completed.has(progressKey(m.id, l.id)),
          locked: !m.free,
        })),
      }))}
      footer={course.isFree && course.previewAssets?.length ? <CourseResources course={course} /> : null}
    />
  );

  return (
    <LessonLayout
      sidebar={sidebar}
      bottomBar={
        lockedCount > 0 ? (
          <LessonAccessBar
            lockedCount={lockedCount}
            subtitle={`Get full access to ${course.title}`}
            ctaLabel="See the full course"
            ctaHref={`/courses/${course.slug}`}
          />
        ) : null
      }
    >
      <LessonArticle>
        <LessonArticleHeader
          crumbs={[
            { label: "Courses", href: "/courses" },
            { label: course.title, href: `/courses/${course.slug}` },
            { label: activeModule.title },
          ]}
          title={lesson.title}
          minutes={lesson.minutes}
          sectionTitle={lesson.type === "quiz" ? "Checkpoint" : activeModule.title}
        />

        {locked ? (
          <LockedLesson course={course} />
        ) : lesson.type === "lesson" ? (
          <article className="guide-prose">
            <LessonBlocks blocks={lesson.blocks} headings={headings} />
          </article>
        ) : (
          <div>
            <p className="mb-6 text-sm leading-7 text-muted-foreground">
              Pick an answer for each question. You will see the explanation right after.
            </p>
            <div className="space-y-8">
              {lesson.questions.map((question, i) => (
                <QuizQuestion key={question.question} question={question} index={i} />
              ))}
            </div>
          </div>
        )}

        <LessonArticleFooter
          isCompleted={completed.has(key)}
          canTrack={!locked}
          hideCompletion={locked}
          onToggleComplete={() => toggle(key)}
          prev={prev}
          next={next}
          after={course.isFree ? { title: "Explore role-based courses", href: "/courses" } : null}
        />
      </LessonArticle>
      <LessonTOC headings={headings} />
    </LessonLayout>
  );
}

function lessonHeadings(blocks: LessonBlock[]): LessonHeading[] {
  const seen = new Map<string, number>();
  const headings: LessonHeading[] = [];
  for (const block of blocks) {
    if (block.type !== "heading") continue;
    const base = slugifyHeading(block.text) || "section";
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    headings.push({ id: count ? `${base}-${count}` : base, text: block.text, level: 2 });
  }
  return headings;
}

// Course blocks render as the same prose elements guide markdown produces, so
// both read identically under `.guide-prose`.
function LessonBlocks({ blocks, headings }: { blocks: LessonBlock[]; headings: LessonHeading[] }) {
  let headingIndex = 0;

  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading": {
            const heading = headings[headingIndex++];
            return (
              <h2 key={i} id={heading?.id}>
                {block.text}
              </h2>
            );
          }
          case "text":
            return <p key={i}>{block.text}</p>;
          case "list":
            return (
              <ul key={i}>
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          case "prompt":
            // Literal copy-paste text: set apart with a left accent, not a card.
            return (
              <div key={i} className="not-prose my-6 border-l-2 border-primary/40 pl-4">
                <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  {block.title}
                </p>
                <div className="mt-2 whitespace-pre-wrap font-mono text-[13px] leading-6 text-foreground/80">
                  {block.text}
                </div>
              </div>
            );
          case "tip":
            return (
              <blockquote key={i}>
                <p>{block.text}</p>
              </blockquote>
            );
        }
      })}
    </>
  );
}

function LockedLesson({ course }: { course: Course }) {
  if (course.isFreemium) return <LockedLessonView course={course} />;

  return (
    <div className="border-t border-border pt-6">
      <p className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Lock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        This lesson is part of the full course
      </p>
      <p className="mt-2 mb-6 text-sm leading-7 text-muted-foreground">
        The first module is free. Join the launch list to get the full course as lessons are released.
      </p>
      <CourseInterestForm courseSlug={course.slug} source={`course-learn-${course.slug}`} compact />
    </div>
  );
}

function CourseResources({ course }: { course: Course }) {
  return (
    <>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40 px-3 pb-1 pt-4">
        Resources
      </p>
      {course.previewAssets?.map((asset) => (
        <Link
          key={asset.href}
          href={asset.href}
          className="flex items-start gap-3 px-3 py-2 rounded-lg text-xs text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground mb-0.5"
        >
          <Download className="mt-[2px] h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="flex-1 min-w-0 leading-snug break-words">{asset.label}</span>
        </Link>
      ))}
    </>
  );
}
