"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SetupProfile() {
  const { user, isAuthenticated, isLoading, updateProfile } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [availability, setAvailability] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user?.username]);

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

      // If same as current username, no need to check
      if (user?.username && clean === user.username.toLowerCase()) {
        setAvailability("available");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (availability !== "available" && availability !== "idle") return;

    setSaving(true);
    try {
      await updateProfile({
        username: username.trim().toLowerCase(),
        bio: bio.trim() || undefined,
      });
      toast.success("Profile set up!");
      router.push("/dashboard");
    } catch {
      toast.error("Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex items-center justify-center py-32">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Set up your profile
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Choose a username and tell the community about yourself.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <Input
                  id="username"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder="your-username"
                  maxLength={30}
                  autoFocus
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
              <p className="text-xs text-muted-foreground">
                {availability === "taken" && "This username is already taken."}
                {availability === "invalid" &&
                  "3-30 characters, letters, numbers, hyphens, and underscores."}
                {availability === "available" && "Username is available!"}
                {(availability === "idle" || availability === "checking") &&
                  "Lowercase letters, numbers, hyphens, and underscores."}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the community a bit about yourself..."
                rows={3}
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground text-right">
                {bio.length}/300
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="submit"
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
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save & Continue"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/dashboard")}
              >
                Skip for now
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
