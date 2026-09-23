"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Megaphone, Pause, Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  sideAdCollections,
  sideAdSponsorHref,
  type SideAdPlacement,
  type SideAdRail,
} from "@/data/sideAdPlacements";
import { cn } from "@/lib/utils";

const ROTATION_MS = 10000;

function SideMcpCard({ placement, index }: { placement: SideAdPlacement; index: number }) {
  const isAvailable = placement.slotType === "available";
  const badgeText = isAvailable ? "Open slot" : placement.label === "Reference" ? "Reference" : "Anchor";

  return (
    <Link
      href={placement.href}
      className={cn(
        "side-ad-flip-card pointer-events-auto group flex min-h-[104px] flex-1 basis-0 flex-col items-center justify-center rounded-md border px-2.5 py-2 text-center shadow-sm transition duration-300 hover:-translate-y-0.5 min-[1760px]:px-3 min-[1760px]:py-2.5 min-[1900px]:px-4",
        placement.tone.panel,
      )}
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div
        aria-label={isAvailable ? `${placement.name} icon` : `${placement.name} logo`}
        className={cn(
          "relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md text-xs font-bold min-[1760px]:h-10 min-[1760px]:w-10 min-[1760px]:text-sm min-[1900px]:h-12 min-[1900px]:w-12 min-[1900px]:text-base",
          isAvailable ? "shadow-none" : "shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]",
          placement.tone.icon,
        )}
      >
        <span aria-hidden="true">{placement.initial}</span>
        {placement.logoDomain ? (
          // eslint-disable-next-line @next/next/no-img-element -- tiny dynamic favicon with inline fallback handling
          <img
            src={`https://www.google.com/s2/favicons?domain=${placement.logoDomain}&sz=64`}
            alt=""
            className="absolute inset-1.5 h-[calc(100%-12px)] w-[calc(100%-12px)] rounded-sm object-contain"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : null}
      </div>
      <div className="mt-2 min-w-0 max-w-full">
        <div className="flex min-w-0 flex-col items-center gap-1">
          <p className="max-w-full truncate text-xs font-semibold leading-tight min-[1760px]:text-sm min-[1900px]:text-base">
            {placement.name}
          </p>
          <span
            className={cn(
              "hidden shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em] opacity-80 min-[1900px]:inline-flex min-[1900px]:px-2 min-[1900px]:text-[9px]",
              placement.tone.badge,
            )}
          >
            {badgeText}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-[10px] leading-snug opacity-72 min-[1760px]:text-xs">
          {placement.headline}
        </p>
        <p className="mt-1.5 hidden truncate text-[9px] font-medium uppercase tracking-[0.08em] opacity-55 min-[1900px]:block">
          {placement.eyebrow}
        </p>
      </div>
    </Link>
  );
}

function SideStack({
  rail,
  side,
  paused,
  onPause,
  onFocusChange,
}: {
  rail: SideAdRail;
  side: "left" | "right";
  paused: boolean;
  onPause: () => void;
  onFocusChange: (focused: boolean) => void;
}) {
  return (
    <aside
      aria-label={`ClaudeAI Directory ${side} ${rail.title} sponsor placements`}
      onFocusCapture={() => onFocusChange(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onFocusChange(false);
      }}
      className={cn(
        "side-ad-rail-surface pointer-events-none fixed inset-y-0 z-[60] hidden w-[187px] border-white/10 shadow-[0_0_70px_rgba(0,0,0,0.32)] min-[1500px]:block min-[1600px]:w-[242px] min-[1760px]:w-[352px] min-[1900px]:w-[429px] min-[2000px]:w-[484px] min-[2200px]:w-[572px]",
        side === "left" ? "left-0 border-r" : "right-0 border-l",
      )}
    >
      <div className="flex h-full flex-col gap-2 p-2 min-[1760px]:gap-2.5 min-[1760px]:p-3 min-[1900px]:gap-3 min-[1900px]:p-4">
        <div
          key={`header-${rail.title}`}
          className="pointer-events-auto side-ad-flip-card shrink-0 px-2 py-2 text-center min-[1760px]:px-3 min-[1760px]:py-3 min-[1900px]:px-4 min-[1900px]:py-4"
        >
          <p className="text-balance text-sm font-semibold leading-tight text-white/82 min-[1760px]:text-base min-[1900px]:text-xl">
            {rail.title}
          </p>
        </div>
        {rail.placements.map((placement, index) => (
          <SideMcpCard key={`${rail.title}-${placement.id}`} placement={placement} index={index} />
        ))}
        <div className="pointer-events-auto flex shrink-0 items-center justify-center gap-2">
          {side === "right" ? (
            <button
              type="button"
              onClick={onPause}
              aria-label={paused ? "Resume sponsor rotation" : "Pause sponsor rotation"}
              title={paused ? "Resume sponsor rotation" : "Pause sponsor rotation"}
              aria-pressed={paused}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-white/20 text-white focus-visible:outline-2 focus-visible:outline-white"
            >
              {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            </button>
          ) : null}
          <a
            href={sideAdSponsorHref}
            className="pointer-events-auto mx-auto flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-white/12 bg-white/8 px-2.5 py-1.5 text-[10px] font-medium text-white/64 shadow-sm backdrop-blur transition hover:border-white/20 hover:bg-white/12 hover:text-white min-[1760px]:text-xs"
          >
            <Megaphone className="h-3 w-3" aria-hidden="true" />
            Advertise
          </a>
        </div>
      </div>
    </aside>
  );
}

export default function SideAdBillboards() {
  const pathname = usePathname();
  const [activePage, setActivePage] = useState(0);
  const [paused, setPaused] = useState(false);
  const [railFocused, setRailFocused] = useState(false);
  const shouldHide = pathname === "/advertise" || pathname.startsWith("/advertise/");

  useEffect(() => {
    if (shouldHide) {
      return;
    }

    document.body.classList.add("side-ads-active");

    return () => {
      document.body.classList.remove("side-ads-active");
    };
  }, [shouldHide]);

  useEffect(() => {
    if (sideAdCollections.length < 2 || shouldHide || paused || railFocused) {
      return;
    }

    const interval = window.setInterval(() => {
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setActivePage((page) => (page + 1) % sideAdCollections.length);
      }
    }, ROTATION_MS);

    return () => window.clearInterval(interval);
  }, [shouldHide, paused, railFocused]);

  const activeCollection = useMemo(
    () => sideAdCollections[activePage % sideAdCollections.length] ?? sideAdCollections[0],
    [activePage],
  );

  if (shouldHide) {
    return null;
  }

  return (
    <>
      <SideStack
        rail={activeCollection.left}
        side="left"
        paused={paused}
        onPause={() => setPaused((value) => !value)}
        onFocusChange={setRailFocused}
      />
      <SideStack
        rail={activeCollection.right}
        side="right"
        paused={paused}
        onPause={() => setPaused((value) => !value)}
        onFocusChange={setRailFocused}
      />
    </>
  );
}
