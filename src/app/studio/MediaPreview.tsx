"use client";

import { useRef, useState } from "react";
import { mediaImage, type StudioMedia } from "@/data/studio/catalog";
import styles from "./media.module.css";

export default function MediaPreview({ asset, motion, priority = false, large = false }: { asset: StudioMedia; motion?: StudioMedia; priority?: boolean; large?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const still = mediaImage(asset);
  const images = asset.files.filter(file => file.mime === "image/webp" && file.width);
  function start() {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (motion && !window.matchMedia("(prefers-reduced-motion: reduce)").matches && !connection?.saveData) setPlaying(true);
  }
  function stop() { video.current?.pause(); setPlaying(false); }
  return <span className={`${styles.media} ${asset.id.startsWith("avatar-") ? styles.character : ""}`} onPointerEnter={event => { if (event.pointerType === "mouse") start(); }} onPointerLeave={stop}>
    {/* Responsive derivatives are generated before publishing, so no second image transcode is needed. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={still.url} srcSet={images.map(file => `${file.url} ${file.width}w`).join(", ")} sizes={large ? "(max-width: 900px) 100vw, 50vw" : "(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"} width={still.width} height={still.height} alt={asset.alt} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async" />
    {motion && playing && <video ref={video} className={styles.loop} autoPlay muted loop playsInline preload="none" poster={still.url} aria-hidden="true" onError={stop}>{motion.files.filter(file => file.mime === "video/webm" || file.mime === "video/mp4").sort((a,b) => a.mime === b.mime ? 0 : a.mime === "video/webm" ? -1 : 1).map(file => <source key={file.url} src={file.url} type={file.mime} />)}</video>}
  </span>;
}
