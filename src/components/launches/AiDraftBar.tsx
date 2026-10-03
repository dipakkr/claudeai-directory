"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api";
import { track } from "@/lib/analytics";
import { useAiDraftConfig, useLaunchAiDraft, type LaunchAiDraft } from "@/hooks/use-showcase";

const FILLS = ["pitch", "description", "story", "tags"];

/**
 * "Write with AI": reads the app's website and drafts the listing. The draft lands in the
 * form for the maker to review; nothing is saved until they save. Hidden when the server
 * has no model configured.
 */
export function AiDraftBar({ url, onDraft, surface }: { url: string; onDraft: (draft: LaunchAiDraft) => void; surface: "edit" | "submit" }) {
  const { data: config } = useAiDraftConfig();
  const draft = useLaunchAiDraft();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const host = url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  const steps = [`Reading ${host}`, "Working out what it does", "Writing the pitch", "Drafting the description and story", "Picking tags"];

  // Rotate the progress line while the model works (about 10 seconds).
  useEffect(() => {
    if (!draft.isPending) return;
    const id = window.setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 2200);
    return () => window.clearInterval(id);
  }, [draft.isPending, steps.length]);

  if (!config?.enabled || !url) return null;

  const run = () => {
    track("launch_ai_draft_clicked", { surface });
    setDone(false);
    setStep(0);
    draft.mutate(url, {
      onSuccess: (d) => {
        setDone(true);
        onDraft(d);
      },
      onError: (error) => {
        const detail = error instanceof ApiError ? (error.data as { detail?: unknown })?.detail : undefined;
        toast.error(typeof detail === "string" ? detail : "Could not write a draft. Try again.");
      },
    });
  };

  return (
    <div className="relative isolate overflow-hidden rounded-[12px] border border-primary/25 bg-[linear-gradient(135deg,hsl(var(--primary)/0.10),transparent_55%)] p-4 sm:p-5">
      <span aria-hidden className="pulse-glow pointer-events-none absolute -inset-y-8 inset-x-0 -z-10 opacity-60" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-primary/15 text-primary">
          {done && !draft.isPending ? <Check className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-sans text-[15px] font-medium text-foreground">
            {draft.isPending ? "Writing your listing..." : done ? "Draft added. Review it, then save." : "Write your listing with AI"}
          </p>
          {draft.isPending ? (
            <p key={step} className="mt-1 animate-fade-in font-mono text-[12.5px] text-muted-foreground" aria-live="polite">
              <span className="text-primary">&gt;</span> {steps[step]}...
            </p>
          ) : (
            <>
              <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
                {done ? "Check the About, Story and Details tabs. Undo is in the message at the bottom." : `Reads ${host} and fills in the form for you. Nothing is saved until you save.`}
              </p>
              {!done && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {FILLS.map((f) => (
                    <span key={f} className="rounded-[4px] border border-border bg-background/40 px-1.5 py-0.5 font-mono text-[10.5px] text-muted-foreground">
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <button
          type="button"
          onClick={run}
          disabled={draft.isPending}
          className={`inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[8px] px-4 text-sm font-medium transition-all disabled:cursor-wait ${
            done && !draft.isPending
              ? "border border-border text-foreground hover:border-[var(--cad-line-hover)]"
              : "bg-primary text-primary-foreground shadow-[0_0_0_1px_hsl(var(--primary)/0.4),0_6px_20px_-6px_hsl(var(--primary)/0.6)] hover:opacity-90 disabled:opacity-80"
          }`}
        >
          {draft.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {draft.isPending ? "Writing..." : done ? "Write again" : "Write with AI"}
        </button>
      </div>

      {/* Progress along the bottom edge while it works. */}
      {draft.isPending && (
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-primary/15">
          <span className="block h-full origin-left animate-[ai-draft-progress_12s_ease-out_forwards] bg-primary" />
        </span>
      )}
    </div>
  );
}
