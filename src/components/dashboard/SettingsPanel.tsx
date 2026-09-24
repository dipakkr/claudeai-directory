"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { countryOptions, PROFESSIONS } from "@/lib/profile-options";
import type { User } from "@/types";
import { PanelHeader } from "./Panels";

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary/60 focus:outline-none";

type Availability = "idle" | "checking" | "available" | "taken" | "invalid";

function initialForm(user: User) {
  return {
    username: user.username,
    bio: user.bio ?? "",
    profession: user.profession ?? "",
    profession_detail: user.profession_detail ?? "",
    country: user.country ?? "",
    website: user.website ?? "",
    twitter: user.twitter ?? "",
    github: user.github ?? "",
    linkedin: user.linkedin ?? "",
    email_notifications: user.email_notifications !== false,
  };
}

function withHttps(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return /^https?:\/\//i.test(trimmed) ? trimmed.replace(/^http:/i, "https:") : `https://${trimmed}`;
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 border-b border-border px-5 py-5 last:border-b-0 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-6">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function SettingsPanel({ user }: { user: User }) {
  const { updateProfile } = useAuth();
  const [form, setForm] = useState(() => initialForm(user));
  const [availability, setAvailability] = useState<Availability>("idle");
  const [saving, setSaving] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);
  const countries = useMemo(() => countryOptions(), []);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }));
  const dirty = JSON.stringify(form) !== JSON.stringify(initialForm(user));

  const checkUsername = useCallback(
    (value: string) => {
      if (debounce.current) clearTimeout(debounce.current);
      if (value.length < 3 || value.length > 30 || !/^[a-z0-9][a-z0-9_-]*$/.test(value)) {
        setAvailability("invalid");
        return;
      }
      if (value === user.username.toLowerCase()) {
        setAvailability("idle");
        return;
      }
      setAvailability("checking");
      debounce.current = setTimeout(async () => {
        try {
          const res = await api.get<{ available: boolean }>(`/auth/check-username/${value}`);
          setAvailability(res.available ? "available" : "taken");
        } catch {
          setAvailability("idle");
        }
      }, 400);
    },
    [user.username],
  );

  const blocked = ["taken", "invalid", "checking"].includes(availability);

  const save = async () => {
    if (blocked) return;
    if (form.profession === "Other" && form.profession_detail.trim().length < 2) {
      toast.error("Add your role");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        username: form.username,
        bio: form.bio.trim(),
        profession: form.profession || undefined,
        profession_detail: form.profession === "Other" ? form.profession_detail.trim() : undefined,
        country: form.country || undefined,
        website: withHttps(form.website) ?? "",
        twitter: form.twitter.trim().replace(/^@/, ""),
        github: form.github.trim().replace(/^@/, ""),
        linkedin: withHttps(form.linkedin) ?? "",
        email_notifications: form.email_notifications,
      });
      setAvailability("idle");
      toast.success("Profile saved");
    } catch (error) {
      const detail = error instanceof ApiError ? (error.data as { detail?: unknown })?.detail : undefined;
      toast.error(
        typeof detail === "string" ? detail : Array.isArray(detail) ? "Check your links. LinkedIn needs your full profile URL." : "Could not save your profile",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <PanelHeader title="Profile and settings" description="This is what builders see on your public profile." />
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <Row label="Username" hint="Your profile lives at /u/username">
          <div className="relative">
            <input
              value={form.username}
              onChange={(e) => {
                const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "");
                set("username", value);
                checkUsername(value);
              }}
              maxLength={30}
              className={`${inputClass} pr-9`}
              aria-label="Username"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {availability === "checking" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              {availability === "available" && <Check className="h-4 w-4 text-success" />}
              {availability === "taken" && <X className="h-4 w-4 text-destructive" />}
            </span>
          </div>
          {availability === "taken" && <p className="mt-1.5 text-xs text-destructive">That username is taken.</p>}
          {availability === "invalid" && (
            <p className="mt-1.5 text-xs text-destructive">3 to 30 characters: letters, numbers, hyphens and underscores.</p>
          )}
        </Row>

        <Row label="One-line intro" hint="Shown on your profile and posts">
          <input value={form.bio} onChange={(e) => set("bio", e.target.value)} maxLength={160} aria-label="One-line intro" className={inputClass} />
          <p className="mt-1.5 text-right text-xs text-muted-foreground">{form.bio.length}/160</p>
        </Row>

        <Row label="Role">
          <div className="flex flex-wrap gap-2">
            {PROFESSIONS.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={form.profession === item}
                onClick={() => set("profession", item)}
                className={`h-8 rounded-full border px-3 text-xs font-medium transition-colors ${
                  form.profession === item
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          {form.profession === "Other" && (
            <input
              value={form.profession_detail}
              onChange={(e) => set("profession_detail", e.target.value)}
              maxLength={40}
              placeholder="What's your role?"
              aria-label="Your role"
              className={`${inputClass} mt-3`}
            />
          )}
        </Row>

        <Row label="Country">
          <select value={form.country} onChange={(e) => set("country", e.target.value)} aria-label="Country" className={inputClass}>
            <option value="">Prefer not to say</option>
            {countries.map(({ code, name }) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </Row>

        <Row label="Links" hint="Optional">
          <div className="grid gap-2 sm:grid-cols-2">
            <input value={form.twitter} onChange={(e) => set("twitter", e.target.value)} placeholder="X handle" aria-label="X handle" className={inputClass} />
            <input value={form.github} onChange={(e) => set("github", e.target.value)} placeholder="GitHub username" aria-label="GitHub username" className={inputClass} />
            <input value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="linkedin.com/in/you" aria-label="LinkedIn profile URL" className={inputClass} />
            <input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="yourwebsite.com" aria-label="Website" className={inputClass} />
          </div>
        </Row>

        <Row label="Email" hint={user.email}>
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">Email me when someone replies to my discussions</span>
            <Switch checked={form.email_notifications} onCheckedChange={(value) => set("email_notifications", value)} />
          </label>
        </Row>
      </div>

      <div className="sticky bottom-4 mt-4 flex justify-end gap-2">
        {dirty && (
          <button
            type="button"
            onClick={() => {
              setForm(initialForm(user));
              setAvailability("idle");
            }}
            disabled={saving}
            className="h-10 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground"
          >
            Discard
          </button>
        )}
        <button
          type="button"
          onClick={save}
          disabled={!dirty || saving || blocked}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background shadow-sm hover:bg-foreground/85 disabled:opacity-40"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save changes
        </button>
      </div>
    </section>
  );
}
