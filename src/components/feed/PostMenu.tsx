"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSignIn } from "@/components/auth/SignInDialog";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

/** ⋯ menu on a post: delete your own, report anyone else's. */
export function PostMenu({ postId, authorUsername, onDeleted }: { postId: string; authorUsername?: string; onDeleted?: () => void }) {
  const { user } = useAuth();
  const { requireAuth } = useSignIn();
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const own = Boolean(user?.username && user.username === authorUsername);

  const remove = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    try {
      await api.del(`/community/threads/${postId}`);
      toast.success("Post deleted");
      await queryClient.invalidateQueries({ queryKey: ["community-threads"] });
      onDeleted?.();
    } catch {
      toast.error("Could not delete the post");
    } finally {
      setConfirming(false);
    }
  };

  const report = () =>
    requireAuth("report this post", async () => {
      await api.post(`/community/threads/${postId}/report`, { reason: "" });
      toast.success("Thanks. We'll take a look.");
    });

  return (
    <DropdownMenu onOpenChange={(open) => !open && setConfirming(false)}>
      <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-[var(--cad-control)] hover:text-foreground" aria-label="Post options">
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {own ? (
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              void remove();
            }}
            className="text-red-500 focus:text-red-500"
          >
            {confirming ? "Click again to delete" : "Delete post"}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onSelect={() => void report()}>Report post</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
