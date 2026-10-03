import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

import { fetchApi } from "@/lib/api-server";
import { faviconFor } from "@/lib/directory";
import { launchTheme } from "@/lib/launch-theme";
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


const INK = "#F0EFEC";

/** Shorten to n characters at a word boundary. */
const clip = (s: string, n: number) => {
  if (s.length <= n) return s;
  const cut = s.slice(0, n - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > n * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,.;:]+$/, "")}…`;
};

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

/** Inter from Google Fonts (TTF, which Satori reads), cached per weight. Falls back to the built-in font. */
const fontCache = new Map<number, Promise<ArrayBuffer | null>>();
function inter(weight: number): Promise<ArrayBuffer | null> {
  if (!fontCache.has(weight)) {
    fontCache.set(
      weight,
      (async () => {
        try {
          const css = await fetch(`https://fonts.googleapis.com/css2?family=Inter:wght@${weight}`, { signal: AbortSignal.timeout(3000) }).then((r) => r.text());
          const url = css.match(/src: url\((.+?)\) format\('truetype'\)/)?.[1];
          return url ? await fetch(url, { signal: AbortSignal.timeout(3000) }).then((r) => r.arrayBuffer()) : null;
        } catch {
          return null;
        }
      })(),
    );
  }
  return fontCache.get(weight)!;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, medium, bold] = await Promise.all([
    fetchApi<ShowcaseProject>(`/showcase/${slug}`, { revalidate: 600 }),
    inter(500),
    inter(700),
  ]);
  const mark = `data:image/png;base64,${readFileSync(join(process.cwd(), "public/logo-mark-256.png")).toString("base64")}`;

  const title = clip(project?.title?.trim() || "A new launch", 30);
  const tagline = clip((project?.tagline || "").trim().replace(/\s+[—–]\s+/g, ": "), 64);
  const logo = project ? await logoData(project) : null;
  const { bottom, accent } = launchTheme(slug);
  const fonts = [
    ...(medium ? [{ name: "Inter", data: medium, weight: 500 as const, style: "normal" as const }] : []),
    ...(bold ? [{ name: "Inter", data: bold, weight: 700 as const, style: "normal" as const }] : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#14120B",
          backgroundImage: `radial-gradient(circle at 20% 0%, ${bottom}cc 0%, transparent 55%), radial-gradient(circle at 85% 100%, ${bottom}99 0%, transparent 50%)`,
          color: INK,
          fontFamily: fonts.length ? "Inter" : "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* fine dot grid */}
        <div style={{ position: "absolute", inset: 0, display: "flex", backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1.2px, transparent 1.2px)", backgroundSize: "26px 26px" }} />

        {/* The card: logo, then the announcement. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: 980,
            padding: "56px 60px",
            borderRadius: 36,
            background: "rgba(20,18,11,0.72)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
          }}
        >
          {logo ? (
            <img src={logo} width={150} height={150} alt="" style={{ objectFit: "contain", borderRadius: 34, marginRight: 52, flexShrink: 0 }} />
          ) : (
            <div style={{ display: "flex", width: 150, height: 150, borderRadius: 34, background: `${bottom}`, alignItems: "center", justifyContent: "center", marginRight: 52, flexShrink: 0 }}>
              <span style={{ fontSize: 72, fontWeight: 700, color: accent }}>{title.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
            <span style={{ fontSize: 22, fontWeight: 500, color: accent, letterSpacing: "0.18em" }}>I JUST LAUNCHED</span>
            <span style={{ fontSize: title.length > 18 ? 62 : 76, fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.04, marginTop: 12 }}>{title}</span>
            {tagline && <span style={{ fontSize: 28, fontWeight: 500, color: "rgba(240,239,236,0.62)", marginTop: 16, lineHeight: 1.3 }}>{tagline}</span>}
          </div>
        </div>

        {/* signature */}
        <div style={{ position: "absolute", bottom: 40, display: "flex", alignItems: "center" }}>
          <img src={mark} width={28} height={28} alt="" style={{ marginRight: 12 }} />
          <span style={{ fontSize: 22, fontWeight: 500, color: "rgba(240,239,236,0.75)" }}>{`Claude AI Directory`}</span>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
