import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb";
import { BreadcrumbSchema, SoftwareApplicationSchema } from "@/components/seo/JsonLd";
import GeneratorClient, { GeneratorSkeleton } from "./GeneratorClient";

const SITE_URL = "https://www.claudeai.directory";
const PATH = "/claude-md-generator";
const TITLE = "CLAUDE.md Generator: Create a CLAUDE.md for Claude Code";
const DESCRIPTION =
  "Free CLAUDE.md generator for Claude Code. Pick your stack, tooling and working rules, then copy or download a ready-to-use CLAUDE.md file.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}${PATH}`,
    siteName: "Claude Directory",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function ClaudeMdGeneratorPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SoftwareApplicationSchema
        name="CLAUDE.md Generator"
        description={DESCRIPTION}
        url={`${SITE_URL}${PATH}`}
        category="DeveloperApplication"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: SITE_URL },
          { name: "CLAUDE.md Generator", url: `${SITE_URL}${PATH}` },
        ]}
      />
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-[1180px] px-4 pb-10 pt-10 md:px-8 md:pt-14">
          <PageBreadcrumb items={[{ label: "CLAUDE.md Generator" }]} />
          <h1 className="text-[clamp(36px,5vw,56px)] font-normal leading-[1.05] text-foreground">
            CLAUDE.md Generator
          </h1>
          <p className="mt-4 max-w-[60ch] text-pretty text-[16px] leading-relaxed text-muted-foreground md:text-[17px]">
            Claude Code reads <code className="font-mono text-[0.92em] text-foreground">CLAUDE.md</code> at the
            start of every session. Pick your stack and how you want Claude to work, then save the file in your
            project root.
          </p>
        </section>

        <section className="mx-auto max-w-[1180px] px-4 md:px-8">
          <Suspense fallback={<GeneratorSkeleton />}>
            <GeneratorClient />
          </Suspense>
        </section>

        <section className="mx-auto mt-24 max-w-[840px] px-4 pb-8 md:px-8">
          <div className="border-t border-border pt-12 text-sm leading-relaxed text-muted-foreground [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:font-sans [&_h2]:text-base [&_h2]:font-medium [&_h2]:text-foreground [&_h2:first-child]:mt-0 [&_p]:mb-3 [&_code]:font-mono [&_code]:text-foreground">
            <h2>What is CLAUDE.md?</h2>
            <p>
              <code>CLAUDE.md</code> is a Markdown file that Claude Code loads into context automatically. It holds
              the things you would otherwise repeat in every session: your stack, commands, code style, testing
              rules and git habits.
            </p>
            <h2>Where does the file go?</h2>
            <p>
              Put it in the root of your repository and commit it so your whole team shares the same instructions.
              For personal preferences across every project, use <code>~/.claude/CLAUDE.md</code> instead.
            </p>
            <h2>How should I edit the generated file?</h2>
            <p>
              Treat it as a starting point. Replace the project name, add a one-line overview, and list the exact
              commands for building, testing and linting. Keep it short: rules Claude can follow beat long
              explanations.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
