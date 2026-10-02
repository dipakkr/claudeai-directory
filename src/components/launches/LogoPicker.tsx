"use client";

import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import type { UploadConfig } from "@/hooks/use-showcase";
import { uploadLaunchMedia } from "@/lib/upload";

/**
 * DevHunt-style logo field: a round preview, a short hint and "Select an image".
 * Uploads straight away and reports the new public URL. Without uploads it takes a link.
 */
export function LogoPicker({
  current,
  fallback,
  limits,
  onUploaded,
  onBusyChange,
  onLink,
  link,
}: {
  current: string;
  fallback: string;
  limits?: UploadConfig["limits"]["logo"];
  onUploaded: (url: string) => void;
  onBusyChange: (busy: boolean) => void;
  /** When uploads are off: a pasted image link instead. */
  onLink?: (url: string) => void;
  link?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const shown = preview || current;

  const pick = (file: File) => {
    setError("");
    if (limits && !limits.types.includes(file.type)) return setError("Use a PNG, JPG or WEBP image.");
    if (limits && file.size > limits.max_bytes) return setError(`Keep it under ${Math.round(limits.max_bytes / 1048576)} MB.`);
    const local = URL.createObjectURL(file);
    setPreview(local);
    setProgress(0);
    onBusyChange(true);
    uploadLaunchMedia("logo", file, setProgress)
      .then((url) => {
        onUploaded(url);
        setProgress(null);
      })
      .catch((e: unknown) => {
        setPreview(null);
        setProgress(null);
        setError(e instanceof Error ? e.message : "Upload failed. Try again.");
      })
      .finally(() => {
        onBusyChange(false);
        URL.revokeObjectURL(local);
      });
  };

  return (
    <div>
      <div className="flex items-center gap-5">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-dashed border-border p-2">
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[18px] bg-foreground/[0.06] text-2xl font-semibold text-muted-foreground">
            {shown ? (
              // eslint-disable-next-line @next/next/no-img-element -- logo preview
              <img src={shown} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              fallback
            )}
          </div>
          {progress !== null && (
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-xs font-medium text-white">
              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
              {Math.round(progress * 100)}%
            </span>
          )}
        </div>
        <div>
          <p className="text-[15px] text-foreground">Logo</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">Square image, at least 256×256 pixels. PNG, JPG or WEBP.</p>
        </div>
      </div>

      {limits ? (
        <>
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={progress !== null}
            className="mt-4 inline-flex h-10 items-center rounded-[10px] bg-foreground/[0.08] px-4 text-sm font-medium text-foreground transition-colors hover:bg-foreground/[0.12] disabled:opacity-60"
          >
            {shown ? "Select a new image" : "Select an image"}
          </button>
          <input
            ref={input}
            type="file"
            accept={limits.types.join(",")}
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) pick(file);
              e.target.value = "";
            }}
          />
        </>
      ) : (
        <input
          value={link ?? ""}
          onChange={(e) => onLink?.(e.target.value)}
          placeholder="https://yourapp.com/logo.png"
          aria-label="Logo image link"
          className="mt-4 h-12 w-full rounded-[10px] border border-transparent bg-foreground/[0.06] px-4 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus:border-[var(--cad-line-hover)] focus:outline-none"
        />
      )}
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}
