"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";

import { useAuth } from "@/lib/auth";

/** Public launch controls belong to the author; read-only views cannot edit. */
export function OwnerEditButton({ slug, authorId }: { slug: string; authorId?: string }) {
  const { user, isLoading, viewOnly } = useAuth();
  if (isLoading || viewOnly || !user?.id || user.id !== authorId) return null;
  return (
    <Link
      href={`/launches/${encodeURIComponent(slug)}/edit`}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm text-foreground transition-colors hover:border-[var(--cad-line-hover)]"
    >
      <Pencil className="h-3.5 w-3.5" />
      Edit
    </Link>
  );
}
