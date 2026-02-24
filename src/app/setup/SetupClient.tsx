"use client";

import { useCallback, useMemo, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Copy, Download, Share2 } from "lucide-react";
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
  type Language,
  type Styling,
  type PackageManager,
  type Strictness,
  type TeamSize,
  type Testing,
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

function paramsToConfig(params: URLSearchParams): GeneratorConfig {
  const behaviors = params.get("opts")
    ? (params.get("opts")!.split(",") as BehaviorKey[])
    : DEFAULT_CONFIG.behaviors;
  return {
    stack: (params.get("stack") as Stack) || DEFAULT_CONFIG.stack,
    language: (params.get("lang") as Language) || DEFAULT_CONFIG.language,
    styling: (params.get("style") as Styling) || DEFAULT_CONFIG.styling,
    packageManager:
      (params.get("pm") as PackageManager) || DEFAULT_CONFIG.packageManager,
    strictness: (params.get("strict") as Strictness) || DEFAULT_CONFIG.strictness,
    teamSize: (params.get("team") as TeamSize) || DEFAULT_CONFIG.teamSize,
    testing: (params.get("test") as Testing) || DEFAULT_CONFIG.testing,
    behaviors,
  };
}

// ─── Primitives ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest mb-2.5">
      {children}
    </p>
  );
}

/** Compact pill — for language, PM, testing, styling */
function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
        active
          ? "bg-primary border-primary text-primary-foreground shadow-sm"
          : "border-border/70 text-muted-foreground hover:border-primary/50 hover:text-foreground bg-transparent"
      }`}
    >
      {children}
    </button>
  );
}

/** Stack card — clean text, no icon box */
function StackCard({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-2 py-2.5 rounded-lg border text-center transition-all text-xs font-medium leading-tight ${
        active
          ? "border-primary bg-primary/10 text-primary shadow-sm"
          : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground hover:bg-accent/40 bg-transparent"
      }`}
    >
      {active && (
        <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary" />
      )}
      {label}
    </button>
  );
}

/** Radio card with level-dots indicator (for strictness & team size) */
function RadioCard({
  active,
  onClick,
  label,
  description,
  dots,
  totalDots,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  description: string;
  dots: number;
  totalDots: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-3 py-3 rounded-lg border text-left transition-all ${
        active
          ? "border-primary bg-primary/8 shadow-sm"
          : "border-border/60 hover:border-border hover:bg-accent/30 bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <p className={`text-sm font-semibold ${active ? "text-primary" : "text-foreground"}`}>
          {label}
        </p>
        <div className="flex gap-1">
          {Array.from({ length: totalDots }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                i < dots
                  ? active ? "bg-primary" : "bg-muted-foreground/50"
                  : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground leading-snug">{description}</p>
    </button>
  );
}

// ─── Markdown preview coloring ───────────────────────────────────────────────

function colorizedMd(content: string): React.ReactNode[] {
  return content.split("\n").map((line, i) => {
    let cls = "text-foreground/75";
    if (line.startsWith("# ")) cls = "text-foreground font-bold text-sm";
    else if (line.startsWith("## ")) cls = "text-primary font-semibold";
    else if (line.startsWith("### ")) cls = "text-foreground/90 font-medium";
    else if (line.startsWith("- ") || line.startsWith("* ")) cls = "text-foreground/65";
    else if (line.startsWith("<!--")) cls = "text-muted-foreground/50 italic";
    else if (line.trim() === "") cls = "";
    return (
      <span key={i} className={cls}>
        {line}
        {"\n"}
      </span>
    );
  });
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function SetupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const config = useMemo(() => paramsToConfig(searchParams), [searchParams]);
  const generatedContent = useMemo(() => generateClaudeMd(config), [config]);

  const updateConfig = useCallback(
    (updates: Partial<GeneratorConfig>) => {
      const next = { ...config, ...updates };
      const params = configToParams(next);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        router.replace(`/setup?${params.toString()}`, { scroll: false });
      }, 150);
    },
    [config, router]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleStackChange = useCallback(
    (value: Stack) => {
      const opt = STACK_OPTIONS.find((s) => s.value === value);
      if (!opt) return;
      updateConfig({
        stack: value,
        language: opt.defaultLanguage,
        packageManager: opt.defaultPM,
        testing: opt.defaultTesting,
        styling: opt.defaultStyling,
      });
    },
    [updateConfig]
  );

  const toggleBehavior = useCallback(
    (key: BehaviorKey) => {
      const next = config.behaviors.includes(key)
        ? config.behaviors.filter((b) => b !== key)
        : [...config.behaviors, key];
      updateConfig({ behaviors: next });
    },
    [config.behaviors, updateConfig]
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(generatedContent).then(() =>
      toast.success("Copied to clipboard")
    );
  }, [generatedContent]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([generatedContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "CLAUDE.md";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded CLAUDE.md");
  }, [generatedContent]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() =>
      toast.success("Link copied to clipboard")
    );
  }, []);

  const currentStackOpt = STACK_OPTIONS.find((s) => s.value === config.stack);
  const isWebStack = currentStackOpt?.isWeb ?? false;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container py-8">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground mb-1">
            CLAUDE.md Generator
          </h1>
          <p className="text-sm text-muted-foreground">
            Pick your stack and preferences — get a shareable CLAUDE.md instantly.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* ── Left Panel ── */}
          <div className="w-full lg:w-[40%] rounded-xl border border-border bg-card/40 overflow-hidden">
            <div className="p-5 space-y-6 overflow-y-auto lg:max-h-[calc(100vh-10rem)]">

              {/* Framework */}
              <div>
                <SectionLabel>Framework</SectionLabel>
                <div className="grid grid-cols-5 gap-1.5">
                  {STACK_OPTIONS.map((opt) => (
                    <StackCard
                      key={opt.value}
                      active={config.stack === opt.value}
                      onClick={() => handleStackChange(opt.value)}
                      label={opt.label}
                    />
                  ))}
                </div>
              </div>

              <Separator className="opacity-50" />

              {/* Language */}
              <div>
                <SectionLabel>Language</SectionLabel>
                <div className="flex flex-wrap gap-1.5">
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <Chip
                      key={opt.value}
                      active={config.language === opt.value}
                      onClick={() => updateConfig({ language: opt.value })}
                    >
                      {opt.label}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Styling (web only) */}
              {isWebStack && (
                <div>
                  <SectionLabel>Styling</SectionLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {STYLING_OPTIONS.map((opt) => (
                      <Chip
                        key={opt.value}
                        active={config.styling === opt.value}
                        onClick={() => updateConfig({ styling: opt.value })}
                      >
                        {opt.label}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              {/* Package Manager */}
              <div>
                <SectionLabel>Package Manager</SectionLabel>
                <div className="flex flex-wrap gap-1.5">
                  {PM_OPTIONS.map((opt) => (
                    <Chip
                      key={opt.value}
                      active={config.packageManager === opt.value}
                      onClick={() => updateConfig({ packageManager: opt.value })}
                    >
                      {opt.label}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Testing */}
              <div>
                <SectionLabel>Testing</SectionLabel>
                <div className="flex flex-wrap gap-1.5">
                  {TESTING_OPTIONS.map((opt) => (
                    <Chip
                      key={opt.value}
                      active={config.testing === opt.value}
                      onClick={() => updateConfig({ testing: opt.value })}
                    >
                      {opt.label}
                    </Chip>
                  ))}
                </div>
              </div>

              <Separator className="opacity-50" />

              {/* Strictness */}
              <div>
                <SectionLabel>Strictness</SectionLabel>
                <div className="flex gap-2">
                  {STRICTNESS_OPTIONS.map((opt, i) => (
                    <RadioCard
                      key={opt.value}
                      active={config.strictness === opt.value}
                      onClick={() => updateConfig({ strictness: opt.value })}
                      label={opt.label}
                      description={opt.description ?? ""}
                      dots={i + 1}
                      totalDots={3}
                    />
                  ))}
                </div>
              </div>

              {/* Team Size */}
              <div>
                <SectionLabel>Team Size</SectionLabel>
                <div className="flex gap-2">
                  {TEAM_SIZE_OPTIONS.map((opt, i) => (
                    <RadioCard
                      key={opt.value}
                      active={config.teamSize === opt.value}
                      onClick={() => updateConfig({ teamSize: opt.value })}
                      label={opt.label}
                      description={opt.description ?? ""}
                      dots={i + 1}
                      totalDots={3}
                    />
                  ))}
                </div>
              </div>

              <Separator className="opacity-50" />

              {/* Behaviors */}
              <div>
                <SectionLabel>Behaviors</SectionLabel>
                <div className="grid grid-cols-1 gap-1">
                  {BEHAVIOR_OPTIONS.map((opt) => {
                    const checked = config.behaviors.includes(opt.key);
                    return (
                      <label
                        key={opt.key}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all group ${
                          checked
                            ? "bg-primary/8 border border-primary/20"
                            : "border border-transparent hover:bg-accent/40"
                        }`}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleBehavior(opt.key)}
                          className="shrink-0"
                        />
                        <div className="min-w-0">
                          <p className={`text-sm font-medium leading-snug ${checked ? "text-foreground" : "text-foreground/80"}`}>
                            {opt.label}
                          </p>
                          <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                            {opt.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* ── Right Panel ── */}
          <div className="w-full lg:w-[60%] lg:sticky lg:top-20">

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-muted border border-border text-xs font-mono font-medium text-foreground">
                <span className="h-2 w-2 rounded-full bg-primary/70" />
                CLAUDE.md
              </div>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleCopy}>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleDownload}>
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleShare}>
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </Button>
              </div>
            </div>

            {/* Preview */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <pre className="p-5 text-xs font-mono leading-relaxed overflow-auto max-h-[calc(100vh-10rem)] whitespace-pre-wrap break-words">
                {colorizedMd(generatedContent)}
              </pre>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
