import { ImageResponse } from "next/og";
import { fetchApi } from "@/lib/api-server";
import type { Prompt } from "@/types";

export const runtime = "edge";
export const alt = "Claude Prompt";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const prompt = await fetchApi<Prompt>(`/prompts/${slug}`);

  const title = prompt?.title || "Claude Prompt";
  const description = prompt?.description?.slice(0, 120) || "";
  const category = prompt?.category || "";

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
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div
            style={{
              background: "#a855f720",
              color: "#a855f7",
              padding: "4px 12px",
              borderRadius: 6,
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            Prompt
          </div>
          {category && <div style={{ color: "#64748b", fontSize: 16 }}>{category}</div>}
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, color: "#f8fafc", marginBottom: 16 }}>
          {title}
        </div>
        <div style={{ fontSize: 24, color: "#94a3b8", maxWidth: 900, lineHeight: 1.4 }}>
          {description}
        </div>
        <div style={{ position: "absolute", bottom: 40, right: 60, fontSize: 18, color: "#475569" }}>
          Claude Directory
        </div>
      </div>
    ),
    { ...size }
  );
}
