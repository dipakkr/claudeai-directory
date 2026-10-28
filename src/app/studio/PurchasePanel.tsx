"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Copy, Download, KeyRound } from "lucide-react";
import { useSignIn } from "@/components/auth/SignInDialog";
import { commerceError, downloadSkill, money, paymentRedirect, skillInstallPrompt, studioRequest } from "@/lib/studio-commerce";
import { useCommerce } from "./useCommerce";
import styles from "./commerce.module.css";

export default function PurchasePanel({ slug }: { slug: string }) {
  const { config, library, libraryError, configError, loading, viewOnly, refresh } = useCommerce();
  const { requireAuth } = useSignIn();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [downloaded, setDownloaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const skill = library?.skills.find(item => item.slug === slug);
  const product = config?.products.find(item => item.slug === slug);
  async function act(action: "skill" | "subscription" | "download") {
    await requireAuth(action === "download" ? "download your skill" : "keep your skills in your library", async () => {
      setBusy(true); setError(""); setDownloaded(false); setCopied(false);
      try {
        if (action === "download") { await downloadSkill(slug); setDownloaded(true); }
        else {
          const result = await studioRequest<{ url: string }>("/checkout", { kind: action, ...(action === "skill" ? { slug } : {}) });
          paymentRedirect(result.url);
        }
      } catch (caught) { setError(commerceError(caught)); refresh(); }
      finally { setBusy(false); }
    });
  }
  async function copyPrompt() {
    if (!skill?.access || !skill.downloadable || viewOnly) return;
    setError(""); setCopied(false); setDownloaded(false);
    try { await navigator.clipboard.writeText(skillInstallPrompt(slug, skill.name)); setCopied(true); }
    catch { setError("The install prompt couldn’t be copied. Please try again."); }
  }
  const feedback = <>{error && <p className={styles.error} role="alert">{error}</p>}{downloaded && <p className={styles.note} role="status">Your ZIP download has started.</p>}{copied && <p className={styles.note} role="status">Install prompt copied. Use it with your downloaded ZIP.</p>}</>;
  if (skill?.access) return <div className={styles.purchase}>
    <p className={styles.ownership}><Check size={15}/>{skill.access === "purchased" ? "In your library" : "Included with your membership"}</p>
    {skill.downloadable && <div className={styles.downloadActions}><button className={styles.primary} disabled={busy || viewOnly} onClick={() => void act("download")}><Download size={16}/>{busy ? "Preparing download…" : "Download skill ZIP"}</button><button className={styles.secondary} disabled={busy || viewOnly} onClick={() => void copyPrompt()}><Copy size={15}/>{copied ? "Copied" : "Copy install prompt"}</button></div>}
    <Link className={styles.textLink} href="/studio/library">Open your library <ArrowUpRight size={14}/></Link>
    {viewOnly && <p className={styles.note}>Account preview is read-only.</p>}{feedback}
  </div>;
  if (!config?.enabled) return <div className={styles.purchase}>
    <a className={styles.primary} href="#outputs">Explore the outputs <ArrowUpRight size={16}/></a>
    {configError && <p className={styles.note}>Purchasing options couldn’t be loaded. <button className={styles.retry} onClick={refresh}>Retry</button></p>}
  </div>;
  return <div className={styles.purchase}>
    {product?.amount != null && <div className={styles.priceRow}><strong>{money(product.amount, config.currency)}</strong><span>One-time purchase</span></div>}
    {libraryError ? <p className={styles.error} role="alert">We couldn’t check your access. <button className={styles.retry} onClick={refresh}>Retry</button></p> : product?.purchasable && <button className={styles.primary} disabled={busy || loading || viewOnly} onClick={() => void act("skill")}>{busy ? "Opening checkout…" : "Buy this skill"}<ArrowUpRight size={16}/></button>}
    {config.subscription.purchasable && config.subscription.amount != null && !libraryError && <Link className={styles.membershipOffer} href="/studio/membership"><KeyRound size={18}/><span><strong>All skills. One membership.</strong><small>{money(config.subscription.amount, config.currency)}/month · Explore all access</small></span><ArrowUpRight size={15}/></Link>}
    {!product?.purchasable && <a className={styles.secondary} href="#outputs">Explore the outputs <ArrowUpRight size={15}/></a>}
    {viewOnly && <p className={styles.note}>Account preview is read-only.</p>}{feedback}
  </div>;
}
