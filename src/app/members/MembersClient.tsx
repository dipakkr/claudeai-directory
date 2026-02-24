"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMembers, type MembersResponse } from "@/hooks/use-members";
import { Users } from "lucide-react";
import type { PublicProfile } from "@/types";

// Random-ish but stable pastel bg for letter avatars
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

function MemberRow({ member }: { member: PublicProfile }) {
  const displayName = member.name || member.username;
  const initials = displayName.slice(0, 2);
  const color = avatarColor(member.username);

  return (
    <Link
      href={`/u/${member.username}`}
      className="flex items-center gap-3 px-4 py-3 border border-border rounded-lg hover:border-primary/40 hover:bg-accent/30 transition-all group"
    >
      <Avatar className="h-10 w-10 shrink-0 rounded-md">
        {member.avatar && (
          <AvatarImage
            src={member.avatar}
            alt={displayName}
            className="rounded-md object-cover"
          />
        )}
        <AvatarFallback
          className={`rounded-md text-xs font-bold text-white ${color}`}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-mono text-foreground group-hover:text-primary transition-colors truncate">
        {displayName}
      </span>
    </Link>
  );
}

function MemberRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border border-border rounded-lg">
      <Skeleton className="h-10 w-10 rounded-md shrink-0" />
      <Skeleton className="h-3.5 w-32" />
    </div>
  );
}

export default function MembersClient({
  initialData,
}: {
  initialData: MembersResponse | null;
}) {
  const [search, setSearch] = useState("");

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
                  ? `Join the Claude community with ${total.toLocaleString()} members.`
                  : "The Claude AI community — builders, researchers, and enthusiasts."}
              </p>
            </div>
            <Button asChild size="sm" className="shrink-0">
              <Link href="/login">Join the community</Link>
            </Button>
          </div>

          {/* Search — borderless, full-width underline style */}
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
                <MemberRowSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {filtered.map((member) => (
                  <MemberRow key={member.id} member={member} />
                ))}
              </div>
              {search && filtered.length !== members.length && (
                <p className="text-xs text-muted-foreground mt-5">
                  Showing {filtered.length} of {members.length} members
                </p>
              )}
            </>
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
