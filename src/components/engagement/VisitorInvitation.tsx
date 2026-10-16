"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { OPEN_ADVERTISE_EVENT, openAdvertiseDialog } from "@/lib/advertise";
import { useAuth } from "@/lib/auth";
import { track } from "@/lib/analytics";

type Mode = "advertise" | "newsletter" | "preferences" | "done" | null;
const excluded = /^\/(dashboard|login|signup|setup-profile|submit|privacy|terms|advertise)(\/|$)|^\/launches\/.*(submit|edit|analytics)/;
const input = "mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm";

export default function VisitorInvitation() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState<Mode>(null);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState("");
  const [goal, setGoal] = useState("");
  const [help, setHelp] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (excluded.test(pathname)) return;
    const onAd = () => { setMode(null); try { sessionStorage.setItem("cad_invitation_seen", "1"); } catch {} };
    window.addEventListener(OPEN_ADVERTISE_EVENT, onAd);
    let seconds = 0;
    const timer = window.setInterval(() => {
      if (document.hidden || document.querySelector('[role="dialog"]') || /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || "")) return;
      seconds++;
      try {
        const preview = process.env.NEXT_PUBLIC_LOCAL_PREVIEW === "true" ? new URLSearchParams(window.location.search).get("welcome") : null;
        if (preview === "advertise" || preview === "newsletter") {
          setMode(preview); window.clearInterval(timer); return;
        }
        if (sessionStorage.getItem("cad_invitation_seen")) return;
        const adDue = Date.now() > Number(localStorage.getItem("cad_ad_invite_after") || 0);
        if (adDue && seconds >= 15) {
          setMode("advertise");
          localStorage.setItem("cad_ad_invite_after", String(Date.now() + 7 * 86400000));
        } else if (!adDue && !isAuthenticated && !localStorage.getItem("cad_digest_subscribed") && Date.now() > Number(localStorage.getItem("cad_digest_invite_after") || 0) && seconds >= 45) {
          setMode("newsletter");
          localStorage.setItem("cad_digest_invite_after", String(Date.now() + 7 * 86400000));
        } else return;
        sessionStorage.setItem("cad_invitation_seen", "1");
        window.clearInterval(timer);
      } catch { window.clearInterval(timer); }
    }, 1000);
    return () => { window.clearInterval(timer); window.removeEventListener(OPEN_ADVERTISE_EVENT, onAd); };
  }, [pathname, isAuthenticated]);

  async function subscribe(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await api.post<{ profile_token: string | null }>("/newsletter/subscribe", { email, source: pathname.slice(0, 120) });
      try { localStorage.setItem("cad_digest_subscribed", "1"); } catch {}
      setToken(response.profile_token); setMode(response.profile_token ? "preferences" : "done");
    } catch { setError("Could not subscribe. Please try again."); } finally { setBusy(false); }
  }
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      await api.post("/newsletter/preferences", { token, role, goal, request_help: help, message });
      setMode("done");
    } catch { setError("Could not save your preferences. Please try again."); } finally { setBusy(false); }
  }
  if (!mode || excluded.test(pathname)) return null;
  return <section aria-label="Claude Directory invitation" className="fixed bottom-4 right-4 z-40 w-[calc(100%-2rem)] max-w-sm rounded-xl border border-border bg-card p-5 shadow-2xl sm:right-6">
    <button aria-label="Dismiss invitation" onClick={() => setMode(null)} className="absolute right-3 top-3 rounded p-1 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
    {mode === "advertise" && <>
      <p className="text-xs font-medium uppercase tracking-wider text-primary">For makers</p>
      <h2 className="mt-2 pr-5 text-xl font-semibold">Your product. In the sidebar.</h2>
      <p className="mt-2 text-sm text-muted-foreground">Reach people exploring Claude tools. One sidebar card, seven days, <strong className="text-foreground">$40</strong>. No subscription.</p>
      <button className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-primary-foreground" onClick={() => { track("ad_slot_clicked", { slot: "visitor_invitation" }); openAdvertiseDialog(); }}>Preview your ad <ArrowRight className="h-4 w-4" /></button>
      <button onClick={() => setMode("newsletter")} className="mt-3 w-full text-xs text-muted-foreground underline underline-offset-4">Just exploring? Get the weekly Claude picks</button>
    </>}
    {mode === "newsletter" && <form onSubmit={subscribe}>
      <h2 className="pr-5 text-xl font-semibold">Find your next Claude tool</h2>
      <p className="mt-2 text-sm text-muted-foreground">New Skills, MCP servers and useful resources. One email a week from Claude Directory.</p>
      <label className="mt-4 block text-xs">Email address<input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={input} /></label>
      <button disabled={busy} className="mt-3 h-10 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground disabled:opacity-50">{busy ? "Subscribing..." : "Send me the weekly picks"}</button>
      <p className="mt-2 text-xs text-muted-foreground">By subscribing, you agree to receive the weekly digest. Unsubscribe anytime. <a href="/privacy" className="underline">Privacy</a></p>
    </form>}
    {mode === "preferences" && <form onSubmit={save}>
      <h2 className="pr-5 text-xl font-semibold">You’re subscribed.</h2>
      <p className="mt-2 text-sm text-muted-foreground">Optional: help us understand what you need from Claude.</p>
      <label className="mt-3 block text-xs">Your role<select value={role} onChange={e => setRole(e.target.value)} className={input}><option value="">Choose a role</option>{["Developer", "Founder", "Marketer", "Consultant", "Student", "Other"].map(v => <option key={v}>{v}</option>)}</select></label>
      <label className="mt-3 block text-xs">What are you trying to do?<select value={goal} onChange={e => setGoal(e.target.value)} className={input}><option value="">Choose a goal</option>{["Build software", "Automate work", "Research", "Create content", "Publish a tool"].map(v => <option key={v}>{v}</option>)}</select></label>
      <label className="mt-4 flex items-start gap-2 text-xs"><input type="checkbox" checked={help} onChange={e => setHelp(e.target.checked)} />I’d like someone from Claude Directory to email me about my setup question.</label>
      {help && <label className="mt-3 block text-xs">What do you need help with?<textarea required maxLength={1000} value={message} onChange={e => setMessage(e.target.value)} className="mt-1 min-h-20 w-full rounded-md border border-border bg-background p-2 text-sm" /></label>}
      <button disabled={busy} className="mt-3 h-10 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground disabled:opacity-50">{busy ? "Saving..." : "Save preferences"}</button>
      <button type="button" onClick={() => setMode(null)} className="mt-2 w-full text-xs text-muted-foreground">Skip for now</button>
    </form>}
    {mode === "done" && <><h2 className="pr-5 text-xl font-semibold">Thanks for joining us.</h2><p className="mt-2 text-sm text-muted-foreground">Your preferences have been received. You can unsubscribe using the link in any digest.</p><button onClick={() => setMode(null)} className="mt-4 text-sm text-primary">Continue exploring →</button></>}
    {error && <p role="alert" className="mt-3 text-sm text-red-500">{error}</p>}
  </section>;
}
