"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

interface CompanyLogoProps {
    company: string;
    logo?: string | null;
    /** Sizing/shape classes, applied to both the image and the fallback tile. */
    className?: string;
}

/**
 * Company logo with an initial-letter fallback.
 *
 * Aggregator logo URLs go stale or start rejecting hotlinks, so a missing or
 * failed image has to degrade to the lettered tile rather than a broken icon.
 */
export function CompanyLogo({ company, logo, className }: CompanyLogoProps) {
    const [failed, setFailed] = useState(false);

    if (logo && !failed) {
        return (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
                src={logo}
                alt={`${company} logo`}
                loading="lazy"
                onError={() => setFailed(true)}
                className={cn(
                    "shrink-0 rounded-md border border-border bg-white object-contain p-0.5",
                    className
                )}
            />
        );
    }

    return (
        <span
            className={cn(
                "flex shrink-0 items-center justify-center rounded-md bg-primary font-medium text-white",
                className
            )}
        >
            {company?.[0]?.toUpperCase() ?? "?"}
        </span>
    );
}
