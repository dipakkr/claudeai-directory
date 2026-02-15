import type { Metadata } from "next";
import { fetchApi } from "@/lib/api-server";
import type { GuideLesson } from "@/types";
import LessonPage from "./LessonClient";
import { ArticleSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://claudeai.directory";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}): Promise<Metadata> {
  const { slug, lessonId } = await params;
  const lesson = await fetchApi<GuideLesson>(`/guides/${slug}/lessons/${lessonId}`);

  if (!lesson) {
    return { title: "Lesson Not Found" };
  }

  const title = lesson.title;
  const description = `${lesson.title} lesson from the ${lesson.guide_title} guide on Claude Directory`;

  return {
    title,
    description,
    alternates: { canonical: `/guides/${slug}/${lessonId}` },
    openGraph: { title, description, url: `/guides/${slug}/${lessonId}` },
  };
}

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const lesson = await fetchApi<GuideLesson>(`/guides/${slug}/lessons/${lessonId}`);

  return (
    <>
      {lesson && (
        <>
          <ArticleSchema
            title={lesson.title}
            description={`${lesson.title} lesson from the ${lesson.guide_title} guide`}
            url={`${SITE_URL}/guides/${slug}/${lessonId}`}
            datePublished={new Date().toISOString()}
          />
          <BreadcrumbSchema
            items={[
              { name: "Home", url: SITE_URL },
              { name: "Guides", url: `${SITE_URL}/guides` },
              { name: lesson.guide_title, url: `${SITE_URL}/guides/${slug}` },
              { name: lesson.title, url: `${SITE_URL}/guides/${slug}/${lessonId}` },
            ]}
          />
        </>
      )}
      <LessonPage />
    </>
  );
}
