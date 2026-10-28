import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ChevronRight, Check, FileImage, Monitor, Terminal } from "lucide-react";
import MediaPreview from "../MediaPreview";
import { evaluatedSkills, mediaAsset } from "@/data/studio/catalog";
import OutputGallery from "./OutputGallery";
import PurchasePanel from "../PurchasePanel";
import Engagement from "../Engagement";
import styles from "../detail.module.css";
import media from "../media.module.css";

export function generateStaticParams() { return evaluatedSkills.map(skill => ({slug:skill.slug})); }
export async function generateMetadata({ params }: { params: Promise<{slug:string}> }): Promise<Metadata> {
  const { slug } = await params;
  const skill = evaluatedSkills.find(item => item.slug === slug);
  if (!skill) return {};
  return { title:`${skill.name} outputs | Studio`, description:skill.description, alternates:{canonical:`/studio/${slug}`} };
}
export default async function EvaluatedSkillPage({ params, searchParams }: { params: Promise<{slug:string}>; searchParams:Promise<{example?:string}> }) {
  const {slug} = await params;
  const {example} = await searchParams;
  const skill = evaluatedSkills.find(item => item.slug === slug);
  if (!skill) notFound();
  return <main className={styles.page}>
    <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/studio"><ArrowLeft size={14} /> All skills</Link><ChevronRight size={12}/><span>{skill.type}</span><ChevronRight size={12}/><span>{skill.name}</span></nav>
    <div className={styles.productGrid}>
      <section className={styles.preview} id="outputs" aria-label="Generated outputs">
        <OutputGallery key={example ?? skill.slug} ids={skill.assets} motionId={skill.motion} initial={example}/>
        <dl className={styles.runtimeCard}>
          <div><dt>Created with</dt><dd>{skill.package}</dd></div>
          <div><dt>You’ll need</dt><dd>{skill.dependencies}</dd></div>
          <div><dt>Outside costs</dt><dd>{skill.costs}</dd></div>
          <div><dt>Captured at</dt><dd>{skill.resolution}</dd></div>
        </dl>
      </section>
      <section className={styles.summary} aria-label="Skill summary">
        <div className={styles.productTags}><span>{skill.type} skill</span></div>
        <div className={styles.productTitle}><h1>{skill.name}</h1></div>
        <p className={styles.subtitle}>{skill.description}</p>
        <Engagement slug={skill.slug}/>
        <div className={styles.skillAttributes}><span><FileImage size={15}/>{skill.output}</span><span>{skill.assets.length} gallery images</span></div>
        <dl className={styles.productFacts}>
          <div><dt><Monitor size={16}/> Output size</dt><dd>{skill.resolution}</dd></div>
          <div><dt><Terminal size={16}/> Requirements</dt><dd>{skill.dependencies}</dd></div>
        </dl>
        <PurchasePanel slug={skill.slug}/>
        <a className={styles.secondaryButton} href="#workflow">See how it works <ArrowUpRight size={14}/></a>
        <div className={styles.proof}><Check size={15}/><span>Generated and reviewed by Claude Directory</span></div>
        <p className={styles.summaryStory}>{skill.story}</p>
        <div className={styles.audience}><span>Useful for</span><div>{skill.audience.map(person => <span key={person}>{person}</span>)}</div></div>
        <div className={styles.summaryFoot}><span>Source: Skillry</span><span>Reviewed Oct 28, 2026</span></div>
      </section>
    </div>
    <section className={styles.fitGrid} aria-label="Skill scope">
      <div><h2>What you get</h2><ul>{skill.deliverables.map(item => <li key={item}><Check size={15}/><span>{item}</span></li>)}</ul></div>
      <div><h2>Good fit</h2><ul>{skill.goodFor.map(item => <li key={item}><Check size={15}/><span>{item}</span></li>)}</ul></div>
      <div><h2>Before you start</h2><ul>{skill.boundaries.map(item => <li key={item}><Terminal size={15}/><span>{item}</span></li>)}</ul></div>
    </section>
    <nav className={styles.sectionNav} aria-label="Skill details"><a href="#outputs">Outputs</a><a href="#workflow">Workflow</a><a href="#testing">Testing notes</a><a href="#prompt">Example prompt</a></nav>
    <section className={styles.details} id="workflow" aria-label="How it runs and what was tested">
      <h2 className={styles.aboutTitle}>From brief to finished output</h2>
      <div className={media.evidence}>
        <div><h3>How to run it</h3><ol>{skill.steps.map(step => <li key={step}>{step}</li>)}</ol></div>
        <div id="testing"><h3>What we tested</h3><ul>{skill.checks.map(check => <li key={check}>{check}</li>)}</ul><p>{skill.limits}</p></div>
      </div>
      <div className={media.prompt} id="prompt"><strong>The request behind this output</strong><p>{skill.prompt}</p></div>
    </section>
    <section className={styles.faq} aria-labelledby="faq-title"><h2 id="faq-title">Questions, answered</h2>{skill.faq.map(item => <details key={item.question}><summary>{item.question}<ChevronRight size={16}/></summary><p>{item.answer}</p></details>)}</section>
    <section className={styles.related} aria-labelledby="related-title"><div><h2 id="related-title">Keep exploring</h2><Link href="/studio">All skills <ArrowUpRight size={14}/></Link></div><div className={styles.relatedGrid}>{evaluatedSkills.filter(item => item.slug !== skill.slug).map(item => <Link href={`/studio/${item.slug}`} key={item.slug}><div><MediaPreview asset={mediaAsset(item.assets[0])}/></div><span>{item.type}</span><h3>{item.name}</h3><p>{item.description}</p></Link>)}</div></section>
    <footer className={styles.bottom}><Link href="/studio"><ArrowLeft size={14}/> Back to all outputs</Link><span>{skill.output} · {skill.resolution}</span></footer>
  </main>;
}
