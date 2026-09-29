"use client";

import { useState } from "react";
import { UserRound } from "lucide-react";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/** The maker's profile photo, or their initials when there is none (or it fails to load). */
export function MakerPhoto({ src, name, size = "base" }: { src?: string | null; name?: string; size?: "sm" | "base" }) {
  const [failed, setFailed] = useState(false);
  const dimension = size === "sm" ? "h-9 w-9 text-xs" : "h-12 w-12 text-sm";
  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote profile photo (Google etc.)
      <img
        src={src}
        alt={name ? `${name}'s profile photo` : ""}
        referrerPolicy="no-referrer"
        loading="lazy"
        onError={() => setFailed(true)}
        className={`shrink-0 rounded-full border border-border object-cover ${dimension}`}
      />
    );
  }
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full border border-border bg-card font-semibold text-muted-foreground ${dimension}`}>
      {name ? initials(name) : <UserRound className="h-5 w-5" />}
    </span>
  );
}
