"use client";

import { useState, useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowUp, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { useSignIn } from "@/components/auth/SignInDialog";
import { UpvoteCount } from "@/components/feed/UpvoteMotion";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { useAuth } from "@/lib/auth";
import { hasVisitedLaunch, onLaunchVisited } from "@/lib/launch-visits";
import { myLaunchUpvotesQuery, useMyLaunchUpvotes, useShowcaseProject, useUpvoteShowcase } from "@/hooks/use-showcase";
import { track } from "@/lib/analytics";

interface UpvoteBoxProps {
  slug: string;
  title: string;
  initialCount: number;
  /** The product's website. When set, people open it before they can upvote. */
  websiteUrl?: string | null;
  websiteRel?: string;
  /** Inline pill for narrow screens instead of the tall hero box. */
  compact?: boolean;
}

/** True once this browser has opened the launch's website from our site. */
export function useLaunchVisited(slug: string) {
  return useSyncExternalStore(
    (onChange) => {
      const off = onLaunchVisited((id) => id === slug && onChange());
      window.addEventListener("storage", onChange);
      return () => {
        off();
        window.removeEventListener("storage", onChange);
      };
    },
    () => hasVisitedLaunch(slug),
    () => false,
  );
}

export function UpvoteBox({ slug, title, initialCount, websiteUrl, websiteRel = "nofollow noopener noreferrer", compact = false }: UpvoteBoxProps) {
  const queryClient = useQueryClient();
  const { requireAuth } = useSignIn();
  const { isAuthenticated } = useAuth();
  const upvote = useUpvoteShowcase();
  // Live count and the user's own vote, so the box is right after a reload
  // even when the server-rendered page is a few minutes old.
  const { data: live } = useShowcaseProject(slug);
  const { data: myUpvotes } = useMyLaunchUpvotes(isAuthenticated);
  const visited = useLaunchVisited(slug);

  const [optimistic, setOptimistic] = useState<{ voted: boolean; count: number } | null>(null);
  const serverVoted = (myUpvotes ?? []).includes(slug);
  const voted = optimistic?.voted ?? serverVoted;
  const count = optimistic?.count ?? live?.upvotes ?? initialCount;
  const [bump, setBump] = useState(0);
  const [shake, setShake] = useState(0);
  const [gateOpen, setGateOpen] = useState(false);
  // Only people who opened the website can upvote; removing a vote is always allowed.
  const locked = Boolean(websiteUrl) && !visited && !voted;

  const vote = () =>
    void requireAuth(`upvote ${title}`, async ({ resumed }) => {
      // Just signed in: the upvote is a toggle, so don't undo an earlier one.
      if (resumed && (await queryClient.fetchQuery(myLaunchUpvotesQuery)).includes(slug)) {
        toast.success(`You already upvoted ${title}`);
        return;
      }
      const next = !voted;
      setOptimistic({ voted: next, count: Math.max(0, count + (next ? 1 : -1)) });
      setBump((b) => b + 1);
      upvote.mutate(slug, {
        onSuccess: (project) => {
          setOptimistic(null);
          if (project.voted !== false) track("launch_upvoted", { slug, placement: "launch_page" });
          if (project.voted === false) toast.success("Upvote removed");
        },
        onError: () => {
          setOptimistic(null);
          toast.error("Could not save your upvote");
        },
      });
    });

  const handleClick = () => {
    if (locked) {
      setShake((s) => s + 1);
      setGateOpen(true);
      track("launch_upvote_gated", { slug });
      return;
    }
    setGateOpen(false);
    vote();
  };

  const icon = compact ? "h-4 w-4" : "h-6 w-6";
  return (
    <Popover open={gateOpen} onOpenChange={setGateOpen}>
      <PopoverAnchor asChild>
        <button
          key={`shake-${shake}`}
          type="button"
          onClick={handleClick}
          disabled={upvote.isPending}
          aria-pressed={voted}
          aria-label={voted ? `Remove upvote from ${title}` : `Upvote ${title}`}
          title={!isAuthenticated ? "Sign in to upvote" : voted ? "You upvoted this. Click to undo." : locked ? "Try the product first" : "Upvote this launch"}
          className={`relative flex shrink-0 cursor-pointer items-center justify-center border shadow-sm transition-[transform,background-color,border-color,box-shadow] duration-200 hover:shadow-md active:scale-95 disabled:cursor-default ${
            compact ? "h-10 gap-1.5 rounded-full px-4" : "h-24 w-24 flex-col gap-1.5 rounded-[10px] hover:-translate-y-0.5"
          } ${voted ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/50"} ${
            locked && shake ? "upvote-shake" : ""
          } ${!voted && visited && Boolean(websiteUrl) ? "upvote-ready border-primary/60" : ""}`}
        >
          {/* "+1" floats off each new upvote */}
          {voted && bump > 0 && (
            <span key={`float-${bump}`} aria-hidden className="upvote-float pointer-events-none absolute -top-1 left-1/2 text-xs font-bold text-primary">
              +1
            </span>
          )}
          <span className="relative inline-flex">
            {voted && bump > 0 && <span key={`ring-${bump}`} aria-hidden className="upvote-ring absolute inset-[-8px] rounded-full bg-primary/40" />}
            <ArrowUp key={`arrow-${bump}`} className={`${icon} ${bump > 0 ? "upvote-pop" : ""}`} strokeWidth={2.25} aria-hidden="true" />
          </span>
          <span className={`${compact ? "text-sm" : "text-xl"} font-semibold leading-none`}>
            <UpvoteCount count={count} bump={bump} up={voted} />
          </span>
          {!compact && <span className="text-[10px] font-medium uppercase tracking-wide opacity-80">{voted ? "Upvoted" : "Upvote"}</span>}
        </button>
      </PopoverAnchor>
      {websiteUrl && (
        <PopoverContent align={compact ? "start" : "end"} sideOffset={10} className="w-72 rounded-[8px] p-4">
          {visited ? (
            <>
              <p className="text-sm font-semibold text-foreground">Thanks for trying it</p>
              <p className="mt-1 text-[13px] leading-5 text-muted-foreground">You can upvote {title} now.</p>
              <button
                type="button"
                onClick={() => {
                  setGateOpen(false);
                  vote();
                }}
                className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[6px] bg-primary text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                <ArrowUp className="h-4 w-4" />
                Upvote {title}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-foreground">Try it before you upvote</p>
              <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
                Upvotes here come from people who opened the product. Take a quick look at {title}, then come back to upvote.
              </p>
              <a
                href={websiteUrl}
                target="_blank"
                rel={websiteRel}
                data-launch-click={slug}
                className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[6px] bg-foreground text-sm font-medium text-background hover:bg-foreground/85"
              >
                Visit website
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </>
          )}
        </PopoverContent>
      )}
    </Popover>
  );
}
