"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Check, Copy, ArrowRight } from "lucide-react";

// ── Inline helpers ─────────────────────────────────────────────────────────

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex items-center px-2 py-0.5 rounded border border-border bg-muted text-xs font-mono text-foreground">
      {children}
    </kbd>
  );
}

function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="relative rounded-md border border-border bg-muted/40 overflow-hidden my-3">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/60">
        <span className="text-xs text-muted-foreground font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="px-4 py-3 text-sm font-mono overflow-x-auto text-foreground leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function CmdRow({ cmd, desc }: { cmd: string; desc: string }) {
  return (
    <tr className="border-b border-border/40 hover:bg-muted/20 transition-colors">
      <td className="py-2 pr-6 font-mono text-sm text-foreground whitespace-nowrap align-top">{cmd}</td>
      <td className="py-2 text-sm text-muted-foreground align-top">{desc}</td>
    </tr>
  );
}

function McpCard({ name, desc, cmd }: { name: string; desc: string; cmd: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(cmd).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  const initial = name[0]?.toUpperCase() ?? "M";
  return (
    <Link
      href="/mcp"
      className="group flex flex-col gap-2 rounded-lg border border-border bg-card p-3 hover:border-primary/30 hover:bg-accent/40 transition-all"
    >
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
          {initial}
        </div>
        <span className="text-sm font-medium text-foreground truncate">{name}</span>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{desc}</p>
      <div className="flex items-center justify-between mt-auto pt-1">
        <code className="text-[10px] font-mono text-muted-foreground/60 truncate flex-1 pr-2">
          {cmd.replace("npx -y ", "")}
        </code>
        <button
          onClick={handleCopy}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>
    </Link>
  );
}

// ── Sections ───────────────────────────────────────────────────────────────

const sections = [
  { id: "getting-started",   label: "Getting Started",    count: 6  },
  { id: "keyboard-shortcuts",label: "Keyboard Shortcuts", count: 12 },
  { id: "configuration",     label: "Configuration",      count: 8  },
  { id: "checkpointing",     label: "Checkpointing",      count: 4  },
  { id: "slash-commands",    label: "Slash Commands",     count: 13 },
  { id: "headless-mode",     label: "Headless Mode",      count: 6  },
  { id: "agent-skills",      label: "Agent Skills",       count: 8  },
  { id: "plugins",           label: "Plugins",            count: 7  },
  { id: "mcp-servers",       label: "MCP Servers",        count: 27 },
  { id: "git-worktrees",     label: "Git Worktrees",      count: 7  },
  { id: "subagents",         label: "Subagents",          count: 3  },
  { id: "permissions",       label: "Permissions",        count: 5  },
  { id: "hooks",             label: "Hooks",              count: 5  },
];

// ── Main ───────────────────────────────────────────────────────────────────

export default function CheatsheetClient() {
  const [activeSection, setActiveSection] = useState("getting-started");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const headings = document.querySelectorAll("section[id]");
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    headings.forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex">

        {/* ── Sidebar — flush to left edge, like cursor.directory ── */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto py-10 px-5">
            <nav>
              {sections.map((s) => {
                const isActive = activeSection === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={`w-full flex items-center justify-between py-3 border-b border-border/30 text-left transition-colors group ${
                      isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="text-sm">{s.label}</span>
                    <span className={`text-sm tabular-nums transition-colors ${
                      isActive ? "text-foreground" : "text-muted-foreground/40 group-hover:text-muted-foreground"
                    }`}>
                      {s.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0 py-10 px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight mb-1.5">Claude Code Cheatsheet</h1>
            <p className="text-sm text-muted-foreground">
              Complete reference for commands, shortcuts, config, MCP servers, and more.
            </p>
          </div>

          <div className="space-y-14">

              {/* 1 — Getting Started */}
              <section id="getting-started">
                <h2 className="text-lg font-semibold mb-5 pb-2 border-b border-border">Getting Started</h2>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Install</h3>
                <CodeBlock code={`# curl (recommended)\ncurl -fsSL https://claude.ai/install.sh | sh\n\n# Homebrew\nbrew install claude\n\n# npm (global)\nnpm install -g @anthropic-ai/claude-code\n\n# PowerShell (Windows)\niwr https://claude.ai/install.ps1 | iex`} />
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 mt-5">Update</h3>
                <CodeBlock code={`claude update\nclaude --version`} />
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 mt-5">Launch</h3>
                <CodeBlock code={`claude\nclaude "explain this codebase"\nclaude --continue\nclaude --resume <session-id>`} />
              </section>

              {/* 2 — Keyboard Shortcuts */}
              <section id="keyboard-shortcuts">
                <h2 className="text-lg font-semibold mb-5 pb-2 border-b border-border">Keyboard Shortcuts</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                  {[
                    { key: "!",          desc: "Run a bash command directly" },
                    { key: "@",          desc: "Mention a file by path" },
                    { key: "\\",         desc: "Multi-line input mode" },
                    { key: "Esc",        desc: "Cancel current generation" },
                    { key: "Esc Esc",    desc: "Undo last message (rewind)" },
                    { key: "Ctrl+R",     desc: "Fuzzy-search conversation history" },
                    { key: "Shift+Tab",  desc: "Cycle through auto-accept modes" },
                    { key: "Ctrl+C",     desc: "Interrupt / hard stop" },
                    { key: "Ctrl+L",     desc: "Clear screen" },
                    { key: "Ctrl+D",     desc: "Exit Claude Code" },
                    { key: "↑ / ↓",      desc: "Navigate input history" },
                    { key: "Tab",        desc: "Autocomplete path / command" },
                  ].map(({ key, desc }) => (
                    <div key={key} className="flex items-center gap-3 py-2.5 border-b border-border/40">
                      <Kbd>{key}</Kbd>
                      <span className="text-sm text-muted-foreground">{desc}</span>
                    </div>
                  ))}
                </div>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 mt-6">Auto-accept modes (Shift+Tab)</h3>
                <table className="w-full"><tbody>
                  <CmdRow cmd="Default" desc="Prompts for each tool call" />
                  <CmdRow cmd="Auto-accept edits" desc="Accepts file edits without prompting, asks for shell commands" />
                  <CmdRow cmd="Auto-accept all" desc="Accepts every tool call. Use carefully." />
                </tbody></table>
              </section>

              {/* 3 — Configuration */}
              <section id="configuration">
                <h2 className="text-lg font-semibold mb-5 pb-2 border-b border-border">Configuration</h2>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Config file priority (highest → lowest)</h3>
                <table className="w-full mb-4"><tbody>
                  <CmdRow cmd=".claude/settings.local.json" desc="Project-local overrides (gitignored)" />
                  <CmdRow cmd=".claude/settings.json" desc="Project-level (committed to repo)" />
                  <CmdRow cmd="~/.claude/settings.json" desc="User-level global defaults" />
                </tbody></table>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 mt-5">CLI commands</h3>
                <CodeBlock code={`claude config list\nclaude config get model\nclaude config set model claude-opus-4-6\nclaude config set --project model claude-sonnet-4-6\nclaude config set env.ANTHROPIC_API_KEY sk-ant-...`} />
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 mt-5">Common settings</h3>
                <CodeBlock code={`{\n  "model": "claude-opus-4-6",\n  "maxTokens": 8192,\n  "temperature": 0,\n  "autoApprove": false,\n  "theme": "dark",\n  "verbosity": "normal"\n}`} language="json" />
              </section>

              {/* 4 — Checkpointing */}
              <section id="checkpointing">
                <h2 className="text-lg font-semibold mb-5 pb-2 border-b border-border">Checkpointing</h2>
                <p className="text-sm text-muted-foreground mb-4">Rewind the conversation and all file changes to a previous state — like a session-level undo.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 mb-5">
                  {[
                    { key: "Esc Esc", desc: "Undo last assistant turn" },
                    { key: "/undo",   desc: "Slash command alias for Esc Esc" },
                  ].map(({ key, desc }) => (
                    <div key={key} className="flex items-center gap-3 py-2.5 border-b border-border/40">
                      <Kbd>{key}</Kbd>
                      <span className="text-sm text-muted-foreground">{desc}</span>
                    </div>
                  ))}
                </div>
                <CodeBlock code={`claude config set checkpointing true\nclaude config set checkpointing false\nclaude config set maxCheckpoints 20`} />
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 mt-5">Limitations</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Only affects files modified in the current session</li>
                  <li>Git commits are not automatically reverted</li>
                  <li>Shell side-effects (installs, migrations) are not undone</li>
                  <li>Cannot rewind past the start of the session</li>
                </ul>
              </section>

              {/* 5 — Slash Commands */}
              <section id="slash-commands">
                <h2 className="text-lg font-semibold mb-5 pb-2 border-b border-border">Slash Commands</h2>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Built-in</h3>
                <table className="w-full mb-6"><tbody>
                  <CmdRow cmd="/help"        desc="Show all available slash commands" />
                  <CmdRow cmd="/clear"       desc="Clear screen and start fresh context" />
                  <CmdRow cmd="/undo"        desc="Rewind to the previous checkpoint" />
                  <CmdRow cmd="/compact"     desc="Compress conversation history to save tokens" />
                  <CmdRow cmd="/memory"      desc="Open CLAUDE.md editor" />
                  <CmdRow cmd="/permissions" desc="Show and edit current tool permissions" />
                  <CmdRow cmd="/model"       desc="Switch model for this session" />
                  <CmdRow cmd="/cost"        desc="Show token usage and estimated cost" />
                  <CmdRow cmd="/export"      desc="Export conversation to a file" />
                  <CmdRow cmd="/doctor"      desc="Run environment diagnostics" />
                  <CmdRow cmd="/bug"         desc="Report a bug to Anthropic" />
                  <CmdRow cmd="/review"      desc="Invoke code-review skill (if installed)" />
                  <CmdRow cmd="/commit"      desc="Invoke commit skill (if installed)" />
                </tbody></table>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Custom — <code className="font-mono normal-case text-xs bg-muted px-1 py-0.5 rounded">.claude/commands/&lt;name&gt;.md</code></h3>
                <CodeBlock code={`---\ndescription: "Run all linters and fix auto-fixable issues"\nallowed-tools: Bash\n---\n\n1. \`npm run lint -- --fix\`\n2. \`npm run type-check\`\n3. Summarise what was fixed.`} language="markdown" />
              </section>

              {/* 6 — Headless Mode */}
              <section id="headless-mode">
                <h2 className="text-lg font-semibold mb-5 pb-2 border-b border-border">Headless Mode</h2>
                <p className="text-sm text-muted-foreground mb-4">Use <Kbd>-p</Kbd> / <Kbd>--print</Kbd> for non-interactive use — CI, scripts, automation.</p>
                <CodeBlock code={`claude -p "summarise the last commit"\ncat README.md | claude -p "check for spelling errors"\nclaude -p "list all TODO comments" --output-format json\nclaude -p "explain main.go" --output-format stream-json`} />
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 mt-5">Output formats</h3>
                <table className="w-full mb-5"><tbody>
                  <CmdRow cmd="--output-format text"        desc="Plain text (default)" />
                  <CmdRow cmd="--output-format json"        desc="Full JSON response object" />
                  <CmdRow cmd="--output-format stream-json" desc="Streaming NDJSON tokens" />
                </tbody></table>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Pipeline examples</h3>
                <CodeBlock code={`# CI: fail if tests broken\nclaude -p "run tests and exit 1 if any fail" --allowedTools Bash\n\n# Nightly summary\ngit log --since=yesterday --oneline | \\\n  claude -p "plain-English summary of today's commits" > summary.txt\n\n# Auto PR review\ngh pr diff | claude -p "review for bugs and security issues"`} />
              </section>

              {/* 7 — Agent Skills */}
              <section id="agent-skills">
                <h2 className="text-lg font-semibold mb-5 pb-2 border-b border-border">Agent Skills</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Markdown files in <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">~/.claude/commands/</code> (global) or <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">.claude/commands/</code> (project).
                </p>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Frontmatter fields</h3>
                <table className="w-full mb-5"><tbody>
                  <CmdRow cmd="description"   desc="Shown in /help and skill picker" />
                  <CmdRow cmd="allowed-tools" desc="Comma-separated tools this skill may use" />
                  <CmdRow cmd="argument-hint" desc="Placeholder shown after the slash command" />
                </tbody></table>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">commit.md</h3>
                <CodeBlock code={`---\ndescription: "Stage all changes and create a conventional commit"\nallowed-tools: Bash, Read, Glob\nargument-hint: "[optional: commit message]"\n---\n\n1. Run \`git diff --staged\` and \`git status\`.\n2. If nothing is staged, run \`git add -A\`.\n3. Write a conventional commit message.\n4. Run \`git commit -m "<message>"\`.`} language="markdown" />
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 mt-5">review.md</h3>
                <CodeBlock code={`---\ndescription: "Review current branch diff for bugs and style issues"\nallowed-tools: Bash, Read\n---\n\n1. Run \`git diff main...HEAD\`.\n2. Check for: bugs, security, missing error handling, style.\n3. Output grouped by severity.`} language="markdown" />
              </section>

              {/* 8 — Plugins */}
              <section id="plugins">
                <h2 className="text-lg font-semibold mb-5 pb-2 border-b border-border">Plugins</h2>
                <CodeBlock code={`claude plugins list\nclaude plugins install <plugin-name>\nclaude plugins install ./my-plugin\nclaude plugins remove <plugin-name>\nclaude plugins update`} />
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 mt-5">Structure</h3>
                <CodeBlock code={`my-plugin/\n├── plugin.json\n├── commands/\n│   └── my-skill.md\n└── mcp/\n    └── my-server.json`} />
                <CodeBlock code={`{\n  "name": "my-plugin",\n  "version": "1.0.0",\n  "description": "My custom plugin",\n  "commands": ["commands/my-skill.md"],\n  "mcpServers": ["mcp/my-server.json"]\n}`} language="json" />
              </section>

              {/* 9 — MCP Servers */}
              <section id="mcp-servers">
                <h2 className="text-lg font-semibold mb-5 pb-2 border-b border-border">MCP Servers</h2>
                <CodeBlock code={`claude mcp add <name> <command> [args...]\nclaude mcp add filesystem npx -y @modelcontextprotocol/server-filesystem /path\nclaude mcp remove <name>\nclaude mcp list`} />
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 mt-5">settings.json</h3>
                <CodeBlock code={`{\n  "mcpServers": {\n    "filesystem": {\n      "command": "npx",\n      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path"],\n      "env": {}\n    }\n  }\n}`} language="json" />
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 mt-5">Popular servers</h3>
                <div className="grid grid-cols-3 gap-2.5 mb-4">
                  {[
                    { name: "github",      desc: "Read repos, issues, PRs, and code search via the GitHub API.",        cmd: "npx -y @modelcontextprotocol/server-github" },
                    { name: "filesystem",  desc: "Read and write local files within allowed directories.",               cmd: "npx -y @modelcontextprotocol/server-filesystem <path>" },
                    { name: "postgres",    desc: "Run read-only SQL queries against a PostgreSQL database.",             cmd: "npx -y @modelcontextprotocol/server-postgres <conn>" },
                    { name: "slack",       desc: "Post messages, list channels, and search Slack workspaces.",          cmd: "npx -y @modelcontextprotocol/server-slack" },
                    { name: "brave-search",desc: "Web and local search powered by the Brave Search API.",               cmd: "npx -y @modelcontextprotocol/server-brave-search" },
                    { name: "notion",      desc: "Query, create, and update pages and databases in Notion.",            cmd: "npx -y @notionhq/notion-mcp-server" },
                    { name: "linear",      desc: "Create and triage issues, projects, and cycles in Linear.",           cmd: "npx -y @linear/linear-mcp-server" },
                    { name: "figma",       desc: "Inspect Figma files, components, and design tokens.",                 cmd: "npx -y @figma/mcp-server" },
                    { name: "playwright",  desc: "Automate browsers — navigate, click, screenshot, and scrape.",        cmd: "npx -y @executeautomation/playwright-mcp-server" },
                  ].map((s) => <McpCard key={s.name} {...s} />)}
                </div>
                <Link
                  href="/mcp"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  View all MCP servers in the directory
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </section>

              {/* 10 — Git Worktrees */}
              <section id="git-worktrees">
                <h2 className="text-lg font-semibold mb-5 pb-2 border-b border-border">Git Worktrees</h2>
                <p className="text-sm text-muted-foreground mb-4">Check out multiple branches simultaneously — run parallel Claude Code sessions without conflicts.</p>
                <CodeBlock code={`git worktree list\ngit worktree add ../feature-branch feature-branch\ngit worktree add -b my-feature ../my-feature main\ngit worktree remove ../feature-branch\ngit worktree prune`} />
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 mt-5">Parallel workflow</h3>
                <CodeBlock code={`# Terminal 1\ngit worktree add -b feat/auth ../project-auth main\ncd ../project-auth && claude\n\n# Terminal 2\ngit worktree add -b fix/perf ../project-perf main\ncd ../project-perf && claude`} />
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 mt-5">Claude Code shortcut</h3>
                <CodeBlock code={`/worktree my-feature-name\n# Creates .claude/worktrees/my-feature-name and switches into it`} />
              </section>

              {/* 11 — Subagents */}
              <section id="subagents">
                <h2 className="text-lg font-semibold mb-5 pb-2 border-b border-border">Subagents</h2>
                <p className="text-sm text-muted-foreground mb-4">Specialised Claude instances for parallel or isolated subtasks.</p>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">code-reviewer</h3>
                <CodeBlock code={`---\ndescription: "Deep code review: bugs, security, style"\nallowed-tools: Read, Glob, Grep\n---\n\nReview the provided diff for:\n- Logic bugs and edge cases\n- Security vulnerabilities (OWASP Top 10)\n- Performance issues\n\nOutput a markdown report with severity labels.`} language="markdown" />
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 mt-5">debugger</h3>
                <CodeBlock code={`---\ndescription: "Root-cause analysis for failing tests or errors"\nallowed-tools: Read, Bash, Grep, Glob\n---\n\n1. Reproduce the error.\n2. Identify the root cause.\n3. Propose the minimal fix.\n4. Verify the fix doesn't break other tests.`} language="markdown" />
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 mt-5">data-scientist</h3>
                <CodeBlock code={`---\ndescription: "Analyse data files and produce statistical summaries"\nallowed-tools: Bash, Read\n---\n\n1. Load and describe the schema.\n2. Identify missing values and outliers.\n3. Compute summary statistics.\n4. Suggest visualisations and next steps.`} language="markdown" />
              </section>

              {/* 12 — Permissions */}
              <section id="permissions">
                <h2 className="text-lg font-semibold mb-5 pb-2 border-b border-border">Permissions</h2>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Basic</h3>
                <CodeBlock code={`{\n  "permissions": {\n    "allow": ["Read", "Write", "Edit", "Bash(git *)"],\n    "deny": ["Bash(rm -rf *)", "Bash(curl *)", "Bash(wget *)"]\n  }\n}`} language="json" />
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 mt-5">Read-only / strict</h3>
                <CodeBlock code={`{\n  "permissions": {\n    "allow": ["Read", "Glob", "Grep"],\n    "deny": ["Write", "Edit", "Bash", "WebFetch", "WebSearch"]\n  },\n  "autoApprove": false\n}`} language="json" />
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 mt-5">Enterprise</h3>
                <CodeBlock code={`{\n  "permissions": {\n    "allow": ["Read","Write","Edit","Glob","Grep",\n      "Bash(npm *)","Bash(git *)","Bash(docker *)"],\n    "deny": ["Bash(curl *)","Bash(wget *)","Bash(ssh *)","WebFetch"]\n  },\n  "autoApprove": false,\n  "requireApprovalForNewFiles": true\n}`} language="json" />
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 mt-5">Patterns</h3>
                <table className="w-full"><tbody>
                  <CmdRow cmd="Read"           desc="All file reads" />
                  <CmdRow cmd="Bash"           desc="All shell commands" />
                  <CmdRow cmd="Bash(git *)"    desc="Only git sub-commands" />
                  <CmdRow cmd="Bash(npm run *)"desc="Only npm run scripts" />
                  <CmdRow cmd="Bash(rm *)"     desc="Any rm command" />
                </tbody></table>
              </section>

              {/* 13 — Hooks */}
              <section id="hooks">
                <h2 className="text-lg font-semibold mb-5 pb-2 border-b border-border">Hooks</h2>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Events</h3>
                <table className="w-full mb-5"><tbody>
                  <CmdRow cmd="PreToolUse"   desc="Before any tool call — block by exiting non-zero" />
                  <CmdRow cmd="PostToolUse"  desc="After any tool call completes" />
                  <CmdRow cmd="Stop"         desc="When Claude finishes its final response" />
                  <CmdRow cmd="Notification" desc="When Claude emits a system notification" />
                  <CmdRow cmd="SubagentStop" desc="When a subagent finishes" />
                </tbody></table>
                <CodeBlock code={`{\n  "hooks": {\n    "PostToolUse": [{\n      "matcher": "Bash",\n      "hooks": [{ "type": "command",\n        "command": "echo '$CLAUDE_TOOL_INPUT' >> ~/.claude/bash-log.txt" }]\n    }],\n    "Stop": [{\n      "hooks": [{ "type": "command",\n        "command": "osascript -e 'display notification \\"Claude finished\\"'" }]\n    }]\n  }\n}`} language="json" />
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 mt-5">PreToolUse blocker</h3>
                <CodeBlock code={`"PreToolUse": [{ "matcher": "Bash", "hooks": [{\n  "type": "command",\n  "command": "if echo \\"$CLAUDE_TOOL_INPUT\\" | grep -qE 'rm -rf|DROP TABLE'; then exit 1; fi"\n}]}]`} language="json" />
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 mt-5">Environment variables</h3>
                <table className="w-full"><tbody>
                  <CmdRow cmd="CLAUDE_TOOL_NAME"   desc="Name of the tool being called" />
                  <CmdRow cmd="CLAUDE_TOOL_INPUT"  desc="JSON-encoded tool input arguments" />
                  <CmdRow cmd="CLAUDE_TOOL_OUTPUT" desc="Tool result (PostToolUse only)" />
                  <CmdRow cmd="CLAUDE_SESSION_ID"  desc="Unique ID for the current session" />
                  <CmdRow cmd="CLAUDE_PROJECT_DIR" desc="Absolute path to the project directory" />
                </tbody></table>
              </section>

          </div>
        </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
