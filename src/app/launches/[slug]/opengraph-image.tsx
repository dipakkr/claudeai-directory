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
  const logo = project ? await logoData(project) : null;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: BG, color: INK, padding: "64px 64px 52px", fontFamily: "system-ui, sans-serif", position: "relative" }}>
        {/* soft coral glow behind the logo */}
        <div style={{ position: "absolute", left: 300, top: -260, width: 600, height: 600, borderRadius: 300, background: "radial-gradient(circle, rgba(217,119,87,0.20), rgba(217,119,87,0) 70%)", display: "flex" }} />

        {/* Minimal on purpose: logo, "I just launched", the name, and a quiet signature. */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1 }}>
          {logo ? (
            <img src={logo} width={128} height={128} alt="" style={{ objectFit: "contain", borderRadius: 28 }} />
          ) : (
            <div style={{ display: "flex", width: 128, height: 128, borderRadius: 28, background: "#1F1C15", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 64, fontWeight: 700, color: ACCENT }}>{title.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <span style={{ fontSize: 36, color: MUTED, marginTop: 40, letterSpacing: "-0.01em" }}>I just launched</span>
          <span style={{ fontSize: title.length > 20 ? 80 : 96, fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.05, marginTop: 8, textAlign: "center", maxWidth: 1040 }}>
            {title}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src={mark} width={30} height={30} alt="" style={{ marginRight: 12 }} />
          <span style={{ fontSize: 24, color: MUTED }}>{`on Claude AI Directory`}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
