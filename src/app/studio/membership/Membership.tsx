"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check, Download, KeyRound } from "lucide-react";
import { useSignIn } from "@/components/auth/SignInDialog";
import { commerceError, money, paymentRedirect, studioRequest } from "@/lib/studio-commerce";
import { useCommerce } from "../useCommerce";
import styles from "../commerce.module.css";

export default function Membership() {
  const { config, library, libraryError, configError, loading, viewOnly, refresh } = useCommerce();
  const { requireAuth } = useSignIn();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const subscription = config?.subscription;
  const existing = Boolean(library?.subscription_status && !["canceled", "incomplete_expired"].includes(library.subscription_status));
  async function subscribe() {
    await requireAuth("start your skills membership", async () => {
      setBusy(true); setError("");
      try { paymentRedirect((await studioRequest<{ url: string }>("/checkout", { kind: "subscription" })).url); }
      catch (caught) { setError(commerceError(caught)); refresh(); }
      finally { setBusy(false); }
    });
  }
  return <main className={styles.page}>
    <Link className={styles.back} href="/studio"><ArrowLeft size={14}/> All skills</Link>
    <header className={styles.heading}><p className={styles.eyebrow}>Skills membership</p><h1>One skill, or the whole collection.</h1><p>Choose an individual skill for a specific project, or use membership to explore the full released collection.</p></header>
    <div className={styles.plans}>
      <section className={styles.plan}><span className={styles.planIcon}><Download size={23}/></span><h2>Individual skills</h2><p>Choose the skill behind an output you want to make.</p><ul><li><Check size={16}/> One-time purchase</li><li><Check size={16}/> Download from your personal library</li><li><Check size={16}/> No subscription required</li></ul><Link className={styles.secondary} href="/studio">Explore skills <ArrowUpRight size={16}/></Link>{config?.enabled && config.products.some(product => product.amount != null) && <p className={styles.note}>Individual prices are shown on each skill page.</p>}</section>
      <section className={`${styles.plan} ${styles.featuredPlan}`}><span className={styles.planIcon}><KeyRound size={23}/></span><h2>All access</h2><p>Every released skill in the collection, in one membership.</p>
        {config?.enabled && subscription?.amount != null && <div className={styles.priceRow}><strong>{money(subscription.amount, config.currency)}</strong><span>/ month</span></div>}
        <ul><li><Check size={16}/> Access to the full released collection</li><li><Check size={16}/> Skill ZIP downloads while membership is active</li><li><Check size={16}/> Manage billing and cancellation from your library</li></ul>
        {library?.premium ? <Link className={styles.primary} href="/studio/library">Open your library <ArrowUpRight size={16}/></Link> : existing ? <Link className={styles.primary} href="/studio/library">Manage your membership <ArrowUpRight size={16}/></Link> : config?.enabled && subscription?.purchasable ? <button className={styles.primary} onClick={() => void subscribe()} disabled={busy || loading || viewOnly || Boolean(libraryError)}>{busy ? "Opening checkout…" : "Subscribe to all access"}<ArrowUpRight size={16}/></button> : <Link className={styles.secondary} href="/studio">Explore the collection <ArrowUpRight size={16}/></Link>}
        {config?.enabled && subscription?.purchasable && !existing && !library?.premium && <p className={styles.note}>Renews monthly. Cancel through your billing portal.</p>}
        {viewOnly && <p className={styles.note}>Account preview is read-only.</p>}
      </section>
    </div>
    {(error || configError || libraryError) && <p className={styles.error} role="alert">{error || "We couldn’t load your purchase options."} <button className={styles.retry} onClick={refresh}>Retry</button></p>}
    <section className={styles.faq}><h2>A few useful details</h2><details><summary>What happens to my individual purchases?</summary><p>Individual purchases stay in your library separately from membership. You do not need an active subscription to download a skill you purchased individually.</p></details><details><summary>What happens when I cancel membership?</summary><p>If you cancel at the end of your paid period, membership access remains until that period ends. Your library shows the current end date and access status.</p></details><details><summary>Are generation costs included?</summary><p>The skill page lists its dependencies and outside costs. Any model, API or agent usage is separate from the skill purchase or membership.</p></details></section>
  </main>;
}
