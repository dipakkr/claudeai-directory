import { ChevronUp } from "lucide-react";

/**
 * The animated parts of an upvote button. `bump` changes on every vote: keying
 * on it remounts the spans so the CSS animations replay each time.
 */
export function UpvoteIcon({ voted, bump, className = "h-4 w-4" }: { voted: boolean; bump: number; className?: string }) {
  return (
    <span className="relative inline-flex items-center justify-center">
      {voted && bump > 0 && <span key={`ring-${bump}`} aria-hidden className="upvote-ring absolute inset-[-6px] rounded-full bg-primary/40" />}
      <ChevronUp key={`icon-${bump}`} className={`${className} ${bump > 0 ? "upvote-pop" : ""}`} strokeWidth={2.5} />
    </span>
  );
}

export function UpvoteCount({ count, bump, up }: { count: number; bump: number; up: boolean }) {
  return (
    <span className="inline-flex h-[1.2em] overflow-hidden tabular-nums">
      <span key={bump} className={bump > 0 ? (up ? "upvote-count-up" : "upvote-count-down") : ""}>
        {count}
      </span>
    </span>
  );
}
