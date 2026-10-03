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


/** Five looks, from the directory's collection banners plus the site's own coral. Picked from the
 * slug, so a launch always gets the same one. [top, bottom, accent] */
const THEMES: [string, string, string][] = [
  ["#1d2b25", "#34594a", "#8FD3B0"], // green
  ["#1c2433", "#2f4a6b", "#93B8E8"], // blue
  ["#2b2119", "#5a3d2a", "#E9B48A"], // warm
  ["#241d2e", "#46365e", "#C3A9EE"], // purple
  ["#14120B", "#3a2318", "#D97757"], // coral
];
const themeFor = (slug: string) => THEMES[[...slug].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % THEMES.length];
const INK = "#F0EFEC";

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

  const [top, bottom, accent] = themeFor(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)`,
          color: INK,
          padding: "70px 64px 48px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Centered like the collection banners: logo, "I just launched", the name. */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1 }}>
          {logo ? (
            <img src={logo} width={136} height={136} alt="" style={{ objectFit: "contain", borderRadius: 30 }} />
          ) : (
            <div style={{ display: "flex", width: 136, height: 136, borderRadius: 30, background: "rgba(0,0,0,0.25)", alignItems: "center", justifyContent: "center", boxShadow: "0 18px 40px rgba(0,0,0,0.35)" }}>
              <span style={{ fontSize: 68, fontWeight: 700, color: accent }}>{title.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <span style={{ fontSize: 34, color: accent, marginTop: 44, letterSpacing: "0.01em" }}>I just launched</span>
          <span style={{ fontSize: title.length > 20 ? 82 : 100, fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.05, marginTop: 6, textAlign: "center", maxWidth: 1060 }}>
            {title}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.28)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 999, padding: "10px 22px 10px 12px" }}>
          <img src={mark} width={30} height={30} alt="" style={{ marginRight: 12 }} />
          <span style={{ fontSize: 23, color: "rgba(240,239,236,0.85)" }}>{`on Claude AI Directory`}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
