"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { MediaUpload } from "@/components/launches/MediaUpload";
import { LogoPicker } from "@/components/launches/LogoPicker";
import { AiDraftBar } from "@/components/launches/AiDraftBar";
import { TopicSelect } from "@/components/launches/TopicSelect";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { CATEGORIES, PLATFORMS, TOPICS, isLaunchLive } from "@/lib/launch-options";
import { useMyShowcaseProjects, useUpdateLaunch, useUploadConfig, type LaunchAiDraft } from "@/hooks/use-showcase";
import type { ShowcaseProject } from "@/types";
import { SignInButton } from "@/components/auth/SignInDialog";

// Same filled, full-width fields as the submit form.
const inputClass =
  "h-10 w-full rounded-[8px] border border-transparent bg-foreground/[0.06] px-3 text-[14px] text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-[var(--cad-line-hover)] focus:outline-none";
const textareaClass =
  "w-full rounded-[8px] border border-transparent bg-foreground/[0.06] px-3 py-2 text-[14px] leading-6 text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-[var(--cad-line-hover)] focus:outline-none";

function lines(value: string) {
  return value
    .split(/\n/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

type EditTab = "about" | "media" | "story" | "details";
const EDIT_TABS: { id: EditTab; label: string }[] = [
  { id: "about", label: "About" },
  { id: "media", label: "Media" },
  { id: "story", label: "Story" },
  { id: "details", label: "Details" },
];

function Label({ text, htmlFor, hint }: { text: string; htmlFor: string; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 flex items-baseline justify-between text-[14px] text-muted-foreground">
      {text}
      {hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}
    </label>
  );
}

function Chips({ options, value, onToggle }: { options: string[]; value: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = value.includes(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(option)}
            className={`inline-flex h-8 items-center gap-1 rounded-full border px-3 text-xs font-medium transition-colors ${
              active ? "border-foreground bg-foreground text-background" : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {active && <Check className="h-3 w-3" />}
            {option}
          </button>
        );
      })}
    </div>
  );
}

/** One saved screenshot in the grid, with a Cover label on the first. */
function ShotTile({ url, cover, onRemove }: { url: string; cover: boolean; onRemove: () => void }) {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border bg-background">
      {/* eslint-disable-next-line @next/next/no-img-element -- saved screenshot */}
      <img src={url} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
      {cover && <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">Cover</span>}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove"
        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/** Existing media as removable tiles. */
function CurrentMedia({ urls, onRemove, video, square }: { urls: string[]; onRemove: (url: string) => void; video?: boolean; square?: boolean }) {
  if (!urls.length) return null;
  return (
    <div className={square || video ? "flex flex-wrap gap-3" : "grid grid-cols-2 gap-3 sm:grid-cols-3"}>
      {urls.map((url) => (
        <div
          key={url}
          className={`relative overflow-hidden rounded-xl border border-border bg-background ${
            square ? "h-20 w-20" : video ? "aspect-video w-full sm:w-72" : "aspect-[16/10] w-full"
          }`}
        >
          {video ? (
            <video src={url} className="h-full w-full object-cover" muted playsInline />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          )}
          <button
            type="button"
            onClick={() => onRemove(url)}
            aria-label="Remove"
            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

function EditForm({ app }: { app: ShowcaseProject }) {
  const router = useRouter();
  const update = useUpdateLaunch(app.id);
  const { data: uploadConfig } = useUploadConfig();
  const uploads = uploadConfig?.enabled;

  const [title, setTitle] = useState(app.title);
  const [tagline, setTagline] = useState(app.tagline ?? "");
  const [description, setDescription] = useState(app.description ?? "");
  const [category, setCategory] = useState(app.category || CATEGORIES[0]);
  const [topics, setTopics] = useState<string[]>(app.topics ?? []);
  const [platforms, setPlatforms] = useState<string[]>(app.platforms ?? []);
  const [tags, setTags] = useState((app.tech_stack ?? []).join(", "));
  const [useCases, setUseCases] = useState((app.use_cases ?? []).join("\n"));
  const [overview, setOverview] = useState({
    audience: app.overview?.audience ?? "",
    problem: app.overview?.problem ?? "",
    solution: app.overview?.solution ?? "",
    unique: app.overview?.unique ?? "",
  });
  const [githubUrl, setGithubUrl] = useState(app.github_url ?? "");
  const [youtube, setYoutube] = useState(app.demo_video_url ?? "");
  const [feedback, setFeedback] = useState(app.feedback_prompt ?? "");
  const [builtWith, setBuiltWith] = useState(app.built_with_claude ?? "");

  // Media: what is already saved, plus new uploads and pasted links.
  const [logo] = useState<string[]>(app.logo_url ? [app.logo_url] : []);
  const [shots, setShots] = useState<string[]>(app.gallery_images?.length ? app.gallery_images : app.images ?? []);
  const [video, setVideo] = useState<string[]>(app.video_url ? [app.video_url] : []);
  const [newLogo, setNewLogo] = useState<string[]>([]);
  const [newShots, setNewShots] = useState<string[]>([]);
  const [newVideo, setNewVideo] = useState<string[]>([]);
  const [pastedShots, setPastedShots] = useState("");
  const [logoUrlInput, setLogoUrlInput] = useState("");
  const [busy, setBusy] = useState({ logo: false, screenshot: false, video: false });
  const [tab, setTab] = useState<EditTab>("about");
  const uploading = Object.values(busy).some(Boolean);

  const gallery = useMemo(
    () => [...shots, ...newShots, ...lines(pastedShots).filter(isHttpsUrl)].slice(0, 8),
    [shots, newShots, pastedShots],
  );
  const logoUrl = newLogo[0] || (isHttpsUrl(logoUrlInput.trim()) ? logoUrlInput.trim() : "") || logo[0] || "";
  const videoUrl = newVideo[0] || video[0] || "";

  // "Write with AI": fill the text fields from the draft, keeping what the draft leaves empty.
  // The name stays (it is the maker's), and Undo puts every field back.
  const applyDraft = (d: LaunchAiDraft) => {
    const before = { tagline, description, category, topics, platforms, tags, useCases, overview, feedback };
    const keep = (next: string, prev: string) => next.trim() || prev;
    setTagline((v) => keep(d.tagline, v));
    setDescription((v) => keep(d.description, v));
    if (d.category && CATEGORIES.includes(d.category)) setCategory(d.category);
    if (d.topics?.length) setTopics(d.topics.filter((t) => TOPICS.includes(t)));
    if (d.platforms.length) setPlatforms(d.platforms);
    if (d.tags.length) setTags(d.tags.join(", "));
    if (d.use_cases.length) setUseCases(d.use_cases.join("\n"));
    setOverview((o) => ({
      audience: keep(d.overview.audience, o.audience),
      problem: keep(d.overview.problem, o.problem),
      solution: keep(d.overview.solution, o.solution),
      unique: keep(d.overview.unique, o.unique),
    }));
    setFeedback((v) => keep(d.feedback_prompt, v));
    setTab("about");
    toast.success("Draft added to About, Story and Details. Review it, then save.", {
      duration: 10000,
      action: {
        label: "Undo",
        onClick: () => {
          setTagline(before.tagline);
          setDescription(before.description);
          setCategory(before.category);
          setTopics(before.topics);
          setPlatforms(before.platforms);
          setTags(before.tags);
          setUseCases(before.useCases);
          setOverview(before.overview);
          setFeedback(before.feedback);
        },
      },
    });
  };

  const live = isLaunchLive(app);
  // A pitch and a real description mean the maker (or the AI draft) already wrote it.
  const alreadyFilled = Boolean(app.tagline?.trim()) && (app.description?.trim().length ?? 0) >= 120;

  // Drafts: "Complete listing" saves, then shows the two ways to go live (badge or one-time listing).
  const save = (completeAfter = false) => {
    if (uploading) return toast.error("Wait for your uploads to finish");
    if (title.trim().length < 2 || description.trim().length < 10) {
      return toast.error("Add a name and a description of at least 10 characters");
    }
    const ov = Object.fromEntries(Object.entries(overview).map(([k, v]) => [k, v.trim() || undefined]));
    update.mutate(
      {
        title: title.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        category,
        topics,
        platforms,
        tech_stack: tags.split(",").map((t) => t.trim()).filter(Boolean),
        use_cases: lines(useCases),
        overview: ov,
        github_url: githubUrl.trim(),
        demo_video_url: youtube.trim(),
        feedback_prompt: feedback.trim(),
        built_with_claude: builtWith.trim(),
        gallery_images: gallery,
        logo_url: logoUrl,
        video_url: videoUrl,
      },
      {
        onSuccess: () => {
          if (completeAfter) {
            router.push(`/launches/submit?finish=${encodeURIComponent(app.id)}`);
            return;
          }
          // Drafts stay on the editor after saving; live launches go back to their page.
          if (!live) {
            toast.success("Draft saved");
            return;
          }
          toast.success("Launch updated");
          router.push(`/launches/${app.id}`);
        },
        onError: (error) => {
          const detail = error instanceof ApiError ? (error.data as { detail?: unknown })?.detail : undefined;
          toast.error(typeof detail === "string" ? detail : "Could not save. Check that image links start with https.");
        },
      },
    );
  };

  return (
    <div>
      {/* Offer AI only while the listing is thin; an AI-filled draft already has all of this. */}
      {app.app_url && !alreadyFilled && (
        <div className="mb-8">
          <AiDraftBar url={app.app_url} onDraft={applyDraft} surface="edit" />
        </div>
      )}
      {/* Tabs for everything else; one save covers all of them. */}
      <div role="tablist" aria-label="Launch details" className="flex gap-6 overflow-x-auto border-b border-border">
        {EDIT_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px whitespace-nowrap border-b-2 pb-3 text-sm transition-colors ${
              tab === t.id ? "border-foreground font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-6" role="tabpanel">
        {tab === "about" && (
          <>
            <LogoPicker
              title={title || app.title}
              subtitle={
                <span className="flex flex-wrap items-center gap-x-2">
                  <span>{isLaunchLive(app) ? "Live" : app.status === "rejected" ? "Not approved" : "Draft"}</span>
                  {isLaunchLive(app) && (
                    <>
                      <span aria-hidden>·</span>
                      <Link href={`/launches/${app.id}`} className="hover:text-foreground hover:underline">View launch</Link>
                      <span aria-hidden>·</span>
                      <Link href={`/launches/${app.id}/analytics`} className="hover:text-foreground hover:underline">Analytics</Link>
                    </>
                  )}
                </span>
              }
              current={logoUrl}
              fallback={title.trim()[0]?.toUpperCase() || "?"}
              limits={uploads ? uploadConfig.limits.logo : undefined}
              onUploaded={(url) => setNewLogo([url])}
              onBusyChange={(b) => setBusy((s) => ({ ...s, logo: b }))}
              link={logoUrlInput}
              onLink={setLogoUrlInput}
            />
            <div>
              <Label text="Name" htmlFor="title" />
              <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} className={inputClass} />
            </div>
            <div>
              <Label text="One-line pitch" htmlFor="tagline" hint={`${tagline.length}/140`} />
              <input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} maxLength={140} className={inputClass} />
            </div>
            <div>
              <Label text="Website" htmlFor="website" hint="Can't be changed" />
              <input id="website" value={app.app_url ?? ""} readOnly className={`${inputClass} cursor-not-allowed text-muted-foreground`} />
            </div>
            <div>
              <p className="mb-2 text-[14px] text-muted-foreground">Type</p>
              <Chips options={CATEGORIES} value={[category]} onToggle={setCategory} />
            </div>
            <div>
              <Label text="Topics" htmlFor="topics" hint="Up to 3" />
              <TopicSelect id="topics" value={topics} onChange={setTopics} />
            </div>
            <div>
              <Label text="What does it do?" htmlFor="description" hint={`${description.length}/2000`} />
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} rows={8} className={textareaClass} />
            </div>
          </>
        )}

        {tab === "media" && (
          <>
            <div>
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <p className="text-[14px] text-muted-foreground">
                  Screenshots <span className="text-muted-foreground/70">· the first one is your cover</span>
                </p>
                <span className="text-xs text-muted-foreground/70">{gallery.length}/8</span>
              </div>
              {uploads ? (
                // Saved screenshots, new uploads and the "+" tile share one grid.
                <MediaUpload
                  kind="screenshot"
                  max={Math.max(0, 8 - shots.length)}
                  limits={uploadConfig.limits.screenshot}
                  label="Screenshots"
                  hint=""
                  bare
                  leadingCount={shots.length}
                  leading={shots.map((url, i) => (
                    <ShotTile key={url} url={url} cover={i === 0} onRemove={() => setShots((list) => list.filter((u) => u !== url))} />
                  ))}
                  onChange={setNewShots}
                  onBusyChange={(b) => setBusy((s) => ({ ...s, screenshot: b }))}
                />
              ) : (
                <CurrentMedia urls={shots} onRemove={(url) => setShots((list) => list.filter((u) => u !== url))} />
              )}
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Paste image links instead</summary>
                <textarea
                  value={pastedShots}
                  onChange={(e) => setPastedShots(e.target.value)}
                  rows={2}
                  placeholder="https://yourapp.com/screenshot.png (one per line)"
                  className={`${textareaClass} mt-2`}
                />
              </details>
            </div>
            <div>
              <p className="mb-2 text-[14px] text-muted-foreground">
                Demo video <span className="text-muted-foreground/70">· MP4 or WEBM up to 50 MB, or a YouTube link</span>
              </p>
              <CurrentMedia urls={video} onRemove={() => setVideo([])} video />
              {uploads && !video.length && (
                <MediaUpload
                  kind="video"
                  max={1}
                  limits={uploadConfig.limits.video}
                  label="Upload a video"
                  hint="MP4 or WEBM, up to 50 MB"
                  bare
                  onChange={setNewVideo}
                  onBusyChange={(b) => setBusy((s) => ({ ...s, video: b }))}
                />
              )}
              <input value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="Or a YouTube link" className={`${inputClass} mt-3`} />
            </div>
          </>
        )}

        {tab === "story" && (
          <>
            <p className="text-sm text-muted-foreground">Optional. Pages that answer these get more upvotes.</p>
            {(
              [
                ["audience", "Who is it for?"],
                ["problem", "What problem does it solve?"],
                ["solution", "How does it solve it?"],
                ["unique", "What makes it different?"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <Label text={label} htmlFor={key} />
                <textarea id={key} rows={3} value={overview[key]} onChange={(e) => setOverview((o) => ({ ...o, [key]: e.target.value }))} className={textareaClass} />
              </div>
            ))}
            <div>
              <Label text="Use cases" htmlFor="use_cases" hint="One per line" />
              <textarea id="use_cases" rows={3} value={useCases} onChange={(e) => setUseCases(e.target.value)} className={textareaClass} />
            </div>
            <div>
              <Label text="How did you use Claude to build it?" htmlFor="built_with_claude" hint={`${builtWith.length}/2000`} />
              <textarea
                id="built_with_claude"
                rows={4}
                maxLength={2000}
                value={builtWith}
                onChange={(e) => setBuiltWith(e.target.value)}
                placeholder="e.g. Built the backend with Claude Code, used the Claude API for summaries, and an MCP server to read our docs."
                className={textareaClass}
              />
            </div>
          </>
        )}

        {tab === "details" && (
          <>
            <div>
              <p className="mb-2 text-[14px] text-muted-foreground">Platforms</p>
              <Chips
                options={PLATFORMS}
                value={platforms}
                onToggle={(p) => setPlatforms((list) => (list.includes(p) ? list.filter((x) => x !== p) : [...list, p]))}
              />
            </div>
            <div>
              <Label text="Tech stack and tags" htmlFor="tags" hint="Comma separated" />
              <input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} />
            </div>
            <div>
              <Label text="Source code" htmlFor="github" />
              <input id="github" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/you/app" className={inputClass} />
            </div>
            <div>
              <Label text="What feedback do you want?" htmlFor="feedback" />
              <input id="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} className={inputClass} />
            </div>
          </>
        )}
      </div>

      {/* Save bar stays in reach on a long form. */}
      <div className="sticky bottom-0 z-10 -mx-4 mt-12 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}>
        {live ? (
          <div className="flex items-center gap-3">
            <span className="flex-1" />
            <Link href={`/launches/${app.id}`} className="shrink-0 text-sm text-muted-foreground hover:text-foreground">
              Cancel
            </Link>
            <button
              type="button"
              onClick={() => save()}
              disabled={update.isPending || uploading}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {update.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {uploading ? "Uploading..." : "Save changes"}
            </button>
          </div>
        ) : (
          // A draft: one big step forward, saving quietly on the side.
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => save(true)}
              disabled={update.isPending || uploading}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[10px] bg-primary text-[15px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {update.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {uploading ? "Uploading..." : "Complete listing"}
              {!update.isPending && !uploading && <ArrowRight className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => save()}
              disabled={update.isPending || uploading}
              className="shrink-0 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              Save draft
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EditLaunchClient({ slug }: { slug: string }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { data: myApps, isLoading: appsLoading } = useMyShowcaseProjects({ enabled: !isLoading && isAuthenticated });
  const app = myApps?.find((a) => a.id === slug);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[680px] px-4 pt-8 md:px-8 md:pt-12">
          <Link href="/dashboard?tab=launches" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            Your launches
          </Link>
          {app && !isLaunchLive(app) ? (
            // A draft: this is the review step before completing the listing.
            <>
              <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.16em] text-primary">Review your launch</p>
              <h1 className="mt-2 font-sans text-[26px] font-semibold tracking-tight text-foreground">{app.title}</h1>
              <p className="mt-3 rounded-lg border border-green-500/30 bg-green-500/[0.06] px-3.5 py-2.5 font-mono text-xs text-green-600 dark:text-green-400">
                ✓ Saved as a draft. Check everything, then complete the listing.
              </p>
            </>
          ) : (
            <>
              <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.16em] text-primary">Edit launch</p>
              <h1 className="sr-only">Edit {app?.title ?? "your launch"}</h1>
            </>
          )}
          <div className="mt-8" />

          {isLoading || (isAuthenticated && appsLoading) ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : !isAuthenticated ? (
            <p className="text-sm text-muted-foreground">
              <SignInButton reason="edit your launch" className="cursor-pointer underline underline-offset-4">Sign in</SignInButton> to edit your launch.
            </p>
          ) : !app ? (
            <p className="text-sm text-muted-foreground">This launch was not found in your account. You can only edit launches you submitted.</p>
          ) : (
            <EditForm key={app.id} app={app} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
