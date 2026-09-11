"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { BadgeCheck, CalendarDays, ArrowLeft, Globe, Github, Twitter, Pencil, ArrowRight, ExternalLink } from "lucide-react";
import type { PublicProfile } from "@/types";

// Warm banners that sit inside the site palette in both themes.
const BANNER_COLORS = [
  "from-[var(--cad-accent-soft)] to-secondary",
  "from-secondary to-[var(--cad-accent-soft)]",
  "from-[var(--cad-accent-soft)] to-background",
];

function bannerGradient(username: string) {
  let n = 0;
  for (let i = 0; i < username.length; i++) n += username.charCodeAt(i);
  return BANNER_COLORS[n % BANNER_COLORS.length];
}

const AVATAR_COLORS = [
  "bg-violet-500", "bg-pink-500", "bg-sky-500",
  "bg-emerald-500", "bg-amber-500", "bg-rose-500",
  "bg-indigo-500", "bg-teal-500",
];

function avatarColor(username: string) {
  let n = 0;
  for (let i = 0; i < username.length; i++) n += username.charCodeAt(i);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

export default function PublicProfilePage({
  initialProfile,
}: {
  initialProfile: PublicProfile | null;
}) {
  const { user } = useAuth();

  if (!initialProfile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium text-foreground mb-2">User not found</p>
            <p className="text-sm text-muted-foreground mb-6">
              The profile you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button variant="outline" asChild>
              <Link href="/members">
                <ArrowLeft className="h-4 w-4" />
                Back to members
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const profile = initialProfile;
  const isOwnProfile = user?.username === profile.username;
  const displayName = profile.name ?? profile.username;
  const initials = displayName.slice(0, 2).toUpperCase();
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const gradient = bannerGradient(profile.username);
  const color = avatarColor(profile.username);
  const listedApps = profile.apps ?? [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">

        {/* Banner */}
        <div className={`h-36 w-full bg-gradient-to-br ${gradient} border-b border-border`} />

        <div className="container max-w-3xl">

          {/* Avatar row — overlaps banner */}
          <div className="flex items-end justify-between -mt-12 mb-4 px-1">
            <Avatar className="h-24 w-24 ring-4 ring-background rounded-full shrink-0">
              {profile.avatar && (
                <AvatarImage src={profile.avatar} alt={displayName} className="object-cover" />
              )}
              <AvatarFallback className={`text-2xl font-bold text-white ${color}`}>
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex items-center gap-2 mb-1">
              {isOwnProfile ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit profile
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/members">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    All members
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Name + handle */}
          <div className="px-1 mb-4">
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {displayName}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">@{profile.username}</p>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="px-1 text-sm text-foreground/80 leading-relaxed mb-4 max-w-xl">
              {profile.bio}
            </p>
          )}

          {/* Social links */}
          {(profile.website || profile.github || profile.twitter) && (
            <div className="px-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-2">
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                >
                  <Globe className="h-4 w-4 shrink-0" />
                  {profile.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </a>
              )}
              {profile.github && (
                <a
                  href={`https://github.com/${profile.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                >
                  <Github className="h-4 w-4 shrink-0" />
                  {profile.github}
                </a>
              )}
              {profile.twitter && (
                <a
                  href={`https://x.com/${profile.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                >
                  <Twitter className="h-4 w-4 shrink-0" />
                  {profile.twitter}
                </a>
              )}
            </div>
          )}

          {/* Joined date — small, secondary */}
          <div className="px-1 flex items-center gap-1 text-xs text-muted-foreground/50 mb-8">
            <CalendarDays className="h-3 w-3 shrink-0" />
            <span>Joined {memberSince}</span>
          </div>

          {/* Divider */}
          <div className="border-t border-border px-1 pt-8 pb-16">
            {listedApps.length > 0 && (
              <section className="mb-10">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Listed apps</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Verified Claude AI Directory submissions from this member.
                    </p>
                  </div>
                  <Badge variant="secondary" className="hidden gap-1 rounded-md sm:inline-flex">
                    <BadgeCheck className="h-3 w-3" />
                    Badge verified
                  </Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {listedApps.map((app) => (
                    <Link
                      key={app.id}
                      href={`/showcase/${app.id}`}
                      className="rounded-[12px] border border-border bg-card p-4 transition-colors hover:border-primary/35"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-foreground">{app.title}</h3>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                            {app.tagline || app.description}
                          </p>
                        </div>
                        <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {app.category && (
                          <Badge variant="outline" className="rounded-md text-[10px]">
                            {app.category}
                          </Badge>
                        )}
                        {app.tech_stack?.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="rounded-md text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {isOwnProfile ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Add your bio, website, social links, or submit an app to complete your profile.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard">
                      Complete profile
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/showcase/submit">Submit app</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center">
                Member of the Claude AI community
              </p>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
