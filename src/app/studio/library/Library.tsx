"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Bookmark, Copy, Download, KeyRound, LibraryBig } from "lucide-react";
import { useSignIn } from "@/components/auth/SignInDialog";
import { commerceError, downloadSkill, paymentRedirect, skillInstallPrompt, studioRequest } from "@/lib/studio-commerce";
import { useCommerce } from "../useCommerce";
import styles from "../commerce.module.css";

export default function Library({ sessionId }: { sessionId?: string }) {
  const { user, authLoading, config, library, libraryError, viewOnly, refresh } = useCommerce();
  const { openSignIn } = useSignIn();
  const [busy, setBusy] = useState<string>();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [copiedSlug, setCopiedSlug] = useState<string>();
  const [confirmation, setConfirmation] = useState<{ owner: string; text: string; failed?: boolean }>();
  const owner = user?.id;
  useEffect(() => {
    if (!sessionId || !owner || authLoading || viewOnly) return;
    const abort = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let tries = 0;
    const confirm = async () => {
      try {
        const result = await studioRequest<{ paid: boolean }>("/confirm", { session_id: sessionId }, abort.signal);
        if (abort.signal.aborted) return;
        if (result.paid) {
          setConfirmation({ owner, text: "Payment received. Your access is shown below." });
          refresh();
        } else {
          setConfirmation({ owner, text: "Your payment is still being confirmed. Access appears after payment verification." });
          if (++tries < 6) timer = setTimeout(() => void confirm(), 3000);
          else refresh();
        }
      } catch (caught) {
        if (!abort.signal.aborted) setConfirmation({ owner, text: commerceError(caught), failed: true });
      }
    };
    void confirm();
    return () => { abort.abort(); if (timer) clearTimeout(timer); };
  }, [sessionId, owner, authLoading, viewOnly, refresh]);

  async function act(action: string) {
    setBusy(action); setError(""); setNotice(""); setCopiedSlug(undefined);
    try {
      if (action === "billing") paymentRedirect((await studioRequest<{ url: string }>("/portal", {})).url);
      else { await downloadSkill(action); setNotice("Your ZIP download has started."); }
    } catch (caught) { setError(commerceError(caught)); }
    finally { setBusy(undefined); }
  }
  async function copyPrompt(slug: string, name: string) {
    const skill = library?.skills.find(item => item.slug === slug);
    if (!skill?.access || !skill.downloadable || viewOnly) return;
    setError(""); setNotice(""); setCopiedSlug(undefined);
    try {
      await navigator.clipboard.writeText(skillInstallPrompt(slug, name));
      setCopiedSlug(slug); setNotice("Install prompt copied. Use it with your downloaded ZIP.");
    } catch { setError("The install prompt couldn’t be copied. Please try again."); }
  }
  const accessible = library?.skills.filter(skill => skill.access) ?? [];
  const periodDate = library?.current_period_end ? new Date(library.current_period_end * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : undefined;
  const statusLabel = library?.premium ? "All access membership" : library?.subscription_status === "past_due" ? "Payment needs attention" : library?.subscription_status === "canceled" ? "Membership ended" : library?.subscription_status ? "Membership inactive" : "Your skill access";
  return <main className={styles.page}>
    <Link className={styles.back} href="/studio"><ArrowLeft size={14}/> All skills</Link>
    <header className={styles.heading}><p className={styles.eyebrow}>Your account</p><h1>Your skill library.</h1><p>Find your purchased skills, membership access and downloads in one place.</p></header>
    {authLoading ? <p className={styles.note} role="status">Loading your account…</p> : !user ? <section className={styles.empty}><LibraryBig size={30}/><h2>Your skills belong here.</h2><p>Sign in with the account you used at checkout to access your library.</p><button className={styles.primary} onClick={() => openSignIn("open your skill library")}>Sign in to your library <ArrowUpRight size={16}/></button></section> : <>
      {sessionId && (!confirmation || confirmation.owner !== owner) && !viewOnly && <p className={styles.status} role="status">Checking your payment…</p>}
      {confirmation && confirmation.owner === owner && <p className={confirmation.failed ? styles.error : styles.status} role={confirmation.failed ? "alert" : "status"}>{confirmation.text}</p>}
      {libraryError ? <p className={styles.error} role="alert">Your library couldn’t be loaded. <button className={styles.retry} onClick={refresh}>Try again</button></p> : !library ? <p className={styles.note} role="status">Loading your skills…</p> : <>
        <section className={styles.accountBar}><div><KeyRound size={20}/><div><h2>{statusLabel}</h2>{library.premium && periodDate && <p>{library.cancel_at_period_end ? "Access ends" : "Current period ends"} {periodDate}</p>}{!library.premium && !library.subscription_status && <p>{accessible.length} individually purchased {accessible.length === 1 ? "skill" : "skills"}</p>}{library.subscription_status === "past_due" && <p>Update your payment details to restore membership access.</p>}</div></div><div className={styles.accountActions}>{library.can_manage_billing && <button className={styles.secondary} disabled={Boolean(busy) || viewOnly} onClick={() => void act("billing")}>{busy === "billing" ? "Opening billing…" : "Manage billing"}<ArrowUpRight size={15}/></button>}{!library.premium && config?.enabled && config.subscription.purchasable && <Link className={styles.textLink} href="/studio/membership">Explore membership <ArrowUpRight size={14}/></Link>}</div></section>
        {accessible.length ? <section className={styles.libraryGrid} aria-label="Your available skills">{accessible.map(skill => <article className={styles.skillCard} key={skill.slug}><span className={styles.eyebrow}>{skill.access === "purchased" ? "Purchased" : "Included in membership"}</span><h2><Link href={`/studio/${skill.slug}`}>{skill.name}</Link></h2><p>Review the workflow and requirements on the skill page.</p>{skill.downloadable && <div className={styles.downloadActions}><button className={styles.primary} disabled={Boolean(busy) || viewOnly} onClick={() => void act(skill.slug)}><Download size={16}/>{busy === skill.slug ? "Preparing download…" : "Download ZIP"}</button><button className={styles.secondary} disabled={Boolean(busy) || viewOnly} onClick={() => void copyPrompt(skill.slug, skill.name)}><Copy size={15}/>{copiedSlug === skill.slug ? "Copied" : "Copy install prompt"}</button></div>}<Link className={styles.textLink} href={`/studio/${skill.slug}`}>View skill <ArrowUpRight size={14}/></Link></article>)}</section> : <section className={styles.empty}><LibraryBig size={30}/><h2>Find your next skill.</h2><p>Explore real outputs and choose the skill behind them.</p><Link className={styles.primary} href="/studio">Browse skills <ArrowUpRight size={16}/></Link></section>}
        {library.saved_skills && library.saved_skills.length > 0 && <section className={styles.savedSection} aria-label="Saved skills"><h2><Bookmark size={20}/> Saved for later</h2><div className={styles.savedList}>{library.saved_skills.map(skill => <Link key={skill.slug} href={`/studio/${skill.slug}`}><span>{skill.name}</span><ArrowUpRight size={15}/></Link>)}</div></section>}
      </>}
      {viewOnly && <p className={styles.note}>Account preview is read-only. Downloads and billing changes are disabled.</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}{notice && <p className={styles.status} role="status">{notice}</p>}
    </>}
  </main>;
}
