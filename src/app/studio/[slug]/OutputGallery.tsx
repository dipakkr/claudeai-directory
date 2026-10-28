"use client";

import { useState } from "react";
import { ArrowUpRight, Film, ImageIcon } from "lucide-react";
import { mediaAsset, mediaImage } from "@/data/studio/catalog";
import MediaPreview from "../MediaPreview";
import styles from "../media.module.css";

export default function OutputGallery({ ids, motionId, initial }: { ids: string[]; motionId?: string; initial?: string }) {
  const [selected, setSelected] = useState(ids.includes(initial ?? "") ? initial! : ids[0]);
  const [watching, setWatching] = useState(false);
  const asset = mediaAsset(selected);
  const motion = motionId ? mediaAsset(motionId) : undefined;
  return <div>
    <div className={styles.gallerySurface}>{watching && motion ? <video controls autoPlay muted playsInline preload="metadata" poster={mediaImage(asset).url} aria-label="Sequence of the four generated slides">{motion.files.filter(file => file.mime.startsWith("video/")).map(file => <source key={file.url} src={file.url} type={file.mime} />)}</video> : <MediaPreview asset={asset} priority large />}</div>
    <div className={styles.galleryActions}>
      <a href={mediaImage(asset).url} target="_blank" rel="noopener noreferrer">View full image <ArrowUpRight size={13} /></a>
      {motion && <button type="button" aria-pressed={watching} onClick={() => setWatching(!watching)}>{watching ? <ImageIcon size={13} /> : <Film size={13} />}{watching ? "Show image" : "Watch slides"}</button>}
      {motion?.files.find(file => file.mime === "image/gif") && <a href={motion.files.find(file => file.mime === "image/gif")!.url} download>Download GIF <ArrowUpRight size={13} /></a>}
    </div>
    <div className={styles.thumbs} role="group" aria-label="Choose an output">{ids.map(id => <button key={id} type="button" aria-label={mediaAsset(id).alt} aria-pressed={selected === id && !watching} onClick={() => {setSelected(id);setWatching(false);}}><MediaPreview asset={mediaAsset(id)} /></button>)}</div>
  </div>;
}
