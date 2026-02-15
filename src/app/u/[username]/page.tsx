"use client";

import { use } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/hooks/use-users";
import { useAuth } from "@/lib/auth";
import { CalendarDays, ArrowLeft } from "lucide-react";

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const { profile, isLoading, error } = useUserProfile(username);
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium text-foreground mb-2">
              User not found
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              The profile you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const memberSince = new Date(profile.created_at).toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    }
  );

  const isOwnProfile = user?.username === profile.username;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-lg p-8">
          <div className="flex items-center gap-8">
            <Avatar className="h-24 w-24 shrink-0">
              {profile.avatar && (
                <AvatarImage
                  src={profile.avatar}
                  alt={profile.name ?? profile.username}
                />
              )}
              <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                {profile.name?.[0]?.toUpperCase() ??
                  profile.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold text-foreground">
                {profile.name ?? profile.username}
              </h1>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>

              {profile.bio && (
                <p className="mt-2 text-sm text-foreground/80 leading-relaxed">
                  {profile.bio}
                </p>
              )}

              <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Member since {memberSince}</span>
              </div>
            </div>

            {isOwnProfile && (
              <Button variant="outline" size="sm" className="shrink-0" asChild>
                <Link href="/dashboard">Edit profile</Link>
              </Button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
