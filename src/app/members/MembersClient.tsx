"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Search, Users } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { useMembers, type MembersResponse } from "@/hooks/use-members";
import { useAuth } from "@/lib/auth";
import type { PublicProfile } from "@/types";

const PAGE_SIZE = 60;
const PUBLIC_PREVIEW_SIZE = 12;

// Muted, warm-leaning hues for letter avatars; picked by a stable hash of the username.
const AVATAR_HUES = [14, 32, 48, 95, 160, 195, 225, 265, 320];

function hueFor(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return AVATAR_HUES[h % AVATAR_HUES.length];
}

function Avatar({ member }: { member: PublicProfile }) {
  const [failed, setFailed] = useState(false);
  const label = (member.name || member.username).trim();
  if (member.avatar && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={member.avatar}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="h-10 w-10 shrink-0 rounded-lg border border-border object-cover"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[15px] font-medium text-white"
      style={{ backgroundColor: `hsl(${hueFor(member.username)} 42% 42%)` }}
    >
      {label[0]?.toUpperCase()}
    </span>
  );
}

function MemberCard({ member }: { member: PublicProfile }) {
  return (
    <Link
      href={`/u/${member.username}`}
      className="flex items-center gap-3 rounded-xl border border-border bg-card/40 p-3 transition-colors hover:border-[var(--cad-line-hover)] hover:bg-card"
    >
      <Avatar member={member} />
      <span className="min-w-0">
        <span className="block truncate text-[14px] text-foreground">{member.name || member.username}</span>
        <span className="block truncate font-mono text-[12px] text-muted-foreground">@{member.username}</span>
      </span>
    </Link>
  );
}

function MemberCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border p-3">
      <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-2.5 w-20" />
      </div>
    </div>
  );
}

type Sort = "recent" | "name";

export default function MembersClient({ initialData }: { initialData: MembersResponse | null }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("recent");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const isPreview = !isAuthenticated;
  const pageSize = isPreview ? PUBLIC_PREVIEW_SIZE : PAGE_SIZE;
  const memberQueryParams = useMemo(() => ({ per_page: isPreview ? PUBLIC_PREVIEW_SIZE : 200 }), [isPreview]);

  const { data, isLoading } = useMembers(memberQueryParams, { initialData: isPreview ? initialData ?? undefined : undefined });
  const members = useMemo(() => data?.members ?? [], [data?.members]);
  const total = data?.total ?? members.length;

  const filtered = useMemo(() => {
    const q = isPreview ? "" : search.trim().toLowerCase();
    const list = q
      ? members.filter(
          (m) =>
            m.username.toLowerCase().includes(q) ||
            m.name?.toLowerCase().includes(q) ||
            m.bio?.toLowerCase().includes(q),
        )
      : members;
    // The API already returns newest first.
    return !isPreview && sort === "name"
      ? [...list].sort((a, b) => (a.name || a.username).localeCompare(b.name || b.username))
      : list;
  }, [isPreview, members, search, sort]);

  const shown = filtered.slice(0, isPreview ? PUBLIC_PREVIEW_SIZE : visible);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-[1120px] px-5 pb-24 pt-14 sm:px-6 md:px-8 md:pt-16">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[clamp(36px,5vw,52px)] font-normal leading-[1.05] text-foreground">Members</h1>
            <p className="mt-3 text-[16px] text-muted-foreground">
              {isPreview
                ? "Preview a few Claude builders. Sign in to browse the full community."
                : `${total > 0 ? total.toLocaleString() : "People"} people building with Claude and sharing what they make.`}
            </p>
          </div>
          {isPreview && !isAuthLoading && (
            <Link
              href="/login"
              className="inline-flex h-10 shrink-0 items-center self-start rounded-full border border-border px-4 text-sm text-foreground transition-colors hover:border-[var(--cad-line-hover)]"
            >
              Sign in to see all members
            </Link>
          )}
        </div>

        {!isPreview && (
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <label className="relative block flex-1 sm:max-w-[520px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setVisible(pageSize);
                }}
                placeholder={members.length > 0 ? `Search ${members.length.toLocaleString()} members by name...` : "Search members by name..."}
                aria-label="Search members"
                className="h-11 w-full rounded-full border border-border bg-card pl-11 pr-4 text-[14px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-[var(--cad-line-hover)]"
              />
            </label>
            <label className="relative block sm:w-44">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                aria-label="Sort members"
                className="h-11 w-full appearance-none rounded-full border border-border bg-card pl-4 pr-10 text-[14px] text-foreground outline-none transition-colors focus:border-[var(--cad-line-hover)]"
              >
                <option value="recent">Recent</option>
                <option value="name">Name A to Z</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </label>
          </div>
        )}

        <div className={isPreview ? "mt-10" : "mt-6"}>
          {isLoading && !data ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 18 }).map((_, i) => (
                <MemberCardSkeleton key={i} />
              ))}
            </div>
          ) : shown.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {shown.map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>
              {isPreview && total > shown.length && (
                <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-border bg-card/40 px-4 py-6 text-center">
                  <p className="max-w-[48ch] text-sm leading-6 text-muted-foreground">
                    Showing {shown.length} of {total.toLocaleString()} members. Sign in to browse every profile and find collaborators.
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    See all members
                  </Link>
                </div>
              )}
              {!isPreview && filtered.length > visible && (
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisible((v) => v + pageSize)}
                    className="h-9 rounded-full border border-border px-5 text-sm text-muted-foreground transition-colors hover:border-[var(--cad-line-hover)] hover:text-foreground"
                  >
                    Show more
                    <span className="ml-2 font-mono text-[11px]">{filtered.length - visible}</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-24 text-center">
              <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">{search ? "No members match your search." : "No members yet."}</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
