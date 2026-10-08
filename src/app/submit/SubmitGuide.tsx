import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BreadcrumbSchema, JsonLd } from "@/components/seo/JsonLd";

// The crawlable half of /submit. The form above it is interactive and thin, so this is
// where "submit to Claude Directory" gets answered in plain text: what the directory is,
// what you can list, what a good submission looks like, and what happens afterwards.
// It also covers Anthropic's own directory, because people searching this phrase want
// both, and sending them to the right place is more useful than pretending we are it.

const SITE_URL = "https://www.claudeai.directory";

const STEPS = [
  {
    name: "Pick what you are submitting",
    text: "Choose Skill, MCP server or Agent. Apps built with Claude go through the launch flow instead, where they get a launch page, upvotes and a badge.",
  },
  {
    name: "Paste the GitHub repository URL",
    text: "We read the repo and fill in the name, description, author, stars, license, the SKILL.md or agent file, and the install method. Nothing to type by hand.",
  },
  {
    name: "Check the details and send it for review",
    text: "Fix the title, description or category if we got them wrong, then submit. A person checks the repository and the install details before anything goes live.",
  },
];

const FAQ = [
  {
    q: "What is Claude Directory?",
    a: "Claude Directory is a community directory of resources for Claude: Skills, MCP servers, Agents and Plugins, with install commands that work in Claude Code. People come here to find something for Claude, install it and come back when they need the next thing.",
  },
  {
    q: "What can I submit?",
    a: "Skills (a repo with a SKILL.md), MCP servers (the server's repo, remote or local) and Claude Code Agents (a repo with an agent .md file). Apps built with Claude have their own launch flow. Plugins are listed from Anthropic's marketplace files and are not submitted here.",
  },
  {
    q: "Does it cost anything?",
    a: "No. Listing is free and there is no paid placement. Ranking comes from install activity, views and recency, not from payment.",
  },
  {
    q: "How long does review take?",
    a: "Usually one to two days. We check the repository by hand, confirm the install method, and only then show an install command on the listing.",
  },
  {
    q: "Why was my submission not published?",
    a: "The usual reasons: the repo has no SKILL.md or agent file where we can find it, the README does not explain what the resource does, the install steps do not work, or the project duplicates something already listed. You can resubmit once it is fixed.",
  },
  {
    q: "Can I submit someone else's project?",
    a: "Yes, as long as it is public and the listing points at the original repository. The author is credited from the repo, not from your account.",
  },
  {
    q: "How is this different from Anthropic's directory at claude.ai/directory?",
    a: "Anthropic's directory is the official catalog inside Claude, submitted through claude.ai/directory/manage and reviewed by Anthropic. Claude Directory is an independent community site focused on discovery and one-step install for Claude Code. Many creators list in both.",
  },
];

export function SubmitGuide() {
  return (
    <>
      <BreadcrumbSchema items={[{ name: "Home", url: SITE_URL }, { name: "Submit", url: `${SITE_URL}/submit` }]} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "How to submit to Claude Directory",
          description: "List a Claude Skill, MCP server or Agent on Claude Directory from its GitHub repository in under a minute.",
          totalTime: "PT1M",
          step: STEPS.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.name, text: s.text })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />

      <div className="mt-16 space-y-12 border-t border-border pt-12">
        <section>
          <h2 className="text-[22px] font-light leading-tight text-foreground">How to submit to Claude Directory</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-[var(--cad-desc)]">
            Three steps from a GitHub URL to a listing with a working install command. Most people finish in under a minute.
          </p>
          <ol className="mt-6 space-y-5">
            {STEPS.map((s, i) => (
              <li key={s.name} className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border font-mono text-[12px] text-muted-foreground">
                  {i + 1}
                </span>
                <div>
                  <p className="text-[15px] text-foreground">{s.name}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="text-[22px] font-light leading-tight text-foreground">What you can list</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              { href: "/skills", label: "Skills", body: "Instructions and scripts that teach Claude a task. Installed through the Claude Code plugin marketplace." },
              { href: "/mcp", label: "MCP servers", body: "Connectors that give Claude a tool, app or data source. Listed with a ready claude mcp add command." },
              { href: "/agents", label: "Agents", body: "Claude Code subagents for a specific job such as reviews, tests or debugging." },
              { href: "/launches/submit", label: "Apps built with Claude", body: "Products made with Claude. A launch page, upvotes and a badge for your site." },
            ].map((t) => (
              <li key={t.href} className="rounded-[11px] border border-border p-4">
                <Link href={t.href} className="text-[15px] font-medium text-foreground hover:underline hover:underline-offset-4">
                  {t.label}
                </Link>
                <p className="mt-1 text-[13.5px] leading-snug text-[var(--cad-desc)]">{t.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-[22px] font-light leading-tight text-foreground">What gets a submission approved quickly</h2>
          <ul className="mt-5 space-y-3 text-[15px] leading-relaxed text-[var(--cad-desc)]">
            <li><span className="text-foreground">A public GitHub repo</span> with the resource file where we expect it: SKILL.md for a Skill, an agent .md file for an Agent, the server code for an MCP.</li>
            <li><span className="text-foreground">A README that says what it does</span> in the first paragraph, and what it needs (API keys, accounts, a running service).</li>
            <li><span className="text-foreground">Install steps that work</span>. We run them. If an MCP needs environment variables, name them in the README.</li>
            <li><span className="text-foreground">A license</span>. Unlicensed repos are listed, but they rank below licensed ones with the same activity.</li>
            <li><span className="text-foreground">One listing per project</span>. If a plugin already bundles your Skill, link the plugin rather than submitting the Skill again.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[22px] font-light leading-tight text-foreground">After you are listed</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-[var(--cad-desc)]">
            Your listing gets a page with a copyable install command, and every install action counts. Trending rewards recent
            momentum rather than lifetime totals, so a new listing that people actually install can reach the front page in its
            first week. Share the listing link, embed the badge, and the installs follow you back to the repo.
          </p>
          <ul className="mt-4 space-y-2 text-[15px] text-[var(--cad-desc)]">
            <li><Link href="/" className="text-foreground hover:underline hover:underline-offset-4">Trending</Link> on the homepage, refreshed daily</li>
            <li><Link href="/stats" className="text-foreground hover:underline hover:underline-offset-4">Open stats</Link> for the whole directory</li>
            <li><Link href="/dashboard" className="text-foreground hover:underline hover:underline-offset-4">Your dashboard</Link> lists everything you published</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[22px] font-light leading-tight text-foreground">Also submitting to Anthropic&apos;s directory?</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-[var(--cad-desc)]">
            Anthropic runs its own directory inside Claude at claude.ai/directory. It is a separate submission with its own
            review, and listing there and here are both worth doing. The short version of Anthropic&apos;s process:
          </p>
          <ul className="mt-4 space-y-2 text-[15px] leading-relaxed text-[var(--cad-desc)]">
            <li>Submit at <span className="text-foreground">claude.ai/directory/manage</span> on any paid Claude plan. Choose MCP connector or Plugin.</li>
            <li>MCP connectors must be remote (an https URL), use OAuth 2.0 when they act on a user&apos;s account, and give every tool a title plus a readOnlyHint or destructiveHint annotation.</li>
            <li>Local MCP servers and Skills are not standalone types there. Bundle them in a plugin hosted in a public GitHub repo.</li>
            <li>Have ready: documentation URL, privacy policy URL, support contact, an icon, and a test account for reviewers.</li>
            <li>Submissions are scanned automatically and listed as Community by default. Some get a human review.</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a href="https://claude.com/docs/connectors/building/submission" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-foreground hover:underline hover:underline-offset-4">
              Connector submission docs <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <a href="https://claude.com/docs/plugins/submit" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-foreground hover:underline hover:underline-offset-4">
              Plugin submission docs <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </section>

        <section>
          <h2 className="text-[22px] font-light leading-tight text-foreground">Questions</h2>
          <dl className="mt-5 space-y-5">
            {FAQ.map((f) => (
              <div key={f.q}>
                <dt className="text-[15px] text-foreground">{f.q}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </>
  );
}
