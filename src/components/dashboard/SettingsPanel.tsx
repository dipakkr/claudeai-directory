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

// Same filled fields as the launch submit and edit forms.
const inputClass =
  "h-10 w-full rounded-[8px] border border-transparent bg-foreground/[0.06] px-3 text-[14px] text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-[var(--cad-line-hover)] focus:outline-none";

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

/** Label above the field, hint on the right: the launch forms' layout. */
function Field({ label, htmlFor, hint, children }: { label: string; htmlFor?: string; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 flex items-baseline justify-between gap-3 text-[14px] text-muted-foreground">
        {label}
        {hint && <span className="text-xs">{hint}</span>}
      </label>
      {children}
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
    <section className="max-w-[680px]">
      <PanelHeader title="Profile and settings" description="This is what builders see on your public profile." />
      <div className="space-y-6">
        <Field label="Username" htmlFor="username" hint="claudeai.directory/u/username">
          <div className="relative">
            <input
              id="username"
              value={form.username}
              onChange={(e) => {
                const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "");
                set("username", value);
                checkUsername(value);
              }}
              maxLength={30}
              className={`${inputClass} pr-9`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {availability === "checking" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              {availability === "available" && <Check className="h-4 w-4 text-success" />}
              {availability === "taken" && <X className="h-4 w-4 text-destructive" />}
            </span>
          </div>
          {availability === "taken" && <p className="mt-1.5 text-xs text-destructive">That username is taken.</p>}
          {availability === "invalid" && <p className="mt-1.5 text-xs text-destructive">3 to 30 characters: letters, numbers, hyphens and underscores.</p>}
        </Field>

        <Field label="One-line intro" htmlFor="bio" hint={`${form.bio.length}/160`}>
          <input id="bio" value={form.bio} onChange={(e) => set("bio", e.target.value)} maxLength={160} placeholder="What you build, in a line" className={inputClass} />
        </Field>

        <Field label="Role">
          <div className="flex flex-wrap gap-2">
            {PROFESSIONS.map((item) => {
              const active = form.profession === item;
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={active}
                  onClick={() => set("profession", active ? "" : item)}
                  className={`inline-flex h-8 items-center gap-1 rounded-full border px-3 text-xs font-medium transition-colors ${
                    active ? "border-foreground bg-foreground text-background" : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {active && <Check className="h-3 w-3" />}
                  {item}
                </button>
              );
            })}
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
        </Field>

        <Field label="Country" htmlFor="country">
          <select id="country" value={form.country} onChange={(e) => set("country", e.target.value)} className={inputClass}>
            <option value="">Prefer not to say</option>
            {countries.map(({ code, name }) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="X" htmlFor="twitter">
            <input id="twitter" value={form.twitter} onChange={(e) => set("twitter", e.target.value)} placeholder="handle" className={inputClass} />
          </Field>
          <Field label="GitHub" htmlFor="github">
            <input id="github" value={form.github} onChange={(e) => set("github", e.target.value)} placeholder="username" className={inputClass} />
          </Field>
          <Field label="LinkedIn" htmlFor="linkedin">
            <input id="linkedin" value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="linkedin.com/in/you" className={inputClass} />
          </Field>
          <Field label="Website" htmlFor="website">
            <input id="website" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="yourwebsite.com" className={inputClass} />
          </Field>
        </div>

        <Field label="Email" hint={user.email}>
          <label className="flex items-center justify-between gap-4 rounded-[8px] bg-foreground/[0.06] px-3 py-2.5">
            <span className="text-[14px] text-foreground">Email me when someone replies to my posts</span>
            <Switch checked={form.email_notifications} onCheckedChange={(value) => set("email_notifications", value)} />
          </label>
        </Field>
      </div>

      {/* Same save bar as the edit launch page. */}
      <div className="sticky bottom-0 z-10 -mx-4 mt-10 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:mx-0 md:px-0" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}>
        <div className="flex items-center justify-end gap-3">
          {dirty && (
            <button
              type="button"
              onClick={() => {
                setForm(initialForm(user));
                setAvailability("idle");
              }}
              disabled={saving}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Discard
            </button>
          )}
          <button
            type="button"
            onClick={save}
            disabled={!dirty || saving || blocked}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save changes
          </button>
        </div>
      </div>
    </section>
  );
}
