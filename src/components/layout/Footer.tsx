import Link from "next/link";

const footerLinks = [
  {
    title: "Explore",
    links: [
      { label: "Skills", href: "/skills" },
      { label: "MCP servers", href: "/mcp" },
      { label: "Community", href: "/community" },
      { label: "Prompts", href: "/prompts" },
    ],
  },
  {
    title: "Work",
    links: [
      { label: "Jobs", href: "/jobs" },
      { label: "Blog", href: "/blog" },
      { label: "Learn", href: "/learn" },
      { label: "API pricing", href: "/llm-api-pricing" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Members", href: "/members" },
      { label: "Discussions", href: "/community" },
      { label: "Submit a resource", href: "/submit" },
      { label: "Sign up", href: "/signup" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Support", href: "mailto:axivionlabs@gmail.com" },
    ],
  },
];

const Footer = () => {
  return (
    <footer>
      <div className="bg-[#1C1310] text-[#FBF7F4]">
        <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-10 px-8 py-[68px] md:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-3.5">
            <div className="text-pretty text-[clamp(26px,3vw,34px)] font-medium leading-[1.14]">
              Built something with Claude?
            </div>
            <div className="max-w-[44ch] text-pretty text-[15px] leading-[1.6] text-[#C9B4A8]">
              Submit a skill, server, connector workflow or prompt. Accepted submissions are
              credited to you and stay free to browse.
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-wrap gap-2.5">
              <input
                type="email"
                placeholder="you@example.com"
                className="min-w-[200px] flex-1 rounded-lg border border-[#3A2A22] bg-[#241812] px-4 py-3.5 text-[15px] text-[#FBF7F4] outline-none placeholder:text-[#8E7568]"
              />
              <button
                type="button"
                className="whitespace-nowrap rounded-lg bg-[#F79E6B] px-6 py-3.5 text-[15px] font-semibold text-[#241812] hover:bg-white"
              >
                Get the weekly
              </button>
            </div>
            <div className="text-[13px] text-[#8E7568]">
              One email a week with new Claude resources and community additions.
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-[1180px] flex-wrap gap-10 px-8 pb-9 pt-[52px]">
          <div className="flex min-w-0 flex-[1_1_280px] flex-col gap-3">
            <Link href="/" className="flex items-center gap-2.5" aria-label="claudeai.directory home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-mark.svg" alt="" width={28} height={28} className="h-7 w-7" />
              <span className="text-[16px] font-semibold text-foreground">
                claudeai<span className="text-primary">.directory</span>
              </span>
            </Link>
            <p className="max-w-[34ch] text-[13.5px] leading-[1.6] text-muted-foreground">
              An independent, community-run index for Claude resources, workflows,
              jobs and people building with Claude.
            </p>
            <p className="text-[11px] leading-relaxed text-muted-foreground/70">
              Not affiliated with or endorsed by Anthropic, Claude.ai, or Claude.com.
            </p>
          </div>

          <div className="grid flex-[2_1_520px] grid-cols-2 gap-8 sm:grid-cols-4">
            {footerLinks.map((column) => (
              <div key={column.title} className="flex min-w-0 flex-col gap-3">
                <h3 className="text-xs font-semibold uppercase text-foreground">{column.title}</h3>
                <div className="flex flex-col gap-2">
                  {column.links.map((link) => (
                    <Link
                      key={`${column.title}-${link.label}`}
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto max-w-[1180px] px-8 pb-8">
          <div className="border-t border-border pt-5 text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} ClaudeAI Directory
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
