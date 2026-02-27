"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Bookmark,
  MessageSquare,
  Wrench,
  Server,
  FileText,
  Briefcase,
  Rocket,
  BookOpen,
  ArrowRight,
  Newspaper,
  Pencil,
  Check,
  X,
  Loader2,
  CalendarDays,
  Globe,
  Github,
  Twitter,
} from "lucide-react";
import { toast } from "sonner";

const links = [
  { href: "/feed", label: "Feed", icon: Newspaper },
  { href: "/community", label: "Discussions", icon: MessageSquare },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/skills", label: "Skills", icon: Wrench },
  { href: "/mcp", label: "MCP Servers", icon: Server },
  { href: "/prompts", label: "Prompts", icon: FileText },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/showcase", label: "Showcase", icon: Rocket },
  { href: "/learn", label: "Learn", icon: BookOpen },
];

const BANNER_COLORS = [
  "from-violet-500/20 to-purple-500/5",
  "from-sky-500/20 to-blue-500/5",
  "from-emerald-500/20 to-teal-500/5",
  "from-rose-500/20 to-pink-500/5",
  "from-amber-500/20 to-orange-500/5",
  "from-indigo-500/20 to-violet-500/5",
];

function bannerGradient(username: string) {
  if (!username) return BANNER_COLORS[0];
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
  if (!username) return AVATAR_COLORS[0];
  let n = 0;
  for (let i = 0; i < username.length; i++) n += username.charCodeAt(i);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

export default function Dashboard() {
  const { user, isAuthenticated, isLoading, updateProfile } = useAuth();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [github, setGithub] = useState("");
  const [saving, setSaving] = useState(false);
  const [availability, setAvailability] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setBio(user.bio ?? "");
      setWebsite(user.website ?? "");
      setTwitter(user.twitter ?? "");
      setGithub(user.github ?? "");
    }
  }, [user]);

  const checkUsername = useCallback(
    (value: string) => {
      const clean = value.trim().toLowerCase();

      if (clean.length < 3 || clean.length > 30) {
        setAvailability("invalid");
        return;
      }
      if (!/^[a-z0-9][a-z0-9_-]*$/.test(clean)) {
        setAvailability("invalid");
        return;
      }
      if (user?.username && clean === user.username.toLowerCase()) {
        setAvailability("idle");
        return;
      }

      setAvailability("checking");
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(async () => {
        try {
          const res = await api.get<{ available: boolean }>(
            `/auth/check-username/${clean}`
          );
          setAvailability(res.available ? "available" : "taken");
        } catch {
          setAvailability("idle");
        }
      }, 400);
    },
    [user?.username]
  );

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    setUsername(value);
    if (value.length > 0) {
      checkUsername(value);
    } else {
      setAvailability("idle");
    }
  };

  const handleSave = async () => {
    if (availability === "taken" || availability === "invalid" || availability === "checking") return;

    setSaving(true);
    try {
      await updateProfile({
        username: username.trim().toLowerCase(),
        bio: bio.trim() || undefined,
        website: website.trim() || undefined,
        twitter: twitter.trim().replace(/^@/, "") || undefined,
        github: github.trim().replace(/^@/, "") || undefined,
      });
      setEditing(false);
      setAvailability("idle");
      toast.success("Profile updated");
    } catch {
      toast.error("Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setUsername(user.username);
      setBio(user.bio ?? "");
      setWebsite(user.website ?? "");
      setTwitter(user.twitter ?? "");
      setGithub(user.github ?? "");
    }
    setAvailability("idle");
    setEditing(false);
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  const displayName = user.name ?? user.username;
  const initials = displayName.slice(0, 2).toUpperCase();
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
    : "Unknown";

  const gradient = bannerGradient(user.username);
  const color = avatarColor(user.username);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pb-16">
        {/* Banner */}
        <div className={`h-36 w-full bg-gradient-to-br ${gradient} border-b border-border`} />

        <div className="container max-w-3xl">
          {/* Avatar row — overlaps banner */}
          <div className="flex items-end justify-between -mt-12 mb-4 px-1">
            <Avatar className="h-24 w-24 ring-4 ring-background rounded-full shrink-0">
              {user.avatar && (
                <AvatarImage src={user.avatar} alt={displayName} className="object-cover" />
              )}
              <AvatarFallback className={`text-2xl font-bold text-white ${color}`}>
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex items-center gap-2 mb-1">
              {!editing && (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  Edit profile
                </Button>
              )}
            </div>
          </div>

          {/* Name + handle + badge */}
          <div className="px-1 mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground leading-tight">
                {displayName}
              </h1>
              <div className="flex items-center gap-3 mt-0.5">
                <p className="text-sm text-muted-foreground">@{user.username}</p>
                <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                  {user.plan ?? "free"} plan
                </Badge>
              </div>
            </div>
          </div>

          {/* Bio display when not editing */}
          {!editing && user.bio && (
            <p className="px-1 text-sm text-foreground/80 leading-relaxed mb-4 max-w-xl">
              {user.bio}
            </p>
          )}

          {/* Social links display when not editing */}
          {!editing && (user.website || user.github || user.twitter) && (
            <div className="px-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-4">
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                >
                  <Globe className="h-4 w-4 shrink-0" />
                  {user.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </a>
              )}
              {user.github && (
                <a
                  href={`https://github.com/${user.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                >
                  <Github className="h-4 w-4 shrink-0" />
                  {user.github}
                </a>
              )}
              {user.twitter && (
                <a
                  href={`https://x.com/${user.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                >
                  <Twitter className="h-4 w-4 shrink-0" />
                  {user.twitter}
                </a>
              )}
            </div>
          )}

          {/* Joined date */}
          {!editing && (
            <div className="px-1 flex items-center gap-1 text-xs text-muted-foreground/50 mb-8">
              <CalendarDays className="h-3 w-3 shrink-0" />
              <span>Joined {memberSince}</span>
            </div>
          )}

          {/* Edit form */}
          {editing && (
            <div className="rounded-lg border border-border p-5 mb-8 space-y-4 max-w-xl mx-1 mt-6">
              <div className="space-y-2">
                <Label htmlFor="edit-username">Username</Label>
                <div className="relative">
                  <Input
                    id="edit-username"
                    value={username}
                    onChange={handleUsernameChange}
                    maxLength={30}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {availability === "checking" && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {availability === "available" && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                    {availability === "taken" && (
                      <X className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </div>
                {availability === "taken" && (
                  <p className="text-xs text-destructive">
                    This username is already taken.
                  </p>
                )}
                {availability === "invalid" && (
                  <p className="text-xs text-destructive">
                    3-30 characters, letters, numbers, hyphens, and underscores.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-bio">Bio</Label>
                <Textarea
                  id="edit-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the community about yourself..."
                  rows={3}
                  maxLength={300}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {bio.length}/300
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-website">Website</Label>
                <Input
                  id="edit-website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yoursite.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-twitter">Twitter / X</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
                    <Input
                      id="edit-twitter"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value.replace(/^@/, ""))}
                      placeholder="handle"
                      className="pl-7"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-github">GitHub</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
                    <Input
                      id="edit-github"
                      value={github}
                      onChange={(e) => setGithub(e.target.value.replace(/^@/, ""))}
                      placeholder="handle"
                      className="pl-7"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={
                    saving ||
                    availability === "taken" ||
                    availability === "invalid" ||
                    availability === "checking" ||
                    username.length < 3
                  }
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Links Grid */}
          {!editing && (
            <div className="mt-8 border-t border-border pt-8 px-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Dashboard Menu</h2>
                <Link
                  href={`/u/${user.username}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  View public profile <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-6 hover:bg-accent/50 hover:border-primary/20 transition-all group"
                  >
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <link.icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
