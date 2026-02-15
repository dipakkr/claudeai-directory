import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Claude Directory — Skills, MCP Servers, Prompts & AI Jobs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
          alignItems: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#22c55e",
            marginBottom: 16,
          }}
        >
          Claude Directory
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          Skills, MCP Servers, Prompts & AI Jobs for Claude
        </div>
      </div>
    ),
    { ...size }
  );
}
