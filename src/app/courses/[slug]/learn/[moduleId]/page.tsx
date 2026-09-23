import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CourseLearnView from "@/components/courses/CourseLearnView";
import { COURSES, getCourse } from "@/data/courses";
import { getCourseContent } from "@/data/course-content";

export function generateStaticParams() {
  return COURSES.flatMap((course) => {
    const content = getCourseContent(course.slug);
    return (content?.modules ?? []).map((module) => ({
      slug: course.slug,
      moduleId: module.id,
    }));
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; moduleId: string }>;
}): Promise<Metadata> {
  const { slug, moduleId } = await params;
  const course = getCourse(slug);
  const content = getCourseContent(slug);
  const courseModule = content?.modules.find((item) => item.id === moduleId);

  if (!course || !courseModule) return { title: "Course Module Not Found" };

  return {
    title: { absolute: `${courseModule.title} | ${course.title} | Claude AI Directory` },
    description: `${courseModule.title} module from ${course.title}.`,
    alternates: { canonical: `/courses/${course.slug}/learn/${courseModule.id}` },
  };
}

export default async function CourseModulePage({
  params,
}: {
  params: Promise<{ slug: string; moduleId: string }>;
}) {
  const { slug, moduleId } = await params;
  const course = getCourse(slug);
  const content = getCourseContent(slug);
  const activeModule = content?.modules.find((module) => module.id === moduleId);

  if (!course || !content || !activeModule) notFound();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CourseLearnView course={course} content={content} activeModule={activeModule} />
      <Footer />
    </div>
  );
}
