import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Claude AI Directory, a community-driven project helping builders discover, install and share Skills, MCP servers and Agents for Claude.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container max-w-3xl py-16">
          <h1 className="text-2xl font-bold tracking-tight mb-6">About Claude AI Directory</h1>

          <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none space-y-5 text-[14.5px] leading-7 text-muted-foreground">
            <p className="text-base leading-relaxed">
              Claude AI Directory (claudeai.directory) is an independent, community-run directory built by{" "}
              <a href="https://x.com/dipakkr_" target="_blank" rel="noopener noreferrer me" className="text-primary hover:underline">
                @dipakkr_
              </a>{" "}
              to help people find, install and share what works with Claude and Claude Code.
            </p>

            <p>
              Every listing aims to answer four questions quickly: what it is, what it helps you do, who built it and how to
              install it. Where a resource can be installed, we show the install command instead of sending you to dig
              through a README.
            </p>

            <div className="rounded-lg border border-border bg-muted/30 p-5 my-8">
              <h2 className="text-base font-semibold text-foreground mt-0 mb-2">Not affiliated with Anthropic</h2>
              <p className="mb-0">
                Claude AI Directory is an independent community project. It is not affiliated with, endorsed by or sponsored
                by Anthropic,{" "}
                <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Claude.ai
                </a>{" "}
                or Claude.com. Claude and Anthropic are trademarks of Anthropic. All other names belong to their owners.
              </p>
            </div>

            <h2 className="text-lg font-semibold text-foreground">What you will find here</h2>
            <ul className="space-y-1.5">
              <li>
                <Link href="/mcp" className="font-normal text-foreground underline-offset-4">MCP servers</Link>: connect Claude to your tools and
                data, with the command to add each one to Claude Code.
              </li>
              <li>
                <Link href="/skills" className="font-normal text-foreground underline-offset-4">Skills</Link> and{" "}
                <Link href="/agents" className="font-normal text-foreground underline-offset-4">Agents</Link>: reusable instructions and
                subagents for coding, testing, research and more.
              </li>
              <li>
                <Link href="/plugins" className="font-normal text-foreground underline-offset-4">Plugins</Link>: Claude Code plugins from
                Anthropic&apos;s published marketplaces. Install counts shown there are Anthropic&apos;s.
              </li>
              <li>
                <Link href="/launches" className="font-normal text-foreground underline-offset-4">Launches</Link>: apps people built with
                Claude, with upvotes and feedback from the community.
              </li>
              <li>
                <Link href="/feed" className="font-normal text-foreground underline-offset-4">Community feed</Link>: posts, questions and
                answers from people building with Claude.
              </li>
              <li>
                <Link href="/guides" className="font-normal text-foreground underline-offset-4">Guides</Link>,{" "}
                <Link href="/prompts" className="font-normal text-foreground underline-offset-4">prompts</Link> and{" "}
                <Link href="/jobs" className="font-normal text-foreground underline-offset-4">jobs</Link> for learning Claude and finding work
                with it.
              </li>
            </ul>

            <h2 className="text-lg font-semibold text-foreground">Add what you built</h2>
            <p>
              Anyone can list a Skill, MCP server or Agent from its GitHub repository on the{" "}
              <Link href="/submit" className="text-primary hover:underline">submit page</Link>, or launch an app on{" "}
              <Link href="/launches/submit" className="text-primary hover:underline">Launches</Link>. Skill, MCP and Agent
              submissions are reviewed before they go live. Directory rankings come from install activity and recent
              interest; sponsored spots are always labelled as sponsored.
            </p>

            <h2 className="text-lg font-semibold text-foreground">Contact</h2>
            <p>
              Questions, corrections or ideas: email{" "}
              <a href="mailto:claudeai.directory@gmail.com" className="text-primary hover:underline">
                claudeai.directory@gmail.com
              </a>{" "}
              or message{" "}
              <a href="https://x.com/dipakkr_" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                @dipakkr_
              </a>{" "}
              on X.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
