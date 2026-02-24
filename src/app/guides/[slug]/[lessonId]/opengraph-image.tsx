import { ImageResponse } from "next/og";
import { fetchApi } from "@/lib/api-server";
import type { GuideLesson } from "@/types";

export const alt = "Guide Lesson";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const lesson = await fetchApi<GuideLesson>(`/guides/${slug}/lessons/${lessonId}`);

  const title = lesson?.title || "Lesson";
  const guideTitle = lesson?.guide_title || "";
  const chapterTitle = lesson?.chapter_title || "";
  const estimatedTime = lesson?.estimated_time || 0;

  // Extract a plain-text excerpt from markdown content
  const excerpt = lesson?.content
    ? lesson.content
        .replace(/#{1,6}\s+.+/g, "")
        .replace(/[*_`~]/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/\n+/g, " ")
        .trim()
        .slice(0, 130)
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1a1a2e 50%, #16213e 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top — guide name + chapter */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div
            style={{
              background: "#e86e4220",
              color: "#e86e42",
              padding: "6px 16px",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            Guide
          </div>
          {guideTitle && (
            <div
              style={{
                color: "#94a3b8",
                fontSize: 15,
                fontWeight: 500,
              }}
            >
              {guideTitle}
            </div>
          )}
          {chapterTitle && (
            <>
              <div style={{ color: "#334155", fontSize: 15 }}>›</div>
              <div
                style={{
                  background: "#ffffff10",
                  color: "#64748b",
                  padding: "6px 16px",
                  borderRadius: 8,
                  fontSize: 14,
                }}
              >
                {chapterTitle}
              </div>
            </>
          )}
          {estimatedTime > 0 && (
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "#475569",
                fontSize: 15,
              }}
            >
              <span>⏱</span>
              <span>{estimatedTime} min read</span>
            </div>
          )}
        </div>

        {/* Lesson title */}
        <div
          style={{
            fontSize: title.length > 50 ? 48 : 58,
            fontWeight: 800,
            color: "#f8fafc",
            lineHeight: 1.15,
            marginBottom: 24,
            maxWidth: 960,
          }}
        >
          {title}
        </div>

        {/* Content excerpt */}
        {excerpt && (
          <div
            style={{
              fontSize: 20,
              color: "#64748b",
              maxWidth: 880,
              lineHeight: 1.55,
            }}
          >
            {excerpt}…
          </div>
        )}

        {/* Branding */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 60,
            fontSize: 17,
            color: "#334155",
          }}
        >
          Claude Directory
        </div>
      </div>
    ),
    { ...size }
  );
}
