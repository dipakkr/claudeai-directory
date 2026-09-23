import Link from "next/link";
import { ArrowRight, CheckCircle2, Download, FileText, Lock } from "lucide-react";

import CourseInterestForm from "@/components/courses/CourseInterestForm";
import LockedLessonView from "@/components/courses/LockedLessonView";
import type { Course } from "@/data/courses";
import type { CourseContent, CourseModule, LessonBlock, PlayerLesson } from "@/data/course-content";

export default function CourseLearnView({
  course,
  content,
  activeModule,
}: {
  course: Course;
  content: CourseContent;
  activeModule: CourseModule;
}) {
  const isFreeCourse = Boolean(course.isFree);
  const totalLessons = content.modules.reduce((sum, module) => sum + module.lessons.length, 0);
  const openLessons = content.modules.reduce((sum, module) => sum + (module.free ? module.lessons.length : 0), 0);
  const activeIndex = content.modules.findIndex((module) => module.id === activeModule.id);
  const previousModule = activeIndex > 0 ? content.modules[activeIndex - 1] : null;
  const nextModule = activeIndex >= 0 && activeIndex < content.modules.length - 1 ? content.modules[activeIndex + 1] : null;

  return (
    <main className="mx-auto max-w-[1120px] px-4 pb-20 pt-9 md:px-8 md:pt-12">
      <Link href={`/courses/${course.slug}`} className="text-sm text-muted-foreground hover:text-foreground">
        {course.title}
      </Link>
      <div className="mt-5 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <CourseSidebar
          course={course}
          content={content}
          activeModule={activeModule}
          isFreeCourse={isFreeCourse}
          totalLessons={totalLessons}
          openLessons={openLessons}
        />

        <section className="order-1 min-w-0 lg:order-2">
          <div className="border-y border-border">
            {!activeModule.free && course.isFreemium ? (
              <>
                <div className="py-6 px-6">
                  <div className="flex items-start gap-3 mb-6">
                    <Lock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h2 className="text-2xl font-medium text-foreground">{activeModule.title}</h2>
                      <p className="mt-2 text-sm text-muted-foreground">
                        This module is available in the full course
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <LockedLessonView course={course} />
                </div>
              </>
            ) : (
              <ModuleDetail module={activeModule} isFreeCourse={isFreeCourse} course={course} />
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            {previousModule ? (
              <Link
                href={`/courses/${course.slug}/learn/${previousModule.id}`}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Previous: {previousModule.title}
              </Link>
            ) : (
              <span />
            )}
            {nextModule ? (
              <Link
                href={`/courses/${course.slug}/learn/${nextModule.id}`}
                className="inline-flex items-center gap-2 text-sm text-foreground underline underline-offset-4"
              >
                Next: {nextModule.title} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : isFreeCourse ? (
              <Link
                href="/courses/claude-for-gtm"
                className="inline-flex items-center gap-2 text-sm text-foreground underline underline-offset-4"
              >
                Explore role-based courses <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function CourseSidebar({
  course,
  content,
  activeModule,
  isFreeCourse,
  totalLessons,
  openLessons,
}: {
  course: Course;
  content: CourseContent;
  activeModule: CourseModule;
  isFreeCourse: boolean;
  totalLessons: number;
  openLessons: number;
}) {
  return (
    <aside className="order-2 lg:order-1 lg:sticky lg:top-24 lg:self-start">
      <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {isFreeCourse ? "Free course" : "Course preview"}
      </p>
      <h1 className="mt-2 text-3xl font-normal leading-tight text-foreground">{course.title}</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {isFreeCourse
          ? "Open lessons, labs and templates for learning how to work effectively with Claude."
          : "The first module is free. Join the launch list to get the full course as lessons are released."}
      </p>
      <div className="mt-5 rounded-xl border border-border bg-card/45 p-4">
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.round((openLessons / Math.max(totalLessons, 1)) * 100)}%` }}
          />
        </div>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          {openLessons} of {totalLessons} lessons open
        </p>
        <nav aria-label="Course modules" className="mt-4 border-t border-border pt-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Modules</p>
          <div className="space-y-1">
            {content.modules.map((module, index) => {
              const isActive = module.id === activeModule.id;
              return (
                <Link
                  key={module.id}
                  href={`/courses/${course.slug}/learn/${module.id}`}
                  aria-current={isActive ? "page" : undefined}
                  className={`grid grid-cols-[28px_minmax(0,1fr)] gap-2 rounded-lg px-2 py-2 text-xs leading-5 transition-colors ${
                    isActive
                      ? "bg-card text-foreground"
                      : "text-muted-foreground hover:bg-card hover:text-foreground"
                  }`}
                >
                  <span className="font-mono text-[11px] text-primary">{String(index + 1).padStart(2, "0")}</span>
                  <span className="truncate">{module.title}</span>
                </Link>
              );
            })}
          </div>
        </nav>
        {isFreeCourse ? (
          <div className="mt-4 space-y-2">
            {course.previewAssets?.map((asset) => (
              <Link
                key={asset.href}
                href={asset.href}
                className="flex items-start gap-2 rounded-lg border border-border px-3 py-2 text-xs leading-5 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <Download className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{asset.label}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <CourseInterestForm courseSlug={course.slug} source={`course-learn-${course.slug}`} compact />
          </div>
        )}
      </div>
    </aside>
  );
}

function ModuleDetail({ module, isFreeCourse, course }: { module: CourseModule; isFreeCourse: boolean; course: Course }) {
  const locked = !module.free;
  const lessonCount = module.lessons.length;
  const totalMinutes = module.lessons.reduce((sum, lesson) => sum + lesson.minutes, 0);

  return (
    <div className="border-b border-border last:border-b-0">
      <div className="py-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {module.free ? (isFreeCourse ? "Open module" : "Free module") : "Locked module"}
            </p>
            <h2 className="mt-1 text-3xl font-normal leading-tight text-foreground">{module.title}</h2>
            <p className="mt-3 max-w-[62ch] text-sm leading-6 text-muted-foreground">
              {lessonCount} lesson{lessonCount === 1 ? "" : "s"} / {totalMinutes} min. Work through the lessons,
              copy the useful prompts, then use the checkpoint to test the mental model.
            </p>
          </div>
          {locked ? <Lock className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" /> : null}
        </div>

        <nav aria-label={`${module.title} lessons`} className="mt-5 grid gap-2 sm:grid-cols-2">
          {module.lessons.map((lesson, index) => (
            <Link
              key={lesson.id}
              href={`#${lesson.id}`}
              className="grid grid-cols-[34px_minmax(0,1fr)] gap-3 rounded-lg border border-border bg-card/35 px-3 py-3 text-sm transition-colors hover:border-primary/35 hover:bg-card"
            >
              <span className="font-mono text-xs text-primary">{String(index + 1).padStart(2, "0")}</span>
              <span className="min-w-0">
                <span className="block truncate text-foreground">{lesson.title}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{lesson.minutes} min</span>
              </span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="pb-4">
        {module.lessons.map((lesson, index) => (
          <LessonCard key={lesson.id} lesson={lesson} lessonNumber={index + 1} locked={locked} />
        ))}
      </div>
    </div>
  );
}

function LessonCard({
  lesson,
  lessonNumber,
  locked,
}: {
  lesson: PlayerLesson;
  lessonNumber: number;
  locked: boolean;
}) {
  const isQuiz = lesson.type === "quiz";

  return (
    <article id={lesson.id} className={`scroll-mt-24 border-t border-border py-6 ${locked ? "opacity-55" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-primary">
            {isQuiz ? "Checkpoint" : `Lesson ${String(lessonNumber).padStart(2, "0")}`}
          </p>
          <h3 className="mt-1 text-xl font-medium leading-snug text-foreground">{lesson.title}</h3>
        </div>
        <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
          {lesson.minutes} min
        </span>
      </div>
      {locked ? (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Join the launch list to unlock this lesson.</p>
      ) : lesson.type === "lesson" ? (
        <div className="mt-5 space-y-4">
          {lesson.blocks.map((block, index) => (
            <LessonBlockView key={`${lesson.id}-${index}`} block={block} />
          ))}
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {lesson.questions.map((question, index) => (
            <div key={question.question} className="rounded-lg border border-border bg-card/35 p-4">
              <p className="text-sm font-medium leading-6 text-foreground">
                {index + 1}. {question.question}
              </p>
              <div className="mt-3 grid gap-2">
                {question.options.map((option, optionIndex) => {
                  const isCorrect = optionIndex === question.correctIndex;
                  return (
                    <div
                      key={option}
                      className={`flex gap-2 rounded-lg border px-3 py-2 text-sm leading-5 ${
                        isCorrect
                          ? "border-primary/35 bg-primary/10 text-foreground"
                          : "border-border bg-background/35 text-muted-foreground"
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      ) : (
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/45" />
                      )}
                      <span>{option}</span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 border-t border-border pt-3 text-xs leading-5 text-muted-foreground">
                {question.explanation}
              </p>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function LessonBlockView({ block }: { block: LessonBlock }) {
  if (block.type === "heading") {
    return <h4 className="pt-2 text-base font-medium text-foreground">{block.text}</h4>;
  }
  if (block.type === "text") return <p className="text-[15px] leading-7 text-muted-foreground">{block.text}</p>;
  if (block.type === "list") {
    return (
      <ul className="space-y-2 rounded-lg border border-border bg-card/25 p-4 text-sm leading-6 text-muted-foreground">
        {block.items.map((item) => (
          <li key={item} className="flex gap-2">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary/80" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }
  if (block.type === "prompt") {
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-card/45">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
            {block.title}
          </span>
          <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Prompt
          </span>
        </div>
        <pre className="whitespace-pre-wrap bg-background/35 px-4 py-4 font-mono text-[13px] leading-6 text-muted-foreground">
          {block.text}
        </pre>
      </div>
    );
  }
  return (
    <p className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">
      {block.text}
    </p>
  );
}
