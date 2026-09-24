"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Check, Copy, Download, Link2, RotateCcw } from "lucide-react";
import { generateClaudeMd } from "./generator";
import {
  DEFAULT_CONFIG,
  STACK_OPTIONS,
  LANGUAGE_OPTIONS,
  STYLING_OPTIONS,
  PM_OPTIONS,
  STRICTNESS_OPTIONS,
  TEAM_SIZE_OPTIONS,
  TESTING_OPTIONS,
  BEHAVIOR_OPTIONS,
  type GeneratorConfig,
  type Stack,
  type BehaviorKey,
} from "./config";

// ─── URL helpers ────────────────────────────────────────────────────────────

function configToParams(config: GeneratorConfig): URLSearchParams {
  const p = new URLSearchParams();
  p.set("stack", config.stack);
  p.set("lang", config.language);
  p.set("style", config.styling);
  p.set("pm", config.packageManager);
  p.set("strict", config.strictness);
  p.set("team", config.teamSize);
  p.set("test", config.testing);
  if (config.behaviors.length > 0) p.set("opts", config.behaviors.join(","));
  return p;
}

/** Shared links are user input: fall back to defaults for unknown values. */
function pick<T extends string>(raw: string | null, options: { value: T }[], fallback: T): T {
  return options.find((o) => o.value === raw)?.value ?? fallback;
}

function paramsToConfig(params: URLSearchParams): GeneratorConfig {
  const opts = params.get("opts");
  const validKeys = new Set<string>(BEHAVIOR_OPTIONS.map((b) => b.key));
  const behaviors =
    opts === null
      ? DEFAULT_CONFIG.behaviors
      : (opts.split(",").filter((k, i, all) => validKeys.has(k) && all.indexOf(k) === i) as BehaviorKey[]);
  const stack = pick(params.get("stack"), STACK_OPTIONS, DEFAULT_CONFIG.stack);
  // Missing tooling params follow the chosen framework, same as clicking it.
  const stackOpt = STACK_OPTIONS.find((s) => s.value === stack)!;
  return {
    stack,
    language: pick(params.get("lang"), LANGUAGE_OPTIONS, stackOpt.defaultLanguage),
    styling: pick(params.get("style"), STYLING_OPTIONS, stackOpt.defaultStyling),
    packageManager: pick(params.get("pm"), PM_OPTIONS, stackOpt.defaultPM),
    strictness: pick(params.get("strict"), STRICTNESS_OPTIONS, DEFAULT_CONFIG.strictness),
    teamSize: pick(params.get("team"), TEAM_SIZE_OPTIONS, DEFAULT_CONFIG.teamSize),
    testing: pick(params.get("test"), TESTING_OPTIONS, stackOpt.defaultTesting),
    behaviors,
  };
}

// ─── Form primitives ────────────────────────────────────────────────────────

function Step({
  n,
  title,
  hint,
  children,
}: {
  n: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border px-5 py-6 first:border-t-0 sm:px-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border font-mono text-[11px] text-muted-foreground">
          {n}
        </span>
        <div className="min-w-0">
          <h2 className="font-sans text-[15px] font-medium leading-snug text-foreground">{title}</h2>
          {hint && <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{hint}</p>}
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function FieldLabel({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </p>
  );
}

function ChipGroup<T extends string>({
  id,
  label,
  options,
  value,
  onChange,
}: {
  id: string;
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <FieldLabel id={id}>{label}</FieldLabel>
      <div role="radiogroup" aria-labelledby={id} className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(opt.value)}
              className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-[var(--cad-line-hover)] hover:text-foreground"
              }`}
            >
              {active && <Check className="h-3 w-3" aria-hidden />}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LevelCards<T extends string>({
  id,
  label,
  options,
  value,
  onChange,
}: {
  id: string;
  label: string;
  options: { value: T; label: string; description?: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <FieldLabel id={id}>{label}</FieldLabel>
      <div role="radiogroup" aria-labelledby={id} className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {options.map((opt, i) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(opt.value)}
              className={`rounded-lg border px-3.5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                active
                  ? "border-foreground bg-secondary"
                  : "border-border hover:border-[var(--cad-line-hover)]"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className={`text-sm font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>
                  {opt.label}
                </span>
                <span className="flex gap-1" aria-hidden>
                  {options.map((_, d) => (
                    <span
                      key={d}
                      className={`h-1.5 w-1.5 rounded-full ${
                        d <= i ? (active ? "bg-primary" : "bg-muted-foreground/50") : "bg-border"
                      }`}
                    />
                  ))}
                </span>
              </span>
              {opt.description && (
                <span className="mt-1 block text-[12px] leading-snug text-muted-foreground">{opt.description}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Preview ────────────────────────────────────────────────────────────────

function lineClass(line: string): string {
  if (line.startsWith("# ")) return "font-semibold text-zinc-50";
  if (line.startsWith("## ")) return "font-semibold text-[#e8a07f]";
  if (line.startsWith("### ")) return "font-medium text-zinc-200";
  if (line.startsWith("<!--")) return "italic text-zinc-500";
  if (line.startsWith("```")) return "text-zinc-600";
  return "text-zinc-300";
}

function PreviewLine({ line }: { line: string }) {
  const cls = lineClass(line);
  if (!line.includes("`") || line.startsWith("```")) return <span className={cls}>{line || " "}</span>;
  return (
    <span className={cls}>
      {line.split("`").map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} className="rounded bg-white/[0.07] px-1 text-[#f0c4ae]">
            {part}
          </code>
        ) : (
          part
        ),
      )}
    </span>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function GeneratorClient() {
  const searchParams = useSearchParams();
  // Local state keeps selection instant; the URL follows so the setup stays shareable.
  const [config, setConfig] = useState<GeneratorConfig>(() => paramsToConfig(searchParams));
  const [copied, setCopied] = useState(false);
  // The mobile action bar is only useful while the options fill the screen.
  const [optionsInView, setOptionsInView] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const content = useMemo(() => generateClaudeMd(config), [config]);
  const lines = useMemo(() => content.replace(/\n$/, "").split("\n"), [content]);

  useEffect(() => {
    const url = `${window.location.pathname}?${configToParams(config).toString()}`;
    window.history.replaceState(null, "", url);
  }, [config]);

  useEffect(() => {
    const el = optionsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setOptionsInView(entry?.isIntersecting ?? false), {
      rootMargin: "0px 0px -35% 0px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => {
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
  }, []);

  const update = useCallback((updates: Partial<GeneratorConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleStackChange = useCallback(
    (value: Stack) => {
      const opt = STACK_OPTIONS.find((s) => s.value === value);
      if (!opt) return;
      update({
        stack: value,
        language: opt.defaultLanguage,
        packageManager: opt.defaultPM,
        testing: opt.defaultTesting,
        styling: opt.defaultStyling,
      });
    },
    [update],
  );

  const toggleBehavior = useCallback((key: BehaviorKey) => {
    setConfig((prev) => ({
      ...prev,
      behaviors: prev.behaviors.includes(key)
        ? prev.behaviors.filter((b) => b !== key)
        : [...prev.behaviors, key],
    }));
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content).then(
      () => {
        setCopied(true);
        if (copiedTimer.current) clearTimeout(copiedTimer.current);
        copiedTimer.current = setTimeout(() => setCopied(false), 2000);
      },
      () => toast.error("Could not copy. Select the text and copy it manually."),
    );
  }, [content]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "CLAUDE.md";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded CLAUDE.md");
  }, [content]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(
      () => toast.success("Link to this setup copied"),
      () => toast.error("Could not copy the link"),
    );
  }, []);

  const isDefault = JSON.stringify(config) === JSON.stringify(DEFAULT_CONFIG);
  const isWebStack = STACK_OPTIONS.find((s) => s.value === config.stack)?.isWeb ?? false;
  const approxTokens = Math.round(content.length / 4);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* ── Options ── */}
      <div ref={optionsRef} className="overflow-hidden rounded-xl border border-border bg-card">
        <Step n={1} title="Framework" hint="Sets sensible defaults for language, package manager and testing.">
          <div
            role="radiogroup"
            aria-label="Framework"
            className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-3 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5"
          >
            {STACK_OPTIONS.map((opt) => {
              const active = config.stack === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => handleStackChange(opt.value)}
                  className={`h-10 rounded-lg border px-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-[var(--cad-line-hover)] hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </Step>

        <Step n={2} title="Tooling">
          <ChipGroup
            id="field-language"
            label="Language"
            options={LANGUAGE_OPTIONS}
            value={config.language}
            onChange={(language) => update({ language })}
          />
          {isWebStack && (
            <ChipGroup
              id="field-styling"
              label="Styling"
              options={STYLING_OPTIONS}
              value={config.styling}
              onChange={(styling) => update({ styling })}
            />
          )}
          <ChipGroup
            id="field-pm"
            label="Package manager"
            options={PM_OPTIONS}
            value={config.packageManager}
            onChange={(packageManager) => update({ packageManager })}
          />
          <ChipGroup
            id="field-testing"
            label="Testing"
            options={TESTING_OPTIONS}
            value={config.testing}
            onChange={(testing) => update({ testing })}
          />
        </Step>

        <Step n={3} title="How Claude should work" hint="Controls how often Claude checks in and how it handles git.">
          <LevelCards
            id="field-strictness"
            label="Autonomy"
            options={STRICTNESS_OPTIONS}
            value={config.strictness}
            onChange={(strictness) => update({ strictness })}
          />
          <LevelCards
            id="field-team"
            label="Team size"
            options={TEAM_SIZE_OPTIONS}
            value={config.teamSize}
            onChange={(teamSize) => update({ teamSize })}
          />
        </Step>

        <Step
          n={4}
          title="Extra rules"
          hint={`${config.behaviors.length} of ${BEHAVIOR_OPTIONS.length} on. Each one adds a line to the file.`}
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {BEHAVIOR_OPTIONS.map((opt) => {
              const checked = config.behaviors.includes(opt.key);
              return (
                <button
                  key={opt.key}
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => toggleBehavior(opt.key)}
                  className={`flex items-start gap-3 rounded-lg border px-3.5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    checked ? "border-foreground bg-secondary" : "border-border hover:border-[var(--cad-line-hover)]"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      checked ? "border-foreground bg-foreground text-background" : "border-muted-foreground/50"
                    }`}
                  >
                    {checked && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                  <span className="min-w-0">
                    <span className={`block text-sm font-medium leading-snug ${checked ? "text-foreground" : "text-muted-foreground"}`}>
                      {opt.label}
                    </span>
                    <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">{opt.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </Step>
      </div>

      {/* ── Preview ── */}
      <div id="preview" className="scroll-mt-24 lg:sticky lg:top-24">
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#0d0d0c] shadow-[0_12px_40px_-12px_rgba(0,0,0,0.35)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
              <span className="font-mono text-[13px] text-zinc-100">CLAUDE.md</span>
              <span className="truncate font-mono text-[11px] text-zinc-500">
                {lines.length} lines · ~{approxTokens.toLocaleString()} tokens
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setConfig(DEFAULT_CONFIG)}
                disabled={isDefault}
                className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12px] text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-zinc-100 disabled:pointer-events-none disabled:opacity-40"
                title="Reset to defaults"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Reset</span>
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12px] text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-zinc-100"
                title="Copy a link to this setup"
              >
                <Link2 className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Share</span>
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-zinc-700 px-2.5 text-[12px] text-zinc-200 transition-colors hover:bg-white/[0.06]"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-zinc-100 px-3 text-[12px] font-medium text-zinc-900 transition-colors hover:bg-white"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div
            role="region"
            aria-label="Generated CLAUDE.md"
            tabIndex={0}
            className="custom-scrollbar max-h-[60vh] overflow-auto py-4 font-mono [font-variant-ligatures:none] focus-visible:outline-none text-[12.5px] leading-[1.7] lg:max-h-[calc(100vh-14rem)]"
          >
            {lines.map((line, i) => (
              <div key={i} className="grid grid-cols-[3rem_minmax(0,1fr)] pr-4">
                <span aria-hidden className="select-none pr-4 text-right text-zinc-600">
                  {i + 1}
                </span>
                <span className="whitespace-pre-wrap break-words">
                  <PreviewLine line={line} />
                </span>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-3 text-[13px] text-muted-foreground">
          Save it as <code className="font-mono text-foreground">CLAUDE.md</code> in your project root, then edit the
          project name and overview at the top.
        </p>
      </div>

      {/* ── Mobile action bar ── */}
      <div
        inert={!optionsInView}
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition-transform duration-200 lg:hidden ${
          optionsInView ? "translate-y-0" : "pointer-events-none translate-y-full"
        }`}
      >
        <div className="mx-auto flex max-w-[640px] gap-2">
          <a
            href="#preview"
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-border text-sm text-foreground"
          >
            Preview
          </a>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex h-11 flex-[2] items-center justify-center gap-2 rounded-full bg-foreground text-sm font-medium text-background"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy CLAUDE.md"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function GeneratorSkeleton() {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]" aria-hidden>
      <div className="h-[640px] animate-pulse rounded-xl border border-border bg-card" />
      <div className="h-[640px] animate-pulse rounded-xl border border-zinc-800 bg-[#0d0d0c]" />
    </div>
  );
}
