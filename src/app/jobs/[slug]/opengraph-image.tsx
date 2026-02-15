import { ImageResponse } from "next/og";
import { fetchApi } from "@/lib/api-server";
import type { Job } from "@/types";

export const runtime = "edge";
export const alt = "AI Job";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await fetchApi<Job>(`/jobs/${slug}`);

  const title = job?.title || "AI Job";
  const company = job?.company || "";
  const location = job?.location || "Remote";
  const salary = job?.salary_range || "";

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
              background: "#f9731620",
              color: "#f97316",
              padding: "4px 12px",
              borderRadius: 6,
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            AI Job
          </div>
          <div style={{ color: "#64748b", fontSize: 16 }}>{location}</div>
        </div>
        <div style={{ fontSize: 52, fontWeight: 700, color: "#f8fafc", marginBottom: 12 }}>
          {title}
        </div>
        <div style={{ fontSize: 28, color: "#94a3b8" }}>{company}</div>
        {salary && (
          <div style={{ fontSize: 22, color: "#64748b", marginTop: 12 }}>{salary}</div>
        )}
        <div style={{ position: "absolute", bottom: 40, right: 60, fontSize: 18, color: "#475569" }}>
          Claude Directory
        </div>
      </div>
    ),
    { ...size }
  );
}
