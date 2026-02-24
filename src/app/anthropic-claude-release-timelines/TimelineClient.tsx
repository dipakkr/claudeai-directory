"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import {
  Cpu,
  Zap,
  Package,
  Smartphone,
  Code2,
  Wrench,
  Bot,
  FlaskConical,
  ShieldCheck,
  FileText,
  BarChart2,
  Building2,
  DollarSign,
  Handshake,
  ExternalLink,
  Star,
} from "lucide-react";
import {
  CATEGORY_LABELS,
  type EventCategory,
  type TimelineEvent,
} from "./timeline-data";

type FilterValue = EventCategory | "all";

const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "model_release", label: "Models" },
  { value: "feature_update", label: "Features" },
  { value: "product_launch", label: "Products" },
  { value: "app", label: "Apps" },
  { value: "api", label: "API" },
  { value: "tooling", label: "Tooling" },
  { value: "agent", label: "Agents" },
  { value: "research_paper", label: "Research" },
  { value: "safety", label: "Safety" },
  { value: "policy", label: "Policy" },
  { value: "benchmark", label: "Benchmarks" },
  { value: "company_milestone", label: "Milestones" },
  { value: "funding", label: "Funding" },
  { value: "partnership", label: "Partnerships" },
];

interface CategoryStyle {
  dot: string;
  badge: string;
  icon: React.ElementType;
}

const CATEGORY_STYLES: Record<EventCategory, CategoryStyle> = {
  model_release: {
    dot: "bg-primary",
    badge: "bg-primary/10 text-primary border-primary/30",
    icon: Cpu,
  },
  feature_update: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    icon: Zap,
  },
  product_launch: {
    dot: "bg-teal-500",
    badge: "bg-teal-500/10 text-teal-400 border-teal-500/30",
    icon: Package,
  },
  app: {
    dot: "bg-cyan-500",
    badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    icon: Smartphone,
  },
  api: {
    dot: "bg-blue-500",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    icon: Code2,
  },
  tooling: {
    dot: "bg-violet-500",
    badge: "bg-violet-500/10 text-violet-400 border-violet-500/30",
    icon: Wrench,
  },
  agent: {
    dot: "bg-purple-500",
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    icon: Bot,
  },
  research_paper: {
    dot: "bg-amber-500",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    icon: FlaskConical,
  },
  safety: {
    dot: "bg-red-500",
    badge: "bg-red-500/10 text-red-400 border-red-500/30",
    icon: ShieldCheck,
  },
  policy: {
    dot: "bg-rose-500",
    badge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    icon: FileText,
  },
  benchmark: {
    dot: "bg-lime-500",
    badge: "bg-lime-500/10 text-lime-400 border-lime-500/30",
    icon: BarChart2,
  },
  company_milestone: {
    dot: "bg-zinc-400",
    badge: "bg-zinc-400/10 text-zinc-400 border-zinc-400/30",
    icon: Building2,
  },
  funding: {
    dot: "bg-yellow-500",
    badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    icon: DollarSign,
  },
  partnership: {
    dot: "bg-sky-500",
    badge: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    icon: Handshake,
  },
};

function formatDisplayDate(date: string, precision: string): string {
  const d = new Date(date + "T00:00:00Z");
  if (precision === "exact") {
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  }
  if (precision === "month") {
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
  }
  // quarter
  const q = Math.floor(d.getUTCMonth() / 3) + 1;
  return `Q${q} ${d.getUTCFullYear()}`;
}

// Pure card content — no dot, used by both mobile and desktop layouts
function EventCardContent({ event }: { event: TimelineEvent }) {
  const styles = CATEGORY_STYLES[event.category];
  const Icon = styles.icon;
  const isMajor = event.tier === "major";
  const displayDate = formatDisplayDate(event.date, event.date_precision);

  return (
    <div
      className={`w-full rounded-lg border bg-card p-4 transition-all hover:bg-accent/30 ${isMajor
          ? "border-primary/20 hover:border-primary/40"
          : "border-border hover:border-border/80"
        }`}
    >
      {/* Top row */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-xs text-muted-foreground font-mono">{displayDate}</span>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${styles.badge}`}
        >
          <Icon className="h-2.5 w-2.5" />
          {CATEGORY_LABELS[event.category]}
        </span>
        {isMajor && (
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold border bg-primary/10 text-primary border-primary/20 uppercase tracking-wide">
            <Star className="h-2 w-2" />
            Major
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-foreground mb-1.5 leading-snug">
        {event.title}
      </h3>

      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
        {event.description}
      </p>

      {/* Metadata pills */}
      {(event.metadata.context_window || event.metadata.modalities.length > 0) && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {event.metadata.context_window && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-accent/60 text-muted-foreground border border-border/50">
              {event.metadata.context_window.toLocaleString()} ctx tokens
            </span>
          )}
          {event.metadata.modalities.map((m) => (
            <span
              key={m}
              className="text-[10px] px-2 py-0.5 rounded bg-accent/60 text-muted-foreground border border-border/50 capitalize"
            >
              {m}
            </span>
          ))}
        </div>
      )}

      {/* Tags + link */}
      <div className="flex flex-wrap items-center gap-1.5">
        {event.tags.slice(0, 4).map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="text-[10px] px-1.5 py-0 h-4 bg-accent/50 text-muted-foreground border-0"
          >
            {tag}
          </Badge>
        ))}
        {event.source_url && event.source_url !== "https://www.anthropic.com" && (
          <a
            href={event.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors shrink-0"
          >
            <ExternalLink className="h-3 w-3" />
            Source
          </a>
        )}
      </div>
    </div>
  );
}

export default function TimelineClient({ initialEvents }: { initialEvents: TimelineEvent[] }) {
  const sortedEvents = useMemo(() => {
    return [...initialEvents].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [initialEvents]);

  const years = useMemo(() => {
    return [...new Set(sortedEvents.map((e) => new Date(e.date).getFullYear()))].sort((a, b) => b - a);
  }, [sortedEvents]);

  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");

  const filtered = useMemo(() => {
    if (activeFilter === "all") return sortedEvents;
    return sortedEvents.filter((e) => e.category === activeFilter);
  }, [activeFilter, sortedEvents]);

  const filteredYears = useMemo(() => {
    const present = new Set(filtered.map((e) => new Date(e.date).getFullYear()));
    return years.filter((y) => present.has(y));
  }, [filtered]);

  const eventsByYear = useMemo(() => {
    const map: Record<number, TimelineEvent[]> = {};
    for (const event of filtered) {
      const year = new Date(event.date).getFullYear();
      if (!map[year]) map[year] = [];
      map[year].push(event);
    }
    return map;
  }, [filtered]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-10">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Anthropic Claude Release Timeline
            </h1>
            <p className="text-sm text-muted-foreground">
              Every model release, feature launch, research paper, and milestone in Anthropic&apos;s
              history —{" "}
              <span className="text-foreground">{sortedEvents.length} events</span> from 2021 to today.
            </p>
          </div>

          {/* Category filter pills — horizontally scrollable on mobile */}
          <div className="flex flex-wrap gap-1.5 mb-8">
            {FILTER_OPTIONS.map((opt) => {
              const count =
                opt.value === "all"
                  ? sortedEvents.length
                  : sortedEvents.filter((e) => e.category === opt.value).length;
              const isActive = activeFilter === opt.value;
              const catStyle =
                opt.value !== "all" ? CATEGORY_STYLES[opt.value as EventCategory] : null;
              return (
                <button
                  key={opt.value}
                  onClick={() => setActiveFilter(opt.value)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-md border transition-colors whitespace-nowrap ${isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/30"
                    }`}
                >
                  {catStyle && (
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-primary-foreground" : catStyle.dot}`}
                    />
                  )}
                  {opt.label}
                  <span
                    className={`text-[10px] ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No events in this category.
            </div>
          )}

          {/* Timeline */}
          <div className="max-w-3xl">
            {filteredYears.map((year) => {
              const eventsForYear = eventsByYear[year];
              const count = eventsForYear.length;

              return (
                <div key={year} className="mb-10">
                  {/* Year heading */}
                  <div className="flex items-center gap-2 mb-5">
                    <span className="text-sm font-bold text-foreground">{year}</span>
                    <span className="text-xs text-muted-foreground">· {count} events</span>
                    <div className="flex-1 h-px bg-border ml-1" />
                  </div>

                  {/* Left-aligned timeline */}
                  <div className="relative pl-5">
                    <div className="absolute left-[8px] top-0 bottom-6 w-px bg-border" />
                    {eventsForYear.map((event) => {
                      const dot = CATEGORY_STYLES[event.category].dot;
                      return (
                        <div key={event.id} className="group relative flex gap-4 pb-6">
                          <div className="flex-shrink-0 -ml-[13px] mt-[18px] z-10">
                            <div
                              className={`h-2.5 w-2.5 rounded-full ${dot} ring-[3px] ring-background transition-transform group-hover:scale-125`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <EventCardContent event={event} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          {filtered.length > 0 && (
            <p className="text-xs text-muted-foreground mt-4 max-w-3xl">
              Based on publicly available Anthropic announcements. Dates reflect original release
              dates. Curated by{" "}
              <Link href="/" className="text-primary hover:underline">
                claudeai.directory
              </Link>
              .
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
