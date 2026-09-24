import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CourseLessonView, { type CourseOutlineModule } from "@/components/courses/CourseLessonView";
import { COURSES, getCourse } from "@/data/courses";
import { getCourseContent, type CourseContent } from "@/data/course-content";
import { courseLessonHref } from "@/lib/course-links";

export function generateStaticParams() {
  return COURSES.flatMap((course) => {
    const content = getCourseContent(course.slug);
    return (content?.modules ?? []).flatMap((module) =>
      module.lessons.map((lesson) => ({ slug: course.slug, moduleId: module.id, lessonId: lesson.id }))
    );
  });
}

function findLesson(slug: string, moduleId: string, lessonId: string) {
  const course = getCourse(slug);
  const content = getCourseContent(slug);
  const courseModule = content?.modules.find((item) => item.id === moduleId);
  const lesson = courseModule?.lessons.find((item) => item.id === lessonId);
  if (!course || !content || !courseModule || !lesson) return null;
  return { course, content, courseModule, lesson };
}

function lessonDescription(found: NonNullable<ReturnType<typeof findLesson>>) {
  const { course, courseModule, lesson } = found;
  const firstText = lesson.type === "lesson" ? lesson.blocks.find((block) => block.type === "text") : undefined;
  const text = firstText && firstText.type === "text" ? firstText.text : "";
  if (text && courseModule.free) return text.length > 158 ? `${text.slice(0, 155).trimEnd()}...` : text;
  return `${lesson.title}, a lesson in ${courseModule.title} from the ${course.title} course.`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; moduleId: string; lessonId: string }>;
}): Promise<Metadata> {
  const { slug, moduleId, lessonId } = await params;
  const found = findLesson(slug, moduleId, lessonId);
  if (!found) return { title: "Lesson Not Found" };

  const { course, courseModule, lesson } = found;
  const title = `${lesson.title} | ${course.title}`;
  const description = lessonDescription(found);
  const url = courseLessonHref(course.slug, courseModule.id, lesson.id);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article" },
    // Locked lessons only show an upgrade prompt, so keep them out of search.
    robots: courseModule.free ? undefined : { index: false, follow: true },
  };
}

function toOutline(content: CourseContent): CourseOutlineModule[] {
  return content.modules.map((module) => ({
    id: module.id,
    title: module.title,
    free: module.free,
    lessons: module.lessons.map((lesson) => ({ id: lesson.id, title: lesson.title })),
  }));
}

export default async function CourseLessonPage({
  params,
}: {
  params: Promise<{ slug: string; moduleId: string; lessonId: string }>;
}) {
  const { slug, moduleId, lessonId } = await params;
  const found = findLesson(slug, moduleId, lessonId);
  if (!found) notFound();

  const { course, content, courseModule, lesson } = found;

  return (
    <CourseLessonView
      course={course}
      outline={toOutline(content)}
      moduleId={courseModule.id}
      // Locked lesson bodies never leave the server.
      lesson={
        courseModule.free
          ? lesson
          : { id: lesson.id, title: lesson.title, minutes: lesson.minutes, type: "lesson", blocks: [] }
      }
    />
  );
}
