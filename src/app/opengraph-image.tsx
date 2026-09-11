import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";
export const alt = "claudeai.directory: Skills, MCP Servers, Prompts & AI Jobs for Claude";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand palette (from the logo asset kit)
const PAPER = "#FBF7F4";
const INK = "#241812";
const ACCENT = "#DE5B3B";
const MUTED = "#6E5A50";
const HAIRLINE = "#EDE2DA";

export default function Image() {
  const markData = readFileSync(join(process.cwd(), "public/logo-mark-512.png"));
  const markSrc = `data:image/png;base64,${markData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          background: PAPER,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "system-ui, sans-serif",
          padding: 80,
        }}
      >
        <img src={markSrc} width={168} height={168} alt="" style={{ marginBottom: 36 }} />
        <div style={{ display: "flex", fontSize: 76, fontWeight: 700, letterSpacing: "-0.03em" }}>
          <span style={{ color: INK }}>claudeai</span>
          <span style={{ color: ACCENT }}>.directory</span>
        </div>
        <div
          style={{
            fontSize: 30,
            color: MUTED,
            textAlign: "center",
            maxWidth: 760,
            marginTop: 18,
          }}
        >
          Skills, MCP servers, prompts &amp; a community forum for people building with Claude
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 20,
            color: MUTED,
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            borderTop: `1px solid ${HAIRLINE}`,
            paddingTop: 20,
          }}
        >
          Community-run · Unofficial
        </div>
      </div>
    ),
    { ...size }
  );
}
