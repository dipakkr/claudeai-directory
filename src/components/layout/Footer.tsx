import Link from "next/link";
import { Linkedin } from "lucide-react";

import { DiscordIcon } from "@/components/icons/DiscordIcon";
import { Logo } from "@/components/layout/Logo";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";
import { FooterSubscribe } from "@/components/layout/FooterSubscribe";
import { SOCIAL_LINKS } from "@/lib/social";

const footerLinks = [
  {
    title: "Explore",
    links: [
      { label: "Skills", href: "/skills" },
      { label: "MCP servers", href: "/mcp" },
      { label: "Agents", href: "/agents" },
      { label: "Jobs", href: "/jobs" },
      { label: "Prompts", href: "/prompts" },
      { label: "Connectors", href: "/connectors" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Discussions", href: "/community" },
      { label: "Members", href: "/members" },
      { label: "Showcase", href: "/showcase" },
      { label: "Discord", href: SOCIAL_LINKS.discord },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Guides", href: "/guides" },
      { label: "Blog", href: "/blog" },
      { label: "Claude Code Cheatsheet", href: "/cheatsheet" },
      { label: "CLAUDE.md Generator", href: "/setup" },
      { label: "LLM API Pricing", href: "/llm-api-pricing" },
      { label: "Anthropic Timeline", href: "/anthropic-claude-release-timelines" },
    ],
  },
  {
    title: "Contribute",
    links: [
      { label: "Submit a resource", href: "/submit" },
      { label: "Submit your app", href: "/showcase/submit" },
      { label: "Sign up", href: "/signup" },
      { label: "About", href: "/about" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Support", href: "mailto:axivionlabs@gmail.com" },
    ],
  },
];

const isExternal = (href: string) => /^(https?:|mailto:)/.test(href);

const Footer = () => {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto max-w-[1180px] px-4 md:px-8">
        <div className="flex flex-col gap-5 border-b border-border py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[15px] text-foreground">The weekly Claude digest</p>
            <p className="mt-1 text-sm text-muted-foreground">
              New Skills, MCP servers and Agents worth installing. One email a week.
            </p>
          </div>
          <FooterSubscribe />
        </div>

        <div className="grid grid-cols-2 gap-10 py-12 md:grid-cols-4">
          {footerLinks.map((column) => (
            <div key={column.title} className="flex min-w-0 flex-col gap-4">
              <h3 className="font-sans text-sm font-medium text-foreground">{column.title}</h3>
              <div className="flex flex-col gap-2.5">
                {column.links.map((link) =>
                  isExternal(link.href) ? (
                    <a
                      key={link.label}
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link key={link.label} href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                      {link.label}
                    </Link>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-5 border-t border-border py-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1.5">
            <Logo muted />
            <p className="text-xs text-muted-foreground/80">
              Independent and community-run. Not affiliated with or endorsed by Anthropic, Claude.ai, or Claude.com.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <a
              href={SOCIAL_LINKS.discord}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Join the community on Discord"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <DiscordIcon className="h-[18px] w-[18px]" />
            </a>
            <a
              href={SOCIAL_LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Linkedin className="h-[18px] w-[18px]" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
