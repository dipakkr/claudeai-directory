import type { Agent } from "@/types";

export interface ResourceGuide {
  name: string;
  metaDescription: string;
  title: string;
  summary: string;
  publisher: string;
  checkedAt: string;
  fit: string;
  avoid: string;
  simpler: string;
  prerequisites: string[];
  compatibility: { surface: string; detail: string }[];
  steps: string[];
  example: { title: string; input: string; expected: string; checks: string[]; files?: { label: string; href: string }[] };
  permissions: string;
  costs: string;
  limits: string[];
  troubleshooting: { symptom: string; action: string }[];
  sources: { label: string; href: string; supports: string }[];
}

export const resourceGuides: Record<string, ResourceGuide> = {
  "skill/xlsx": {
    name: "Excel Spreadsheet Creator & Editor",
    title: "XLSX Skill for Claude: Spreadsheet Setup & Example",
    metaDescription: "Build an editable spreadsheet with Claude's XLSX skill. Try a sample budget, check formulas, and understand setup, file access, and limitations.",
    summary: "Turn spreadsheet data into an editable workbook with calculations you can inspect. Start with a small budget exercise before trusting generated formulas with real business decisions.",
    publisher: "Anthropic", checkedAt: "2026-09-21",
    fit: "You need a reusable workbook with formulas, readable formatting and explicit input assumptions.",
    avoid: "You only need one calculation, or cannot share the workbook's contents with your Claude environment.",
    simpler: "Use a spreadsheet formula directly for a simple total. Upload a sanitized table for a one-off explanation before installing a local workflow.",
    prerequisites: ["Claude Code with plugin support and permission to work in a dedicated test folder.", "The document-skills bundle from Anthropic's skills marketplace; review the included tools before installation.", "Python dependencies and a spreadsheet recalculation engine as described in the publisher's setup. Check availability locally rather than assuming hosted dependencies exist.", "Excel or another spreadsheet viewer to inspect the output independently."],
    compatibility: [{ surface: "Claude Code", detail: "This guide targets the publisher's local skill/plugin workflow. Installation alone does not provision all runtime dependencies." }, { surface: "Other surfaces", detail: "Do not assume a Claude Code plugin command installs into Claude web or Excel. Check the documentation for your chosen surface." }],
    steps: ["Create a test folder and download the synthetic budget CSV below. Keep original business files elsewhere.", "Use the installation panel to inspect the publisher's marketplace and document-skills bundle. Follow the source setup if a direct command is unavailable.", "Start a new session in the test folder. Ask Claude to use the XLSX skill and report missing dependencies before creating files.", "Run the example prompt. Keep the CSV unchanged and save the workbook under a new filename.", "Open the workbook, compare the answer key, then change an input to verify that the formulas actually recalculate."],
    example: {
      title: "Try it: turn a CSV into a working budget",
      input: "Use the XLSX skill with budget.csv in this test folder. Create budget.xlsx without overwriting the CSV. Add columns for Budget, Actual and Variance, where Variance = Actual - Budget. Use formulas for variance and the totals row, not hardcoded answers. Add a clearly labeled chart comparing budget with actual. Preserve category labels and format amounts as USD. Recalculate and report the checks you actually ran, any missing dependencies, and any formulas you could not validate. Do not upload files to another service or install dependencies without asking.",
      expected: "An editable workbook, not a screenshot or a CSV renamed .xlsx. This synthetic exercise has budget total $3,000, actual total $3,150 and variance +$150. Those are our arithmetic answer key, not an observed Claude result.",
      checks: ["Hosting variance is +$50, Software is -$50 and Contractors is +$150.", "The total row uses formulas and the chart refers to the three category rows, not the total row.", "Change Hosting Actual from 350 to 400: total actual should become $3,200 and total variance +$200.", "Inspect formula cells and reopen the file in your normal spreadsheet app. No formula-error report alone proves the workbook is correct."],
      files: [{ label: "Synthetic budget CSV", href: "/examples/xlsx/budget.csv" }],
    },
    permissions: "A local spreadsheet workflow can read inputs and write output files, and may run Python or other local programs. Limit the working folder, review command approvals and remove confidential data from samples. A skill is not a security sandbox.",
    costs: "Claude usage is subject to your account's terms. No fixed subscription price or free execution is promised here; check your account and any spreadsheet application license separately.",
    limits: ["The source describes formula recalculation and engine-specific compatibility constraints; modern formulas may not behave identically across engines.", "The source warns about cached-value reads and macro preservation. Work on copies and verify any macro-enabled output separately.", "No generated workbook has been tested with Claude by this directory. Large workbooks, external data links and business-specific logic need their own validation."],
    troubleshooting: [{ symptom: "Formula cells show blanks or stale numbers", action: "Check whether recalculation ran successfully. Open in your target spreadsheet application and recalculate before trusting displayed values." }, { symptom: "Totals look right but changing an input does nothing", action: "Inspect whether calculated cells contain formulas or fixed numbers. Ask for formula-based totals and repeat the input-change test." }, { symptom: "A dependency is missing", action: "Have Claude name the missing program and proposed setup command. Review the publisher requirements and approve installation only in an appropriate environment." }],
    sources: [{ label: "Anthropic XLSX skill", href: "https://github.com/anthropics/skills/blob/main/skills/xlsx/SKILL.md", supports: "Spreadsheet workflow, dependencies, formula handling and compatibility cautions. This moving source was checked on the date above." }, { label: "Anthropic skills marketplace", href: "https://github.com/anthropics/skills", supports: "Publisher distribution and document-skills bundle setup." }],
  },
  "agent/code-explorer": {
    name: "Code Explorer",
    title: "Code Explorer for Claude: Understand an Existing Feature",
    metaDescription: "Trace an unfamiliar codebase with Anthropic's Code Explorer. See setup, a scoped example, access considerations, and checks for file-and-line evidence.",
    summary: "Understand how an existing feature works before changing it. Code Explorer helps map a code path; its explanation still needs to be checked against your repository.",
    publisher: "Anthropic", checkedAt: "2026-09-21",
    fit: "You are onboarding to a repository or preparing a change that crosses several files.",
    avoid: "You already know the single function you need, or are looking for proof that a system is secure or correct.",
    simpler: "Ask Claude to explain one file first. Escalate to feature exploration only when the behavior crosses multiple components.",
    prerequisites: ["Claude Code and a repository you are permitted to share with its environment.", "The publisher's Feature Development plugin. This agent is part of that plugin, not the PR Review Toolkit.", "A specific feature, route or entry point to investigate; avoid asking for an entire large repository in one pass."],
    compatibility: [{ surface: "Claude Code", detail: "The source defines a Sonnet subagent inside the Feature Development plugin." }, { surface: "Claude web", detail: "This is not a connector or a hosted repository browser. The plugin setup described here targets Claude Code." }],
    steps: ["Open a disposable checkout or a clean working tree and record its current revision.", "Follow the linked Feature Development plugin setup. Inspect its agent definition and permissions before enabling it.", "Check /agents after installation, then explicitly request Code Explorer for one feature.", "Run the example using a route that actually exists in your repository. Do not launch the full feature-development workflow when you only want an explanation.", "Open the cited files yourself and follow one successful path and one failure path. Save unresolved questions before planning changes."],
    example: {
      title: "Try it: map a feature before editing it",
      input: "Use the code-explorer agent to explain how one existing user-facing feature works in this repository. First ask me for its route or entry point if it is unclear. Trace the path from user action through validation to data access and response. Cite current file paths and line numbers. Separate directly observed code from inferences. Identify one failure path, relevant tests and unanswered questions. Do not edit files, install anything or contact external services. Stop after the explanation; do not begin implementation.",
      expected: "A bounded feature map with citations you can open, plus clear unknowns. There is no universal answer key because repositories differ; the checks below are the acceptance criteria, not a claim that this agent passed them.",
      checks: ["Every cited path exists at the recorded revision and the referenced lines support the associated claim.", "At least one real call chain connects the entry point to an output or side effect; a list of filenames alone is insufficient.", "An error path is grounded in code rather than invented expected behavior.", "Check git status and the diff afterward. The exercise requests no changes; this is not a permission-enforced guarantee."],
    },
    permissions: "The published tool list includes file inspection and web tools, plus shell-output/process tools. Treat the task's no-edit request as intent, not isolation. Review Claude Code permissions, protect secrets and deny unnecessary network access.",
    costs: "Exploration consumes Claude usage under your account. Keep the scope small and review your usage limits; no fixed token cost or completion time is promised.",
    limits: ["Static inspection can miss dynamically configured behavior or services outside the checkout.", "Paths and line numbers become stale after code changes; record the revision with your notes.", "The parent plugin also contains design and implementation phases. This guide only covers exploration, and does not claim independent execution or measured accuracy."],
    troubleshooting: [{ symptom: "The agent is unavailable", action: "Check the Feature Development plugin installation, active scope and /agents list. Reopen the session if the plugin was just enabled." }, { symptom: "The explanation is too broad", action: "Name one entry point and one question. Ask it to stop at the first external boundary and list the missing evidence." }, { symptom: "A reference does not support the claim", action: "Give the specific mismatch and ask for corrected evidence. Do not carry an unsupported architectural claim into your implementation plan." }],
    sources: [{ label: "Code Explorer definition", href: "https://github.com/anthropics/claude-plugins-official/blob/main/plugins/feature-dev/agents/code-explorer.md", supports: "Agent purpose, model, declared tools and citation-oriented output. Moving source checked on the date above." }, { label: "Feature Development plugin", href: "https://github.com/anthropics/claude-plugins-official/tree/main/plugins/feature-dev", supports: "Parent plugin, manual exploration and the wider development workflow." }],
  },
  "mcp/filesystem": {
    name: "Filesystem MCP",
    metaDescription: "Use Filesystem MCP with local folders. Compare fit, setup, read/write permissions, compatibility, and troubleshooting before granting file access.",
    title: "Filesystem MCP for Claude: Setup, Access & Examples",
    summary: "Let an MCP client read, search, and edit files in selected local folders. Useful for repeated work across documents; unnecessary when Claude Code already has the file access your task needs.",
    publisher: "Model Context Protocol project",
    checkedAt: "2026-09-21",
    fit: "You use an MCP-capable desktop client and repeatedly need to inspect or update a folder of local documents.",
    avoid: "You only need to discuss one uploaded document, or your coding assistant already has suitable filesystem tools.",
    simpler: "Upload a single document for a one-off question. In Claude Code, start with its existing file tools before adding a second filesystem interface.",
    prerequisites: ["A local MCP client such as Claude Desktop, or Claude Code with stdio MCP support.", "Node.js and npm for the documented npx setup.", "A dedicated folder containing non-sensitive test files. Use its absolute path, not the example placeholder."],
    compatibility: [
      { surface: "Claude Desktop", detail: "Local configuration is documented by the publisher. Not run by this directory." },
      { surface: "Claude Code", detail: "Supports local stdio MCP servers. This server/client combination has not been executed here." },
      { surface: "Claude.ai", detail: "This local stdio package is not a hosted connector URL. Do not paste its command into a remote connector field." },
    ],
    steps: ["Open the publisher setup below. Select its local npx configuration and replace the allowed-directory example with your test folder.", "Add the configuration using your client's MCP setup flow and restart or reconnect as required. In Claude Code, inspect the connection using /mcp.", "Ask the client to list the server's allowed directories before reading files. Client-provided roots can replace the command-line directory list.", "Try the read-only exercise below. Inspect the result before permitting any write, edit, or move operation."],
    example: {
      title: "Compare two meeting notes without changing them",
      files: [{ label: "monday.txt", href: "/examples/filesystem/monday.txt" }, { label: "friday.txt", href: "/examples/filesystem/friday.txt" }],
      input: "In my allowed test folder, read monday.txt and friday.txt. List decisions that changed, cite the filename for each claim, and flag contradictions. Do not write, rename, or move any files.",
      expected: "With the sample files: launch moves from October 10 to October 12, the pilot shrinks from 20 agents to 10, Mira remains the owner, and accessibility review is still pending. Each statement should cite its source file. This is the answer key for synthetic fixtures, not a recorded MCP test result.",
      checks: ["Both filenames appear in the answer and their cited details match the files.", "Missing or contradictory information is stated explicitly.", "The original files remain unchanged."],
    },
    permissions: "The server can read and write inside allowed directories. Its documented tools include overwrite, edit, and move operations. Directory scope is not a read-only guarantee. Files returned to your AI client enter that client's processing context; local execution does not mean the AI analysis stays local. To stop access, remove or disable the server in your client's MCP configuration and restart/reconnect. This does not undo prior file edits; keep backups.",
    costs: "The repository is MIT-licensed. Running it locally still requires your computer and a compatible client; Claude plan or API usage costs are separate. No fixed usage price is asserted here.",
    limits: ["At least one allowed directory must be supplied through arguments or client roots.", "Roots supplied by a supporting client replace the server-side allowed directory list.", "This directory has not run an installation, tested access boundaries, or audited the package."],
    troubleshooting: [
      { symptom: "Server does not initialize", action: "Check Node/npm availability and that at least one existing directory is supplied. Read the client log; do not broaden access to your whole home folder as a workaround." },
      { symptom: "A file is outside the allowed directories", action: "Inspect list_allowed_directories and the client's roots. Move a test copy into the intended folder or deliberately adjust the scope." },
      { symptom: "The example path does not exist", action: "Replace /path/to/allowed/dir with your own absolute folder path using the publisher's configuration example." },
    ],
    sources: [
      { label: "Filesystem README", href: "https://github.com/modelcontextprotocol/servers/blob/d73f99efbfd40c3aa1b61e88728b3d49fb52608f/src/filesystem/README.md", supports: "Package, tools, directory scope, client roots, Desktop setup and license." },
      { label: "Claude Code MCP setup", href: "https://code.claude.com/docs/en/mcp", supports: "Client-side MCP configuration and local stdio support." },
    ],
  },
  "skill/frontend-design": {
    name: "Frontend Design",
    metaDescription: "Use Anthropic's Frontend Design skill with Claude Code. Explore a realistic brief, setup, bundle contents, limitations, and checks for the resulting interface.",
    title: "Frontend Design for Claude: Setup & Practical Examples",
    summary: "Anthropic's frontend-design skill guides Claude's visual decisions when building or reshaping an interface. It adds reusable design instructions; it does not supply a component library or guarantee production-ready code.",
    publisher: "Anthropic",
    checkedAt: "2026-09-21",
    fit: "You can describe a product and audience, and want Claude to make deliberate choices about typography, layout, and visual identity while implementing the UI.",
    avoid: "You need guaranteed brand compliance, an accessibility certification, or a finished app without reviewing its behavior.",
    simpler: "For a small styling correction, give Claude your existing design rules and the specific change. Add the skill when the same design guidance is useful across tasks.",
    prerequisites: ["Claude Code and a project you are comfortable letting it edit.", "A brief naming the audience, task, framework, existing design constraints, and required states.", "A browser and the project's normal build/test tools to inspect what Claude creates."],
    compatibility: [
      { surface: "Claude Code", detail: "Listed in Anthropic's example-skills marketplace bundle. The bundle includes other skills too." },
      { surface: "Other Claude surfaces", detail: "This guide covers the Code marketplace path only. It does not establish compatibility for this package in web, Desktop chat, or API usage." },
    ],
    steps: ["Review the current skill source and marketplace bundle before installation. The install panel uses the published marketplace entry, not the old standalone plugin name.", "Install the bundle and start a new Claude Code session. Confirm the skill is available before beginning the task.", "Provide your actual product context and explicitly ask Claude to use frontend-design. Specify states, breakpoints, and any existing design system.", "Run the resulting interface in a browser, exercise its actions, and check mobile, keyboard access, and the project build before accepting it."],
    example: {
      title: "Build a customer-support queue",
      input: "Use frontend-design to build a support queue in this project's existing framework. Agents need to scan priority, customer, status, and last reply. Preserve our design tokens. Include loading, empty, error, and selected-ticket states. Make the ticket action usable on a 390px screen and with a keyboard.",
      expected: "Working interface code shaped around the support workflow, plus states you can inspect. This brief and acceptance criteria are editorial examples; no generated output has been benchmarked here.",
      checks: ["Tickets can be opened and their status changed through the intended interaction.", "The longest customer name does not overlap the next column.", "At mobile width and keyboard-only navigation, the primary action remains reachable.", "The normal project build and relevant tests pass."],
    },
    permissions: "The skill is design guidance. File edits, commands, and external asset access depend on Claude Code's available tools and approvals. Review the whole example-skills bundle before enabling it; installation includes more than this one skill. Disable or uninstall the parent plugin through Claude Code's plugin manager to stop using the bundle. That does not undo changes already made to your project.",
    costs: "The source is publicly available and includes license terms. Claude usage and any paid assets, services, or hosting are separate. No measured cost or time-saving claim is available.",
    limits: ["A visually distinctive result can still have functional or accessibility defects.", "The current upstream skill has changed since the older copy in our catalog. The linked source is the reference for the reviewed version.", "The directory has not independently executed a design task with this version."],
    troubleshooting: [
      { symptom: "Claude does not use the skill", action: "Check that the bundle is installed in the current session, restart the session if needed, and name frontend-design explicitly in your request." },
      { symptom: "The design ignores your existing product", action: "Supply actual content, reference screens, design tokens, and constraints. Ask for a focused revision and inspect the result." },
      { symptom: "It looks finished but controls do nothing", action: "Give each control an acceptance criterion and test the actual workflow. Visual guidance does not replace implementation testing." },
    ],
    sources: [
      { label: "Frontend Design source", href: "https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/skills/frontend-design/SKILL.md", supports: "Purpose, design guidance and review process." },
      { label: "Published skills marketplace", href: "https://github.com/anthropics/skills/blob/34040c9c568585f6929bedeaad110ad08f079624/.claude-plugin/marketplace.json", supports: "frontend-design is part of example-skills in anthropic-agent-skills." },
    ],
  },
  "agent/code-reviewer": {
    name: "Code Reviewer",
    metaDescription: "Review code changes with Anthropic's Code Reviewer subagent. Understand setup, diff scope, permissions, limitations, and how to check its findings.",
    title: "Code Reviewer for Claude: Review Pull Requests",
    summary: "Anthropic's PR Review Toolkit includes a Claude Code subagent that checks a specified code diff against project guidelines and looks for actionable bugs. Its findings support human review; they do not prove the code is correct.",
    publisher: "Anthropic, PR Review Toolkit",
    checkedAt: "2026-09-21",
    fit: "You have a bounded change and want a second review for bugs, missing handling, and deviations from documented project rules.",
    avoid: "You need a security certification, an automatic merge decision, or a substitute for executing tests.",
    simpler: "For a small diff, ask your current Claude Code session to review it with file/line evidence. Use a subagent when separate review context is useful.",
    prerequisites: ["Claude Code with access to the repository and diff you want reviewed.", "A clear scope: unstaged edits, staged edits, a commit, or a branch comparison.", "Project rules in CLAUDE.md where available, and a clean understanding of which changes are yours."],
    compatibility: [
      { surface: "Claude Code", detail: "Agent definition is published in Anthropic's PR Review Toolkit plugin. Its source specifies the opus model alias." },
      { surface: "Claude.ai / API", detail: "Not established by this agent file. A plugin subagent is not automatically a hosted or scheduled agent." },
    ],
    steps: ["Open the toolkit setup instructions below and install the PR Review Toolkit, which includes several reviewers rather than this agent alone.", "Start a new Claude Code session and confirm code-reviewer is available in /agents.", "Ask for code-reviewer explicitly and identify the diff. Its default review scope is unstaged changes, which will miss staged-only changes unless you specify them.", "Read each finding against the cited code. Reproduce the issue and run relevant tests before changing code or opening the pull request."],
    example: {
      title: "Review staged changes without editing them",
      input: "Use the PR Review Toolkit code-reviewer to review git diff --cached against CLAUDE.md. Report actionable issues with file and line, a concrete failure scenario, and a suggested fix. Do not edit files, commit, push, or merge. If you cannot inspect part of the change, say so.",
      expected: "A scoped list of findings with references and reasoning, or a statement that no sufficiently supported findings were identified. This is an illustrative request, not a recorded agent run.",
      checks: ["The review names staged changes as its scope.", "Each finding points to a real changed line and explains a reproducible risk.", "No edits, commits, or pushes occurred.", "A clean review is not treated as proof that tests or security checks passed."],
    },
    permissions: "The source does not declare a restricted tools allowlist. Check effective tools and permissions in your Claude Code configuration. The request not to edit is an instruction, not a security boundary; do not assume read-only isolation. Stop an active run if it exceeds the review scope. Disable or uninstall the parent toolkit through the plugin manager to remove its agents; previous repository changes are not undone.",
    costs: "The definition specifies opus. Claude plan limits or API billing apply to the review work; actual cost varies with repository scope and context. No independent runtime or cost benchmark is available.",
    limits: ["The confidence score in an agent response is a model judgment, not a calibrated probability or independent verification.", "The source filters for high-confidence findings and can miss real bugs.", "This directory has checked the source, not executed this agent or measured review accuracy."],
    troubleshooting: [
      { symptom: "Review says there are no changes", action: "Check whether your work is staged or committed. Name git diff --cached or the exact branch/commit range rather than relying on the unstaged default." },
      { symptom: "The agent is not listed", action: "Check the toolkit installation and current project scope, then restart the session and inspect /agents." },
      { symptom: "A finding does not match the code", action: "Ask for the exact line and failure scenario, inspect them yourself, and reject findings that cannot be supported." },
    ],
    sources: [
      { label: "Code Reviewer definition", href: "https://github.com/anthropics/claude-plugins-official/blob/c447c3207a425bc4e2a0d068435f64b0477ae981/plugins/pr-review-toolkit/agents/code-reviewer.md", supports: "Scope, model, missing tool allowlist and finding format." },
      { label: "PR Review Toolkit setup", href: "https://github.com/anthropics/claude-plugins-official/tree/c447c3207a425bc4e2a0d068435f64b0477ae981/plugins/pr-review-toolkit", supports: "Parent plugin, related reviewers and installation guidance." },
      { label: "Claude Code subagents", href: "https://code.claude.com/docs/en/sub-agents", supports: "Subagent configuration and permission behavior." },
    ],
  },
};

// Reviewed catalog entry while the deployed API lacks the agents endpoint.
// No popularity, install verification, or runtime results are synthesized.
export const reviewedCodeReviewer: Agent = {
  id: "code-reviewer", name: "code-reviewer", title: "Code Reviewer",
  description: resourceGuides["agent/code-reviewer"].summary,
  category: "code-review", tags: ["code review", "pull requests"],
  author: { name: "Anthropic", url: "https://github.com/anthropics" },
  github_url: resourceGuides["agent/code-reviewer"].sources[1].href,
  model: "opus", created_at: "2026-09-21", updated_at: "2026-09-21",
};

export const reviewedAgents: Agent[] = [reviewedCodeReviewer, {
  id: "code-explorer", name: "code-explorer", title: "Code Explorer",
  description: resourceGuides["agent/code-explorer"].summary,
  category: "research", tags: ["code exploration", "onboarding"],
  author: { name: "Anthropic", url: "https://github.com/anthropics" },
  github_url: resourceGuides["agent/code-explorer"].sources[1].href,
  model: "sonnet", created_at: "2026-09-21", updated_at: "2026-09-21",
}];
