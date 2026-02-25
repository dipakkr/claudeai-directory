import { ImageResponse } from "next/og";
import { fetchApi } from "@/lib/api-server";
import type { GuideDetail } from "@/types";

export const alt = "Guide";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await fetchApi<GuideDetail>(`/guides/${slug}`);

  const title = guide?.title || "Guide";
  const description = guide?.description?.slice(0, 120) || "";
  const difficulty = guide?.difficulty || "";
  const category = guide?.category || "";
  const totalLessons = guide?.total_lessons || 0;
  const estimatedTime = guide?.estimated_time || 0;
  const isFree = guide?.is_free ?? true;
  const price = guide?.price || 0;

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
        {/* Top badges row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div
            style={{
              background: "#e86e4220",
              color: "#e86e42",
              padding: "6px 16px",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            Guide
          </div>
          {difficulty && (
            <div
              style={{
                background: "#ffffff10",
                color: "#94a3b8",
                padding: "6px 16px",
                borderRadius: 8,
                fontSize: 16,
              }}
            >
              {difficulty}
            </div>
          )}
          {category && (
            <div
              style={{
                background: "#ffffff10",
                color: "#94a3b8",
                padding: "6px 16px",
                borderRadius: 8,
                fontSize: 16,
              }}
            >
              {category}
            </div>
          )}
          <div
            style={{
              marginLeft: "auto",
              background: isFree ? "#22c55e20" : "#e86e4220",
              color: isFree ? "#22c55e" : "#e86e42",
              padding: "6px 16px",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            {isFree ? "Free" : `$${price}`}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 60,
            fontWeight: 800,
            color: "#f8fafc",
            lineHeight: 1.15,
            marginBottom: 20,
            maxWidth: 900,
          }}
        >
          {title}
        </div>

        {/* Description */}
        {description && (
          <div
            style={{
              fontSize: 22,
              color: "#94a3b8",
              maxWidth: 860,
              lineHeight: 1.5,
              marginBottom: 36,
            }}
          >
            {description}
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {totalLessons > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748b", fontSize: 18 }}>
              <span style={{ fontSize: 20 }}>📖</span>
              <span>{totalLessons} lessons</span>
            </div>
          )}
          {estimatedTime > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748b", fontSize: 18 }}>
              <span style={{ fontSize: 20 }}>⏱</span>
              <span>{estimatedTime} min</span>
            </div>
          )}
        </div>

        {/* Branding */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 60,
            fontSize: 18,
            color: "#475569",
          }}
        >
          ClaudeAI Directory
        </div>
      </div>
    ),
    { ...size }
  );
}
