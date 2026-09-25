import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock3, Download, Lock } from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CourseInterestForm from "@/components/courses/CourseInterestForm";
import { COURSES, getCourse, getCourseStatusLabel, isCourseCheckoutLive } from "@/data/courses";
import { pageTitle } from "@/lib/seo";

export function generateStaticParams() {
  return COURSES.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) return { title: "Course Not Found" };

  return {
    title: pageTitle(course.title),
    description: course.description,
    alternates: { canonical: `/courses/${course.slug}` },
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const checkoutLive = isCourseCheckoutLive(course.checkoutUrl);
  const isFreeCourse = Boolean(course.isFree);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="mx-auto max-w-[1120px] px-4 pb-8 pt-9 md:px-8 md:pt-12">
          <Link href="/courses" className="text-sm text-muted-foreground hover:text-foreground">
            Courses
          </Link>
          <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                {course.eyebrow} / {isFreeCourse ? "Open course" : getCourseStatusLabel(course.status)}
              </p>
              <h1 className="mt-3 max-w-[780px] text-balance text-[34px] font-normal leading-tight text-foreground md:text-[50px]">
                {course.title}
              </h1>
              <p className="mt-5 max-w-[720px] text-lg leading-8 text-foreground/90">{course.promise}</p>
              <p className="mt-4 max-w-[720px] text-sm leading-6 text-muted-foreground">{course.description}</p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-full border border-border px-3 py-1.5">{course.category}</span>
                <span className="rounded-full border border-border px-3 py-1.5">{course.level}</span>
                <span className="rounded-full border border-border px-3 py-1.5">
                  {isFreeCourse ? "Free" : `${course.durationDays} days`}
                </span>
                <span className="rounded-full border border-border px-3 py-1.5">{course.dailyMinutes} min/day</span>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={`/courses/${course.slug}/learn`}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/85"
                >
                  {isFreeCourse ? "Start free course" : "Start free preview"} <ArrowRight className="h-4 w-4" />
                </Link>
                {!isFreeCourse && checkoutLive ? (
                  <a
                    href={course.checkoutUrl}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-5 text-sm text-foreground transition-colors hover:border-[var(--cad-line-hover)]"
                  >
                    Buy for ${course.price}
                  </a>
                ) : !isFreeCourse ? (
                  <Link
                    href="#join"
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-5 text-sm text-foreground transition-colors hover:border-[var(--cad-line-hover)]"
                  >
                    Join launch list
                  </Link>
                ) : null}
              </div>
            </div>
            <aside id="join" className="rounded-xl border border-border bg-card/45 p-5">
              {isFreeCourse ? (
                <>
                  <p className="text-sm font-medium text-foreground">Open course</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    No account or checkout needed. Start learning, download the templates, and use the course as a
                    practical Claude workbook.
                  </p>
                  <Link
                    href={`/courses/${course.slug}/learn`}
                    className="mt-4 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
                  >
                    Open lessons
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground">Get course previews</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Join the launch list for previews, worksheets and checkout access.
                  </p>
                  <div className="mt-4">
                    <CourseInterestForm courseSlug={course.slug} source={`course-detail-${course.slug}`} compact />
                  </div>
                </>
              )}
            </aside>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1120px] gap-8 px-4 pb-20 md:px-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <h2 className="text-2xl font-normal text-foreground">{isFreeCourse ? "Course path" : "7-day curriculum"}</h2>
            <div className="mt-5 border-y border-border">
              {course.lessons.map((lesson) => (
                <div key={lesson.day} className="grid gap-3 border-b border-border py-5 last:border-b-0 sm:grid-cols-[60px_minmax(0,1fr)]">
                  <span className="font-mono text-sm text-primary">Day {lesson.day}</span>
                  <div>
                    <h3 className="text-lg font-medium text-foreground">{lesson.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{lesson.outcome}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Artifact: {lesson.artifact}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-8">
            <div>
              <h2 className="text-xl font-normal text-foreground">Included</h2>
              <div className="mt-4 space-y-3">
                {course.includes.map((item) => (
                  <p key={item} className="flex gap-2 text-sm leading-6 text-muted-foreground">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    {item}
                  </p>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-normal text-foreground">Outcomes</h2>
              <div className="mt-4 space-y-3">
                {course.outcomes.map((item) => (
                  <p key={item} className="flex gap-2 text-sm leading-6 text-muted-foreground">
                    <Clock3 className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    {item}
                  </p>
                ))}
              </div>
            </div>
            {course.previewAssets?.length ? (
              <div>
                <h2 className="text-xl font-normal text-foreground">Preview assets</h2>
                <div className="mt-4 space-y-3">
                  {course.previewAssets.map((asset) => (
                    <Link key={asset.href} href={asset.href} className="block rounded-xl border border-border p-4 hover:border-primary/50">
                      <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Download className="h-4 w-4" aria-hidden="true" />
                        {asset.label}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-muted-foreground">{asset.description}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-4 text-sm leading-6 text-muted-foreground">
                <Lock className="mb-2 h-4 w-4" aria-hidden="true" />
                Preview worksheets are being packaged. Join the launch list to get them first.
              </div>
            )}
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}
