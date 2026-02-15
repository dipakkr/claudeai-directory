"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface GuideAccessBarProps {
  guideName: string;
  price: number;
  lockedCount: number;
}

export function GuideAccessBar({
  guideName,
  price,
  lockedCount,
}: GuideAccessBarProps) {
  if (lockedCount <= 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Unlock {lockedCount} premium lesson{lockedCount > 1 ? "s" : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              Get full access to {guideName}
            </p>
          </div>
        </div>
        <Link href="/pricing">
          <Button size="sm">
            Get Full Access — ${price}
          </Button>
        </Link>
      </div>
    </div>
  );
}
