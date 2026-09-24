"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { MediaUpload } from "@/components/launches/MediaUpload";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { CATEGORIES, PLATFORMS } from "@/lib/launch-options";
import { useMyShowcaseProjects, useUpdateLaunch, useUploadConfig } from "@/hooks/use-showcase";
import type { ShowcaseProject } from "@/types";
import { SignInButton } from "@/components/auth/SignInDialog";

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-card px-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary/60 focus:outline-none";
const textareaClass =
  "w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm leading-6 text-foreground placeholder:text-muted-foreground/70 focus:border-primary/60 focus:outline-none";

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

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-border py-6 first:pt-0 last:border-b-0">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Label({ text, htmlFor, hint }: { text: string; htmlFor: string; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between text-sm font-medium text-foreground">
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

  // Media: what is already saved, plus new uploads and pasted links.
  const [logo, setLogo] = useState<string[]>(app.logo_url ? [app.logo_url] : []);
  const [shots, setShots] = useState<string[]>(app.gallery_images?.length ? app.gallery_images : app.images ?? []);
  const [video, setVideo] = useState<string[]>(app.video_url ? [app.video_url] : []);
  const [newLogo, setNewLogo] = useState<string[]>([]);
  const [newShots, setNewShots] = useState<string[]>([]);
  const [newVideo, setNewVideo] = useState<string[]>([]);
  const [pastedShots, setPastedShots] = useState("");
  const [logoUrlInput, setLogoUrlInput] = useState("");
  const [busy, setBusy] = useState({ logo: false, screenshot: false, video: false });
  const uploading = Object.values(busy).some(Boolean);

  const gallery = useMemo(
    () => [...shots, ...newShots, ...lines(pastedShots).filter(isHttpsUrl)].slice(0, 8),
    [shots, newShots, pastedShots],
  );
  const logoUrl = newLogo[0] || (isHttpsUrl(logoUrlInput.trim()) ? logoUrlInput.trim() : "") || logo[0] || "";
  const videoUrl = newVideo[0] || video[0] || "";

  const save = () => {
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
        platforms,
        tech_stack: tags.split(",").map((t) => t.trim()).filter(Boolean),
        use_cases: lines(useCases),
        overview: ov,
        github_url: githubUrl.trim(),
        demo_video_url: youtube.trim(),
        feedback_prompt: feedback.trim(),
        gallery_images: gallery,
        logo_url: logoUrl,
        video_url: videoUrl,
      },
      {
        onSuccess: () => {
          toast.success("Launch updated");
          router.push(app.badge_verified ? `/launches/${app.id}` : "/dashboard?tab=launches");
        },
        onError: (error) => {
          const detail = error instanceof ApiError ? (error.data as { detail?: unknown })?.detail : undefined;
          toast.error(typeof detail === "string" ? detail : "Could not save. Check that image links start with https.");
        },
      },
    );
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
      <div className="rounded-2xl border border-border bg-card/40 p-5 sm:p-7">
        <Section title="Basics">
          <div>
            <Label text="Name" htmlFor="title" />
            <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} className={inputClass} />
          </div>
          <div>
            <Label text="One-line pitch" htmlFor="tagline" hint={`${tagline.length}/140`} />
            <input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} maxLength={140} className={inputClass} />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium text-foreground">Category</p>
            <Chips options={CATEGORIES} value={[category]} onToggle={setCategory} />
          </div>
          <div>
            <Label text="What does it do?" htmlFor="description" hint={`${description.length}/2000`} />
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} rows={6} className={textareaClass} />
          </div>
        </Section>

        <Section title="Media" hint="Logo, screenshots and a demo video. The first screenshot is your cover.">
          <div>
            <p className="mb-1.5 text-sm font-medium text-foreground">Logo</p>
            <CurrentMedia urls={logo} onRemove={() => setLogo([])} square />
            {uploads ? (
              <div className={logo.length ? "mt-3" : ""}>
                <MediaUpload
                  kind="logo"
                  max={1}
                  limits={uploadConfig.limits.logo}
                  label={logo.length ? "Replace logo" : "Upload logo"}
                  hint="Square PNG, JPG or WEBP"
                  onChange={setNewLogo}
                  onBusyChange={(b) => setBusy((s) => ({ ...s, logo: b }))}
                />
              </div>
            ) : (
              <input
                value={logoUrlInput}
                onChange={(e) => setLogoUrlInput(e.target.value)}
                placeholder={logo.length ? "Paste a new logo URL to replace it" : "https://yourapp.com/logo.png"}
                className={`${inputClass} ${logo.length ? "mt-3" : ""}`}
              />
            )}
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium text-foreground">Screenshots</p>
            <CurrentMedia urls={shots} onRemove={(url) => setShots((list) => list.filter((u) => u !== url))} />
            {uploads && (
              <div className={shots.length ? "mt-3" : ""}>
                <MediaUpload
                  kind="screenshot"
                  max={Math.max(0, 8 - shots.length)}
                  limits={uploadConfig.limits.screenshot}
                  label="Add screenshots"
                  hint={`Up to ${8 - shots.length} more`}
                  onChange={setNewShots}
                  onBusyChange={(b) => setBusy((s) => ({ ...s, screenshot: b }))}
                />
              </div>
            )}
            <textarea
              value={pastedShots}
              onChange={(e) => setPastedShots(e.target.value)}
              rows={2}
              placeholder="Or paste image URLs, one per line"
              className={`${textareaClass} mt-3`}
            />
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium text-foreground">Demo video</p>
            <CurrentMedia urls={video} onRemove={() => setVideo([])} video />
            {uploads && !video.length && (
              <MediaUpload
                kind="video"
                max={1}
                limits={uploadConfig.limits.video}
                label="Upload a video"
                hint="MP4 or WEBM, up to 50 MB"
                onChange={setNewVideo}
                onBusyChange={(b) => setBusy((s) => ({ ...s, video: b }))}
              />
            )}
            <input value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="Or a YouTube link" className={`${inputClass} mt-3`} />
          </div>
        </Section>

        <Section title="Details" hint="Optional. Richer pages get more upvotes.">
          <div className="grid gap-4 sm:grid-cols-2">
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
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium text-foreground">Platforms</p>
            <Chips
              options={PLATFORMS}
              value={platforms}
              onToggle={(p) => setPlatforms((list) => (list.includes(p) ? list.filter((x) => x !== p) : [...list, p]))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label text="Tech stack and tags" htmlFor="tags" hint="Comma separated" />
              <input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} />
            </div>
            <div>
              <Label text="Source code" htmlFor="github" />
              <input id="github" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/you/app" className={inputClass} />
            </div>
          </div>
          <div>
            <Label text="Use cases" htmlFor="use_cases" hint="One per line" />
            <textarea id="use_cases" rows={3} value={useCases} onChange={(e) => setUseCases(e.target.value)} className={textareaClass} />
          </div>
          <div>
            <Label text="What feedback do you want?" htmlFor="feedback" />
            <input id="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} className={inputClass} />
          </div>
        </Section>
      </div>

      <aside className="space-y-3 lg:sticky lg:top-24">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-medium text-foreground">{app.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{app.badge_verified ? "Live" : app.status === "rejected" ? "Not approved" : "Waiting for badge"}</p>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            The app URL stays the same ({app.app_url?.replace(/^https?:\/\//, "")}). Everything else can change.
          </p>
          <button
            type="button"
            onClick={save}
            disabled={update.isPending || uploading}
            className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-foreground text-sm font-medium text-background hover:bg-foreground/85 disabled:opacity-50"
          >
            {update.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {uploading ? "Uploading..." : "Save changes"}
          </button>
          <Link href={app.badge_verified ? `/launches/${app.id}` : "/dashboard?tab=launches"} className="mt-2 block text-center text-xs text-muted-foreground hover:text-foreground">
            Cancel
          </Link>
        </div>
      </aside>
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
        <div className="mx-auto max-w-[1080px] px-4 pb-16 pt-8 md:px-8 md:pt-10">
          <Link href="/dashboard?tab=launches" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            Your launches
          </Link>
          <h1 className="mb-6 mt-4 text-3xl font-semibold text-foreground">Edit launch</h1>

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
