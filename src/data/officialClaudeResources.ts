import { withUtmParams } from "@/lib/tracking";

function trackedOfficialClaudeHref(id: string, href: string): string {
  return withUtmParams(href, {
    medium: "resource_card",
    campaign: "official_claude_resources",
    content: id,
  });
}

export const officialClaudeResources = [
  {
    title: "Extend Claude Code",
    description: "Official guide for choosing between CLAUDE.md, Skills, subagents, hooks, MCP and plugins.",
    href: trackedOfficialClaudeHref("features-overview", "https://code.claude.com/docs/en/features-overview"),
    label: "Architecture",
    tags: ["claude-code", "skills", "subagents", "mcp", "hooks"],
  },
  {
    title: "Create Custom Subagents",
    description: "Build task-specific Claude Code subagents with custom prompts, tools, permissions and models.",
    href: trackedOfficialClaudeHref("sub-agents", "https://code.claude.com/docs/en/sub-agents"),
    label: "Subagents",
    tags: ["subagents", "agents", "claude-code"],
  },
  {
    title: "Run Agents in Parallel",
    description: "Compare subagents, agent view, agent teams, dynamic workflows and Projects for parallel work.",
    href: trackedOfficialClaudeHref("agents", "https://code.claude.com/docs/en/agents"),
    label: "Agents",
    tags: ["agents", "parallel-work", "claude-code"],
  },
  {
    title: "Agent Teams",
    description: "Coordinate multiple Claude Code sessions with shared tasks, messaging and centralized management.",
    href: trackedOfficialClaudeHref("agent-teams", "https://code.claude.com/docs/en/agent-teams"),
    label: "Teams",
    tags: ["agent-teams", "parallel-work"],
  },
  {
    title: "Dynamic Workflows",
    description: "Orchestrate many subagents from rerunnable scripts for audits, migrations and cross-checked research.",
    href: trackedOfficialClaudeHref("workflows", "https://code.claude.com/docs/en/workflows"),
    label: "Workflows",
    tags: ["workflows", "subagents", "automation"],
  },
  {
    title: "Extend Claude with Skills",
    description: "Create, manage and share Skills that load instructions and resources only when relevant.",
    href: trackedOfficialClaudeHref("skills", "https://code.claude.com/docs/en/skills"),
    label: "Skills",
    tags: ["skills", "claude-code"],
  },
  {
    title: "Connect Claude Code to MCP Servers",
    description: "Use Model Context Protocol servers to connect Claude Code to tools, databases and APIs.",
    href: trackedOfficialClaudeHref("mcp", "https://code.claude.com/docs/en/mcp"),
    label: "MCP",
    tags: ["mcp", "integrations", "tools"],
  },
  {
    title: "Automate Actions with Hooks",
    description: "Run commands at lifecycle events to validate actions, format files, notify users and enforce rules.",
    href: trackedOfficialClaudeHref("hooks-guide", "https://code.claude.com/docs/en/hooks-guide"),
    label: "Hooks",
    tags: ["hooks", "automation", "guardrails"],
  },
  {
    title: "Create Plugins",
    description: "Package Claude Code skills, agents, hooks and MCP servers into reusable plugins.",
    href: trackedOfficialClaudeHref("plugins", "https://code.claude.com/docs/en/plugins"),
    label: "Plugins",
    tags: ["plugins", "distribution"],
  },
  {
    title: "Claude Agent SDK",
    description: "Build production AI agents with Claude Code as a library using Python or TypeScript.",
    href: trackedOfficialClaudeHref("agent-sdk-overview", "https://code.claude.com/docs/en/agent-sdk/overview"),
    label: "Agent SDK",
    tags: ["agent-sdk", "developers"],
  },
] as const;
