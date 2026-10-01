"use client";

import { Eye } from "lucide-react";

import { useAuth } from "@/lib/auth";

/** Fixed bar while an admin views a member's account (read-only, this tab only). */
export function ViewAsBanner() {
  const { viewOnly, viewExpired, user, exitView } = useAuth();
  if (!viewOnly && !viewExpired) return null;
  return (
    <div className="sticky top-0 z-[60] flex items-center justify-center gap-3 bg-amber-400 px-4 py-2 text-[13px] font-medium text-black" style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top, 0px))" }}>
      <Eye className="h-4 w-4 shrink-0" />
      <span className="truncate">
        {viewExpired ? "The admin view expired. Open it again from the admin." : `Viewing as @${user?.username}. Read-only: nothing you click here changes their account.`}
      </span>
      <button type="button" onClick={exitView} className="shrink-0 rounded-[4px] bg-black px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-black/80">
        Exit
      </button>
    </div>
  );
}
