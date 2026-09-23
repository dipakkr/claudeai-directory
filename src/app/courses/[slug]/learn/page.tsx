import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { COURSES, getCourse } from "@/data/courses";
import { getCourseContent } from "@/data/course-content";

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
    title: { absolute: `Learn: ${course.title} | Claude AI Directory` },
    description: course.isFree ? `Start the free ${course.title} course.` : `Start the free preview of ${course.title}.`,
    alternates: { canonical: `/courses/${course.slug}/learn` },
  };
}

export default async function CourseLearnIndexPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourse(slug);
  const content = getCourseContent(slug);
  const firstModule = content?.modules[0];

  if (!course || !content || !firstModule) notFound();

  redirect(`/courses/${course.slug}/learn/${firstModule.id}`);
}
