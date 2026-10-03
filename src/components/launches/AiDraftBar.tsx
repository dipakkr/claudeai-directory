"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api";
import { track } from "@/lib/analytics";
import { useAiDraftConfig, useLaunchAiDraft, type LaunchAiDraft } from "@/hooks/use-showcase";

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

  // One slim row: what it does (or what it is doing now) and the button.
  return (
    <div className="relative flex items-center gap-3 overflow-hidden rounded-[10px] border border-primary/25 bg-primary/[0.05] py-2 pl-3 pr-2">
      {done && !draft.isPending ? <Check className="h-4 w-4 shrink-0 text-primary" /> : <Sparkles className="h-4 w-4 shrink-0 text-primary" />}
      <p className="min-w-0 flex-1 truncate text-[13px] text-muted-foreground" aria-live="polite">
        {draft.isPending ? (
          <span key={step} className="animate-fade-in font-mono text-[12.5px]">{steps[step]}...</span>
        ) : done ? (
          <><span className="text-foreground">Draft added.</span> Review it, then save.</>
        ) : (
          <><span className="text-foreground">AI can write this for you</span> from {host}.</>
        )}
      </p>
      <button
        type="button"
        onClick={run}
        disabled={draft.isPending}
        className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[8px] bg-primary px-3 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-80"
      >
        {draft.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
        {draft.isPending ? "Writing..." : done ? "Write again" : "Write with AI"}
      </button>
      {draft.isPending && (
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-primary/15">
          <span className="block h-full origin-left animate-[ai-draft-progress_12s_ease-out_forwards] bg-primary" />
        </span>
      )}
    </div>
  );
}
