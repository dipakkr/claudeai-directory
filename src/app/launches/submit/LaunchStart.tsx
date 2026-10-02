"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

/** Step one of a launch: just the website. We read it and fill in the rest. */
export function LaunchStart({ initialUrl, onContinue, onManual }: { initialUrl: string; onContinue: (url: string) => void; onManual: () => void }) {
  const [url, setUrl] = useState(initialUrl.replace(/^https?:\/\//i, ""));
  return (
    <div className="pt-2">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">Launch</p>
      <h2 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-foreground md:text-4xl">What are you launching?</h2>
      <p className="mt-2 text-[15px] text-muted-foreground">Paste your website. We read it and fill in the details; you review them.</p>
      <form
        className="mt-6 flex flex-col gap-2.5 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          if (url.trim()) onContinue(url.trim());
        }}
      >
        <label className="flex flex-1 items-center rounded-[10px] border border-border bg-card px-4 focus-within:border-[var(--cad-line-hover)]">
          <span className="font-mono text-sm text-muted-foreground">https://</span>
          <input
            autoFocus
            aria-label="Your app's website"
            inputMode="url"
            placeholder="yourapp.com"
            value={url}
            onChange={(event) => setUrl(event.target.value.replace(/^https?:\/\//i, ""))}
            className="w-full bg-transparent py-3.5 pl-1 text-[15px] text-foreground outline-none placeholder:text-muted-foreground/60"
          />
        </label>
        <button
          type="submit"
          disabled={!url.trim()}
          className="inline-flex h-[50px] items-center justify-center gap-2 rounded-[10px] bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
      <p className="mt-3 font-mono text-[11.5px] text-muted-foreground">Takes a few seconds. Nothing is public until you add the badge.</p>
      <button type="button" onClick={onManual} className="mt-8 text-sm text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground">
        Fill it in manually
      </button>
    </div>
  );
}

const STEPS = ["fetching your website", "reading what it does", "writing a name and one-line pitch", "drafting a description", "looking for a preview image", "drafting your first comment", "checking everything"];
const SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

/** Terminal-style progress while the site is read. Steps tick off; the last one waits for the real result. */
export function LaunchReading({ url }: { url: string }) {
  const [done, setDone] = useState(0);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const spin = window.setInterval(() => setFrame((f) => (f + 1) % SPINNER.length), 90);
    const timers = STEPS.slice(0, -1).map((_, i) => window.setTimeout(() => setDone((d) => Math.max(d, i + 1)), 500 + i * 650 + i * i * 60));
    return () => {
      window.clearInterval(spin);
      timers.forEach(window.clearTimeout);
    };
  }, []);

  const host = url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  return (
    <div className="pt-2" aria-live="polite" aria-busy="true">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">Launch</p>
      <h2 className="mt-3 font-sans text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Reading your site…</h2>
      <div className="mt-6 overflow-hidden rounded-[10px] border border-border bg-card font-mono text-[13px] leading-7">
        <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5 text-[11px] text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-border" />
          <span className="h-2 w-2 rounded-full bg-border" />
          <span className="h-2 w-2 rounded-full bg-border" />
          <span className="ml-2">claudeai.directory: launch</span>
        </div>
        <div className="px-4 py-3">
          <p className="text-foreground">
            <span className="text-green-500">$</span> launch <span className="text-primary">{host}</span>
          </p>
          {STEPS.map((step, i) =>
            i > done ? null : (
              <p key={step} className="flex items-center gap-2 text-muted-foreground">
                <span className={`w-3 ${i < done ? "text-green-500" : "text-primary"}`}>{i < done ? "✓" : SPINNER[frame]}</span>
                <span className={i < done ? "text-muted-foreground" : "text-foreground"}>{step}</span>
                {i < done && <span className="hidden text-muted-foreground/50 sm:inline">{".".repeat(Math.max(2, 34 - step.length))} ok</span>}
              </p>
            ),
          )}
        </div>
      </div>
      <p className="mt-3 font-mono text-[11.5px] text-muted-foreground">You review everything next.</p>
    </div>
  );
}

/** Numbered section of the review form (01 The basics, 02 Media, ...). */
export function FormSection({ n, title, hint, children }: { n: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-6">
      <legend className="mb-6 flex w-full flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border pb-3">
        <span className="font-mono text-xs text-primary">{n}</span>
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-foreground">{title}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </legend>
      {children}
    </fieldset>
  );
}
