import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CopyButton } from "@/components/directory/detail";
import { BreadcrumbSchema, JsonLd } from "@/components/seo/JsonLd";
import docs from "@/data/claude-code-commands.json";
import {
  cliGuide,
  commandCategories,
  commandGuide,
  keyFlags,
  notCommands,
  topCommands,
} from "@/data/claude-code-commands-guide";
import CommandsExplorer, { type ExplorerGroup } from "./CommandsExplorer";

const SITE_URL = "https://www.claudeai.directory";
const PATH = "/claude-code-commands";
const title = "Claude Code Commands: Every Slash Command Explained";
const description = `All ${docs.commands.length} Claude Code slash commands in plain English, starting with the ones you will use every day, plus CLI flags, keyboard shortcuts and input prefixes.`;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: PATH },
  openGraph: { title, description, url: PATH, type: "article" },
  twitter: { card: "summary", title, description },
};

type DocCommand = (typeof docs.commands)[number];

const checked = new Date(`${docs.checkedAt}T00:00:00Z`).toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function guideFor(c: DocCommand) {
  const guide = commandGuide[c.name];
  if (!guide && process.env.NODE_ENV !== "production") {
    throw new Error(`Missing entry for ${c.name} in src/data/claude-code-commands-guide.ts`);
  }
  return guide;
}

function badges(c: DocCommand) {
  const out: string[] = [];
  if (c.kind === "skill") out.push("Bundled skill");
  if (c.kind === "workflow") out.push("Workflow");
  if (c.aliasOf) out.push(`Alias of ${c.aliasOf}`);
  if (c.hidden) out.push("Type in full");
  if (c.minVersion) out.push(`v${c.minVersion}+`);
  out.push(...c.requirements.map(r => `Needs ${r}`));
  return out;
}

const heading = "font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground";
const kbd = "rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[12px] text-foreground";

const faqs = [
  {
    q: "How do I see which commands I can use?",
    a: "Type / at the start of the prompt in Claude Code. A menu lists every command available to you, and typing more letters filters it. Availability depends on your plan, platform and version, so some commands on this page may not appear for you.",
  },
  {
    q: "Is there an undo command in Claude Code?",
    a: "Yes. /rewind rolls code and conversation back to an earlier checkpoint, and /undo and /checkpoint are aliases for it. You can also press Esc twice on an empty prompt to open the same menu.",
  },
  {
    q: "What is the difference between /clear and /compact?",
    a: "/clear starts a new conversation with an empty context, which is best when you switch to an unrelated task. /compact keeps the same conversation but replaces the history with a summary to free up space.",
  },
  {
    q: "How do I make my own slash command?",
    a: "Create a skill: a folder with a SKILL.md file inside .claude/skills/ in your project, or ~/.claude/skills/ for all your projects. The folder name becomes the command, so .claude/skills/deploy/SKILL.md runs as /deploy.",
  },
  {
    q: "What is the difference between slash commands and CLI flags?",
    a: "Slash commands run inside a Claude Code session, such as /model or /compact. CLI flags are added when you start Claude Code from your shell, such as claude -c to continue your last conversation or claude -p to run one prompt from a script.",
  },
];

export default function ClaudeCodeCommandsPage() {
  const byName = new Map(docs.commands.map(c => [c.name, c]));
  const active = docs.commands.filter(c => !c.removed);
  const removed = docs.commands.filter(c => c.removed);

  const groups: ExplorerGroup[] = commandCategories
    .map(cat => ({
      id: cat.id,
      label: cat.label,
      commands: active
        .filter(c => guideFor(c)?.category === cat.id)
        .map(c => ({
          name: c.name,
          usage: c.usage,
          summary: commandGuide[c.name].summary,
          details: commandGuide[c.name].details,
          aliases: c.aliases,
          badges: badges(c),
          docsUrl: c.docsUrl,
        })),
    }))
    .filter(g => g.commands.length > 0);

  const top = topCommands.filter(t => byName.has(t.name));
  const flagSet = new Set(docs.flags.flatMap(f => f.flags.map(x => x.split(" ")[0])));
  const flags = keyFlags.filter(f => f.flag.split(", ").every(x => flagSet.has(x)));
  // Removed commands can't be myths: they were real. Only list names the docs don't have at all.
  const myths = notCommands.filter(m => !byName.has(m.name) && !docs.commands.some(c => (c.aliases as string[]).includes(m.name)));

  const { shortcuts } = docs;
  const firstSentence = (s: string) => s.split(/(?<=\.)\s/)[0].replace(/\.$/, "");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Claude Code Commands", url: `${SITE_URL}${PATH}` },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: title,
          description,
          dateModified: docs.checkedAt,
          url: `${SITE_URL}${PATH}`,
          isBasedOn: docs.sources.commands,
        }}
      />
      <Header />
      <main className="flex-1">
        <CommandsExplorer
          groups={groups}
          start={[{ id: "top-commands", label: `Top ${top.length} to learn first` }]}
          reference={[
            { id: "cli", label: "Terminal commands and flags" },
            { id: "shortcuts", label: "Keyboard shortcuts" },
            { id: "removed", label: "Removed commands and mix-ups" },
            { id: "faq", label: "FAQ" },
          ]}
          intro={
            <>
              <section className="pb-4 pt-10 md:pt-12">
                <nav aria-label="Breadcrumb" className="text-[13px] text-muted-foreground">
                  <Link href="/" className="hover:text-foreground">Home</Link>
                  <span className="px-2">/</span>
                  <span className="text-foreground">Claude Code Commands</span>
                </nav>
                <h1 className="mt-5 max-w-[760px] text-[clamp(34px,4.6vw,52px)] font-normal leading-[1.05] text-foreground">
                  Claude Code commands
                </h1>
                <p className="mt-4 max-w-[680px] text-pretty text-[16px] leading-relaxed text-muted-foreground md:text-[17px]">
                  Every slash command in Claude Code, explained in plain words. Start with the {top.length} commands most people
                  use every day, then look up the other {active.length - top.length} by category, along with CLI flags and
                  keyboard shortcuts.
                </p>
                <p className="mt-3 text-[13px] text-muted-foreground">
                  Checked against the{" "}
                  <a href={docs.sources.commands} target="_blank" rel="noopener" className="underline underline-offset-4 hover:text-foreground">
                    official Claude Code docs
                  </a>{" "}
                  on {checked}. Type <kbd className={kbd}>/</kbd> in Claude Code to see what your version and plan include.
                </p>
              </section>

              <section className="mt-10" aria-labelledby="top-commands">
                <h2 id="top-commands" className={`${heading} scroll-mt-24`}>
                  Top {top.length} commands to learn first
                </h2>
                <ol className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {top.map((t, i) => (
                    <li key={t.name} className="flex min-w-0 flex-col rounded-lg border border-border bg-card p-4">
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-[12px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                        <a href={`#cmd-${t.name.slice(1)}`} className="font-mono text-[16px] text-foreground hover:text-primary">
                          {t.name}
                        </a>
                      </div>
                      <p className="mt-2 flex-1 text-[14px] leading-relaxed text-muted-foreground">{t.why}</p>
                      <div className="mt-3 flex items-center gap-2 rounded-md bg-muted px-2.5 py-1.5">
                        <code className="min-w-0 flex-1 truncate font-mono text-[12px] text-foreground" title={t.example}>
                          {t.example}
                        </code>
                        <CopyButton text={t.example} />
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            </>
          }
          after={
            <>
              <section className="mt-20" aria-labelledby="cli">
                <h2 id="cli" className={`${heading} scroll-mt-24`}>Terminal commands</h2>
                <p className="mt-3 max-w-[70ch] text-[14px] leading-relaxed text-muted-foreground">
                  Run these from your shell, not inside a session.
                </p>
                <ul className="mt-4 divide-y divide-border border-y border-border">
                  {docs.cli.map(c => (
                    <li key={c.usage} className="grid gap-1 py-3 md:grid-cols-[300px_1fr] md:gap-6">
                      <code className="break-words font-mono text-[13px] text-foreground">{c.usage}</code>
                      <span className="text-[14px] text-muted-foreground">{cliGuide[c.usage] ?? ""}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="mt-12 text-[20px] font-normal text-foreground">Flags worth knowing</h3>
                <ul className="mt-3 divide-y divide-border border-y border-border">
                  {flags.map(f => (
                    <li key={f.flag} className="grid gap-1.5 py-3 md:grid-cols-[300px_1fr] md:gap-6">
                      <code className="font-mono text-[13px] text-foreground">{f.flag}</code>
                      <div className="min-w-0">
                        <p className="text-[14px] text-muted-foreground">{f.summary}</p>
                        <code className="mt-1 block break-words font-mono text-[12px] text-foreground/80">{f.example}</code>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-[13px] text-muted-foreground">
                  There are {docs.flags.length} flags in total. See the{" "}
                  <a href={docs.sources.cli} target="_blank" rel="noopener" className="underline underline-offset-4 hover:text-foreground">
                    CLI reference
                  </a>{" "}
                  for the full list.
                </p>
              </section>

              <section className="mt-20" aria-labelledby="shortcuts">
                <h2 id="shortcuts" className={`${heading} scroll-mt-24`}>Keyboard shortcuts and input prefixes</h2>
                <div className="mt-4 grid gap-8 xl:grid-cols-2">
                  <div>
                    <h3 className="text-[20px] font-normal text-foreground">Start your prompt with</h3>
                    <dl className="mt-3 divide-y divide-border border-y border-border">
                      {shortcuts.prefixes.map(s => (
                        <div key={s.keys} className="flex items-baseline gap-4 py-2.5">
                          <dt className="w-32 shrink-0"><kbd className={kbd}>{s.keys}</kbd></dt>
                          <dd className="text-[14px] text-muted-foreground">{s.description}</dd>
                        </div>
                      ))}
                    </dl>
                    <h3 className="mt-10 text-[20px] font-normal text-foreground">New line without sending</h3>
                    <dl className="mt-3 divide-y divide-border border-y border-border">
                      {shortcuts.multiline.map(s => (
                        <div key={s.keys} className="flex items-baseline gap-4 py-2.5">
                          <dt className="w-32 shrink-0"><kbd className={kbd}>{s.keys}</kbd></dt>
                          <dd className="text-[14px] text-muted-foreground">{s.notes}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <div>
                    <h3 className="text-[20px] font-normal text-foreground">While Claude works</h3>
                    <dl className="mt-3 divide-y divide-border border-y border-border">
                      {shortcuts.general.map(s => (
                        <div key={s.keys} className="grid gap-1 py-2.5 sm:grid-cols-[180px_1fr] sm:gap-4">
                          <dt><kbd className={`${kbd} inline-block whitespace-normal`}>{s.keys}</kbd></dt>
                          <dd className="text-[14px] text-muted-foreground">{firstSentence(s.description)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
                <details className="mt-8 rounded-lg border border-border bg-card p-4">
                  <summary className="cursor-pointer text-[15px] text-foreground">Text editing shortcuts</summary>
                  <dl className="mt-3 divide-y divide-border">
                    {shortcuts.editing.map(s => (
                      <div key={s.keys} className="grid gap-1 py-2 sm:grid-cols-[180px_1fr] sm:gap-4">
                        <dt><kbd className={kbd}>{s.keys}</kbd></dt>
                        <dd className="text-[14px] text-muted-foreground">{s.description}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              </section>

              <section className="mt-20" aria-labelledby="removed">
                <h2 id="removed" className={`${heading} scroll-mt-24`}>Removed commands and common mix-ups</h2>
                <ul className="mt-4 divide-y divide-border border-y border-border">
                  {removed.map(c => (
                    <li key={c.name} className="grid gap-1 py-3 md:grid-cols-[240px_1fr] md:gap-6">
                      <div>
                        <code className="font-mono text-[14px] text-foreground">{c.name}</code>
                        <span className="ml-2 rounded border border-border px-1.5 py-px text-[11px] text-muted-foreground">Removed</span>
                      </div>
                      <span className="text-[14px] text-muted-foreground">{commandGuide[c.name]?.details}</span>
                    </li>
                  ))}
                  {myths.map(m => (
                    <li key={m.name} className="grid gap-1 py-3 md:grid-cols-[240px_1fr] md:gap-6">
                      <div>
                        <code className="font-mono text-[14px] text-foreground">{m.name}</code>
                        <span className="ml-2 rounded border border-border px-1.5 py-px text-[11px] text-muted-foreground">Not a command</span>
                      </div>
                      <span className="text-[14px] text-muted-foreground">{m.instead}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mb-24 mt-20" aria-labelledby="faq">
                <h2 id="faq" className="scroll-mt-24 text-[26px] font-normal text-foreground">Questions about Claude Code commands</h2>
                <div className="mt-6 divide-y divide-border border-y border-border">
                  {faqs.map(f => (
                    <details key={f.q} className="group py-4">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] text-foreground">
                        {f.q}
                        <span aria-hidden className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
                      </summary>
                      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{f.a}</p>
                    </details>
                  ))}
                </div>
                <p className="mt-8 text-[14px] text-muted-foreground">
                  Looking for hooks, subagents and settings too? See the{" "}
                  <Link href="/cheatsheet" className="underline underline-offset-4 hover:text-foreground">Claude Code cheatsheet</Link>.
                </p>
              </section>
            </>
          }
        />
      </main>
      <Footer />
    </div>
  );
}
