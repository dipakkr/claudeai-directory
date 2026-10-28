"use client";

import { useEffect, useState } from "react";
import { Bookmark, Download, Star } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useSignIn } from "@/components/auth/SignInDialog";
import { commerceError, studioRequest } from "@/lib/studio-commerce";
import styles from "./commerce.module.css";

interface EngagementData {
  rating_average: number | null;
  rating_count: number;
  bookmark_count: number;
  download_count: number;
  my_rating: number | null;
  bookmarked: boolean;
  can_rate: boolean;
}
export default function Engagement({ slug }: { slug: string }) {
  const { user, isLoading, viewOnly } = useAuth();
  const { requireAuth } = useSignIn();
  const owner = user?.id ?? "guest";
  const [state, setState] = useState<{ owner: string; slug: string; data: EngagementData }>();
  const [revision, setRevision] = useState(0);
  const [loadError, setLoadError] = useState<{ owner: string; slug: string }>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [value, setValue] = useState("");
  const data = state?.owner === owner && state.slug === slug ? state.data : undefined;
  useEffect(() => {
    if (isLoading) return;
    const abort = new AbortController();
    studioRequest<EngagementData>(`/skills/${encodeURIComponent(slug)}/engagement`, undefined, abort.signal).then(data => { setState({ owner, slug, data }); setLoadError(undefined); }).catch(() => {
      if (!abort.signal.aborted) setLoadError({ owner, slug });
    });
    return () => abort.abort();
  }, [slug, owner, isLoading, revision]);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const downloaded = (event: Event) => {
      if ((event as CustomEvent<{ slug: string }>).detail?.slug !== slug) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setRevision(current => current + 1), 500);
    };
    window.addEventListener("studio:downloaded", downloaded);
    return () => { window.removeEventListener("studio:downloaded", downloaded); if (timer) clearTimeout(timer); };
  }, [slug]);
  useEffect(() => {
    const refreshVisible = () => {
      if (document.visibilityState === "visible") setRevision(current => current + 1);
    };
    window.addEventListener("focus", refreshVisible);
    const interval = window.setInterval(refreshVisible, 30_000);
    return () => { window.removeEventListener("focus", refreshVisible); window.clearInterval(interval); };
  }, []);
  async function update(kind: "bookmark" | "rating") {
    await requireAuth(kind === "bookmark" ? "save this skill" : "rate this skill", async () => {
      setBusy(true); setError("");
      try {
        await studioRequest(`/skills/${encodeURIComponent(slug)}/${kind}`, kind === "bookmark" ? { saved: !data?.bookmarked } : { value: Number(value) }, undefined, "PUT");
        setRevision(current => current + 1);
      } catch (caught) { setError(commerceError(caught)); }
      finally { setBusy(false); }
    });
  }
  if (!data) return loadError?.owner === owner && loadError.slug === slug ? <p className={styles.note}>Skill activity couldn’t be loaded. <button className={styles.retry} onClick={() => setRevision(current => current + 1)}>Retry</button></p> : null;
  return <div className={styles.engagement}>
    <div className={styles.statsRow}>
      <span aria-label={data.rating_count ? `${data.rating_average?.toFixed(1)} out of 5 from ${data.rating_count} ratings` : "0 ratings"}><Star size={15}/>{data.rating_count && data.rating_average != null ? <><strong>{data.rating_average.toFixed(1)}</strong><span>({data.rating_count})</span></> : "0 ratings"}</span>
      <span title="Verified skill downloads"><Download size={15}/>{data.download_count} downloads</span>
      <button type="button" aria-label={data.bookmarked ? "Remove saved skill" : "Save skill"} aria-pressed={data.bookmarked} disabled={busy || viewOnly} onClick={() => void update("bookmark")}><Bookmark size={15} fill={data.bookmarked ? "currentColor" : "none"}/>{data.bookmark_count}</button>
    </div>
    <details className={styles.ratingDetails}><summary>{data.my_rating ? `Your rating: ${data.my_rating}/5` : "Rate this skill"}</summary>
      {data.can_rate ? <div className={styles.ratingForm}><label>Rating<select aria-label="Your skill rating" value={value || String(data.my_rating || "")} onChange={event => setValue(event.target.value)}><option value="" disabled>Choose a rating</option>{[5, 4, 3, 2, 1].map(rating => <option value={rating} key={rating}>{rating} {rating === 1 ? "star" : "stars"}</option>)}</select></label><button className={styles.secondary} disabled={busy || viewOnly || !value} onClick={() => void update("rating")}>{busy ? "Saving…" : "Save rating"}</button></div> : <p className={styles.note}>Ratings are available to buyers and members with access to this skill.</p>}
    </details>
    {error && <p className={styles.error} role="alert">{error}</p>}
  </div>;
}
