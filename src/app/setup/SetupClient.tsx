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
      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${active
          ? "bg-zinc-800 border-zinc-700 text-zinc-100 shadow-sm"
          : "border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 bg-transparent"
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
      className={`relative px-2 py-2.5 rounded-lg border text-center transition-all text-xs font-medium leading-tight ${active
          ? "border-zinc-700 bg-zinc-800/80 text-zinc-100 shadow-sm"
          : "border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 hover:bg-zinc-900/50 bg-transparent"
        }`}
    >
      {active && (
        <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-zinc-300" />
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
      className={`flex-1 px-3 py-3 rounded-lg border text-left transition-all ${active
          ? "border-zinc-700 bg-zinc-800/60 shadow-sm"
          : "border-zinc-800/80 hover:border-zinc-700/80 hover:bg-zinc-900/50 bg-transparent"
        }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <p className={`text-sm font-semibold ${active ? "text-zinc-100" : "text-zinc-400"}`}>
          {label}
        </p>
        <div className="flex gap-1">
          {Array.from({ length: totalDots }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${i < dots
                  ? active ? "bg-zinc-300" : "bg-zinc-600"
                  : "bg-zinc-800"
                }`}
            />
          ))}
        </div>
      </div>
      <p className="text-[11px] text-zinc-500 leading-snug">{description}</p>
    </button>
  );
}

// ─── Markdown preview coloring ───────────────────────────────────────────────

// ─── Markdown preview coloring ───────────────────────────────────────────────

function colorizedMd(content: string): React.ReactNode[] {
  return content.split("\n").map((line, i) => {
    let cls = "text-zinc-300";
    if (line.startsWith("# ")) cls = "text-zinc-100 font-bold text-sm tracking-wide";
    else if (line.startsWith("## ")) cls = "text-zinc-200 font-semibold";
    else if (line.startsWith("### ")) cls = "text-zinc-200 font-medium";
    else if (line.startsWith("- ") || line.startsWith("* ")) cls = "text-zinc-400";
    else if (line.startsWith("<!--")) cls = "text-zinc-500 italic";
    else if (line.trim() === "") cls = "";

    // Highlight code blocks
    if (line.startsWith("```")) cls = "text-zinc-600";

    // Highlight inline paths or code
    else if (line.includes("`")) {
      const parts = line.split("`");
      return (
        <span key={i} className={cls}>
          {parts.map((part, index) =>
            index % 2 === 1 ? (
              <span key={index} className="text-zinc-300 bg-black/40 px-1 rounded">{part}</span>
            ) : part
          )}
          {"\n"}
        </span>
      );
    }

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
          <div className="w-full lg:w-[40%] rounded-xl border border-zinc-800/80 bg-black/40 shadow-inner overflow-hidden">
            <div className="p-5 space-y-6 overflow-y-auto lg:max-h-[calc(100vh-10rem)] custom-scrollbar">

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
                <SectionLabel>PackageManager</SectionLabel>
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
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all group ${checked
                            ? "bg-zinc-800/80 border border-zinc-700 shadow-sm"
                            : "border border-transparent hover:bg-zinc-900/50"
                          }`}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleBehavior(opt.key)}
                          className="shrink-0 border-zinc-600 data-[state=checked]:bg-zinc-300 data-[state=checked]:text-black"
                        />
                        <div className="min-w-0">
                          <p className={`text-sm font-medium leading-snug ${checked ? "text-zinc-100" : "text-zinc-400"}`}>
                            {opt.label}
                          </p>
                          <p className="text-[11px] text-zinc-500 leading-snug mt-0.5">
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
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#0d0d0d] border border-zinc-800 text-xs font-mono font-medium text-zinc-300 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-zinc-500" />
                CLAUDE.md
              </div>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs bg-black/40 border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800" onClick={handleCopy}>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs bg-black/40 border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800" onClick={handleDownload}>
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs bg-black/40 border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800" onClick={handleShare}>
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </Button>
              </div>
            </div>

            {/* Preview */}
            <div className="rounded-xl border border-zinc-800 bg-[#0a0a0a] shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent opacity-20" />
              <pre className="p-6 text-[13px] font-mono leading-relaxed overflow-auto max-h-[calc(100vh-10rem)] whitespace-pre-wrap break-words custom-scrollbar">
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
