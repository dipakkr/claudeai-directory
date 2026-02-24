import type { Metadata } from "next";
import { fetchApi } from "@/lib/api-server";
import type { GuideDetail, GuideLesson } from "@/types";
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

  const title = `${lesson.title} | ${lesson.guide_title}`;

  // Extract a plain-text excerpt from markdown content for description
  const excerpt = lesson.content
    ? lesson.content
        .replace(/#{1,6}\s+.+/g, "")
        .replace(/[*_`~]/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/\n+/g, " ")
        .trim()
        .slice(0, 155)
    : "";
  const description = excerpt
    ? `${excerpt}…`
    : `${lesson.title} — part of the ${lesson.guide_title} guide on Claude Directory.`;

  const ogImageUrl = `${SITE_URL}/guides/${slug}/${lessonId}/opengraph-image`;

  return {
    title,
    description,
    alternates: { canonical: `/guides/${slug}/${lessonId}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/guides/${slug}/${lessonId}`,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: lesson.title }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;

  // Fetch both in parallel for SSR — lesson content and guide structure
  const [lesson, guide] = await Promise.all([
    fetchApi<GuideLesson>(`/guides/${slug}/lessons/${lessonId}`),
    fetchApi<GuideDetail>(`/guides/${slug}`),
  ]);

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
      <LessonPage initialLesson={lesson ?? undefined} initialGuide={guide ?? undefined} />
    </>
  );
}
