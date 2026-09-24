"use client";

import { Star } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useMemo } from "react";
import { useSignIn } from "@/components/auth/SignInDialog";
import { bookmarksQuery, useAddBookmark, useOptionalBookmarks, useRemoveBookmark } from "@/hooks/use-bookmarks";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export type FavoriteTargetType = "skill" | "mcp_server" | "agent" | "prompt" | "showcase" | "resource" | "job";

export function favoriteTargetType(kind: string): FavoriteTargetType {
  if (kind === "mcp") return "mcp_server";
  if (kind === "skill" || kind === "agent" || kind === "prompt" || kind === "showcase" || kind === "resource" || kind === "job") return kind;
  return "resource";
}

export default function FavoriteButton({
  targetType,
  targetId,
  label = "Favorite",
  compact = false,
  className,
}: {
  targetType: FavoriteTargetType;
  targetId: string;
  label?: string;
  compact?: boolean;
  className?: string;
}) {
  const queryClient = useQueryClient();
  const { requireAuth } = useSignIn();
  const { isAuthenticated } = useAuth();
  const { data: bookmarks } = useOptionalBookmarks(isAuthenticated);
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();

  const bookmark = useMemo(
    () => bookmarks?.find((item) => item.target_type === targetType && item.target_id === targetId),
    [bookmarks, targetId, targetType],
  );
  const isFavorite = Boolean(bookmark);
  const isPending = addBookmark.isPending || removeBookmark.isPending;
  const text = isFavorite ? "Favorited" : label;

  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      aria-label={`${isFavorite ? "Remove from" : "Add to"} favorites`}
      title={`${isFavorite ? "Remove from" : "Add to"} favorites`}
      disabled={isPending}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();

        void requireAuth("save this to your favorites", async ({ resumed }) => {
          const add = () =>
            addBookmark.mutate(
              { target_type: targetType, target_id: targetId },
              {
                onSuccess: () => toast.success("Added to favorites"),
                onError: () => toast.error("Could not update favorite"),
              },
            );

          // Just signed in: only add, never remove a favorite saved earlier.
          if (resumed) {
            const saved = await queryClient.fetchQuery(bookmarksQuery);
            if (saved.some((item) => item.target_type === targetType && item.target_id === targetId)) {
              toast.success("Already in your favorites");
              return;
            }
            add();
            return;
          }

          if (bookmark) {
            removeBookmark.mutate(bookmark.id, {
              onSuccess: () => toast.success("Removed from favorites"),
              onError: () => toast.error("Could not update favorite"),
            });
            return;
          }
          add();
        });
      }}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full border border-border text-sm text-muted-foreground transition-colors hover:border-[var(--cad-line-hover)] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60",
        isFavorite && "border-primary/45 bg-primary/10 text-primary",
        compact ? "h-8 w-8" : "h-10 px-4",
        className,
      )}
    >
      <Star className={cn("h-4 w-4", isFavorite && "fill-current")} aria-hidden="true" />
      {!compact && <span>{text}</span>}
    </button>
  );
}
