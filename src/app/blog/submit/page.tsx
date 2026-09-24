"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import { ApiError, api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { BlogSubmission } from "@/types";
import { SignInButton } from "@/components/auth/SignInDialog";

// Matches BLOG_CATEGORIES and the limits in backend/app/models/blog_submission.py.
const CATEGORIES = ["Tutorial", "Guide", "Deep Dive", "Case Study", "News"] as const;
const LIMITS = { title: [10, 140], summary: [50, 300], content: [300, 60000], bio: [0, 300] } as const;

const inputClass =
  "w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground/70 focus:border-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20";

function errorMessage(error: unknown) {
  if (error instanceof ApiError && error.data && typeof error.data === "object" && "detail" in error.data) {
    const detail = (error.data as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail[0] && typeof detail[0] === "object") {
      const first = detail[0] as { loc?: unknown[]; msg?: string };
      const field = Array.isArray(first.loc) ? String(first.loc[first.loc.length - 1]) : "";
      return `${field ? `${field.replace(/_/g, " ")}: ` : ""}${first.msg ?? "invalid value"}`;
    }
  }
  return "Could not submit your post. Please try again.";
}

function Counter({ value, limit }: { value: string; limit: readonly [number, number] }) {
  const n = value.trim().length;
  const bad = n > 0 && (n < limit[0] || n > limit[1]);
  return (
    <span className={`font-mono text-[11px] ${bad ? "text-destructive" : "text-muted-foreground"}`}>
      {n}/{limit[1]}
    </span>
  );
}

const STATUS_STYLE: Record<BlogSubmission["status"], string> = {
  pending: "border-border text-muted-foreground",
  approved: "border-success/40 text-success",
  rejected: "border-destructive/40 text-destructive",
};

const STATUS_LABEL: Record<BlogSubmission["status"], string> = {
  pending: "In review",
  approved: "Published",
  rejected: "Not accepted",
};

function MySubmissions() {
  const { data } = useQuery({
    queryKey: ["blog-submissions", "mine"],
    queryFn: () => api.get<BlogSubmission[]>("/blog/submissions/mine"),
  });
  if (!data || data.length === 0) return null;
  return (
    <section aria-labelledby="mine" className="mt-14 border-t border-border pt-8">
      <h2 id="mine" className="text-lg font-medium text-foreground">
        Your submissions
      </h2>
      <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
        {data.map((sub) => (
          <li key={sub.id} className="flex items-start justify-between gap-4 p-4">
            <div className="min-w-0">
              {sub.status === "approved" && sub.post_slug ? (
                <Link href={`/blog/${sub.post_slug}`} className="text-[15px] text-foreground underline underline-offset-4">
                  {sub.title}
                </Link>
              ) : (
                <p className="text-[15px] text-foreground">{sub.title}</p>
              )}
              <p className="mt-1 text-[13px] text-muted-foreground">
                {sub.category} · submitted {new Date(sub.created_at.endsWith("Z") ? sub.created_at : `${sub.created_at}Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
              {sub.status === "rejected" && sub.reject_reason ? (
                <p className="mt-2 text-[13px] leading-5 text-muted-foreground">Reviewer note: {sub.reject_reason}</p>
              ) : null}
            </div>
            <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[12px] ${STATUS_STYLE[sub.status]}`}>
              {STATUS_LABEL[sub.status]}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function SubmitBlogPostPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    summary: "",
    category: "" as (typeof CATEGORIES)[number] | "",
    content: "",
    sources: "",
    canonical_url: "",
    author_bio: "",
  });
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // Start from the profile bio; the writer can change it for this post.
  useEffect(() => {
    if (user?.bio) setForm((f) => (f.author_bio ? f : { ...f, author_bio: user.bio ?? "" }));
  }, [user?.bio]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const within = (value: string, [min, max]: readonly [number, number]) => {
    const n = value.trim().length;
    return n >= min && n <= max;
  };
  const ready =
    within(form.title, LIMITS.title) &&
    within(form.summary, LIMITS.summary) &&
    within(form.content, LIMITS.content) &&
    form.author_bio.trim().length <= LIMITS.bio[1] &&
    Boolean(form.category);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready || submitting) return;
    setError("");
    setSubmitting(true);
    try {
      await api.post("/blog/submissions", {
        title: form.title.trim(),
        summary: form.summary.trim(),
        category: form.category,
        content: form.content,
        sources: form.sources.split("\n").map((s) => s.trim()).filter(Boolean),
        canonical_url: form.canonical_url.trim() || null,
        author_bio: form.author_bio.trim() || null,
      });
      setDone(true);
      queryClient.invalidateQueries({ queryKey: ["blog-submissions", "mine"] });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cad-shell flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[760px] px-4 pb-20 pt-8 md:px-8 md:pt-12">
          <PageBreadcrumb items={[{ label: "Blog", href: "/blog" }, { label: "Write for the blog" }]} />
          <h1 className="text-balance text-[clamp(32px,4.5vw,46px)] font-normal leading-[1.08] text-foreground">
            Write for the blog
          </h1>
          <p className="mt-4 max-w-[60ch] text-[16px] leading-7 text-muted-foreground">
            Share a workflow, a Skill, an MCP setup or a lesson from building with Claude. Posts are published under your
            name with a link to your profile after a person on our team reviews them.
          </p>

          <div className="mt-8 grid gap-4 rounded-lg border border-border bg-card p-5 text-sm leading-6 sm:grid-cols-2">
            <div>
              <p className="font-medium text-foreground">What we publish</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-muted-foreground">
                <li>First-hand experience with specific steps or code</li>
                <li>Claims backed by links to docs, repos or data</li>
                <li>Accurate, current Claude and Claude Code details</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground">What we decline</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-muted-foreground">
                <li>Thin or mostly AI-generated posts</li>
                <li>Promotional posts without useful content</li>
                <li>Copied content (republishing your own post is fine: add its original URL)</li>
              </ul>
            </div>
          </div>

          {authLoading ? (
            <div className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading
            </div>
          ) : !isAuthenticated ? (
            <div className="mt-10 rounded-lg border border-border p-6">
              <p className="text-[15px] text-foreground">Sign in to submit a post</p>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                Posts are tied to your profile so readers know who wrote them. You stay on this page after signing in.
              </p>
              <div className="mt-5 flex gap-2.5">
                <SignInButton reason="submit a post" className="inline-flex h-9 cursor-pointer items-center rounded-full bg-foreground px-4 text-sm font-medium text-background">
                  Sign in
                </SignInButton>
                <Link href="/signup" className="inline-flex h-9 items-center rounded-full border border-border px-4 text-sm text-foreground">
                  Create an account
                </Link>
              </div>
            </div>
          ) : done ? (
            <div className="mt-10 rounded-lg border border-border bg-card p-6">
              <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
              <p className="mt-3 text-[15px] text-foreground">Submitted for review</p>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                Your post is not public yet. We review every submission and publish it under your name if it fits. You can
                follow its status below.
              </p>
              <div className="mt-5 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setDone(false);
                    setForm((f) => ({ ...f, title: "", summary: "", content: "", sources: "", canonical_url: "", category: "" }));
                  }}
                  className="inline-flex h-9 items-center rounded-full border border-border px-4 text-sm text-foreground"
                >
                  Write another
                </button>
                <Link href="/blog" className="inline-flex h-9 items-center rounded-full px-4 text-sm text-muted-foreground hover:text-foreground">
                  Back to the blog
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-10 space-y-7">
              <label className="block">
                <span className="mb-2 flex items-baseline justify-between">
                  <span className="text-sm text-foreground">Title</span>
                  <Counter value={form.title} limit={LIMITS.title} />
                </span>
                <input value={form.title} onChange={set("title")} maxLength={LIMITS.title[1]} required className={inputClass} placeholder="How I run Claude Code in CI without surprises" />
              </label>

              <label className="block">
                <span className="mb-2 flex items-baseline justify-between">
                  <span className="text-sm text-foreground">Summary</span>
                  <Counter value={form.summary} limit={LIMITS.summary} />
                </span>
                <textarea value={form.summary} onChange={set("summary")} maxLength={LIMITS.summary[1]} rows={3} required className={inputClass} placeholder="Two or three sentences that answer the reader's question directly. Shown at the top of the post and in search results." />
              </label>

              <fieldset>
                <legend className="mb-2 text-sm text-foreground">Category</legend>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <label
                      key={cat}
                      className={`inline-flex h-9 cursor-pointer items-center rounded-full border px-4 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/40 ${
                        form.category === cat ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <input type="radio" name="category" value={cat} checked={form.category === cat} onChange={() => setForm((f) => ({ ...f, category: cat }))} className="sr-only" />
                      {cat}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <div className="mb-2 flex items-end justify-between gap-3">
                  <div role="tablist" aria-label="Post body" className="inline-flex rounded-full border border-border p-0.5">
                    {(["write", "preview"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        role="tab"
                        aria-selected={tab === t}
                        onClick={() => setTab(t)}
                        className={`h-7 rounded-full px-3.5 text-[13px] capitalize ${tab === t ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <Counter value={form.content} limit={LIMITS.content} />
                </div>
                {tab === "write" ? (
                  <textarea
                    aria-label="Post body in Markdown"
                    value={form.content}
                    onChange={set("content")}
                    maxLength={LIMITS.content[1]}
                    rows={18}
                    required
                    className={`${inputClass} font-mono text-[13px] leading-6`}
                    placeholder={"Write in Markdown. Use ## for section headings; they become the table of contents.\n\n## The problem\n\n## What I tried\n\n## What worked"}
                  />
                ) : (
                  <div className="min-h-[300px] rounded-lg border border-border bg-card px-5 pb-6">
                    {form.content.trim() ? (
                      <div className="blog-prose">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="pt-6 text-sm text-muted-foreground">Nothing to preview yet.</p>
                    )}
                  </div>
                )}
                <p className="mt-2 text-[13px] text-muted-foreground">At least 300 characters. Code blocks, tables and links are supported.</p>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm text-foreground">
                  Sources <span className="text-muted-foreground">(optional, one URL per line)</span>
                </span>
                <textarea value={form.sources} onChange={set("sources")} rows={3} className={`${inputClass} font-mono text-[13px]`} placeholder={"https://docs.claude.com/...\nhttps://github.com/..."} />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-foreground">
                  Original URL <span className="text-muted-foreground">(optional, if this was published elsewhere first)</span>
                </span>
                <input type="url" value={form.canonical_url} onChange={set("canonical_url")} className={inputClass} placeholder="https://yourblog.com/post" />
              </label>

              <label className="block">
                <span className="mb-2 flex items-baseline justify-between">
                  <span className="text-sm text-foreground">
                    About you <span className="text-muted-foreground">(shown under the post)</span>
                  </span>
                  <Counter value={form.author_bio} limit={LIMITS.bio} />
                </span>
                <textarea value={form.author_bio} onChange={set("author_bio")} maxLength={LIMITS.bio[1]} rows={2} className={inputClass} placeholder="What you build and why readers can trust your take." />
              </label>

              {error ? (
                <p role="alert" className="flex gap-2 text-sm text-destructive">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {error}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-4 border-t border-border pt-6">
                <button
                  type="submit"
                  disabled={!ready || submitting}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                  Submit for review
                  {!submitting ? <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                </button>
                <p className="text-[13px] text-muted-foreground">Publishing as {user?.name || user?.username}. Nothing goes live until it is reviewed.</p>
              </div>
            </form>
          )}

          {isAuthenticated ? <MySubmissions /> : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
