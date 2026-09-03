import Link from "next/link";
import { ArrowUpRight, Briefcase, MessageSquareText, Server, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { Stat } from "@/types";

// Each figure corresponds to a real section, so the strip doubles as navigation
// instead of being four inert numbers.
const STAT_META: Record<string, { href: string; icon: LucideIcon }> = {
  skills: { href: "/skills", icon: Sparkles },
  "mcp-servers": { href: "/mcp", icon: Server },
  prompts: { href: "/prompts", icon: MessageSquareText },
  jobs: { href: "/jobs", icon: Briefcase },
};

const StatsStrip = ({ stats }: { stats: Stat[] }) => {
  if (!stats.length) return null;

  return (
    <section className="border-y border-border bg-[var(--cad-raised)]">
      <div className="container grid grid-cols-2 gap-px overflow-hidden py-8 sm:grid-cols-4 sm:py-10">
        {stats.slice(0, 4).map((stat, i) => {
          const meta = STAT_META[stat.id];
          const Icon = meta?.icon;

          const body = (
            <>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                {Icon && <Icon className="h-3.5 w-3.5 shrink-0 transition-colors group-hover:text-primary" />}
                <span className="text-[12px] font-medium uppercase tracking-[0.08em]">
                  {stat.label}
                </span>
                {meta && (
                  <ArrowUpRight className="h-3 w-3 shrink-0 -translate-x-1 text-transparent transition-all group-hover:translate-x-0 group-hover:text-primary" />
                )}
              </div>

              <div className="mt-1.5 text-[clamp(26px,3.2vw,36px)] font-semibold leading-none text-foreground transition-colors group-hover:text-primary">
                {stat.value}
              </div>

              <p className="mt-1.5 text-[12px] leading-snug text-muted-foreground">
                {stat.description}
              </p>
            </>
          );

          const cellClass =
            "group flex flex-col px-4 py-3 sm:px-6 " +
            // hairline separators between columns, not around the outside
            (i % 2 === 1 ? "border-l border-border sm:border-l " : "sm:border-l sm:first:border-l-0 ") +
            (i >= 2 ? "border-t border-border pt-5 sm:border-t-0 sm:pt-3" : "");

          return meta ? (
            <Link key={stat.id || i} href={meta.href} className={cellClass}>
              {body}
            </Link>
          ) : (
            <div key={stat.id || i} className={cellClass}>
              {body}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default StatsStrip;
