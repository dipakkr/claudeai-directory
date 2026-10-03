"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useSignIn } from "@/components/auth/SignInDialog";
import { UpvoteCount } from "@/components/feed/UpvoteMotion";
import { useLaunchVisited } from "@/components/launches/UpvoteBox";
import { UpTriangle, upvotePillClass } from "@/components/launches/UpvotePill";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import {
  myLaunchUpvotesQuery,
  useMyLaunchUpvotes,
  useUpvoteShowcase,
} from "@/hooks/use-showcase";
import { track } from "@/lib/analytics";
import { useAuth } from "@/lib/auth";
import { markLaunchVisited } from "@/lib/launch-visits";
import type { ShowcaseProject } from "@/types";

/**
 * Upvote a launch right from a list (homepage, MCP tab, related). Same rules as the launches page:
 * sign in, and try the product first (open its website) before the first upvote. Keeps its own count,
 * so it works inside server-rendered lists. Stops the click from opening the launch page.
 */
export function LaunchVoteButton({
  project,
  placement,
}: {
  project: ShowcaseProject;
  placement: string;
}) {
  const { requireAuth } = useSignIn();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const upvote = useUpvoteShowcase();
  const { data: mine } = useMyLaunchUpvotes(isAuthenticated);
  const [state, setState] = useState<{ voted: boolean; count: number } | null>(
    null,
  );
  const voted = state?.voted ?? Boolean(mine?.includes(project.id));
  const count = state?.count ?? project.upvotes ?? 0;
  const website = project.app_url || project.demo_url;
  const visited = useLaunchVisited(project.id);
  const locked = Boolean(website) && !visited && !voted;
  const [bump, setBump] = useState(0);
  const [shake, setShake] = useState(0);
  // "Try it first" sits next to the button, not in a corner toast.
  const [gateOpen, setGateOpen] = useState(false);

  const vote = () =>
    void requireAuth(`upvote ${project.title}`, async ({ resumed }) => {
      // Just signed in: the upvote is a toggle, so don't undo an earlier one.
      if (
        resumed &&
        (await queryClient.fetchQuery(myLaunchUpvotesQuery)).includes(
          project.id,
        )
      ) {
        setState({ voted: true, count });
        toast.success(`You already upvoted ${project.title}`);
        return;
      }
      const before = { voted, count };
      setState({ voted: !voted, count: count + (voted ? -1 : 1) });
      setBump((n) => n + 1);
      upvote.mutate(project.id, {
        onSuccess: (updated) => {
          const nowVoted = updated.voted !== false;
          setState({
            voted: nowVoted,
            count: updated.upvotes ?? before.count + (nowVoted ? 1 : -1),
          });
          if (nowVoted)
            track("launch_upvoted", { slug: project.id, placement });
          void queryClient.invalidateQueries({
            queryKey: myLaunchUpvotesQuery.queryKey,
          });
        },
        onError: () => {
          setState(before);
          toast.error("Could not save your upvote");
        },
      });
    });

  const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // The row is a link to the launch; the button must not follow it.
    event.preventDefault();
    event.stopPropagation();
    if (locked && website) {
      setShake((n) => n + 1);
      setGateOpen(true);
      track("launch_upvote_gated", { slug: project.id });
      return;
    }
    setGateOpen(false);
    vote();
  };

  return (
    <Popover open={gateOpen} onOpenChange={setGateOpen}>
      <PopoverAnchor asChild>
        <button
          key={`shake-${shake}`}
          type="button"
          onClick={onClick}
          disabled={upvote.isPending}
          aria-pressed={voted}
          aria-label={
            voted
              ? `Remove upvote from ${project.title}`
              : `Upvote ${project.title}`
          }
          title={
            voted
              ? "You upvoted this. Click to undo."
              : locked
                ? "Try the product first"
                : "Upvote this launch"
          }
          className={`relative shrink-0 cursor-pointer active:scale-95 ${upvotePillClass(voted)} ${locked && shake ? "upvote-shake" : ""} disabled:opacity-70`}
        >
          {voted && bump > 0 && (
            <span
              key={`float-${bump}`}
              aria-hidden
              className="upvote-float pointer-events-none absolute -top-1 left-1/2 text-[11px] font-bold text-primary"
            >
              +1
            </span>
          )}
          <span className="relative inline-flex">
            {voted && bump > 0 && (
              <span
                key={`ring-${bump}`}
                aria-hidden
                className="upvote-ring absolute inset-[-6px] rounded-full bg-primary/40"
              />
            )}
            <span
              key={`arrow-${bump}`}
              className={`inline-flex ${bump > 0 ? "upvote-pop" : ""} ${voted ? "text-primary" : "text-muted-foreground"}`}
            >
              <UpTriangle className="h-2.5 w-3" />
            </span>
          </span>
          <UpvoteCount count={count} bump={bump} up={voted} />
        </button>
      </PopoverAnchor>
      {website && (
        <PopoverContent
          align="end"
          sideOffset={8}
          className="w-72 rounded-[8px] p-4"
          onClick={(e) => e.stopPropagation()}
        >
          {visited ? (
            <>
              <p className="text-sm font-semibold text-foreground">
                Thanks for trying it
              </p>
              <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
                You can upvote {project.title} now.
              </p>
              <button
                type="button"
                onClick={() => {
                  setGateOpen(false);
                  vote();
                }}
                className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[6px] bg-primary text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                <UpTriangle className="h-2.5 w-3" />
                Upvote {project.title}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-foreground">
                Try it before you upvote
              </p>
              <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
                Upvotes here come from people who opened the product. Take a
                quick look at {project.title}, then upvote.
              </p>
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                data-launch-click={project.id}
                onClick={() => markLaunchVisited(project.id)}
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
