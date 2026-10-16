/** "▲ 32%" green / "▼ 12%" red against the previous period; "new" when there was nothing before. */
function Change({ now, prev }: { now: number; prev?: number }) {
  if (prev === undefined) return null;
  if (prev === 0) return now > 0 ? <span className="rounded-[4px] bg-green-500/10 px-1.5 py-0.5 font-mono text-[11px] text-green-600 dark:text-green-400">new</span> : null;
  const pct = Math.round(((now - prev) / prev) * 100);
  if (pct === 0) return <span className="font-mono text-[11px] text-muted-foreground">0%</span>;
  const up = pct > 0;
  return (
    <span
      className={`rounded-[4px] px-1.5 py-0.5 font-mono text-[11px] tabular-nums ${up ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}
      title={`${prev.toLocaleString("en-US")} in the previous period`}
    >
      {up ? "▲" : "▼"} {Math.abs(pct) > 999 ? "999+" : Math.abs(pct)}%
    </span>
  );
}

export function Stat({ label, value, sub, now, prev }: { label: string; value: string; sub?: string; now?: number; prev?: number }) {
  return (
    <div className="bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[11px] text-muted-foreground">{label}</p>
        {now !== undefined && <Change now={now} prev={prev} />}
      </div>
      <p className="mt-1.5 text-[22px] font-semibold tabular-nums leading-none text-foreground">{value}</p>
      {sub && <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

