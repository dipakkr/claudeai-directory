import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getFeaturedCourses, getCourseStatusLabel } from "@/data/courses";
import { ArrowRight, BookOpen, CheckCircle2, Clock3 } from "lucide-react";

const CoursesSection = () => {
  const courses = getFeaturedCourses();

  return (
    <section className="border-y border-border bg-muted/10 py-14">
      <div className="container max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 text-xs uppercase tracking-wider text-primary">
              New paid learning path
            </div>
            <h2 className="text-3xl font-medium tracking-tight text-foreground">
              7-day Claude courses for real work.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The directory remains free discovery. The product becomes short,
              practical courses with prompts, templates and role-specific outcomes.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/courses">
              View all courses
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.slug}
              href={`/courses/${course.slug}`}
              className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="rounded-xl border border-primary/20 bg-primary/10 p-2 text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground">
                  {getCourseStatusLabel(course.status)}
                </span>
              </div>
              <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                {course.durationDays} days / ${course.price}
              </div>
              <h3 className="mb-3 text-xl font-medium leading-tight text-foreground">
                {course.title}
              </h3>
              <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                {course.promise}
              </p>
              <div className="mb-5 grid gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-3.5 w-3.5 text-primary" />
                  {course.dailyMinutes} minutes per day
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  Templates and final work artifact included
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                Open course
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
