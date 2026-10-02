import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

import { CURRENT_MODELS, LAST_UPDATED, PUBLIC_MODELS, STATS, formatDate, toTime, yearOf } from "./timeline-data";

export const runtime = "nodejs";
export const alt = "Claude release timeline: every Claude model, dated. By Claude AI Directory.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#14120B";
const INK = "#F0EFEC";
const MUTED = "#A8A598";
const ACCENT = "#D97757";
const LINE = "#2B2920";

export default function Image() {
  const mark = readFileSync(join(process.cwd(), "public/logo-mark-256.png"));
  const markSrc = `data:image/png;base64,${mark.toString("base64")}`;

  const start = toTime(`${yearOf(STATS.first.date)}-01-01`);
  const end = toTime(`${yearOf(LAST_UPDATED) + 1}-01-01`);
  const pos = (iso: string) => ((toTime(iso) - start) / (end - start)) * 100;
  const years: number[] = [];
  for (let y = yearOf(STATS.first.date); y <= yearOf(LAST_UPDATED); y++) years.push(y);
  const months = Math.round(STATS.spanDays / 30.44);

  const stats = [
    { label: "models", value: `${STATS.models}` },
    { label: "avg gap", value: `${STATS.avgGap} days` },
    { label: "fastest gap", value: `${STATS.fastest.days} days` },
    { label: `in ${STATS.busiestYear.year}`, value: `${STATS.busiestYear.count} models` },
  ];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: BG, color: INK, padding: "56px 64px", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src={markSrc} width={40} height={40} alt="" style={{ marginRight: 14 }} />
            <span style={{ fontSize: 24, fontWeight: 600 }}>Claude AI Directory</span>
          </div>
          <span style={{ fontSize: 20, color: MUTED, fontFamily: "monospace" }}>{`Updated ${formatDate(LAST_UPDATED)}`}</span>
        </div>

        <div style={{ display: "flex", marginTop: 44, fontSize: 22, color: ACCENT, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "monospace" }}>
          Claude release timeline
        </div>
        <div style={{ display: "flex", marginTop: 10, fontSize: 76, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.05 }}>Every Claude model, dated</div>
        <div style={{ display: "flex", marginTop: 16, fontSize: 28, color: MUTED }}>
          {`${STATS.models} models in ${months} months. Now: ${CURRENT_MODELS.map((m) => m.title.replace(/^Claude /, "")).join(", ")}.`}
        </div>

        <div style={{ display: "flex", marginTop: 34 }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{ display: "flex", flexDirection: "column", paddingLeft: i ? 28 : 0, paddingRight: 28, borderLeft: i ? `1px solid ${LINE}` : "none" }}>
              <span style={{ fontSize: 40, fontWeight: 700 }}>{s.value}</span>
              <span style={{ fontSize: 18, color: MUTED, fontFamily: "monospace", marginTop: 4 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Release strip: one dot per generally available model */}
        <div style={{ display: "flex", position: "relative", marginTop: "auto", height: 54 }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 12, height: 2, background: LINE }} />
          {PUBLIC_MODELS.map((m) => (
            <div
              key={m.id}
              style={{ position: "absolute", left: `${pos(m.date)}%`, top: 6, width: 14, height: 14, marginLeft: -7, borderRadius: 7, background: m.current ? ACCENT : "#8C5A45", border: `2px solid ${BG}` }}
            />
          ))}
          {years.map((y) => (
            <span key={y} style={{ position: "absolute", left: `${pos(`${y}-01-01`)}%`, top: 30, fontSize: 18, color: MUTED, fontFamily: "monospace" }}>
              {`${y}`}
            </span>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
