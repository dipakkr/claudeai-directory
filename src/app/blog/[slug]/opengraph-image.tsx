import { ImageResponse } from "next/og";
import { fetchApi } from "@/lib/api-server";
import type { BlogPost } from "@/types";

export const runtime = "edge";
export const alt = "Cloud Directory — Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
    const { slug } = params;
    // If fetching fails it will gracefully fall back to default text
    const post = await fetchApi<BlogPost>(`/blog/${slug}`);

    const title = post?.title || "Claude Blog Article";
    const author = post?.author || "Community";
    const badge = "Article";

    return new ImageResponse(
        (
            <div
                style={{
                    background: "linear-gradient(135deg, #0f172a 0%, #1a1a2e 50%, #16213e 100%)",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "80px",
                    fontFamily: "system-ui, sans-serif",
                }}
            >
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div
                        style={{
                            padding: "8px 20px",
                            background: "rgba(232, 110, 66, 0.15)",
                            color: "#e86e42",
                            borderRadius: "100px",
                            fontSize: 24,
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            alignSelf: "flex-start",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                        }}
                    >
                        {badge}
                    </div>
                    <div
                        style={{
                            fontSize: 72,
                            fontWeight: 800,
                            color: "#ffffff",
                            lineHeight: 1.1,
                            maxWidth: 900,
                        }}
                    >
                        {title}
                    </div>
                    <div
                        style={{
                            fontSize: 32,
                            color: "#94a3b8",
                        }}
                    >
                        By {author}
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <div
                        style={{
                            width: 50,
                            height: 50,
                            borderRadius: "12px",
                            background: "#e86e42",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 32,
                            fontWeight: "bold",
                            color: "#fff",
                        }}
                    >
                        C
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: "#cbd5e1" }}>
                        ClaudeAI Directory
                    </div>
                </div>
            </div>
        ),
        { ...size }
    );
}
