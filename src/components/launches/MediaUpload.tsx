"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, RotateCcw, Video, X } from "lucide-react";

import type { UploadConfig, UploadKind } from "@/hooks/use-showcase";
import { uploadLaunchMedia } from "@/lib/upload";

interface Item {
  id: string;
  file: File;
  preview: string;
  progress: number;
  url?: string;
  error?: string;
}

interface MediaUploadProps {
  kind: UploadKind;
  max: number;
  limits: UploadConfig["limits"][UploadKind];
  /** Public URLs of finished uploads, in display order. */
  onChange: (urls: string[]) => void;
  /** True while any file is still uploading, so the form can wait. */
  onBusyChange: (busy: boolean) => void;
  label: string;
  hint: string;
}

const EXT_LABEL: Record<string, string> = {
  "image/png": "PNG",
  "image/jpeg": "JPG",
  "image/webp": "WEBP",
  "video/mp4": "MP4",
  "video/webm": "WEBM",
};

function sizeLabel(bytes: number) {
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

export function MediaUpload({ kind, max, limits, onChange, onBusyChange, label, hint }: MediaUploadProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const isVideo = kind === "video";
  const square = kind === "logo";

  // Report finished URLs and busy state whenever items change.
  useEffect(() => {
    onChange(items.filter((item) => item.url).map((item) => item.url as string));
    onBusyChange(items.some((item) => !item.url && !item.error));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- callbacks are stable setters from the parent
  }, [items]);

  // Free object URLs when the component goes away.
  useEffect(() => () => itemsRef.current.forEach((item) => URL.revokeObjectURL(item.preview)), []);

  const patch = (id: string, changes: Partial<Item>) =>
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...changes } : item)));

  const start = (item: Item) => {
    uploadLaunchMedia(kind, item.file, (fraction) => patch(item.id, { progress: fraction }))
      .then((url) => patch(item.id, { url, progress: 1, error: undefined }))
      .catch((error: unknown) => {
        const detail = (error as { data?: { detail?: unknown } } | null)?.data?.detail;
        patch(item.id, {
          error: typeof detail === "string" ? detail : error instanceof Error ? error.message : "Upload failed",
        });
      });
  };

  const addFiles = (files: FileList | File[]) => {
    setNotice(null);
    const room = max - itemsRef.current.length;
    const accepted: Item[] = [];
    for (const file of Array.from(files)) {
      if (accepted.length >= room) {
        setNotice(`You can add up to ${max}.`);
        break;
      }
      if (!limits.types.includes(file.type)) {
        setNotice(`${file.name}: use ${limits.types.map((t) => EXT_LABEL[t] ?? t).join(", ")}.`);
        continue;
      }
      if (file.size > limits.max_bytes) {
        setNotice(`${file.name} is over the ${sizeLabel(limits.max_bytes)} limit.`);
        continue;
      }
      accepted.push({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file), progress: 0 });
    }
    if (!accepted.length) return;
    setItems((current) => (max === 1 ? accepted.slice(0, 1) : [...current, ...accepted]));
    if (max === 1) itemsRef.current.forEach((item) => URL.revokeObjectURL(item.preview));
    accepted.forEach(start);
  };

  const remove = (id: string) =>
    setItems((current) => {
      const target = current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return current.filter((item) => item.id !== id);
    });

  const retry = (item: Item) => {
    patch(item.id, { error: undefined, progress: 0 });
    start(item);
  };

  const canAdd = items.length < max;
  const tileSize = square ? "h-24 w-24" : isVideo ? "aspect-video w-full sm:w-72" : "aspect-[16/10] w-full";

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>

      <div className={square || isVideo ? "flex flex-wrap gap-3" : "grid grid-cols-2 gap-3 sm:grid-cols-3"}>
        {items.map((item) => (
          <div key={item.id} className={`relative overflow-hidden rounded-xl border border-border bg-background ${tileSize}`}>
            {isVideo ? (
              <video src={item.preview} className="h-full w-full object-cover" muted playsInline />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
              <img src={item.preview} alt="" className="h-full w-full object-cover" />
            )}
            {!item.url && !item.error && (
              <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20">
                <div className="h-full bg-primary transition-[width]" style={{ width: `${Math.round(item.progress * 100)}%` }} />
              </div>
            )}
            {!item.url && !item.error && (
              <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                <Loader2 className="h-3 w-3 animate-spin" />
                {Math.round(item.progress * 100)}%
              </span>
            )}
            {item.error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/70 p-2 text-center">
                <p className="line-clamp-2 text-[11px] text-white" title={item.error}>
                  {square ? "Failed" : item.error}
                </p>
                <button
                  type="button"
                  onClick={() => retry(item)}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-black"
                >
                  <RotateCcw className="h-3 w-3" />
                  Retry
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => remove(item.id)}
              aria-label="Remove"
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              if (event.dataTransfer.files.length) addFiles(event.dataTransfer.files);
            }}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground ${tileSize} ${
              dragging ? "border-primary bg-primary/5 text-foreground" : "border-border bg-card"
            }`}
          >
            {isVideo ? <Video className="h-5 w-5" /> : <ImagePlus className="h-5 w-5" />}
            <span>{square ? "Upload" : items.length ? "Add more" : "Upload or drop"}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={limits.types.join(",")}
        multiple={max > 1}
        hidden
        onChange={(event) => {
          if (event.target.files?.length) addFiles(event.target.files);
          event.target.value = "";
        }}
      />
      {notice && <p className="text-xs text-destructive">{notice}</p>}
    </div>
  );
}
