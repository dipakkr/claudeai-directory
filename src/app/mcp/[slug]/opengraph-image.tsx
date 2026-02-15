import { ImageResponse } from "next/og";
import { fetchApi } from "@/lib/api-server";
import type { MCPServer } from "@/types";

export const runtime = "edge";
export const alt = "MCP Server";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const server = await fetchApi<MCPServer>(`/mcp-servers/${slug}`);

  const title = server?.name || "MCP Server";
  const description = server?.one_liner || server?.description?.slice(0, 100) || "";
  const author =
    server?.author && typeof server.author === "object"
      ? (server.author as { name?: string }).name || ""
      : String(server?.author || "");
  const toolCount = server?.capabilities?.tools?.length || 0;

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
              background: "#22c55e20",
              color: "#22c55e",
              padding: "4px 12px",
              borderRadius: 6,
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            MCP Server
          </div>
          {toolCount > 0 && (
            <div style={{ color: "#64748b", fontSize: 16 }}>{toolCount} tools</div>
          )}
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, color: "#f8fafc", marginBottom: 16 }}>
          {title}
        </div>
        <div style={{ fontSize: 24, color: "#94a3b8", maxWidth: 900, lineHeight: 1.4 }}>
          {description}
        </div>
        {author && (
          <div style={{ fontSize: 18, color: "#64748b", marginTop: 24 }}>by {author}</div>
        )}
        <div style={{ position: "absolute", bottom: 40, right: 60, fontSize: 18, color: "#475569" }}>
          Claude Directory
        </div>
      </div>
    ),
    { ...size }
  );
}
