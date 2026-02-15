import Link from "next/link";

const footerLinks = [
  {
    title: "Explore",
    links: [
      { label: "Skills", href: "/skills" },
      { label: "MCP Servers", href: "/mcp" },
      { label: "Prompts", href: "/prompts" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Learn", href: "/learn" },
      { label: "Jobs", href: "/jobs" },
      { label: "LLM API Pricing", href: "/llm-api-pricing" },
      { label: "Cost Calculator", href: "/llm-api-pricing/cost-calculator" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Discussions", href: "/community" },
      { label: "Submit Resource", href: "/submit" },
      { label: "Sign Up", href: "/signup" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/20">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-5">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3"
            >
              <div className="h-5 w-5 rounded bg-primary flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary-foreground">C</span>
              </div>
              Claude Directory
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The directory for Claude AI. Discover skills, MCP servers, prompts, and more.
            </p>
          </div>

          {/* Link Columns */}
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-medium text-foreground mb-3 uppercase tracking-wider">
                {col.title}
              </h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-border space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Claude Directory
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Link href="/about" className="hover:text-foreground transition-colors">
                About
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground/60">
            Claude Directory is not affiliated with or endorsed by Anthropic, Claude.ai, or Claude.com. This is an independent community project.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
