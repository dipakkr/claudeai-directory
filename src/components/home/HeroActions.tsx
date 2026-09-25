"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";

import { useSignIn } from "@/components/auth/SignInDialog";
import { useCommandMenu } from "@/components/layout/CommandMenu";
import { useAuth } from "@/lib/auth";
import { compactNumber } from "@/lib/directory";
import type { PublicProfile } from "@/types";

/** The hero's main action: a search field that opens the site search (⌘K). */
export function HeroSearch() {
  const { open } = useCommandMenu();
  return (
    <div className="mx-auto mt-8 w-full max-w-[560px]">
      <button
        type="button"
        onClick={open}
        className="flex h-12 w-full cursor-text items-center gap-3 rounded-full border border-border bg-card px-5 text-left text-[15px] text-muted-foreground shadow-sm transition-colors hover:border-[var(--cad-line-hover)]"
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="flex-1 truncate">Search Skills, MCPs and Agents...</span>
        <kbd className="hidden rounded border border-border px-1.5 font-mono text-[11px] sm:inline">⌘K</kbd>
      </button>
    </div>
  );
}

/** Member avatars as a join prompt: sign in when signed out, the community when signed in. */
export function HeroJoin({ members, total }: { members: PublicProfile[]; total: number }) {
  const { isAuthenticated } = useAuth();
  const { openSignIn } = useSignIn();
  const router = useRouter();
  const preview = members.slice(0, 8);
  if (preview.length === 0) return null;

  // Product decision: show "1k+" until the real count passes it.
  const builders = total >= 1000 ? `${compactNumber(total)}+` : "1k+";
  const label = isAuthenticated ? "Ask the community" : `Join ${builders} builders`;

  return (
    <button
      type="button"
      onClick={() => (isAuthenticated ? router.push("/community") : openSignIn("join the community"))}
      className="group mx-auto mt-7 flex w-fit max-w-full cursor-pointer items-center justify-center"
    >
      <span className="flex -space-x-2">
        {preview.map((member) => {
          const name = member.name || member.username;
          return (
            <span
              key={member.id}
              title={name}
              className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-background bg-muted text-[11px] font-medium text-muted-foreground ring-1 ring-border"
            >
              {member.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element -- member avatars are remote user-provided URLs
                <img src={member.avatar} alt="" className="h-full w-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
              ) : (
                name[0]?.toUpperCase()
              )}
            </span>
          );
        })}
      </span>
      <span className="ml-3 inline-flex shrink-0 items-center gap-1 text-sm text-foreground group-hover:underline group-hover:underline-offset-4">
        {label}
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
    </button>
  );
}
