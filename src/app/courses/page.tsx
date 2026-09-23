import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Clock3 } from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CourseInterestForm from "@/components/courses/CourseInterestForm";
import { COURSES, getCourseStatusLabel } from "@/data/courses";

export const metadata: Metadata = {
  title: { absolute: "Claude Courses: Claude Mastery, GTM, SEO and Workflows | Claude AI Directory" },
  description:
    "Free Claude Mastery course plus practical Claude courses for GTM, SEO, product, marketing and work systems.",
  alternates: { canonical: "/courses" },
};

const prioritySlugs = new Set(["claude-mastery", "claude-for-gtm", "claude-for-seo"]);

export default function CoursesPage() {
  // Fully-free courses get their own section above, so specialization/coming-soon
  // lists only need the ones that still require a subscription to unlock.
  const priorityCourses = COURSES.filter((course) => prioritySlugs.has(course.slug) && !course.isFree);
  const otherCourses = COURSES.filter((course) => !prioritySlugs.has(course.slug) && !course.isFree);
  const freeCourses = COURSES.filter((course) => course.isFree);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section with Featured Courses */}
        <section className="relative overflow-hidden py-16 md:py-24">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.06),transparent_70%)]" />

          <div className="relative mx-auto max-w-[1120px] px-4 text-center md:px-8">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">
              Free to start learning
            </p>
            <h1 className="max-w-[900px] mx-auto text-balance text-[44px] font-normal leading-[1.1] text-foreground md:text-[56px]">
              Learn Claude through real workflows
            </h1>
            <p className="mx-auto mt-6 max-w-[680px] text-lg leading-8 text-muted-foreground">
              Master Claude with free modules, then unlock deeper role-based courses in GTM, SEO, product, and Claude Code.
            </p>

            {/* Featured logos */}
            <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
              <span className="text-xs font-medium text-muted-foreground">Featured in:</span>
              <div className="flex gap-3">
                {['GTM', 'SEO', 'Product', 'Code'].map((name) => (
                  <div key={name} className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card/50 text-xs font-semibold text-muted-foreground">
                    {name.slice(0, 2)}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="#free-courses"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Start free course
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#role-based"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-card"
              >
                Explore courses
              </Link>
            </div>
          </div>
        </section>

        {/* Free Courses Section */}
        <section id="free-courses" className="mx-auto max-w-[1120px] px-4 pb-6 md:px-8">
          <div className="border-y border-border">
            <div className="py-6 text-center md:py-8">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">No payment required</p>
              <h2 className="mt-2 text-2xl font-normal text-foreground">Free courses</h2>
              <p className="mt-1 text-sm text-muted-foreground">Start here. No account needed.</p>
            </div>
            <div className="border-t border-border">
              {freeCourses.map((course) => (
                <CourseRow key={course.slug} course={course} priority />
              ))}
            </div>
          </div>
        </section>

        {/* Freemium & Paid Courses Section */}
        <section className="mx-auto mt-12 max-w-[1120px] px-4 pb-20 md:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-normal text-foreground">Specialization courses</h2>
              <p className="mt-1 text-sm text-muted-foreground">Try the first 2 days free, then subscribe to unlock the full course.</p>
            </div>
          </div>

          {/* Freemium Courses (priority) */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">Free preview available</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="rounded-xl border border-border overflow-hidden">
              {priorityCourses.map((course) => (
                <CourseRow key={course.slug} course={course} freemium />
              ))}
            </div>
          </div>

          {/* Other Paid Courses */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Coming soon</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="rounded-xl border border-border overflow-hidden">
              {otherCourses.map((course) => (
                <CourseRow key={course.slug} course={course} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function CourseRow({
  course,
  priority = false,
  freemium = false,
}: {
  course: (typeof COURSES)[number];
  priority?: boolean;
  freemium?: boolean;
}) {
  const statusLabel = course.isFree ? "Open course" : freemium ? "Free preview" : getCourseStatusLabel(course.status);
  const priceLabel = course.isFree ? "Free course" : freemium ? "From $19 • 2 days free" : `$${course.price} launch price`;
  // "Open" implies the course is ready to start today - only true for free/
  // freemium/preview-ready courses. Anything still launching or planned gets
  // a softer CTA since the link just leads to a waitlist, not the course.
  const ctaLabel = freemium
    ? "Try free"
    : course.isFree || course.status === "ready-preview"
      ? "Open"
      : "Learn more";

  return (
    <Link
      href={`/courses/${course.slug}`}
      className={`group flex items-start gap-4 border-b border-border px-4 py-5 sm:px-6 last:border-b-0 transition-colors hover:bg-card/45 ${
        priority || freemium ? "bg-primary/[0.035]" : ""
      }`}
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-primary shadow-sm">
        <BookOpen className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-md border border-border px-2 py-0.5">{course.category}</span>
          <span>{course.durationDays} days</span>
          <span>{course.dailyMinutes} min/day</span>
          <span className={`${freemium ? "text-primary font-medium" : ""}`}>{statusLabel}</span>
        </span>
        <span className="mt-2.5 block text-lg font-medium leading-tight text-foreground">{course.title}</span>
        <span className="mt-1.5 block max-w-[76ch] text-sm leading-6 text-muted-foreground">{course.promise}</span>
        <span className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            {priceLabel}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            Templates and final artifact
          </span>
        </span>
      </span>
      <span className="hidden shrink-0 items-center gap-1.5 pt-2 text-sm font-medium text-foreground group-hover:underline sm:inline-flex">
        {ctaLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </Link>
  );
}
