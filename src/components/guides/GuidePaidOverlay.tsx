"use client";

import Link from "next/link";
import { Lock, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GuidePaidOverlayProps {
  guideTitle: string;
  price?: number;
}

export function GuidePaidOverlay({ guideTitle, price }: GuidePaidOverlayProps) {
  return (
    <div className="flex-1 min-w-0 max-w-3xl flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-xl border border-border bg-card p-8 max-w-md w-full">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <Lock className="h-5 w-5 text-primary" />
        </div>

        <h2 className="text-lg font-semibold text-foreground mb-2">
          Premium Lesson
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          This lesson is part of{" "}
          <span className="text-foreground font-medium">{guideTitle}</span>.
          Unlock the full guide to continue learning.
        </p>

        <div className="space-y-2 text-left mb-6">
          {["Access all premium lessons", "Track your progress", "Lifetime access to updates"].map((item) => (
            <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        <Link href="/pricing">
          <Button className="w-full" size="sm">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            {price ? `Unlock Guide — $${price}` : "Upgrade to Pro"}
          </Button>
        </Link>

        <p className="text-[10px] text-muted-foreground/60 mt-3">
          One-time payment. No subscription required.
        </p>
      </div>
    </div>
  );
}
