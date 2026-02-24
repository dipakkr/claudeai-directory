"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMembers, type MembersResponse } from "@/hooks/use-members";
import { useAuth } from "@/lib/auth";
import { Users, Lock } from "lucide-react";
import type { PublicProfile } from "@/types";

const FALLBACK_COLORS = [
  "bg-violet-500",
  "bg-pink-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-indigo-500",
  "bg-teal-500",
];

function avatarColor(username: string) {
  let n = 0;
  for (let i = 0; i < username.length; i++) n += username.charCodeAt(i);
  return FALLBACK_COLORS[n % FALLBACK_COLORS.length];
}

function MemberCard({ member, blurred }: { member: PublicProfile; blurred?: boolean }) {
  const displayName = member.name || member.username;
  const initials = displayName.slice(0, 2).toUpperCase();
  const color = avatarColor(member.username);

  const inner = (
    <div
      className={`flex items-center gap-3 px-4 py-3 border border-border rounded-lg transition-all group ${
        blurred
          ? "select-none pointer-events-none"
          : "hover:border-primary/40 hover:bg-accent/30 cursor-pointer"
      }`}
    >
      <Avatar className="h-10 w-10 shrink-0 rounded-md">
        {member.avatar && !blurred && (
          <AvatarImage src={member.avatar} alt={displayName} className="rounded-md object-cover" />
        )}
        <AvatarFallback className={`rounded-md text-xs font-bold text-white ${color}`}>
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
          {displayName}
        </p>
        {member.bio && !blurred && (
          <p className="text-[11px] text-muted-foreground truncate">{member.bio}</p>
        )}
        {blurred && (
          <p className="text-[11px] text-muted-foreground">@{member.username}</p>
        )}
      </div>
    </div>
  );

  if (blurred) return inner;
  return (
    <Link href={`/u/${member.username}`} className="block">
      {inner}
    </Link>
  );
}

function MemberCardSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border border-border rounded-lg">
      <Skeleton className="h-10 w-10 rounded-md shrink-0" />
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-2.5 w-20" />
      </div>
    </div>
  );
}

// How many members to show clearly before blurring
const VISIBLE_COUNT = 12;

export default function MembersClient({
  initialData,
}: {
  initialData: MembersResponse | null;
}) {
  const [search, setSearch] = useState("");
  const { isAuthenticated } = useAuth();

  const { data, isLoading } = useMembers(
    { per_page: 200 },
    { initialData: initialData ?? undefined }
  );

  const members = data?.members ?? [];
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
  const visibleMembers = isAuthenticated ? filtered : filtered.slice(0, VISIBLE_COUNT);
  const lockedMembers = isAuthenticated ? [] : filtered.slice(VISIBLE_COUNT);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-12 max-w-7xl">

          {/* Page header */}
          <div className="flex items-start justify-between mb-10">
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-1">
                Browse Members
              </h1>
              <p className="text-sm text-muted-foreground">
                {total > 0
                  ? `${total.toLocaleString()} members in the Claude community.`
                  : "The Claude AI community — builders, researchers, and enthusiasts."}
              </p>
            </div>
            {!isAuthenticated && (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {Array.from({ length: 18 }).map((_, i) => (
                <MemberCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="relative">
              {/* Visible members */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {visibleMembers.map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>

              {/* Blurred locked members */}
              {lockedMembers.length > 0 && (
                <div className="relative mt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 blur-sm pointer-events-none select-none opacity-60">
                    {lockedMembers.slice(0, 16).map((member) => (
                      <MemberCard key={member.id} member={member} blurred />
                    ))}
                  </div>

                  {/* Gradient fade + CTA overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div className="bg-background/90 border border-border rounded-2xl px-8 py-6 text-center shadow-xl backdrop-blur-sm max-w-sm">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mx-auto mb-3">
                        <Lock className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-sm font-semibold text-foreground mb-1">
                        {lockedMembers.length + VISIBLE_COUNT} members and counting
                      </p>
                      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                        Sign in to see all members, visit profiles, and connect with the community.
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
