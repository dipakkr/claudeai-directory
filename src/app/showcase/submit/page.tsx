"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, BadgeCheck, CheckCircle2, Clipboard, ExternalLink, ShieldCheck } from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  useMyShowcaseProjects,
  useSubmitShowcaseProject,
  useVerifyShowcaseBadge,
} from "@/hooks/use-showcase";
import type { ShowcaseProject } from "@/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.claudeai.directory";

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function badgeSnippet(project?: ShowcaseProject | null) {
  if (project?.badge_html) return project.badge_html;
  const href = project ? `${SITE_URL}/showcase/${project.id}` : SITE_URL;
  return `<a href="${href}" target="_blank" rel="noopener">Listed on Claude AI Directory</a>`;
}

export default function SubmitAppPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const submitApp = useSubmitShowcaseProject();
  const verifyBadge = useVerifyShowcaseBadge();
  const { data: myApps } = useMyShowcaseProjects({ enabled: !isLoading && isAuthenticated });
  const [createdApp, setCreatedApp] = useState<ShowcaseProject | null>(null);
  const [form, setForm] = useState({
    title: "",
    tagline: "",
    app_url: "",
    badge_page_url: "",
    github_url: "",
    category: "Claude app",
    description: "",
    tech_stack: "Claude, MCP",
    use_cases: "",
    feedback_prompt: "What would make this more useful for Claude builders?",
  });

  const activeApp = createdApp ?? myApps?.[0] ?? null;
  const snippet = useMemo(() => badgeSnippet(activeApp), [activeApp]);

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title || !form.app_url || !form.badge_page_url || !form.description) {
      toast.error("App name, URL, badge page, and description are required");
      return;
    }

    submitApp.mutate(
      {
        title: form.title,
        tagline: form.tagline,
        description: form.description,
        app_url: form.app_url,
        demo_url: form.app_url,
        github_url: form.github_url || undefined,
        category: form.category,
        tech_stack: splitList(form.tech_stack),
        skills_used: [],
        use_cases: splitList(form.use_cases),
        feedback_prompt: form.feedback_prompt,
        badge_page_url: form.badge_page_url,
      },
      {
        onSuccess: (project) => {
          setCreatedApp(project);
          toast.success("Application created. Add the badge, then verify it.");
        },
        onError: (error) => {
          if (error instanceof ApiError && error.status === 409) {
            toast.error("That app URL is already submitted.");
            return;
          }
          toast.error("Could not submit the app. Please try again.");
        },
      }
    );
  };

  const handleVerify = (project: ShowcaseProject) => {
    verifyBadge.mutate(
      { slug: project.id, badge_page_url: project.badge_page_url || form.badge_page_url },
      {
        onSuccess: (updated) => {
          setCreatedApp(updated);
          toast.success("Badge verified. Your app is now listed.");
        },
        onError: (error) => {
          const detail = error instanceof ApiError && typeof error.data === "object" && error.data && "detail" in error.data
            ? String((error.data as { detail: unknown }).detail)
            : "Badge was not found yet.";
          toast.error(detail);
        },
      }
    );
  };

  const copySnippet = async () => {
    await navigator.clipboard.writeText(snippet);
    toast.success("Badge snippet copied");
  };

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1">
          <section className="mx-auto grid max-w-[1080px] gap-8 px-6 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[13px] font-medium text-primary">
                <BadgeCheck className="h-3.5 w-3.5" />
                App applications
              </div>
              <h1 className="max-w-[13ch] text-balance text-[clamp(34px,7vw,52px)] font-medium leading-[1.04]">
                Sign in to list your Claude app
              </h1>
              <p className="mt-4 max-w-[62ch] text-base leading-[1.65] text-muted-foreground">
                App profiles are tied to member accounts so builders can verify
                their badge, manage status, and receive community feedback.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/login">
                    Sign in to submit
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/showcase">View listed apps</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-[14px] border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold">How approval works</h2>
                  <ol className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
                    <li>Submit your app details from a member account.</li>
                    <li>Add the Claude AI Directory badge to your app site.</li>
                    <li>Verify the badge to publish your nofollow app profile.</li>
                  </ol>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="mx-auto grid max-w-[1180px] grid-cols-1 gap-8 px-6 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[13px] font-medium text-primary">
              <BadgeCheck className="h-3.5 w-3.5" />
              App applications
            </div>
            <h1 className="max-w-[13ch] text-balance text-[clamp(34px,7vw,52px)] font-medium leading-[1.04]">
              List your Claude app
            </h1>
            <p className="mt-4 max-w-[64ch] text-[16px] leading-[1.65] text-muted-foreground">
              Submit an app, add the Claude AI Directory badge to your site, then
              verify it to unlock a public profile and community feedback.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 grid gap-5 rounded-[14px] border border-border bg-card p-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">App name</Label>
                  <Input id="title" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Claude Desk" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" value={form.category} onChange={(e) => update("category", e.target.value)} placeholder="Claude app" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Short tagline</Label>
                <Input id="tagline" value={form.tagline} onChange={(e) => update("tagline", e.target.value)} placeholder="Turn customer notes into Claude-ready workflows" />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="app_url">App URL</Label>
                  <Input id="app_url" type="url" value={form.app_url} onChange={(e) => update("app_url", e.target.value)} placeholder="https://yourapp.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="badge_page_url">Badge page URL</Label>
                  <Input id="badge_page_url" type="url" value={form.badge_page_url} onChange={(e) => update("badge_page_url", e.target.value)} placeholder="https://yourapp.com" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">What does it do?</Label>
                <Textarea id="description" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe who it is for, what Claude workflow it improves, and what feedback you want." className="min-h-[120px]" required />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tech_stack">Tags / stack</Label>
                  <Input id="tech_stack" value={form.tech_stack} onChange={(e) => update("tech_stack", e.target.value)} placeholder="Claude, MCP, Next.js" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="use_cases">Use cases</Label>
                  <Input id="use_cases" value={form.use_cases} onChange={(e) => update("use_cases", e.target.value)} placeholder="support, research, writing" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="github_url">GitHub URL</Label>
                <Input id="github_url" type="url" value={form.github_url} onChange={(e) => update("github_url", e.target.value)} placeholder="https://github.com/..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback_prompt">Feedback request</Label>
                <Input id="feedback_prompt" value={form.feedback_prompt} onChange={(e) => update("feedback_prompt", e.target.value)} />
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button type="submit" disabled={submitApp.isPending}>
                  {submitApp.isPending ? "Creating application..." : "Create application"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/showcase">View listed apps</Link>
                </Button>
              </div>
            </form>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[14px] border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold">Badge required</h2>
                  <p className="mt-2 text-sm leading-[1.6] text-muted-foreground">
                    Add this badge to your app site. Once verified, your listing goes public with a nofollow app link.
                  </p>
                </div>
              </div>
              <pre className="mt-4 max-h-[180px] overflow-auto rounded-[10px] border border-border bg-background p-3 text-xs leading-relaxed text-muted-foreground">
                {snippet}
              </pre>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={copySnippet}>
                  <Clipboard className="h-3.5 w-3.5" />
                  Copy badge
                </Button>
                {activeApp && (
                  <Button type="button" size="sm" onClick={() => handleVerify(activeApp)} disabled={verifyBadge.isPending || activeApp.badge_verified}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {activeApp.badge_verified ? "Verified" : verifyBadge.isPending ? "Checking..." : "Verify badge"}
                  </Button>
                )}
              </div>
            </div>

            <div className="rounded-[14px] border border-border bg-card p-5">
              <h2 className="text-lg font-semibold">Your app profile</h2>
              <p className="mt-2 text-sm leading-[1.6] text-muted-foreground">
                Listed apps get a public profile, community feedback entry point, and a nofollow app link.
              </p>
              <div className="mt-4 space-y-2">
                {(myApps ?? []).slice(0, 4).map((app) => (
                  <div key={app.id} className="rounded-[10px] border border-border bg-background p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{app.title}</div>
                        <div className="mt-1 text-xs text-[var(--cad-faint)]">
                          {app.badge_verified ? "Listed" : "Waiting for badge"}
                        </div>
                      </div>
                      {app.badge_verified ? (
                        <Link href={`/showcase/${app.id}`} className="text-primary hover:text-[var(--cad-accent-hover)]">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      ) : (
                        <span className="rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {(myApps ?? []).length === 0 && (
                  <p className="rounded-[10px] border border-dashed border-border p-4 text-sm text-muted-foreground">
                    Your submitted apps will appear here after you create an application.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}
