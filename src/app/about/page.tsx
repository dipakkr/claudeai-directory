import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About - Claude Directory",
  description:
    "Learn about Claude Directory, a community-driven project helping builders understand the Claude AI ecosystem.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container max-w-3xl py-16">
          <h1 className="text-3xl font-bold tracking-tight mb-8">
            About Claude Directory
          </h1>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg leading-relaxed">
              <strong className="text-foreground">Claude Directory</strong>{" "}
              (claudeai.directory) is an independent, community-driven project
              built to help developers, builders, and AI enthusiasts discover and
              understand more about the Claude AI ecosystem.
            </p>

            <p>
              We curate skills, MCP servers, prompts, guides, jobs, and other
              resources that help you get the most out of Claude AI. Whether
              you&apos;re a seasoned developer or just getting started, our goal
              is to make the Claude ecosystem more accessible and easier to
              navigate.
            </p>

            <div className="rounded-lg border border-border bg-muted/30 p-6 my-8">
              <h2 className="text-lg font-semibold text-foreground mt-0 mb-3">
                Important Disclaimer
              </h2>
              <p className="mb-0">
                Claude Directory is <strong className="text-foreground">NOT</strong>{" "}
                associated with Anthropic, Claude.com, or Claude.ai in any way.
                This is a community project and we are in{" "}
                <strong className="text-foreground">no way</strong> officially
                associated with{" "}
                <Link
                  href="https://claude.ai"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Claude.ai
                </Link>{" "}
                or{" "}
                <Link
                  href="https://anthropic.com"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Anthropic
                </Link>
                . All trademarks and brand names belong to their respective
                owners.
              </p>
            </div>

            <h2 className="text-xl font-semibold text-foreground">
              What We Offer
            </h2>
            <ul className="space-y-2">
              <li>
                <strong className="text-foreground">Skills Directory</strong> —
                Browse and discover Claude skills and capabilities
              </li>
              <li>
                <strong className="text-foreground">MCP Servers</strong> —
                Explore Model Context Protocol servers and integrations
              </li>
              <li>
                <strong className="text-foreground">Prompts Library</strong> —
                Find and share effective prompts for Claude
              </li>
              <li>
                <strong className="text-foreground">Learning Resources</strong>{" "}
                — Guides, tutorials, and blog posts to level up your AI skills
              </li>
              <li>
                <strong className="text-foreground">Job Board</strong> — AI and
                Claude-related job opportunities
              </li>
              <li>
                <strong className="text-foreground">Community</strong> — Connect
                with other builders in the ecosystem
              </li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">
              Community Driven
            </h2>
            <p>
              This project is built by the community, for the community. We
              welcome contributions, resource submissions, and feedback. If
              you&apos;d like to submit a resource or get involved, visit our{" "}
              <Link href="/submit" className="text-primary hover:underline">
                submission page
              </Link>{" "}
              or join the{" "}
              <Link href="/community" className="text-primary hover:underline">
                community discussions
              </Link>
              .
            </p>

            <h2 className="text-xl font-semibold text-foreground">Contact</h2>
            <p>
              Have questions, feedback, or want to get in touch? Reach out to us
              through our{" "}
              <Link href="/community" className="text-primary hover:underline">
                community page
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
