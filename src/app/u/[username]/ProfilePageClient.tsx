"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { CalendarDays, ArrowLeft, Globe, Github, Twitter, Pencil, ArrowRight } from "lucide-react";
import type { PublicProfile } from "@/types";

const BANNER_COLORS = [
  "from-violet-500/20 to-purple-500/5",
  "from-sky-500/20 to-blue-500/5",
  "from-emerald-500/20 to-teal-500/5",
  "from-rose-500/20 to-pink-500/5",
  "from-amber-500/20 to-orange-500/5",
  "from-indigo-500/20 to-violet-500/5",
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
  username,
  initialProfile,
}: {
  username: string;
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
            {isOwnProfile ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Add your bio, website, and social links to complete your profile.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard">
                    Complete profile
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
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
