"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Bot, CheckCircle2, ExternalLink, Loader2, Plug, Rocket, Sparkles, Star } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ApiError, api } from "@/lib/api";
import { track } from "@/lib/analytics";
import { useAuth } from "@/lib/auth";
import type { ResourceInstall, ResourceKind } from "@/lib/install";
import { SignInButton } from "@/components/auth/SignInDialog";

// CLAUDE.md "Submit" + INSTALL_REGISTRY.md "Skill Submission Flow":
// GitHub URL + type, we detect what we can, the creator reviews, a human approves.

interface Detected {
  path: string;
  name: string;
  description?: string;
}

interface DetectResult {
  repo: {
    owner: string;
    name: string;
    default_branch: string;
    description?: string;
    stars?: number;
    license?: string;
    html_url: string;
  };
  detected: {
    plugin_json: boolean;
    marketplace_json: boolean;
    mcp_json: unknown | null;
    skills: Detected[];
    agents: Detected[];
  };
  resolution: ResourceInstall | null;
  warnings: string[];
}

// What people can submit. Apps have their own launch flow (/launches/submit).
const TYPES: { value: ResourceKind; label: string; body: string; source: string; Icon: typeof Sparkles }[] = [
  {
    value: "skill",
    label: "Skill",
    body: "Instructions and scripts that teach Claude a task.",
    source: "GitHub repo with a SKILL.md",
    Icon: Sparkles,
  },
  {
    value: "mcp",
    label: "MCP server",
    body: "A connector that lets Claude use a tool, app or data source.",
    source: "GitHub repo of the server",
    Icon: Plug,
  },
  {
    value: "agent",
    label: "Agent",
    body: "A Claude Code subagent for a specific job, like reviews or tests.",
    source: "GitHub repo with an agent .md file",
    Icon: Bot,
  },
];

const isKind = (v: string | null): v is ResourceKind => v === "skill" || v === "mcp" || v === "agent";

const CATEGORIES: Record<ResourceKind, string[]> = {
  skill: ["Coding", "Frontend", "Testing", "Research", "Productivity", "Data", "Marketing", "DevOps"],
  mcp: ["Developer Tools", "Databases", "Browser", "Productivity", "Communication", "Observability", "Data"],
  agent: ["Coding", "Testing", "Code Review", "Debugging", "Security", "Research", "DevOps"],
};

const GITHUB_REPO = /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?(?:#.*)?$/;

const inputClass =
  "h-11 w-full rounded-lg border border-border bg-card px-3.5 text-[15px] text-foreground outline-none placeholder:text-muted-foreground focus:border-[var(--cad-line-hover)]";

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError && error.data && typeof error.data === "object" && "detail" in error.data) {
    const detail = (error.data as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
  }
  return fallback;
}

export default function SubmitPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [url, setUrl] = useState("");
  const [type, setType] = useState<ResourceKind | null>(null);

  // /submit?type=mcp (from the Submit menus) pre-selects the type.
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("type");
    if (isKind(param)) setType(param);
  }, []);

  const choose = (next: ResourceKind) => {
    setType(next);
    setResult(null);
    setError("");
    const qs = new URLSearchParams(window.location.search);
    qs.set("type", next);
    window.history.replaceState(null, "", `${window.location.pathname}?${qs}`);
  };
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DetectResult | null>(null);
  const [form, setForm] = useState({ source_path: "", name: "", title: "", description: "", category: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const components = result ? (type === "agent" ? result.detected.agents : type === "skill" ? result.detected.skills : []) : [];

  const pick = (component: Detected | undefined, repo: DetectResult["repo"]) => {
    setForm({
      source_path: component?.path ?? "",
      name: component?.name ?? repo.name,
      title: component?.name ?? repo.name,
      // The creator's own text, trimmed. We never generate descriptions.
      description: (component?.description ?? repo.description ?? "").slice(0, 300),
      category: "",
    });
  };

  const detect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) return;
    setError("");
    setResult(null);
    const trimmed = url.trim();
    if (!GITHUB_REPO.test(trimmed)) {
      setError("Paste a GitHub repository URL, like https://github.com/owner/repo");
      return;
    }
    setDetecting(true);
    try {
      const data = await api.post<DetectResult>("/submissions/detect", { github_url: trimmed, resource_type: type });
      setResult(data);
      const list = type === "agent" ? data.detected.agents : type === "skill" ? data.detected.skills : [];
      pick(list[0], data.repo);
    } catch (err) {
      setError(errorMessage(err, "We could not read that repository right now. Check the URL and try again."));
    } finally {
      setDetecting(false);
    }
  };

  const submit = async () => {
    if (!result || !type) return;
    setSubmitting(true);
    setError("");
    try {
      await api.post("/submissions", {
        github_url: url.trim(),
        resource_type: type,
        source_path: form.source_path,
        name: form.name,
        title: form.title,
        description: form.description,
        category: form.category,
        install,
      });
      track("resource_submitted", { resource_type: type });
      setDone(true);
    } catch (err) {
      setError(errorMessage(err, "Submission failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  // Detection resolves the first component it finds; follow the one the creator picked.
  const install: ResourceInstall | null = (() => {
    const base = result?.resolution ?? null;
    if (!base || base.method !== "plugin_marketplace" || !form.source_path) return base;
    const chosen = components.find((c) => c.path === form.source_path);
    const fallback = form.source_path.replace(/\.md$/, "").split("/").pop() ?? "";
    return { ...base, source_path: form.source_path, plugin_name: pluginSlug(chosen?.name || fallback) || base.plugin_name };
  })();

  const noComponents = result && type !== "mcp" && components.length === 0;
  const canSubmit = result && !noComponents && form.title.trim() && form.description.trim() && form.category;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-[680px] px-4 pb-10 pt-16 md:px-8 md:pt-20">
        <h1 className="text-[clamp(34px,5vw,44px)] font-light leading-[1.05] text-foreground">Submit to Claude Directory</h1>
        <p className="mt-3 text-[15.5px] leading-relaxed text-[var(--cad-desc)]">
          Share something you built for Claude. We read your GitHub repo, you check the details, and we review it before it
          goes live.
        </p>

        {done ? (
          <div className="mt-10 rounded-xl border border-border bg-card/40 p-6">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <p className="mt-3 text-[15px] text-foreground">Submitted for review</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              We check the repository and the install details by hand before anything is published. Install commands appear
              on the listing only after that.
            </p>
            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setDone(false);
                  setResult(null);
                  setUrl("");
                }}
                className="inline-flex h-9 items-center rounded-full border border-border px-4 text-sm text-foreground"
              >
                Submit another
              </button>
              <Link href="/" className="inline-flex h-9 items-center rounded-full px-4 text-sm text-muted-foreground hover:text-foreground">
                Back to the directory
              </Link>
            </div>
          </div>
        ) : (
          <>
            <fieldset className="mt-10">
              <legend className="mb-3 text-[15px] text-foreground">What are you submitting?</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {TYPES.map(({ value, label, body, source, Icon }) => {
                  const active = type === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => choose(value)}
                      className={`flex cursor-pointer gap-3.5 rounded-[11px] border p-4 text-left transition-colors ${
                        active ? "border-foreground bg-[var(--cad-surface)]" : "border-border hover:bg-[var(--cad-surface)]"
                      }`}
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-[var(--cad-tile)] text-foreground/85">
                        <Icon className="h-5 w-5" strokeWidth={1.6} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[15px] font-medium text-foreground">{label}</span>
                        <span className="mt-0.5 block text-[13px] leading-snug text-[var(--cad-desc)]">{body}</span>
                        <span className="mt-1 block text-[12.5px] text-muted-foreground">{source}</span>
                      </span>
                    </button>
                  );
                })}
                <Link
                  href="/launches/submit"
                  className="flex gap-3.5 rounded-[11px] border border-border p-4 transition-colors hover:bg-[var(--cad-surface)]"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-[var(--cad-tile)] text-foreground/85">
                    <Rocket className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-[15px] font-medium text-foreground">
                      App <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-[var(--cad-desc)]">
                      A product you built with Claude. Get a launch page, upvotes and a badge.
                    </span>
                    <span className="mt-1 block text-[12.5px] text-muted-foreground">Your app&apos;s website</span>
                  </span>
                </Link>
              </div>
            </fieldset>

            {type && (
            <form onSubmit={detect} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm text-foreground">
                  GitHub repository of your {TYPES.find((t) => t.value === type)?.label ?? type}
                </span>
                <input
                  type="url"
                  required
                  autoFocus
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo"
                  className={inputClass}
                />
              </label>
              {!result && (
                <button
                  type="submit"
                  disabled={detecting}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background disabled:opacity-60"
                >
                  {detecting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {detecting ? "Reading repository" : "Continue"}
                  {!detecting && <ArrowRight className="h-3.5 w-3.5" />}
                </button>
              )}
            </form>
            )}

            {error && (
              <p className="mt-5 flex gap-2 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </p>
            )}

            {result && (
              <div className="mt-10 space-y-6 border-t border-border pt-8">
                <a
                  href={result.repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start justify-between gap-4 rounded-xl border border-border p-4 hover:border-[var(--cad-line-hover)]"
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-[15px] text-foreground">
                      {result.repo.owner}/{result.repo.name}
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </span>
                    {result.repo.description && (
                      <span className="mt-1 block text-sm text-muted-foreground">{result.repo.description}</span>
                    )}
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1 font-mono text-[12px] text-muted-foreground">
                    {result.repo.stars !== undefined && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {result.repo.stars.toLocaleString()}
                      </span>
                    )}
                    {result.repo.license && <span>{result.repo.license}</span>}
                  </span>
                </a>

                {noComponents ? (
                  <div className="rounded-xl border border-dashed border-border p-5 text-sm leading-relaxed text-muted-foreground">
                    <p className="text-[15px] text-foreground">We could not find a {type === "skill" ? "SKILL.md" : "agent file"} in this repo</p>
                    <p className="mt-1.5">
                      {type === "skill"
                        ? "Add a folder with a SKILL.md (for example skills/your-skill/SKILL.md) with a name and description in its frontmatter, then try again."
                        : "Add a Markdown file under agents/ with name and description frontmatter, then try again."}
                    </p>
                  </div>
                ) : (
                  <>
                    {components.length > 1 && (
                      <label className="block">
                        <span className="mb-2 block text-sm text-foreground">Which {type} are you submitting?</span>
                        <select
                          value={form.source_path}
                          onChange={(e) => pick(components.find((c) => c.path === e.target.value), result.repo)}
                          className={inputClass}
                        >
                          {components.map((c) => (
                            <option key={c.path} value={c.path}>
                              {c.name} ({c.path})
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                    <label className="block">
                      <span className="mb-2 block text-sm text-foreground">Name</span>
                      <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm text-foreground">Short description</span>
                      <textarea
                        value={form.description}
                        maxLength={300}
                        rows={3}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className={`${inputClass} h-auto py-3`}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-sm text-foreground">Category</span>
                      <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
                        <option value="">Choose a category</option>
                        {(type ? CATEGORIES[type] : []).map((c) => (
                          <option key={c} value={c.toLowerCase().replace(/\s+/g, "-")}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </label>

                    <InstallPreview install={install} />

                    {result.warnings.length > 0 && (
                      <ul className="space-y-1.5 text-sm text-muted-foreground">
                        {result.warnings.map((w) => (
                          <li key={w} className="flex gap-2">
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            {w}
                          </li>
                        ))}
                      </ul>
                    )}

                    {authLoading ? null : isAuthenticated ? (
                      <button
                        type="button"
                        onClick={submit}
                        disabled={!canSubmit || submitting}
                        className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background disabled:opacity-50"
                      >
                        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        Submit for review
                      </button>
                    ) : (
                      <SignInButton
                        reason="submit this resource"
                        className="inline-flex h-10 cursor-pointer items-center rounded-full bg-foreground px-5 text-sm font-medium text-background"
                      >
                        Sign in to submit
                      </SignInButton>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}

      </main>
      <Footer />
    </div>
  );
}

/** Structured install details we detected. Shown as fields, not a runnable command, until reviewed. */
/** Same rule as the backend's sanitize_slug: lowercase [a-z0-9-], max 64. */
function pluginSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64).replace(/-+$/, "");
}

function InstallPreview({ install }: { install: ResourceInstall | null }) {
  const rows: [string, string][] = [];
  if (install) {
    const methodLabel: Record<ResourceInstall["method"], string> = {
      plugin_marketplace: "Claude Code plugin marketplace",
      mcp_http: "Remote MCP (HTTP)",
      mcp_stdio: "Local MCP (runs a command)",
      manual: "Manual setup",
    };
    rows.push(["Install method", methodLabel[install.method]]);
    if (install.source_path) rows.push(["Path", install.source_path]);
    if (install.url) rows.push(["Server URL", install.url]);
    if (install.command) rows.push(["Command", [install.command, ...(install.args ?? [])].join(" ")]);
    if (install.env_keys?.length) rows.push(["Needs", install.env_keys.join(", ")]);
    if (install.oauth_required) rows.push(["Sign-in", "OAuth required"]);
  }

  return (
    <div className="rounded-xl border border-border">
      <p className="border-b border-border px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        Detected install details
      </p>
      {rows.length > 0 ? (
        <dl>
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-border/60 px-4 py-2.5 text-sm last:border-b-0">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="break-all text-right font-mono text-[13px] text-foreground">{v}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="px-4 py-3 text-sm text-muted-foreground">
          Nothing installable was detected yet. You can still submit; a reviewer will follow up.
        </p>
      )}
      <p className="border-t border-border px-4 py-3 text-[13px] text-muted-foreground">
        Reviewed by a person before any install command is shown publicly.
      </p>
    </div>
  );
}
