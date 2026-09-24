import { notFound, permanentRedirect } from "next/navigation";

import { COURSES, getCourse } from "@/data/courses";
import { getCourseContent } from "@/data/course-content";
import { courseLessonHref } from "@/lib/course-links";

export function generateStaticParams() {
  return COURSES.flatMap((course) => {
    const content = getCourseContent(course.slug);
    return (content?.modules ?? []).map((module) => ({
      slug: course.slug,
      moduleId: module.id,
    }));
  });
}

// Modules used to render as one long page. Each lesson now has its own page,
// so a module URL opens the module's first lesson.
export default async function CourseModulePage({
  params,
}: {
  params: Promise<{ slug: string; moduleId: string }>;
}) {
  const { slug, moduleId } = await params;
  const course = getCourse(slug);
  const courseModule = getCourseContent(slug)?.modules.find((module) => module.id === moduleId);
  const firstLesson = courseModule?.lessons[0];

  if (!course || !courseModule || !firstLesson) notFound();

  permanentRedirect(courseLessonHref(course.slug, courseModule.id, firstLesson.id));
}
