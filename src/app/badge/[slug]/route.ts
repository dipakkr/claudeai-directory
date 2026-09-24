// Embeddable launch badges: /badge/{slug}?style=launched|upvotes|minimal&theme=light|dark
// Served as SVG so makers can drop an <img> on their site or a README. The
// surrounding link (not this image) is what badge verification looks for.

import { fetchApi } from "@/lib/api-server";
import type { ShowcaseProject } from "@/types";

type Theme = "light" | "dark";
type Style = "launched" | "upvotes" | "minimal";

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Helvetica, Arial, sans-serif";

const THEMES = {
  light: { bg: "#FFFFFF", border: "#E7E1D8", eyebrow: "#8A7F72", text: "#1F1B17", divider: "#EFE9E1" },
  dark: { bg: "#1C1A17", border: "#3A352F", eyebrow: "#A89C8E", text: "#F7F3EE", divider: "#34302A" },
} as const;

/** Coral rounded square with a white spark, echoing the site logo. */
function mark(x: number, y: number, size: number) {
  const c = size / 2;
  const r = size * 0.28;
  const spokes = Array.from({ length: 8 }, (_, i) => {
    const a = (Math.PI / 4) * i;
    return `<line x1="${c}" y1="${c}" x2="${(c + Math.cos(a) * r).toFixed(2)}" y2="${(c + Math.sin(a) * r).toFixed(2)}"/>`;
  }).join("");
  return `<g transform="translate(${x} ${y})">
    <rect width="${size}" height="${size}" rx="${size * 0.26}" fill="url(#cad-coral)"/>
    <g stroke="#FFF4EC" stroke-width="${(size * 0.09).toFixed(2)}" stroke-linecap="round">${spokes}</g>
  </g>`;
}

const DEFS = `<defs><linearGradient id="cad-coral" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F79E6B"/><stop offset="1" stop-color="#DE5B3B"/></linearGradient></defs>`;

function launchedSvg(theme: Theme, upvotes: number | null) {
  const t = THEMES[theme];
  const withCount = upvotes !== null;
  const width = withCount ? 262 : 220;
  const height = 54;
  const count = withCount
    ? `<line x1="210" y1="12" x2="210" y2="42" stroke="${t.divider}"/>
       <path d="M236 17 l6 8 h-12 z" fill="${t.text}"/>
       <text x="236" y="41" text-anchor="middle" font-family="${FONT}" font-size="13" font-weight="700" fill="${t.text}">${upvotes}</text>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Launched on Claude AI Directory">
  ${DEFS}
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="10" fill="${t.bg}" stroke="${t.border}"/>
  ${mark(12, 11, 32)}
  <text x="54" y="23" font-family="${FONT}" font-size="9" font-weight="600" letter-spacing="0.9" fill="${t.eyebrow}">LAUNCHED ON</text>
  <text x="54" y="41" font-family="${FONT}" font-size="15" font-weight="700" fill="${t.text}">Claude AI Directory</text>
  ${count}
</svg>`;
}

function minimalSvg(theme: Theme) {
  const t = THEMES[theme];
  const width = 196;
  const height = 28;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Listed on Claude AI Directory">
  ${DEFS}
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="14" fill="${t.bg}" stroke="${t.border}"/>
  ${mark(6, 5, 18)}
  <text x="31" y="18" font-family="${FONT}" font-size="11.5" font-weight="600" fill="${t.text}">Listed on claudeai.directory</text>
</svg>`;
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const url = new URL(request.url);
  const theme: Theme = url.searchParams.get("theme") === "dark" ? "dark" : "light";
  const styleParam = url.searchParams.get("style");
  const style: Style = styleParam === "upvotes" || styleParam === "minimal" ? styleParam : "launched";

  let svg: string;
  if (style === "minimal") {
    svg = minimalSvg(theme);
  } else if (style === "upvotes") {
    // Unknown or unreachable launch: still render a valid badge (with 0), never a broken image.
    const project = await fetchApi<ShowcaseProject>(`/showcase/${encodeURIComponent(slug)}`, { revalidate: 300 });
    svg = launchedSvg(theme, Math.max(0, Number(project?.upvotes ?? 0)));
  } else {
    svg = launchedSvg(theme, null);
  }

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
    },
  });
}

