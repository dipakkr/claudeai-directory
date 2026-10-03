"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Thread } from "@/types";

const field =
  "w-full rounded-[8px] border border-transparent bg-foreground/[0.06] px-3 py-2 text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-[var(--cad-line-hover)]";

/** In-place editor for the author: title, text and link. Upvotes and comments are kept. */
export function EditPostForm({ thread, onDone }: { thread: Thread; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(thread.title ?? "");
  const [body, setBody] = useState(thread.body);
  const [link, setLink] = useState(thread.link_url ?? "");
  const [saving, setSaving] = useState(false);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!body.trim()) {
      toast.error("Write something first");
      return;
    }
    setSaving(true);
    try {
      const updated = await api.put<Thread>(`/community/threads/${thread.id}`, {
        title: title.trim() || null,
        body: body.trim(),
        link_url: link.trim() || null,
      });
      queryClient.setQueryData(["community-thread", thread.id], { ...thread, ...updated, id: thread.id });
      await queryClient.invalidateQueries({ queryKey: ["community-threads"] });
      toast.success("Post updated");
      onDone();
    } catch (error) {
      toast.error(error instanceof Error && error.message ? error.message : "Could not save the post");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="mt-5 max-w-[72ch] space-y-3">
      <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} placeholder="Title (optional)" aria-label="Title" className={`${field} h-10 text-[15px] font-semibold`} />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={3000} rows={10} aria-label="Post" className={`${field} resize-y text-[15px] leading-7`} />
      <input value={link} onChange={(e) => setLink(e.target.value)} maxLength={1000} placeholder="Link (optional)" aria-label="Link" className={`${field} h-10 text-[14px]`} />
      <div className="flex items-center gap-2">
        <button type="submit" disabled={saving} className="inline-flex h-9 items-center rounded-[6px] bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
          {saving ? "Saving..." : "Save changes"}
        </button>
        <button type="button" onClick={onDone} disabled={saving} className="inline-flex h-9 items-center rounded-[6px] px-3 text-sm text-muted-foreground hover:text-foreground">
          Cancel
        </button>
        <span className="ml-auto text-xs tabular-nums text-muted-foreground">{body.length}/3000</span>
      </div>
    </form>
  );
}
