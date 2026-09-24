"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { blendedPrice, type APIPricing } from "@/data/apiPricing";
import { formatDate, formatPrice, formatTokens } from "./format";

type SortKey = "model" | "input" | "output" | "blended" | "cache" | "context" | "released";

const columns: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: "model", label: "Model" },
  { key: "input", label: "Input", numeric: true },
  { key: "output", label: "Output", numeric: true },
  { key: "blended", label: "Blended", numeric: true },
  { key: "cache", label: "Cache read", numeric: true },
  { key: "context", label: "Context", numeric: true },
  { key: "released", label: "Released", numeric: true },
];

const sortValue: Record<SortKey, (m: APIPricing) => number | string> = {
  model: m => m.model.toLowerCase(),
  input: m => m.inputPrice,
  output: m => m.outputPrice,
  blended: m => blendedPrice(m),
  cache: m => m.cacheReadPrice ?? Number.POSITIVE_INFINITY,
  context: m => m.contextWindow,
  released: m => m.released ?? "",
};

const PAGE = 40;

export default function PricingTable({ models }: { models: APIPricing[] }) {
  const providers = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of models) counts.set(m.provider, (counts.get(m.provider) ?? 0) + 1);
    // Anthropic first, then by number of models.
    return [...counts.entries()].sort((a, b) =>
      a[0] === "Anthropic" ? -1 : b[0] === "Anthropic" ? 1 : b[1] - a[1],
    );
  }, [models]);

  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState<string | null>(null);
  const [openOnly, setOpenOnly] = useState(false);
  const [visionOnly, setVisionOnly] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "released", dir: -1 });
  const [limit, setLimit] = useState(PAGE);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const get = sortValue[sort.key];
    return models
      .filter(m => !provider || m.provider === provider)
      .filter(m => !openOnly || m.openWeights)
      .filter(m => !visionOnly || m.features.includes("Vision"))
      .filter(m => !q || m.model.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q))
      .sort((a, b) => {
        const va = get(a);
        const vb = get(b);
        return (va < vb ? -1 : va > vb ? 1 : 0) * sort.dir;
      });
  }, [models, query, provider, openOnly, visionOnly, sort]);

  const toggleSort = (key: SortKey) => {
    setSort(s => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: key === "model" ? 1 : -1 }));
    setLimit(PAGE);
  };

  const chip = (active: boolean) =>
    `inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[13px] transition-colors ${
      active
        ? "border-foreground bg-foreground text-background"
        : "border-border bg-card text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            aria-label="Search models"
            placeholder="Search models or providers"
            className="h-9 pl-9"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setLimit(PAGE);
            }}
          />
        </div>
        <div className="flex gap-2">
          <button type="button" className={chip(openOnly)} aria-pressed={openOnly} onClick={() => setOpenOnly(v => !v)}>
            Open weights
          </button>
          <button type="button" className={chip(visionOnly)} aria-pressed={visionOnly} onClick={() => setVisionOnly(v => !v)}>
            Vision
          </button>
        </div>
      </div>

      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <button type="button" className={chip(provider === null)} onClick={() => setProvider(null)}>
          All <span className="opacity-60">{models.length}</span>
        </button>
        {providers.map(([name, count]) => (
          <button
            type="button"
            key={name}
            className={chip(provider === name)}
            aria-pressed={provider === name}
            onClick={() => {
              setProvider(p => (p === name ? null : name));
              setLimit(PAGE);
            }}
          >
            {name} <span className="opacity-60">{count}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              {columns.map(col => {
                const active = sort.key === col.key;
                const Icon = sort.dir === 1 ? ArrowUp : ArrowDown;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={active ? (sort.dir === 1 ? "ascending" : "descending") : "none"}
                    className={`px-4 py-3 font-medium text-muted-foreground ${col.numeric ? "text-right" : ""}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className={`inline-flex items-center gap-1 text-[12px] uppercase tracking-wide hover:text-foreground ${
                        active ? "text-foreground" : ""
                      }`}
                    >
                      {col.label}
                      {active && <Icon className="h-3 w-3" />}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, limit).map(m => {
              const claude = m.provider === "Anthropic";
              return (
                <tr key={m.id} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className={`h-2 w-2 shrink-0 rounded-full ${claude ? "bg-primary" : "bg-muted-foreground/30"}`}
                      />
                      <span className="font-medium text-foreground">{m.model}</span>
                      {m.openWeights && (
                        <span className="rounded border border-border px-1.5 py-px text-[10px] uppercase tracking-wide text-muted-foreground">
                          Open
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 pl-4 text-[12px] text-muted-foreground">{m.provider}</div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatPrice(m.inputPrice)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatPrice(m.outputPrice)}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">{formatPrice(blendedPrice(m))}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {formatPrice(m.cacheReadPrice)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatTokens(m.contextWindow)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-muted-foreground">
                    {formatDate(m.released)}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-muted-foreground">
                  No models match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between text-[13px] text-muted-foreground">
        <span>
          Showing {Math.min(limit, rows.length)} of {rows.length} models. Prices in USD per 1M tokens.
        </span>
        {rows.length > limit && (
          <button
            type="button"
            onClick={() => setLimit(l => l + PAGE)}
            className="rounded-full border border-border bg-card px-4 py-1.5 text-foreground hover:bg-muted"
          >
            Show more
          </button>
        )}
      </div>
    </div>
  );
}
