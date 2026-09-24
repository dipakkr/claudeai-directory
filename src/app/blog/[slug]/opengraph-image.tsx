import { ImageResponse } from "next/og";
import { fetchApi } from "@/lib/api-server";
import { formatDate } from "@/lib/blog";
import type { BlogPost } from "@/types";

export const alt = "Claude Directory blog article";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await fetchApi<BlogPost>(`/blog/${slug}`);

  const title = post?.title || "Claude Directory blog";
  const meta = [post?.author ? `By ${post.author}` : null, formatDate(post?.published_at, "short"), post?.read_time ? `${post.read_time} min read` : null]
    .filter(Boolean)
    .join("  ·  ");

  return new ImageResponse(
    (
      <div
        style={{
          background: "#FAF9F5",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          fontFamily: "Georgia, serif",
          borderTop: "12px solid #C15F3C",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "#C15F3C",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {post?.category ? `Blog · ${post.category}` : "Blog"}
          </div>
          <div style={{ display: "flex", fontSize: title.length > 70 ? 58 : 68, lineHeight: 1.12, color: "#1F1E1B", maxWidth: 1040 }}>
            {title}
          </div>
          {meta ? (
            <div style={{ display: "flex", fontSize: 28, color: "#5C5A55", fontFamily: "system-ui, sans-serif" }}>{meta}</div>
          ) : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", fontFamily: "system-ui, sans-serif" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "10px",
              background: "#C15F3C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            C
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#1F1E1B" }}>claudeai.directory</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
