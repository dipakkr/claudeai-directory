// Rebuilds src/data/claude-code-commands.json from the official Claude Code docs.
//
//   node scripts/build-claude-code-commands.mjs            # fetch live docs
//   node scripts/build-claude-code-commands.mjs <dir>      # use saved .md files
//
// Only names, arguments, aliases and requirement flags come from the docs. The
// plain-English explanations shown on /claude-code-commands live in
// src/data/claude-code-commands-guide.ts and are written by hand, so rerunning
// this script never overwrites them. The script warns about any command that
// has no hand-written entry yet, and about entries whose command was removed.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { commandGuide } from "../src/data/claude-code-commands-guide.ts";

const DOCS = "https://code.claude.com/docs/en";
const OUT = new URL("../src/data/claude-code-commands.json", import.meta.url);
const localDir = process.argv[2];

async function load(page) {
  if (localDir) return readFileSync(join(localDir, `${page}.md`), "utf8");
  const res = await fetch(`${DOCS}/${page}.md`);
  if (!res.ok) throw new Error(`${page}.md: HTTP ${res.status}`);
  return res.text();
}

const plain = s =>
  s
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*/g, "")
    .replace(/<br\s*\/?>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Splits a markdown table row, keeping escaped pipes (`\|`) inside cells.
const cells = line =>
  line
    .trim()
    .replace(/^\||\|$/g, "")
    .split(/(?<!\\)\|/)
    .map(c => c.replace(/\\\|/g, "|").trim());

function tableAfter(md, heading) {
  const lines = md.split("\n");
  const start = lines.findIndex(l => l.trim() === heading);
  if (start === -1) throw new Error(`Heading not found: ${heading}`);
  const rows = [];
  let inTable = false;
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith("|")) {
      inTable = true;
      if (/^\|\s*:?-{3,}/.test(line)) continue;
      rows.push(cells(line));
    } else if (inTable || line.startsWith("#")) break;
  }
  return rows.slice(1); // drop header row
}

const code = s => [...s.matchAll(/`([^`]+)`/g)].map(m => m[1]);

function slashCommands(md) {
  return tableAfter(md, "## All commands").map(([usageCell, purposeCell]) => {
    const usage = code(usageCell)[0];
    const name = usage.split(" ")[0];
    const text = plain(purposeCell);
    const aliases = new Set();
    for (const m of text.matchAll(/(?:Alias(?:es)?:|Also available as)\s+((?:`\/[\w-]+`(?:,\s*|\s+and\s+)?)+)/g)) {
      code(m[1]).forEach(a => aliases.add(a));
    }
    const aliasOf = text.match(/^Alias (?:for|of) `(\/[\w-]+)`/)?.[1] ?? null;
    const sentences = text.split(/(?<=\.)\s+/);
    const minVersion =
      sentences
        .filter(s => /^Requires\b/.test(s))
        .map(s => s.match(/Claude Code v(\d+\.\d+\.\d+) or later/)?.[1])
        .find(Boolean) ?? null;
    const requirements = [
      ...new Set(
        sentences.flatMap(s => {
          const out = [];
          const plan = s.match(/(Pro, Max, or Team plan|Pro and Max plan subscribers|claude\.ai subscription|Claude subscription|Claude\.ai account)/i);
          if (plan && /^(Requires|Only available)/.test(s)) out.push(plan[1]);
          if (/^Requires the `?gh`? CLI/.test(s) || /Requires the gh CLI/.test(s)) out.push("gh CLI");
          if (/^Requires a git repository/.test(s)) out.push("git repository");
          return out;
        }),
      ),
    ];
    return {
      name,
      usage,
      kind: /^Skill\b/.test(text) ? "skill" : /^Workflow\b/.test(text) ? "workflow" : "builtin",
      aliases: [...aliases].filter(a => a !== name),
      aliasOf,
      removed: /^Removed\b/.test(text),
      hidden: /Hidden from the command menu|Doesn't appear in the command menu/.test(text),
      minVersion,
      requirements,
      docsUrl: `${DOCS}/commands#:~:text=${encodeURIComponent(usage.split(" ")[0])}`,
    };
  });
}

function cliCommands(md) {
  return tableAfter(md, "## CLI commands").map(([usage, , example]) => ({
    usage: code(usage)[0],
    example: code(example ?? "")[0] ?? null,
  }));
}

function cliFlags(md) {
  return tableAfter(md, "## CLI flags").map(([flag, , example]) => ({
    flags: code(flag),
    example: code(example ?? "")[0] ?? null,
  }));
}

function shortcuts(md) {
  const keysOf = s => plain(s).replace(/`/g, "");
  const table = heading =>
    tableAfter(md, heading).map(([keys, description, notes]) => ({
      keys: keysOf(keys),
      description: plain(description),
      notes: plain(notes ?? ""),
    }));
  return {
    general: table("### General controls"),
    editing: table("### Text editing"),
    multiline: tableAfter(md, "### Multiline input").map(([method, keys, notes]) => ({
      keys: keysOf(keys),
      description: plain(method),
      notes: plain(notes),
    })),
    prefixes: table("### Quick commands"),
  };
}

const [commandsMd, cliMd, interactiveMd] = await Promise.all(
  ["commands", "cli-reference", "interactive-mode"].map(load),
);

const commands = slashCommands(commandsMd);
const names = new Set(commands.map(c => c.name));
const missing = commands.filter(c => !commandGuide[c.name]).map(c => c.name);
const stale = Object.keys(commandGuide).filter(n => !names.has(n));
if (missing.length) console.warn(`WARNING: no hand-written guide entry for: ${missing.join(", ")}`);
if (stale.length) console.warn(`WARNING: guide entries for commands no longer in the docs: ${stale.join(", ")}`);

const data = {
  checkedAt: new Date().toISOString().slice(0, 10),
  sources: {
    commands: `${DOCS}/commands`,
    cli: `${DOCS}/cli-reference`,
    interactive: `${DOCS}/interactive-mode`,
  },
  commands,
  cli: cliCommands(cliMd),
  flags: cliFlags(cliMd),
  shortcuts: shortcuts(interactiveMd),
};

writeFileSync(OUT, JSON.stringify(data, null, 2) + "\n");
console.log(
  `Wrote ${commands.length} slash commands, ${data.cli.length} CLI commands, ${data.flags.length} flags, ` +
    `${Object.values(data.shortcuts).flat().length} shortcuts`,
);
if (missing.length) process.exitCode = 1;
