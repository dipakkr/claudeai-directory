"use client";

import { useCallback, useSyncExternalStore } from "react";
import { ArrowRight, X } from "lucide-react";

import { DiscordIcon } from "@/components/icons/DiscordIcon";
import { SOCIAL_LINKS } from "@/lib/social";

// Bump this when the announcement changes so a new message shows again to
// people who dismissed the previous one.
const ANNOUNCEMENT_ID = "discord-launch";
const STORAGE_KEY = `cad_announcement_dismissed:${ANNOUNCEMENT_ID}`;

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function isDismissed() {
    try {
        return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
        // Private mode or storage disabled — just show it.
        return false;
    }
}

/** The server cannot know what the visitor dismissed, so it renders the banner. */
function isDismissedOnServer() {
    return false;
}

export function AnnouncementBanner() {
    const dismissed = useSyncExternalStore(subscribe, isDismissed, isDismissedOnServer);

    const dismiss = useCallback(() => {
        try {
            localStorage.setItem(STORAGE_KEY, "1");
        } catch {
            // Nothing to persist to; the banner returns on the next load.
        }
        listeners.forEach((listener) => listener());
    }, []);

    if (dismissed) return null;

    return (
        <div className="announcement-bar relative z-[60] w-full border-b border-border bg-card text-muted-foreground">
            <div className="mx-auto flex max-w-[1180px] items-center justify-center gap-2.5 px-10 py-2 text-[13px]">
                <DiscordIcon className="h-4 w-4 shrink-0 text-[#7984F5]" />
                <span className="text-center">
                    The Claude AI Community Discord is open.
                </span>
                <a
                    href={SOCIAL_LINKS.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex shrink-0 items-center gap-1 font-medium text-foreground hover:text-primary"
                >
                    Join us
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </a>
            </div>

            <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss announcement"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}
