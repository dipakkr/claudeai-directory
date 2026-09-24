"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, BadgeCheck, CheckCircle2, Clipboard, ExternalLink, LinkIcon, MessageSquare, Rocket, ShieldCheck, Share2, Twitter, Linkedin, Copy, X } from "lucide-react";

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
import { SignInButton } from "@/components/auth/SignInDialog";

const SITE_URL = "https://www.claudeai.directory";

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function badgeSnippet(project?: ShowcaseProject | null) {
  if (project?.badge_html) return project.badge_html.replaceAll("Listed on Claude AI Directory", "Launched on Claude AI.directory");
  const href = project ? `${SITE_URL}/showcase/${project.id}` : SITE_URL;
  return `<a href="${href}" target="_blank" rel="noopener">Launched on Claude AI.directory</a>`;
}

const launchSteps = [
  { title: "Submit", body: "Add the live URL and a short description.", Icon: Rocket },
  { title: "Link back", body: "Place the directory badge on your site.", Icon: LinkIcon },
  { title: "Collect feedback", body: "Publish the profile and ask builders what to improve.", Icon: MessageSquare },
];

export default function SubmitAppPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const submitApp = useSubmitShowcaseProject();
  const verifyBadge = useVerifyShowcaseBadge();
  const { data: myApps } = useMyShowcaseProjects({ enabled: !isLoading && isAuthenticated });
  const [createdApp, setCreatedApp] = useState<ShowcaseProject | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
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
    setForm((current) => {
      if (field === "app_url" && (!current.badge_page_url || current.badge_page_url === current.app_url)) {
        return { ...current, app_url: value, badge_page_url: value };
      }
      return { ...current, [field]: value };
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const badgePageUrl = form.badge_page_url || form.app_url;
    if (!form.title || !form.app_url || !form.description) {
      toast.error("Name, live URL, and description are required");
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
        badge_page_url: badgePageUrl,
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
          setShowShareModal(true);
        },
        onError: (error) => {
          const detail = error instanceof ApiError && typeof error.data === "object" && error.data && "detail" in error.data
            ? String((error.data as { detail: unknown }).detail)
            : "Badge not found. Make sure it's placed on the page you specified.";
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
          <section className="mx-auto max-w-[980px] px-6 py-16 sm:px-8">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
                <Rocket className="h-4 w-4" />
                Claude launch profile
              </div>
              <h1 className="max-w-[14ch] text-balance text-[clamp(36px,7vw,58px)] font-normal leading-[1.03]">
                Launch your Claude site
              </h1>
              <p className="mt-5 max-w-[58ch] text-base leading-[1.7] text-muted-foreground">
                Create a simple public profile for the Claude app, MCP, agent,
                tool, or workflow you built. Add the badge, verify it, and start
                collecting community feedback.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild>
                  <SignInButton reason="launch your app">
                    Sign in to launch
                    <ArrowRight className="h-4 w-4" />
                  </SignInButton>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/showcase">View launches</Link>
                </Button>
              </div>
            </div>

            <div className="mt-12 grid gap-3 md:grid-cols-3">
              {launchSteps.map(({ title, body, Icon }) => (
                <div key={title} className="rounded-xl border border-border bg-card/45 p-5">
                  <Icon className="h-4 w-4 text-primary" />
                  <h2 className="mt-4 text-base font-medium text-foreground">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
                </div>
              ))}
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
        <section className="mx-auto max-w-[1120px] px-6 py-12 sm:px-8">
          <div className="max-w-[760px]">
            <div className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
              <Rocket className="h-4 w-4" />
              Claude launch profile
            </div>
            <h1 className="max-w-[15ch] text-balance text-[clamp(36px,7vw,58px)] font-normal leading-[1.03]">
              Launch your Claude site
            </h1>
            <p className="mt-5 max-w-[58ch] text-base leading-[1.7] text-muted-foreground">
              Share what you built for Claude, add the directory badge, and get
              a public nofollow profile where builders can discover it and send
              feedback.
            </p>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
            <form onSubmit={handleSubmit} className="grid gap-6 rounded-xl border border-border bg-card/45 p-5 sm:p-6">
              {/* Essentials Section */}
              <div className="space-y-4 pb-4 border-b border-border/50">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Essential info</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Name <span className="text-destructive">*</span></Label>
                    <Input id="title" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Claude Desk" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="app_url">Live URL <span className="text-destructive">*</span></Label>
                    <Input id="app_url" type="url" value={form.app_url} onChange={(e) => update("app_url", e.target.value)} placeholder="https://yourapp.com" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">What did you build? <span className="text-destructive">*</span></Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="Who is it for, what Claude workflow does it improve, and what should people try first?"
                    className="min-h-[130px]"
                    required
                  />
                </div>
              </div>

              {/* Optional Discovery Section */}
              <div className="space-y-4 pb-4 border-b border-border/50">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Make it discoverable</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">One-line pitch <span className="text-xs text-muted-foreground">(optional)</span></Label>
                  <Input id="tagline" value={form.tagline} onChange={(e) => update("tagline", e.target.value)} placeholder="Turn customer notes into Claude-ready workflows" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category <span className="text-xs text-muted-foreground">(optional)</span></Label>
                    <Input id="category" value={form.category} onChange={(e) => update("category", e.target.value)} placeholder="Claude app" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tech_stack">Tags <span className="text-xs text-muted-foreground">(optional)</span></Label>
                    <Input id="tech_stack" value={form.tech_stack} onChange={(e) => update("tech_stack", e.target.value)} placeholder="Claude, MCP, Next.js" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="use_cases">Use cases <span className="text-xs text-muted-foreground">(optional)</span></Label>
                  <Input id="use_cases" value={form.use_cases} onChange={(e) => update("use_cases", e.target.value)} placeholder="support, research, writing" />
                </div>
              </div>

              {/* Badge Section */}
              <div className="rounded-lg border border-border bg-background/45 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <BadgeCheck className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                  <div>
                    <Label htmlFor="badge_page_url">Badge location <span className="text-xs text-muted-foreground">(optional)</span></Label>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      We will check this page for the launch badge. By default, it uses your live URL.
                    </p>
                  </div>
                </div>
                <Input
                  id="badge_page_url"
                  type="url"
                  value={form.badge_page_url}
                  onChange={(e) => update("badge_page_url", e.target.value)}
                  placeholder={form.app_url || "https://yourapp.com"}
                />
              </div>

              {/* Advanced Options */}
              <details className="group">
                <summary className="cursor-pointer flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold group-open:rotate-90 transition-transform">▶</span>
                  Advanced options (optional)
                </summary>
                <div className="mt-4 space-y-4 pt-4 border-t border-border/50">
                  <div className="space-y-2">
                    <Label htmlFor="github_url">GitHub URL</Label>
                    <Input id="github_url" type="url" value={form.github_url} onChange={(e) => update("github_url", e.target.value)} placeholder="https://github.com/..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="feedback_prompt">Feedback request</Label>
                    <Input id="feedback_prompt" value={form.feedback_prompt} onChange={(e) => update("feedback_prompt", e.target.value)} placeholder="What would make this more useful?" />
                  </div>
                </div>
              </details>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button type="submit" disabled={submitApp.isPending}>
                  {submitApp.isPending ? "Creating launch..." : "Create launch profile"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/showcase">View launches</Link>
                </Button>
              </div>
            </form>

            <aside className="space-y-4">
              <div className="rounded-xl border border-border bg-card/45 p-5">
                <h2 className="text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">How it works</h2>
                <div className="mt-4 space-y-4">
                  {launchSteps.map(({ title, body, Icon }) => (
                    <div key={title} className="flex gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                        <Icon className="h-4 w-4 text-primary" />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{title}</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">{body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card/45 p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <h2 className="text-base font-medium">Badge required</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Add this snippet to the page above, then verify it when your
                    launch profile has been created.
                  </p>
                </div>
              </div>
              <pre className="mt-4 max-h-[150px] overflow-auto rounded-lg border border-border bg-background p-3 text-xs leading-relaxed text-muted-foreground">
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

              <div className="rounded-xl border border-border bg-card/45 p-5">
                <h2 className="text-base font-medium">Your launches</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Verified launches appear publicly in the showcase.
                </p>
                <div className="mt-4 space-y-2">
                {(myApps ?? []).slice(0, 4).map((app) => (
                  <div key={app.id} className="rounded-lg border border-border bg-background p-3">
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
                  <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                    Your launch profiles will appear here.
                  </p>
                )}
              </div>
            </div>
            </aside>
          </div>
        </section>
        {showShareModal && createdApp && (
          <ShareModal
            app={createdApp}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

function ShareModal({ app, onClose }: { app: ShowcaseProject; onClose: () => void }) {
  const listingUrl = `${SITE_URL}/showcase/${app.id}`;
  const shareText = `Just launched my Claude app on Claude AI.directory! 🚀\n\n${app.tagline || app.title}\n\nCheck it out & let me know what you think:\n${listingUrl}\n\n#Claude #AI #Builders`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  const linkedinText = `Excited to launch ${app.title} on Claude AI.directory! ${app.tagline || app.description.slice(0, 80)}...\n\n${listingUrl}\n\n#Claude #AI #Builders`;
  const linkedinUrl = `https://www.linkedin.com/feed/?linkOrigin=UNKNOWN_FEED_SOURCE`;

  const copyUrl = async () => {
    await navigator.clipboard.writeText(listingUrl);
    toast.success("Listing URL copied!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-foreground">🎉 Your app is live!</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          <strong>{app.title}</strong> is now discoverable on Claude AI.directory. Share it to drive traffic and upvotes!
        </p>

        <div className="space-y-3 mb-6">
          {/* Copy Link */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">📋 Copy listing link</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={listingUrl}
                readOnly
                className="flex-1 h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground"
              />
              <button
                type="button"
                onClick={copyUrl}
                className="px-3 py-2 rounded-lg border border-border bg-background hover:bg-card transition-colors text-muted-foreground hover:text-foreground"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Twitter Share */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">🐦 Share on X</p>
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-10 rounded-lg border border-border bg-background hover:bg-card transition-colors text-sm font-medium text-foreground"
            >
              <Twitter className="h-4 w-4" />
              Share on X
            </a>
          </div>

          {/* LinkedIn Share */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">💼 Share on LinkedIn</p>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(linkedinText);
                toast.success("Paste the text on LinkedIn!");
              }}
              className="flex items-center justify-center gap-2 w-full h-10 rounded-lg border border-border bg-background hover:bg-card transition-colors text-sm font-medium text-foreground"
            >
              <Linkedin className="h-4 w-4" />
              Copy for LinkedIn
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Maybe later
          </button>
          <Link
            href={`/showcase/${app.id}`}
            className="flex-1 h-10 rounded-lg bg-foreground text-background text-sm font-medium flex items-center justify-center hover:bg-foreground/85 transition-colors"
          >
            View listing
            <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
