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

export default function Dashboard() {
  const { user, isAuthenticated, isLoading, updateProfile } = useAuth();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-10 max-w-2xl">
          {/* Profile */}
          <div className="flex items-start justify-between mb-10">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                {user.avatar && (
                  <AvatarImage
                    src={user.avatar}
                    alt={user.name ?? user.username}
                  />
                )}
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {user.name?.[0]?.toUpperCase() ??
                    user.username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {user.name ?? user.username}
                </h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Badge variant="secondary" className="mt-1 text-[10px]">
                  {user.plan ?? "free"} plan
                </Badge>
              </div>
            </div>
            {!editing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditing(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            )}
          </div>

          {/* Edit form */}
          {editing && (
            <div className="rounded-lg border border-border p-5 mb-8 space-y-4">
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

              <div className="flex items-center gap-2">
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
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
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

          {/* Bio display when not editing */}
          {!editing && user.bio && (
            <p className="text-sm text-muted-foreground mb-8 -mt-4">
              {user.bio}
            </p>
          )}

          {/* Public profile link */}
          <Link
            href={`/u/${user.username}`}
            className="inline-block text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            View public profile &rarr;
          </Link>

          {/* Links */}
          <div className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-accent/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <link.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{link.label}</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
