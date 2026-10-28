"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Asterisk, ChevronDown, ImageIcon, Monitor, Presentation, Search, SlidersHorizontal, X } from "lucide-react";
import { catalogOutputs, mediaAsset } from "@/data/studio/catalog";
import MediaPreview from "./MediaPreview";
import styles from "./studio.module.css";

const roles = [...new Set(catalogOutputs.map(item => item.role))];
const palettes = [...new Set(catalogOutputs.map(item => item.palette))];
const outputTypes = [{name:"Web", Icon:Monitor},{name:"Images", Icon:ImageIcon},{name:"Slides", Icon:Presentation}].filter(type => catalogOutputs.some(item => item.output === type.name));

export default function Catalog() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<string[]>([]);
  const [palette, setPalette] = useState<string[]>([]);
  const [outputs, setOutputs] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState("featured");
  const toggle = (value: string, selected: string[], update: (items: string[]) => void) => update(selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value]);
  const reset = () => { setQuery(""); setRole([]); setPalette([]); setOutputs([]); };
  const filtered = catalogOutputs.filter(example => {
    const searchText = `${example.name} ${example.category} ${example.palette} ${example.role} ${example.skill}`.toLowerCase();
    return searchText.includes(query.trim().toLowerCase()) && (!outputs.length || outputs.includes(example.output)) && (!role.length || role.includes(example.role)) && (!palette.length || palette.includes(example.palette));
  }).sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : 0);
  const activeCount = role.length + palette.length + outputs.length;

  return <div className={styles.catalogShell}>
    <aside className={`${styles.filters} ${filtersOpen ? styles.filtersOpen : ""}`} id="catalog-filters" aria-label="Filter outputs">
      <div className={styles.filterHeading}><strong>Filters</strong><button type="button" aria-label="Close filters" onClick={() => setFiltersOpen(false)}><X size={16} /></button><SlidersHorizontal className={styles.desktopFilterIcon} size={15} /></div>
      <fieldset><legend>By output</legend>{outputTypes.map(({name,Icon}) => <label key={name}><input type="checkbox" checked={outputs.includes(name)} onChange={() => toggle(name, outputs, setOutputs)} /><Icon size={14} /><span>{name}</span><small>{catalogOutputs.filter(item => item.output === name).length}</small></label>)}</fieldset>
      <fieldset><legend>By role</legend>{roles.map(value => <label key={value}><input type="checkbox" checked={role.includes(value)} onChange={() => toggle(value, role, setRole)} /><span>{value}</span><small>{catalogOutputs.filter(example => example.role === value).length}</small></label>)}</fieldset>
      <fieldset><legend>By style</legend>{palettes.map(value => <label key={value}><input type="checkbox" checked={palette.includes(value)} onChange={() => toggle(value, palette, setPalette)} /><span>{value}</span><small>{catalogOutputs.filter(example => example.palette === value).length}</small></label>)}</fieldset>
    </aside>
    <main className={styles.catalog} id="collection">
      <div className={styles.catalogHeading}><div><div className={styles.titleRow}><h1>Skills marketplace</h1><span>{new Set(catalogOutputs.map(item => item.skill)).size} skills</span></div><p>See what you can make. Explore the skill behind it.</p></div>
        <label className={styles.search}><Search size={16} /><input aria-label="Search outputs" placeholder="Find an output…" value={query} onChange={e => setQuery(e.target.value)} />{query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")}><X size={14} /></button>}</label>
      </div>
      <div className={styles.catalogToolbar}><div className={styles.viewTabs}><span className={styles.selectedTab}><Monitor size={14} /> All outputs <small>{catalogOutputs.length}</small></span></div><div className={styles.toolbarActions}><button className={styles.filterToggle} type="button" aria-expanded={filtersOpen} aria-controls="catalog-filters" onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={14} /> Filters{activeCount ? ` (${activeCount})` : ""}</button><label className={styles.sort}><select aria-label="Sort outputs" value={sort} onChange={e => setSort(e.target.value)}><option value="featured">Featured</option><option value="name">Name A–Z</option></select><ChevronDown size={13} /></label></div></div>
      {(activeCount > 0 || query) && <div className={styles.filterSummary}><span role="status">{filtered.length} {filtered.length === 1 ? "output" : "outputs"} found</span><button type="button" onClick={reset}>Clear filters <X size={12} /></button></div>}
      {filtered.length ? <div className={styles.outputGrid}>{filtered.map((example, index) => <article key={example.id} className={styles.outputCard}>
        <Link href={example.href} className={styles.outputImage} aria-label={`Explore ${example.name}`}>
          <MediaPreview asset={mediaAsset(example.assetId)} motion={example.motionId ? mediaAsset(example.motionId) : undefined} priority={index < 3} />
          <span className={styles.outputType} title={`${example.output} output`}>{example.output === "Web" ? <Monitor size={14} /> : example.output === "Slides" ? <Presentation size={14} /> : <ImageIcon size={14} />}</span><span className={styles.imageFooter}><span>{example.palette}</span><span>Explore output <ArrowUpRight size={13} /></span></span>
        </Link>
        <div className={styles.cardTitle}><Link href={example.href}>{example.name}</Link>{example.publisher === "Claude Directory" && <span title="Made by Claude Directory"><Asterisk size={15} /></span>}</div>
        <div className={styles.cardMeta}><span>{example.category}</span><span>{example.output}</span></div>
      </article>)}</div> : <div className={styles.empty}><Search size={24} /><h2>No matching outputs</h2><p>Try a different search or clear your filters.</p><button type="button" className={styles.darkButton} onClick={reset}>Clear filters</button></div>}
      <div className={styles.catalogFoot}><p>Explore the output. Read how it was made on the skill page.</p></div>
    </main>
  </div>;
}
