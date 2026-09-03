"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMembers, type MembersResponse } from "@/hooks/use-members";
import { useAuth } from "@/lib/auth";
import { Users, Lock } from "lucide-react";
import type { PublicProfile } from "@/types";

function MemberCard({
  member,
  blurred,
  teased,
}: {
  member: PublicProfile;
  blurred?: boolean;
  /** Real content, softened and non-interactive — the row behind the gate. */
  teased?: boolean;
}) {
  const displayName = member.name || member.username;
  const initials = displayName.slice(0, 2).toUpperCase();

  const inner = (
    <div
      className={`flex items-center gap-3 rounded-[10px] border border-border bg-card p-3 transition-colors group ${
        blurred || teased
          ? "select-none pointer-events-none"
          : "hover:border-[var(--cad-line-hover)] cursor-pointer"
      }`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--cad-chip)] text-[12px] font-semibold text-[var(--cad-accent-hover)]">
        {member.avatar && !blurred ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={member.avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </span>
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold text-foreground">
          {displayName}
        </p>
        {member.bio && !blurred && (
          <p className="truncate text-[12px] leading-[1.4] text-muted-foreground">{member.bio}</p>
        )}
        {blurred && (
          <p className="text-[12px] text-muted-foreground">@{member.username}</p>
        )}
      </div>
    </div>
  );

  if (blurred || teased) return inner;
  return (
    <Link href={`/u/${member.username}`} className="block">
      {inner}
    </Link>
  );
}

function MemberCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 border border-border rounded-[10px]">
      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-2.5 w-20" />
      </div>
    </div>
  );
}

// Two rows fully visible, then one row of real people softened behind the gate
// so it reads as "there are more" rather than ending in grey placeholders.
const VISIBLE_COUNT = 8;
const TEASE_COUNT = 4;

export default function MembersClient({
  initialData,
}: {
  initialData: MembersResponse | null;
}) {
  const [search, setSearch] = useState("");
  const { isAuthenticated } = useAuth();
  const isUnlocked = isAuthenticated;

  const { data, isLoading } = useMembers(
    { per_page: 200 },
    { initialData: initialData ?? undefined }
  );

  const members = useMemo(() => data?.members ?? [], [data?.members]);
  const total = data?.total ?? 0;

  const filtered = useMemo(() => {
    if (!search.trim()) return members;
    const q = search.toLowerCase();
    return members.filter(
      (m) =>
        m.username.toLowerCase().includes(q) ||
        m.name?.toLowerCase().includes(q) ||
        m.bio?.toLowerCase().includes(q) ||
        m.github?.toLowerCase().includes(q) ||
        m.twitter?.toLowerCase().includes(q)
    );
  }, [members, search]);

  // Split into visible + locked sections
  const visibleMembers = isUnlocked ? filtered : filtered.slice(0, VISIBLE_COUNT);
  const teasedMembers = isUnlocked
    ? []
    : filtered.slice(VISIBLE_COUNT, VISIBLE_COUNT + TEASE_COUNT);
  const lockedMembers = isUnlocked ? [] : filtered.slice(VISIBLE_COUNT);

  return (
    <div className="cad-shell flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[1180px] px-8 pb-[88px] pt-[60px]">

          {/* Page header */}
          <div className="mb-[34px] flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-[clamp(32px,4vw,42px)] font-medium leading-[1.08]">
                Members
              </h1>
              <p className="mt-3 max-w-[62ch] text-base leading-[1.6] text-muted-foreground">
                {total > 0
                  ? `${total.toLocaleString()} people submit, review and maintain what's listed here.`
                  : "People submit, review and maintain what's listed here."}
              </p>
            </div>
            {!isUnlocked && (
              <Button asChild size="sm" className="shrink-0">
                <Link href="/login">Join the community</Link>
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="mb-8 border-b border-border">
            <input
              type="text"
              placeholder="Search members"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            />
          </div>

          {/* Grid */}
          {isLoading && !initialData ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 18 }).map((_, i) => (
                <MemberCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="relative">
              {/* Visible members */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleMembers.map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>

              {/* Locked section — one softened row of real members, fading into the CTA */}
              {lockedMembers.length > 0 && (
                <div className="relative mt-3">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none select-none blur-[3px] opacity-70"
                    style={{
                      maskImage:
                        "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0) 100%)",
                      WebkitMaskImage:
                        "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0) 100%)",
                    }}
                  >
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {teasedMembers.map((member) => (
                        <MemberCard key={member.id} member={member} teased />
                      ))}
                    </div>
                  </div>

                  {/* CTA sits under the fade rather than covering the faces */}
                  <div className="-mt-6 flex justify-center">
                    <div className="w-full max-w-sm rounded-[10px] border border-border bg-card px-8 py-6 text-center shadow-xl">
                      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Lock className="h-5 w-5 text-primary" />
                      </div>
                      <p className="mb-1 text-sm font-semibold text-foreground">
                        {lockedMembers.length.toLocaleString()} more {lockedMembers.length === 1 ? "member" : "members"}
                      </p>
                      <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
                        Sign in to browse all profiles and connect with the community.
                      </p>
                      <Button asChild size="sm" className="w-full">
                        <Link href="/login">Sign in to unlock</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {search && filtered.length !== members.length && (
                <p className="text-xs text-muted-foreground mt-5">
                  Showing {filtered.length} of {members.length} members
                </p>
              )}
            </div>
          ) : (
            <div className="py-24 text-center">
              <Users className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {search ? "No members match your search." : "No members yet."}
              </p>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
