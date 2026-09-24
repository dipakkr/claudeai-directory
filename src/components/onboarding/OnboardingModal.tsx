"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";

import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

// Keep in sync with PROFESSIONS in backend/app/models/user.py.
const PROFESSIONS = [
  "Developer",
  "Founder",
  "Product manager",
  "Designer",
  "Marketer",
  "Data scientist",
  "Researcher",
  "Student",
  "Other",
];

// ISO 3166-1 alpha-2. Names come from the browser (Intl.DisplayNames).
const COUNTRY_CODES =
  "AF AL DZ AR AM AU AT AZ BH BD BY BE BJ BO BA BR BG KH CM CA CL CN CO CR HR CY CZ DK DO EC EG SV EE ET FI FR GE DE GH GR GT HN HK HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KR KW KG LV LB LT LU MY MT MX MD MN MA NP NL NZ NI NG MK NO OM PK PA PY PE PH PL PT QA RO RU RW SA SN RS SG SK SI ZA ES LK SE CH TW TZ TH TN TR UG UA AE GB US UY UZ VE VN ZM ZW".split(" ");

// Where the step must never block: signing in, legal pages, the old setup page.
const EXCLUDED = ["/login", "/setup-profile", "/privacy", "/terms"];
const DISMISS_KEY = "cad_onboarding_dismissed";

interface Member {
  id: string;
  username: string;
  name?: string;
  avatar?: string;
  profession?: string;
}

interface CommunityPreview {
  total: number;
  newest: Member[];
  peers: Member[];
}

function guessCountry() {
  try {
    const region = new Intl.Locale(navigator.language).maximize().region;
    return region && COUNTRY_CODES.includes(region) ? region : "";
  } catch {
    return "";
  }
}

/** Accept "linkedin.com/in/you" or "yoursite.com" and send a full https URL. */
function withHttps(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return /^https?:\/\//i.test(trimmed) ? trimmed.replace(/^http:/i, "https:") : `https://${trimmed}`;
}

function Avatars({ members, size = "h-9 w-9" }: { members: Member[]; size?: string }) {
  return (
    <div className="flex -space-x-2.5">
      {members.slice(0, 6).map((member) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={member.id}
          src={member.avatar}
          alt=""
          title={member.name || member.username}
          referrerPolicy="no-referrer"
          className={`${size} rounded-full border-2 border-card bg-background object-cover`}
        />
      ))}
    </div>
  );
}

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary/60 focus:outline-none";

export default function OnboardingModal() {
  const { user, isLoading, updateProfile } = useAuth();
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return typeof window !== "undefined" && sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [profession, setProfession] = useState("");
  const [country, setCountry] = useState("");
  const [countryGuessed, setCountryGuessed] = useState(false);
  const [links, setLinks] = useState({ twitter: "", github: "", linkedin: "", website: "", bio: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const open =
    !isLoading &&
    user?.needs_onboarding === true &&
    !dismissed &&
    !EXCLUDED.some((path) => pathname === path || pathname?.startsWith(`${path}/`));
  // Step 2 (the welcome) stays open after saving even though needs_onboarding flips.
  const visible = open || (step === 2 && !dismissed && !!user);

  const { data: community } = useQuery({
    queryKey: ["onboarding", "community", user?.profession],
    queryFn: () => api.get<CommunityPreview>("/auth/community-preview"),
    enabled: visible,
    staleTime: 60_000,
  });

  const countryNames = useMemo(() => {
    try {
      const names = new Intl.DisplayNames(["en"], { type: "region" });
      return COUNTRY_CODES.map((code) => ({ code, name: names.of(code) ?? code })).sort((a, b) =>
        a.name.localeCompare(b.name),
      );
    } catch {
      return COUNTRY_CODES.map((code) => ({ code, name: code }));
    }
  }, []);

  // Prefill a visible, editable country guess once.
  useEffect(() => {
    if (visible && !country && !countryGuessed) {
      const guess = guessCountry();
      if (guess) setCountry(guess);
      setCountryGuessed(true);
    }
  }, [visible, country, countryGuessed]);

  // Lock page scroll and move focus into the dialog while it is open.
  useEffect(() => {
    if (!visible) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [visible]);

  if (!visible || !user) return null;

  const firstName = (user.name || user.username).split(" ")[0];
  const faces = (community?.newest ?? []).filter((member) => member.avatar);

  const save = async (withLinks: boolean) => {
    setSaving(true);
    setError(null);
    try {
      await updateProfile({
        profession,
        country: country || undefined,
        ...(withLinks
          ? {
              twitter: links.twitter.trim() || undefined,
              github: links.github.trim() || undefined,
              linkedin: withHttps(links.linkedin),
              website: withHttps(links.website),
              bio: links.bio.trim() || undefined,
            }
          : {}),
      });
      setStep(2);
    } catch (err) {
      const detail = err instanceof ApiError ? (err.data as { detail?: unknown })?.detail : undefined;
      setError(
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
            ? "Check your links. LinkedIn needs your full profile URL."
            : "Could not save. Check your connection and try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  // Escape hatch so a failing API can never lock someone out of the site.
  const continueForNow = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* private mode: dismiss for this page view only */
    }
    setDismissed(true);
  };

  const finish = () => setDismissed(true);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        tabIndex={-1}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-border bg-card shadow-2xl outline-none sm:max-w-[520px] sm:rounded-2xl"
      >
        {step < 2 && (
          <div className="flex items-center gap-1.5 px-6 pt-5" aria-hidden="true">
            {[0, 1].map((index) => (
              <span key={index} className={`h-1 flex-1 rounded-full ${index <= step ? "bg-primary" : "bg-border"}`} />
            ))}
          </div>
        )}

        {step === 0 && (
          <div className="p-6">
            {faces.length > 0 && (
              <div className="flex items-center gap-3">
                <Avatars members={faces} />
                {community && (
                  <p className="text-xs text-muted-foreground">
                    {community.total.toLocaleString()} builders are already here
                  </p>
                )}
              </div>
            )}
            <h2 id="onboarding-title" className="mt-5 text-2xl font-semibold text-foreground">
              Welcome, {firstName}. Meet the community.
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Two quick questions so other builders know who you are.
            </p>

            <p className="mt-6 text-sm font-medium text-foreground">What do you do?</p>
            <div role="radiogroup" aria-label="What do you do?" className="mt-2.5 flex flex-wrap gap-2">
              {PROFESSIONS.map((item) => {
                const active = profession === item;
                return (
                  <button
                    key={item}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setProfession(item)}
                    className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm transition-colors ${
                      active
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background text-foreground hover:border-[var(--cad-line-hover)]"
                    }`}
                  >
                    {active && <Check className="h-3.5 w-3.5" />}
                    {item}
                  </button>
                );
              })}
            </div>

            <label htmlFor="onboarding-country" className="mt-6 block text-sm font-medium text-foreground">
              Where are you based?
            </label>
            <select
              id="onboarding-country"
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className={`${inputClass} mt-2.5`}
            >
              <option value="">Prefer not to say</option>
              {countryNames.map(({ code, name }) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
            {country && countryGuessed && (
              <p className="mt-1.5 text-xs text-muted-foreground">Guessed from your browser. Change it if it is wrong.</p>
            )}

            <button
              type="button"
              disabled={!profession}
              onClick={() => setStep(1)}
              className="mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-foreground text-sm font-medium text-background transition-colors hover:bg-foreground/85 disabled:opacity-40"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="p-6">
            <h2 id="onboarding-title" className="text-2xl font-semibold text-foreground">
              Where can people find you?
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Optional. Links show on your profile so builders can follow your work.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <input aria-label="X handle" value={links.twitter} onChange={(e) => setLinks({ ...links, twitter: e.target.value })} placeholder="X handle" className={inputClass} />
              <input aria-label="GitHub username" value={links.github} onChange={(e) => setLinks({ ...links, github: e.target.value })} placeholder="GitHub username" className={inputClass} />
              <input aria-label="LinkedIn profile URL" value={links.linkedin} onChange={(e) => setLinks({ ...links, linkedin: e.target.value })} placeholder="linkedin.com/in/you" className={inputClass} />
              <input aria-label="Website" value={links.website} onChange={(e) => setLinks({ ...links, website: e.target.value })} placeholder="yourwebsite.com" className={inputClass} />
            </div>
            <textarea
              aria-label="Short bio"
              value={links.bio}
              onChange={(e) => setLinks({ ...links, bio: e.target.value })}
              maxLength={160}
              rows={2}
              placeholder="One line about what you are building with Claude"
              className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary/60 focus:outline-none"
            />

            {error && (
              <div role="alert" className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                {error}{" "}
                <button type="button" onClick={continueForNow} className="font-medium underline underline-offset-2">
                  Continue for now
                </button>
              </div>
            )}

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(0)}
                aria-label="Back"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => save(true)}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-foreground text-sm font-medium text-background transition-colors hover:bg-foreground/85 disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {error ? "Try again" : "Join the community"}
              </button>
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={() => save(false)}
              className="mt-3 w-full text-center text-sm text-muted-foreground hover:text-foreground"
            >
              Skip links for now
            </button>
          </div>
        )}

        {step === 2 && (
          <WelcomeStep firstName={firstName} community={community} onDone={finish} />
        )}
      </div>
    </div>
  );
}

function WelcomeStep({
  firstName,
  community,
  onDone,
}: {
  firstName: string;
  community?: CommunityPreview;
  onDone: () => void;
}) {
  const peers = (community?.peers ?? []).filter((member) => member.avatar);
  const people = peers.length >= 3 ? peers : (community?.newest ?? []).filter((member) => member.avatar);
  const heading = peers.length >= 3 ? "Builders like you" : "Say hi to the newest members";

  return (
    <div className="p-6">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-success/15 text-success">
        <Check className="h-5 w-5" />
      </span>
      <h2 id="onboarding-title" className="mt-4 text-2xl font-semibold text-foreground">
        You are in, {firstName}
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Your profile is live. Here are a few people to meet.
      </p>

      {people.length > 0 && (
        <>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{heading}</p>
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {people.slice(0, 6).map((member) => (
              <li key={member.id}>
                <Link
                  href={`/u/${member.username}`}
                  onClick={onDone}
                  className="flex items-center gap-2.5 rounded-xl border border-border bg-background p-2.5 transition-colors hover:border-[var(--cad-line-hover)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={member.avatar} alt="" referrerPolicy="no-referrer" className="h-8 w-8 shrink-0 rounded-full object-cover" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground">{member.name || member.username}</span>
                    {member.profession && <span className="block truncate text-xs text-muted-foreground">{member.profession}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-7 flex flex-col gap-2 sm:flex-row">
        <Link
          href="/members"
          onClick={onDone}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-border text-sm font-medium text-foreground hover:border-[var(--cad-line-hover)]"
        >
          See all members
        </Link>
        <button
          type="button"
          onClick={onDone}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-foreground text-sm font-medium text-background hover:bg-foreground/85"
        >
          Start exploring
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
