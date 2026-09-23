import Link from "next/link";
import { getFeaturedCourses, getCourseStatusLabel } from "@/data/courses";
import { ArrowRight, BookOpen, CheckCircle2, Clock3 } from "lucide-react";

const CoursesSection = () => {
  const courses = getFeaturedCourses();

  return (
    <section className="mx-auto mt-16 max-w-[840px] px-4 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">Claude courses</p>
          <h2 className="mt-2 text-2xl leading-tight text-foreground">Learn Claude for GTM and SEO</h2>
        </div>
        <Link href="/courses" className="inline-flex items-center gap-2 py-2 text-sm text-foreground underline underline-offset-4">
          View all courses <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Short courses with prompts, templates and one finished work system at the end.
      </p>

      <div className="mt-5 border-y border-border">
          {courses.map((course) => (
            <Link
              key={course.slug}
              href={`/courses/${course.slug}`}
            className="group flex items-start gap-4 border-b border-border py-5 last:border-b-0 transition-colors hover:bg-card/45"
            >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-primary shadow-sm">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{course.category}</span>
                <span>{course.durationDays} days</span>
                <span>{getCourseStatusLabel(course.status)}</span>
              </span>
              <span className="mt-2 block text-lg font-medium leading-tight text-foreground">{course.title}</span>
              <span className="mt-1.5 block text-sm leading-6 text-muted-foreground">{course.promise}</span>
              <span className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  {course.dailyMinutes} minutes per day
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  Templates and final work artifact included
                </span>
              </span>
            </span>
            <span className="hidden shrink-0 pt-2 text-sm text-foreground group-hover:underline sm:inline">Open</span>
            </Link>
          ))}
      </div>
    </section>
  );
};

export default CoursesSection;
