"use client";

import { ArrowUpRight, Download, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { ResourceGuide as Guide } from "@/data/resource-guides";
import { CopyButton } from "./detail";

export function ResourceGuide({ guide }: { guide: Guide }) {
  const heading = "text-xl font-semibold text-foreground";
  return (
    <div className="mt-8 min-w-0 space-y-10 text-sm leading-7 text-muted-foreground [&_section]:scroll-mt-24">
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="inline-flex items-center gap-1.5 rounded-sm py-2 text-xs hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground">
              <Info aria-hidden="true" className="h-3.5 w-3.5" />
              About this guide
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" align="start" className="max-w-[min(260px,calc(100vw-32px))] text-xs leading-5">
            Sources checked {guide.checkedAt}. Not independently tested.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <nav aria-label="Resource guide sections" className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {[['fit', 'Is it for you?'], ['first-task', 'Try a task'], ['setup-guide', 'Setup'], ['access', 'Access & cost'], ['troubleshooting', 'Troubleshooting']].map(([id, label]) => <a key={id} href={`#${id}`} className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground">{label}</a>)}
      </nav>
      <section id="fit">
        <h2 className={heading}>Is it right for your task?</h2>
        <dl className="mt-4 space-y-4">
          {[['Use it when', guide.fit], ['Skip it when', guide.avoid], ['Start simpler', guide.simpler]].map(([label, value]) => <div key={label} className="grid gap-1 sm:grid-cols-[130px_minmax(0,1fr)] sm:gap-4"><dt className="font-medium text-foreground">{label}</dt><dd>{value}</dd></div>)}
        </dl>
      </section>
      <section id="first-task">
        <h2 className={heading}>{guide.example.title}</h2>
        <p className="mt-2">Example brief. Adapt it to your own test project.</p>
        {guide.example.files && <div className="mt-3"><p>Download these synthetic sample files into your allowed test folder:</p><div className="mt-2 flex flex-wrap gap-4">{guide.example.files.map(file => <a key={file.href} href={file.href} download className="inline-flex items-center gap-2 text-foreground underline underline-offset-4"><Download className="h-4 w-4" />{file.label}</a>)}</div></div>}
        <div className="mt-3 rounded-lg border border-border bg-muted/30 p-4">
          <p className="whitespace-pre-wrap text-foreground">{guide.example.input}</p>
          <div className="mt-3"><CopyButton text={guide.example.input} label="Copy example" /></div>
        </div>
        <h3 className="mt-5 font-semibold text-foreground">What to expect</h3><p>{guide.example.expected}</p>
        <h3 className="mt-4 font-semibold text-foreground">Check the result</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">{guide.example.checks.map(x => <li key={x}>{x}</li>)}</ul>
      </section>
      <section id="setup-guide">
        <h2 className={heading}>Before you start</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">{guide.prerequisites.map(x => <li key={x}>{x}</li>)}</ul>
        <dl className="mt-5 divide-y divide-border border-y border-border">{guide.compatibility.map(x => <div key={x.surface} className="grid gap-1 py-3 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-4"><dt className="font-medium text-foreground">{x.surface}</dt><dd>{x.detail}</dd></div>)}</dl>
        <h3 className="mt-6 font-semibold text-foreground">Setup and first use</h3>
        <ol className="mt-3 list-decimal space-y-3 pl-5">{guide.steps.map(x => <li key={x} className="pl-1">{x}</li>)}</ol>
        <a href="#install" className="mt-4 inline-flex items-center gap-1 text-foreground underline underline-offset-4">Open installation options <ArrowUpRight className="h-4 w-4" /></a>
      </section>
      <section id="access">
        <h2 className={heading}>Access, cost, and limits</h2>
        <h3 className="mt-4 font-semibold text-foreground">What access are you granting?</h3><p>{guide.permissions}</p>
        <h3 className="mt-4 font-semibold text-foreground">What does it cost?</h3><p>{guide.costs}</p>
        <h3 className="mt-4 font-semibold text-foreground">Limitations to keep in mind</h3><ul className="mt-2 list-disc space-y-2 pl-5">{guide.limits.map(x => <li key={x}>{x}</li>)}</ul>
      </section>
      <section id="troubleshooting">
        <h2 className={heading}>If something goes wrong</h2>
        <div className="mt-3 divide-y divide-border">{guide.troubleshooting.map(x => <div key={x.symptom} className="py-4"><h3 className="font-semibold text-foreground">{x.symptom}</h3><p className="mt-1">{x.action}</p></div>)}</div>
      </section>
      <section id="guide-sources" className="border-t border-border pt-6">
        <h2 className={heading}>Sources and review scope</h2>
        <p className="mt-2">Publisher: {guide.publisher}. This editorial guide checks published documentation, not runtime behavior. The examples and acceptance checks are our suggested exercises.</p>
        <ul className="mt-4 space-y-4">{guide.sources.map(x => <li key={x.href}><a href={x.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-foreground underline underline-offset-4">{x.label}<ArrowUpRight className="h-3.5 w-3.5" /></a><p className="text-xs leading-6">{x.supports}</p></li>)}</ul>
        <p className="mt-4 text-xs">Reviewed {guide.checkedAt}. Recheck due 2026-10-21, or sooner if setup changes. No installation or workflow execution is claimed.</p>
        <a className="mt-3 inline-block text-sm text-foreground underline underline-offset-4" href={`mailto:claudeai.directory@gmail.com?subject=${encodeURIComponent(`Correction: ${guide.title}`)}`}>Report an issue with this guide</a>
      </section>
    </div>
  );
}
