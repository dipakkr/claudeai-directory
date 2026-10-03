import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

import { fetchApi } from "@/lib/api-server";
import { faviconFor } from "@/lib/directory";
import type { ShowcaseProject } from "@/types";

/**
 * The launch card: "{App} launched on Claude AI Directory". Used as the launch page's
 * share image and as the picture on its feed post. Satori rule: any div with more than
 * one child needs display:flex, and mixed text must be one template string.
 */

export const runtime = "nodejs";
export const alt = "I just launched on Claude AI Directory";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#14120B";
const INK = "#F0EFEC";
const MUTED = "#A8A598";
const ACCENT = "#D97757";
const LINE = "#2B2920";

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

/** The app's logo as a data URI, or null. Satori can't draw WEBP/SVG and a failed remote image
 * would crash the render, so fetch it here (short timeout) and keep only PNG/JPEG/GIF. */
async function logoData(project: ShowcaseProject): Promise<string | null> {
  const candidates = [project.logo_url, faviconFor(project.app_url || project.demo_url, 128)].filter(Boolean) as string[];
  for (const url of candidates) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
      const type = (res.headers.get("content-type") || "").split(";")[0];
      if (!res.ok || !/^image\/(png|jpe?g|gif)$/.test(type)) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 200 || buf.length > 2_000_000) continue; // skip blank 1px favicons and huge files
      return `data:${type};base64,${buf.toString("base64")}`;
    } catch {
      // try the next one
    }
  }
  return null;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await fetchApi<ShowcaseProject>(`/showcase/${slug}`, { revalidate: 600 });
  const mark = `data:image/png;base64,${readFileSync(join(process.cwd(), "public/logo-mark-256.png")).toString("base64")}`;

  const title = clip(project?.title?.trim() || "A new launch", 34);
  const tagline = clip((project?.tagline || project?.description || "").trim().replace(/\s+[—–]\s+/g, ": "), 110);
  const upvotes = project?.upvotes ?? 0;
  const logo = project ? await logoData(project) : null;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: BG, color: INK, padding: "56px 64px", fontFamily: "system-ui, sans-serif", position: "relative" }}>
        {/* soft coral glow, like the homepage card */}
        <div style={{ position: "absolute", right: -160, top: -160, width: 620, height: 620, borderRadius: 310, background: "radial-gradient(circle, rgba(217,119,87,0.22), rgba(217,119,87,0) 70%)", display: "flex" }} />

        {/* Top: small brand, and the logo top-right so the headline gets the space. */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src={mark} width={36} height={36} alt="" style={{ marginRight: 12 }} />
            <span style={{ fontSize: 22, fontWeight: 600, color: MUTED }}>Claude AI Directory</span>
          </div>
          {logo ? (
            <img src={logo} width={104} height={104} alt="" style={{ objectFit: "contain", borderRadius: 24 }} />
          ) : (
            <div style={{ display: "flex", width: 104, height: 104, borderRadius: 24, background: "#1F1C15", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 52, fontWeight: 700, color: ACCENT }}>{title.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </div>

        {/* The maker's announcement, in their voice. */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: 6 }}>
          <span style={{ fontSize: 40, color: MUTED, letterSpacing: "-0.01em" }}>I just launched</span>
          <span style={{ fontSize: title.length > 20 ? 76 : 92, fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.02, marginTop: 6, maxWidth: 1000 }}>{title}</span>
          <div style={{ display: "flex", fontSize: 40, marginTop: 10, letterSpacing: "-0.01em" }}>
            <span style={{ color: MUTED, marginRight: 12 }}>on</span>
            <span style={{ color: ACCENT, fontWeight: 600 }}>Claude AI Directory</span>
          </div>
          {tagline && <span style={{ fontSize: 26, color: MUTED, marginTop: 22, lineHeight: 1.35, maxWidth: 980 }}>{tagline}</span>}
        </div>

        {/* Footer: where to go, and the live count. */}
        <div style={{ display: "flex", alignItems: "center", marginTop: "auto", borderTop: `1px solid ${LINE}`, paddingTop: 24, fontFamily: "monospace", fontSize: 22, color: MUTED }}>
          <span style={{ display: "flex", color: INK, marginRight: 14 }}>Upvote it</span>
          <span style={{ display: "flex" }}>{`claudeai.directory/launches/${clip(slug, 28)}`}</span>
          <span style={{ display: "flex", alignItems: "center", marginLeft: "auto", color: ACCENT, fontSize: 26, fontWeight: 700 }}>
            {/* drawn, not a glyph: the default OG font has no ▲ */}
            <svg width="22" height="18" viewBox="0 0 12 10" style={{ marginRight: 10 }}>
              <path d="M6 0.6 11.4 9.4H0.6Z" fill={ACCENT} />
            </svg>
            {`${upvotes}`}
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
