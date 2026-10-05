import type { ConnectorGuide } from "@/lib/connector-guides";

const CHECKED = "2026-10-05";
const ADAPTER = "https://github.com/WordPress/mcp-adapter";
const WPCOM_SUPPORT = "https://wordpress.com/support/mcp/";

const wordpress: ConnectorGuide = {
  slug: "wordpress",
  app: "WordPress",
  category: "cms",
  description:
    "Connect WordPress to Claude: the official WordPress.com connector, or the MCP Adapter plugin for self-hosted sites, with tested setup for Claude Code.",
  quickAnswer:
    "On WordPress.com, add the official WordPress.com connector in Claude under Customize, then Connectors. It needs a paid plan. On a self-hosted site, install the official MCP Adapter plugin plus a plugin that adds content abilities, such as Enable Abilities for MCP, then connect Claude Code with an Application Password.",
  keyFacts: [
    "WordPress.com has an official Claude connector, made by Automattic. It needs a paid WordPress.com plan, though free sites can use it for their first 30 days.",
    "Self-hosted WordPress 6.9 or later uses the official MCP Adapter plugin, which serves MCP at `/wp-json/mcp/mcp-adapter-default-server`.",
    "On its own, MCP Adapter only shares site and user info. To read and write posts, add a plugin that registers content abilities.",
    "Claude works with the permissions of the WordPress user you connect as. Use a dedicated Editor account, not an admin.",
    "Claude.ai in the browser can only reach a self-hosted site that is public on HTTPS.",
  ],
  evidence: [
    {
      src: "/connectors/wordpress/claude-code-posts.png",
      width: 1600,
      height: 373,
      alt: "Claude Code in a terminal listing four WordPress posts with their status and category",
    },
    {
      src: "/connectors/wordpress/claude-code-todo.png",
      width: 1600,
      height: 495,
      alt: "Claude Code in a terminal finding two WordPress drafts that still contain TODO notes and listing what is left",
    },
  ],
  methods: [
    {
      kind: "official_connector",
      name: "WordPress.com connector",
      maintainer: "Automattic",
      isOfficial: true,
      url: "https://claude.com/marketplace/connectors/wordpress-com",
      worksIn: ["claude_ai", "desktop", "claude_code"],
      auth: "oauth",
      needs: "A paid WordPress.com plan, or a free site in its first 30 days",
      status: "active",
      note: "The easiest route if your site is on WordPress.com. Claude asks you to confirm every change, and it can only do what your WordPress.com role allows.",
      source: { url: WPCOM_SUPPORT, verifiedOn: CHECKED },
    },
    {
      kind: "official_mcp",
      name: "MCP Adapter (self-hosted)",
      maintainer: "WordPress.org",
      isOfficial: true,
      url: ADAPTER,
      worksIn: ["claude_code", "desktop"],
      auth: "api_key",
      needs: "WordPress 6.9+ and a plugin that adds content abilities",
      lastActivity: "2026-10-02",
      status: "active",
      note: "The official way to connect a self-hosted site. On its own it can't touch posts, so pair it with a content plugin like the one below.",
      source: { url: ADAPTER, verifiedOn: CHECKED },
    },
    {
      kind: "plugin",
      name: "Enable Abilities for MCP",
      maintainer: "Fabio Montenegro",
      isOfficial: false,
      url: "https://wordpress.org/plugins/enable-abilities-for-mcp/",
      worksIn: ["claude_code", "desktop", "claude_ai"],
      auth: "api_key",
      needs: "MCP Adapter",
      lastActivity: "2026-09-18",
      status: "active",
      note: "Adds the abilities Claude needs to read and write posts, pages, categories, comments and more, each with its own on/off switch. It also includes a sign-in flow for Claude.ai, which we haven't tested.",
      source: { url: "https://wordpress.org/plugins/enable-abilities-for-mcp/", verifiedOn: CHECKED },
    },
    {
      kind: "third_party_mcp",
      name: "AI Engine",
      maintainer: "Meow Apps",
      isOfficial: false,
      url: "https://wordpress.org/plugins/ai-engine/",
      worksIn: ["claude_code", "desktop"],
      auth: "api_key",
      lastActivity: "2026-10-01",
      status: "active",
      note: "A popular all-in-one AI plugin with its own MCP server. Its makers warn that it gives Claude full admin access to your site.",
      source: { url: "https://meowapps.com/claude-code-wordpress-mcp/", verifiedOn: CHECKED },
    },
    {
      kind: "third_party_mcp",
      name: "mcp-wordpress-remote",
      maintainer: "Automattic",
      isOfficial: false,
      url: "https://github.com/Automattic/mcp-wordpress-remote",
      worksIn: ["claude_code", "desktop"],
      auth: "api_key",
      needs: "Node.js 22+",
      lastActivity: "2026-09-28",
      status: "broken",
      note: "The proxy that MCP Adapter's docs recommend. It currently fails against MCP Adapter 0.7.0 (issue #120). Connect directly over HTTP instead, as shown below.",
      source: { url: "https://github.com/Automattic/mcp-wordpress-remote/issues/120", verifiedOn: CHECKED },
    },
  ],
  setup: [
    {
      method: 1,
      title: "How to connect a self-hosted WordPress site to Claude Code",
      surface: "Claude Code",
      steps: [
        {
          text: "Check you're on WordPress 6.9 or later. In Plugins, then Add New, install and activate `MCP Adapter` and `Enable Abilities for MCP`. Or use WP-CLI:",
          code: { label: "Terminal", value: "wp plugin install mcp-adapter enable-abilities-for-mcp --activate" },
        },
        {
          text: "Create a dedicated user for Claude with the Editor role, so it can manage content but not plugins or settings.",
          code: { label: "Terminal", value: "wp user create claude-bot claude-bot@example.com --role=editor" },
        },
        {
          text: "Create an Application Password for that user, in Users, then Profile, then Application Passwords. Or with WP-CLI. Copy it now: it's only shown once. Your site needs HTTPS for this to work.",
          code: { label: "Terminal", value: "wp user application-password create claude-bot claude-code --porcelain" },
        },
        { text: "Optional: open the Enable Abilities for MCP settings and switch off anything you don't want Claude to do, such as deleting posts." },
        {
          text: "Add the site to Claude Code. Replace the URL, and `YOUR-APP-PASSWORD` with the password from step 3.",
          code: {
            label: "Terminal",
            value:
              "B64=$(printf 'claude-bot:YOUR-APP-PASSWORD' | base64)\nclaude mcp add --transport http wordpress https://your-site.com/wp-json/mcp/mcp-adapter-default-server \\\n  --header \"Authorization: Basic $B64\"",
          },
        },
        { text: "Check the connection: in Claude Code, run `/mcp` and look for `wordpress`. Then ask Claude about your posts." },
      ],
      source: { url: ADAPTER, verifiedOn: CHECKED },
    },
    {
      method: 0,
      title: "How to connect WordPress.com to Claude",
      surface: "Claude.ai, Claude Desktop and Claude Code",
      steps: [
        { text: "On WordPress.com, open your account Preferences, then AI and MCP, and turn on Enable MCP access." },
        { text: "In Claude, open Customize, then Connectors. Click the + button, find WordPress.com, click Connect, then sign in to WordPress.com and approve access." },
        {
          text: "For Claude Code, add the connector from the terminal, then run `/mcp` inside Claude Code to sign in.",
          code: { label: "Terminal", value: "claude mcp add --transport http wpcom-mcp https://public-api.wordpress.com/wpcom/v2/mcp/v1" },
        },
      ],
      source: { url: "https://developer.wordpress.com/docs/mcp/", verifiedOn: CHECKED },
    },
  ],
  permissions: [
    {
      heading: "Self-hosted",
      body: "The Application Password signs Claude in as that user, so it can do whatever the role allows. An Editor can write, publish and delete posts and pages, but can't change plugins or settings. Ability switches in Enable Abilities for MCP narrow it further.",
    },
    {
      heading: "WordPress.com",
      body: "Read and write access are both on once MCP is enabled, and Claude asks you to confirm each change. Deleted posts and pages stay in the trash for 30 days, but deleted media, categories and tags are gone for good.",
    },
    {
      heading: "Revoking access",
      body: "Self-hosted: revoke the password in Users, then Profile, then Application Passwords. WordPress.com: disconnect Claude under Security, then Connected Apps. In Claude Code, also run `claude mcp remove wordpress`.",
    },
    {
      heading: "Claude.ai on the web",
      body: "Custom connectors connect from Anthropic's servers, so a self-hosted site must be public on HTTPS. A site on your own computer or office network won't work; use Claude Code instead.",
    },
  ],
  prompts: [
    {
      prompt: "List every post on my WordPress site with its status and category.",
      outcome: "Claude returns a table of every post, including drafts, with status and category, and checks it against the site's own counts.",
      basis: "tested",
    },
    {
      prompt: "Find any draft post that still has a TODO in it and tell me what's left to do.",
      outcome: "Claude reads each draft, quotes the TODO notes, and lists what's missing, such as an excerpt or the body itself.",
      basis: "tested",
    },
    {
      prompt: "Which pages are published on my site, and is anything still in draft?",
      outcome: "Claude lists published pages with their links, flags drafts, and suggests cleanups like WordPress's default Sample Page.",
      basis: "tested",
    },
    {
      prompt: "Write a short draft post titled 'What's new in November' that follows on from the October product update. Save it as a draft in the News category. Don't publish it.",
      outcome:
        "Claude reads the October post, writes a draft that links back to it, and saves it unpublished in News. Where it didn't have facts, it left clear placeholders instead of inventing them.",
      basis: "tested",
    },
  ],
  troubleshooting: [
    {
      problem: "`401` or `rest_forbidden` even though the Application Password is right",
      fix: "WordPress only accepts Application Passwords over HTTPS. Serve the site on HTTPS. For a local test site, set `WP_ENVIRONMENT_TYPE` to `local` in wp-config.php.",
      sourceUrl: "https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/",
    },
    {
      problem: "Claude connects but can't see any posts",
      fix: "MCP Adapter on its own only shares site and user info. Install a content-abilities plugin such as Enable Abilities for MCP, and check its read and write abilities are switched on.",
      sourceUrl: ADAPTER,
    },
    {
      problem: "`MCP-Protocol-Version must be 2025-11-25` with mcp-wordpress-remote",
      fix: "The proxy sends an older protocol version than MCP Adapter 0.7.0 accepts. Connect Claude Code straight to the HTTP endpoint with a Basic auth header, as in the setup above.",
      sourceUrl: "https://github.com/Automattic/mcp-wordpress-remote/issues/120",
    },
    {
      problem: "Authentication fails only on your live server",
      fix: "Some hosts strip the Authorization header. On Apache, add `SetEnvIf Authorization \"(.*)\" HTTP_AUTHORIZATION=$1` to .htaccess. On Nginx with PHP-FPM, pass the header through to PHP.",
      sourceUrl: "https://developer.wordpress.org/rest-api/frequently-asked-questions/",
    },
  ],
  faq: [
    {
      q: "Is there an official WordPress connector for Claude?",
      a: "Yes, for WordPress.com: Automattic makes the WordPress.com connector in Claude's connector directory. For self-hosted WordPress, the official route is WordPress.org's MCP Adapter plugin.",
    },
    {
      q: "Does it work with self-hosted WordPress?",
      a: "Yes. Install MCP Adapter plus a plugin that adds content abilities, create an Application Password for a dedicated user, and add the site to Claude Code. Your site needs WordPress 6.9 or later and HTTPS.",
    },
    {
      q: "Can Claude publish or delete posts?",
      a: "Only if the abilities are switched on and the user you connect as is allowed to. Connect as an Editor rather than an admin, and switch off delete abilities if you don't want Claude removing content. On WordPress.com, Claude asks you to confirm every change.",
    },
    {
      q: "Do I need a paid plan?",
      a: "On WordPress.com, MCP access needs a paid plan; free sites get it for their first 30 days. For self-hosted WordPress, MCP Adapter and Enable Abilities for MCP are free plugins.",
    },
    {
      q: "Can I use Claude.ai with a self-hosted site?",
      a: "Only if the site is public on HTTPS, because Claude.ai connects from Anthropic's servers. Enable Abilities for MCP includes a Claude.ai sign-in flow for this. For a private or local site, use Claude Code.",
    },
  ],
  related: ["obsidian", "home-assistant"],
  publishedOn: CHECKED,
  verifiedOn: CHECKED,
  status: "published",
};

export default wordpress;
