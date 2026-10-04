import type { ConnectorGuide } from "@/lib/connector-guides";

const CHECKED = "2026-10-05";
const PLUGIN_README = "https://github.com/coddingtonbear/obsidian-local-rest-api#mcp-model-context-protocol";

const obsidian: ConnectorGuide = {
  slug: "obsidian",
  app: "Obsidian",
  category: "notes",
  description:
    "Connect your Obsidian vault to Claude Code or Claude Desktop, by opening the vault folder directly or through the Local REST API plugin's built-in MCP server.",
  quickAnswer:
    "Obsidian has no official Claude connector. The quickest route is to start Claude Code inside your vault folder (`cd` into it and run `claude`): a vault is plain Markdown, so Claude can read, search and edit notes with no plugin. For Claude Desktop, use the Local REST API with MCP community plugin, which includes its own MCP server. Claude.ai in the browser can't reach a vault stored on your computer.",
  keyFacts: [
    "Obsidian has no official Claude connector or official MCP server (checked October 2026).",
    "Claude Code can work on an Obsidian vault directly: start `claude` inside the vault folder. No plugin is needed.",
    "For Claude Desktop, the Local REST API with MCP community plugin includes an MCP server at `https://127.0.0.1:27124/mcp/`.",
    "Claude.ai in the browser can't connect to a vault stored on your computer.",
    "Claude Code asks before it edits or creates a note, unless you change its permission mode.",
  ],
  testedWith: "Claude Code 2.1.289 on macOS, against a test vault of 8 notes",
  evidence: [
    {
      src: "/connectors/obsidian/claude-code-tasks.png",
      width: 1600,
      height: 597,
      alt: "Claude Code in a terminal listing 7 open tasks from an Obsidian test vault, grouped by note",
      caption: "Claude Code started inside a test vault, asked to list open tasks. It found all 7 across 4 notes and skipped the one already checked off.",
      capturedOn: CHECKED,
    },
    {
      src: "/connectors/obsidian/claude-code-priya.png",
      width: 1600,
      height: 414,
      alt: "Claude Code in a terminal finding the two notes that link to [[Priya]] and the open task owed to her",
      caption: "Following backlinks: Claude Code found both notes linking to [[Priya]] and the one open task she's waiting on.",
      capturedOn: CHECKED,
    },
  ],
  methods: [
    {
      kind: "no_mcp",
      name: "Claude Code in your vault folder",
      maintainer: "Anthropic (Claude Code)",
      isOfficial: true,
      url: "https://code.claude.com/docs/en/permissions#working-directories",
      worksIn: ["claude_code"],
      auth: "local",
      status: "active",
      note: "Reads files directly, so Obsidian doesn't need to be open. Claude asks before editing a note unless you change the permission mode.",
      source: { url: "https://code.claude.com/docs/en/permissions#working-directories", verifiedOn: CHECKED },
    },
    {
      kind: "third_party_mcp",
      name: "Local REST API with MCP (plugin)",
      maintainer: "Adam Coddington",
      isOfficial: false,
      url: "https://github.com/coddingtonbear/obsidian-local-rest-api",
      worksIn: ["claude_code", "desktop"],
      auth: "api_key",
      needs: "Obsidian desktop running with the plugin enabled",
      lastActivity: "2026-10-03",
      status: "active",
      note: "Version 4.0 added a built-in MCP server at `/mcp/`. Its README says separate Obsidian MCP servers are no longer necessary.",
      source: { url: PLUGIN_README, verifiedOn: CHECKED },
    },
    {
      kind: "third_party_mcp",
      name: "obsidian-mcp",
      maintainer: "Steven Stavrakis",
      isOfficial: false,
      url: "https://github.com/StevenStavrakis/obsidian-mcp",
      worksIn: ["claude_code", "desktop"],
      auth: "local",
      needs: "Node.js 22 or later",
      lastActivity: "2026-08-14",
      status: "active",
      note: "Reads the Markdown files directly, so no plugin or API key is needed and Obsidian can stay closed.",
      source: { url: "https://github.com/StevenStavrakis/obsidian-mcp", verifiedOn: CHECKED },
    },
    {
      kind: "third_party_mcp",
      name: "obsidian-mcp-server",
      maintainer: "cyanheads",
      isOfficial: false,
      url: "https://github.com/cyanheads/obsidian-mcp-server",
      worksIn: ["claude_code", "desktop"],
      auth: "api_key",
      needs: "Local REST API plugin 4.0+, Node.js 24+",
      lastActivity: "2026-09-23",
      status: "active",
      note: "Lets you restrict Claude to certain folders, or to read-only access.",
      source: { url: "https://github.com/cyanheads/obsidian-mcp-server", verifiedOn: CHECKED },
    },
    {
      kind: "third_party_mcp",
      name: "mcp-obsidian",
      maintainer: "Markus Pfundstein",
      isOfficial: false,
      url: "https://github.com/MarkusPfundstein/mcp-obsidian",
      worksIn: ["claude_code", "desktop"],
      auth: "api_key",
      needs: "Local REST API plugin, uv",
      lastActivity: "2026-08-31",
      status: "active",
      note: "The most-starred Obsidian MCP server. With version 5 of the plugin, its patch tool fails (issue #158), so editing inside a note doesn't work. Reading, appending and rewriting whole notes still do.",
      source: { url: "https://github.com/MarkusPfundstein/mcp-obsidian", verifiedOn: CHECKED },
    },
    {
      kind: "plugin",
      name: "obsidian-skills",
      maintainer: "Steph Ango (kepano)",
      isOfficial: false,
      url: "https://github.com/kepano/obsidian-skills",
      worksIn: ["claude_code"],
      auth: "none",
      lastActivity: "2026-09-15",
      status: "active",
      note: "Skills that teach Claude Code Obsidian's own formats (Markdown, Bases, JSON Canvas) and the Obsidian CLI. Pairs well with the folder route. Steph Ango is Obsidian's CEO, but the skills come from his personal repo, not from Obsidian.",
      source: { url: "https://github.com/kepano/obsidian-skills", verifiedOn: CHECKED },
    },
  ],
  setup: [
    {
      method: 0,
      title: "How to connect Obsidian to Claude Code (no plugin)",
      surface: "Claude Code",
      steps: [
        { text: "Install Claude Code if you don't have it yet, by following the quickstart at code.claude.com/docs." },
        { text: "Find your vault: it's the folder you chose when you created it in Obsidian. Every note in it is a `.md` file." },
        {
          text: "Open a terminal, go into the vault folder and start Claude Code.",
          code: { label: "Terminal", value: 'cd "/path/to/your/vault"\nclaude' },
        },
        { text: "Ask about your notes in plain English. Claude reads files without asking, and asks before it edits or creates one." },
        {
          text: "Already working in another project? Add the vault as an extra directory instead of switching folders.",
          code: { label: "Terminal", value: 'claude --add-dir "/path/to/your/vault"' },
        },
        {
          text: "Optional: install Steph Ango's Obsidian skills so Claude writes valid wikilinks, properties, Bases and Canvas files. Run these inside Claude Code.",
          code: { label: "Claude Code", value: "/plugin marketplace add kepano/obsidian-skills\n/plugin install obsidian@obsidian-skills" },
        },
      ],
      source: { url: "https://code.claude.com/docs/en/cli-reference", verifiedOn: CHECKED },
    },
    {
      method: 1,
      title: "How to connect Obsidian to Claude Desktop with MCP",
      surface: "Claude Code and Claude Desktop",
      steps: [
        { text: "In Obsidian, open Settings, then Community plugins. Browse for `Local REST API with MCP`, then install and enable it." },
        { text: "Open Settings, then Local REST API, and copy your API key. Obsidian must stay open while Claude uses the vault." },
        {
          text: "For Claude Code, add the server. Replace `<your-api-key>` with the key you copied.",
          code: {
            label: "Terminal",
            value:
              'claude mcp add --transport http obsidian https://127.0.0.1:27124/mcp/ \\\n  --header "Authorization: Bearer <your-api-key>"',
          },
        },
        {
          text: "For Claude Desktop, add this to `claude_desktop_config.json` (macOS: `~/Library/Application Support/Claude/`, Windows: `%APPDATA%\\Claude\\`), then quit and reopen Claude Desktop. It needs Node.js for `npx`.",
          code: {
            label: "claude_desktop_config.json",
            value: `{
  "mcpServers": {
    "obsidian": {
      "command": "npx",
      "args": [
        "mcp-remote@latest",
        "https://127.0.0.1:27124/mcp/",
        "--header",
        "Authorization: Bearer <your-api-key>"
      ]
    }
  }
}`,
          },
        },
        { text: "Check the connection: in Claude Code, run `/mcp` and look for `obsidian`. If it fails with a certificate error, see Troubleshooting below." },
      ],
      source: { url: PLUGIN_README, verifiedOn: CHECKED },
    },
  ],
  permissions: [
    {
      heading: "Folder route",
      body: "Claude Code can read any file in the folder you started it in, and in folders added with `--add-dir`. It asks before every edit unless you switch to a mode that accepts edits. Nothing is installed in Obsidian, and closing Claude Code ends its access.",
    },
    {
      heading: "Plugin route",
      body: "The API key gives full read and write access to the vault, including deleting and moving notes. By default the plugin only listens on your own computer (`127.0.0.1`), and its MCP server refuses to touch the `.obsidian` settings folder.",
    },
    {
      heading: "Revoking access",
      body: "Run `claude mcp remove obsidian` in Claude Code, delete the `obsidian` entry from `claude_desktop_config.json`, or turn the plugin off in Obsidian's Community plugins settings.",
    },
    {
      heading: "Claude.ai on the web",
      body: "Custom connectors on Claude.ai connect from Anthropic's servers and must be reachable over the public internet, so they can't reach a vault on your computer. Use Claude Code or Claude Desktop.",
    },
  ],
  prompts: [
    {
      prompt: "List every open task in this vault, grouped by note.",
      outcome:
        "Claude finds every unchecked `- [ ]` item, groups them by note, and points out which daily-note tasks belong to which project.",
      basis: "tested",
    },
    {
      prompt: "Summarize my daily notes from the last week: what did I decide and what is still open?",
      outcome:
        "Claude reads the week's daily notes and the notes they link to, then lists decisions and open items. It also flags where two notes disagree.",
      basis: "tested",
    },
    {
      prompt: "Find every note that links to [[Priya]] and tell me what I owe her.",
      outcome: "Claude follows backlinks to a person's note and pulls out open tasks that mention them. Swap in any note name.",
      basis: "tested",
    },
    {
      prompt: "Which notes have no links to or from any other note?",
      outcome: "Claude checks links in both directions and lists orphan notes, with a table of how the rest connect.",
      basis: "tested",
    },
    {
      prompt: "Create a note in Projects called 'Q4 Plan' that links to every project with status active, using Obsidian [[wikilinks]].",
      outcome:
        "Claude reads the `status` property on each project, then writes a new note with wikilinks to the active ones. It asks before creating the file.",
      basis: "tested",
    },
  ],
  troubleshooting: [
    {
      problem: "Claude says it can't find my notes",
      fix: "Claude Code only sees the folder it was started in. Quit, `cd` into the vault and run `claude` again, or start it with `--add-dir \"/path/to/your/vault\"`.",
      sourceUrl: "https://code.claude.com/docs/en/cli-reference",
    },
    {
      problem: "Certificate or TLS error when connecting to `https://127.0.0.1:27124/mcp/`",
      fix: "The plugin signs its HTTPS certificate with its own authority, which your system doesn't trust yet. Download it from `https://127.0.0.1:27124/obsidian-local-rest-api.crt` and trust it. Or turn on \"Enable non-encrypted (HTTP) server\" in the plugin settings and use `http://127.0.0.1:27123/mcp/` instead.",
      sourceUrl: PLUGIN_README,
    },
    {
      problem: "Connection refused",
      fix: "The plugin only runs while Obsidian is open. Open Obsidian, check the plugin is enabled, and confirm the port matches the plugin settings (27124 for HTTPS by default).",
      sourceUrl: "https://github.com/MarkusPfundstein/mcp-obsidian/issues/76",
    },
    {
      problem: "`spawn uvx ENOENT` in Claude Desktop (mcp-obsidian)",
      fix: "Claude Desktop can't find `uv`. Install it, or run `which uvx` in a terminal and put that full path in the `command` field of the config.",
      sourceUrl: "https://github.com/MarkusPfundstein/mcp-obsidian/issues/7",
    },
    {
      problem: "`obsidian_patch_content` fails with error 40084 (mcp-obsidian)",
      fix: "Version 5 of the plugin needs a header that mcp-obsidian doesn't send yet. Use the plugin's built-in MCP server instead, or have Claude append to or rewrite the whole note.",
      sourceUrl: "https://github.com/MarkusPfundstein/mcp-obsidian/issues/158",
    },
  ],
  faq: [
    {
      q: "Is there an official Obsidian connector for Claude?",
      a: "No. As of October 2026 there is no Obsidian connector in Anthropic's directory and no official MCP server from Obsidian. The options are Claude Code working on the vault folder directly, or a community plugin or MCP server.",
    },
    {
      q: "Can I use my Obsidian vault with Claude.ai in the browser?",
      a: "Not directly. Claude.ai custom connectors connect from Anthropic's servers, so they can't reach a vault stored on your computer. Use Claude Code or Claude Desktop instead.",
    },
    {
      q: "Does Obsidian need to be open?",
      a: "For the folder route and for obsidian-mcp, no: they read the Markdown files directly. For the Local REST API plugin and the servers built on it, yes: the plugin only runs while Obsidian is open.",
    },
    {
      q: "Will Claude change my notes without asking?",
      a: "Not by default. Claude Code reads files freely but asks before every edit unless you switch to a permission mode that accepts edits. Back up your vault or use Git before letting it make large changes.",
    },
    {
      q: "Which Obsidian MCP server should I use?",
      a: "If you want Obsidian-aware features such as search, tags and running commands, use the MCP server built into the Local REST API with MCP plugin. If you'd rather not install a plugin, obsidian-mcp works on the files directly. For Claude Code alone, you may not need an MCP server at all.",
    },
  ],
  related: [],
  publishedOn: CHECKED,
  verifiedOn: CHECKED,
  status: "published",
};

export default obsidian;
