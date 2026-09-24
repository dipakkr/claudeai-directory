// Hand-written explanations for every Claude Code slash command, keyed by the
// command name as it appears in the official docs. The names, arguments and
// requirement flags come from src/data/claude-code-commands.json, which
// scripts/build-claude-code-commands.mjs regenerates. That script warns when a
// documented command has no entry here, so add one whenever it does.

export const commandCategories = [
  { id: "sessions", label: "Sessions and context" },
  { id: "planning", label: "Planning and agents" },
  { id: "review", label: "Review and verify" },
  { id: "project", label: "Project setup and memory" },
  { id: "settings", label: "Models and settings" },
  { id: "integrations", label: "MCP, plugins and integrations" },
  { id: "remote", label: "Cloud and other devices" },
  { id: "account", label: "Account and usage" },
  { id: "help", label: "Help and troubleshooting" },
  { id: "extras", label: "Extras" },
] as const;

export type CommandCategory = (typeof commandCategories)[number]["id"];

export interface CommandGuide {
  category: CommandCategory;
  summary: string;
  details: string;
}

export interface TopCommand {
  name: string;
  why: string;
  example: string;
}

// Everyday commands, in the order a new user tends to need them.
export const topCommands: TopCommand[] = [
  { name: "/init", why: "Creates a CLAUDE.md so Claude knows how your project builds, tests and is laid out.", example: "/init" },
  { name: "/plan", why: "Makes Claude think through a large change and show you the plan before it edits anything.", example: "/plan add rate limiting to the public API" },
  { name: "/clear", why: "Starts a clean conversation for a new task, so old context does not steer the new one.", example: "/clear auth-refactor" },
  { name: "/compact", why: "Summarizes a long conversation to free up context without losing the thread.", example: "/compact keep the failing test names and the fix plan" },
  { name: "/context", why: "Shows what is filling the context window, so you know what to trim.", example: "/context" },
  { name: "/resume", why: "Picks up an earlier conversation by name or from a list, with its full history.", example: "/resume auth-refactor" },
  { name: "/rewind", why: "Rolls code and conversation back to an earlier checkpoint when a change goes wrong.", example: "/rewind" },
  { name: "/model", why: "Switches models, for example to a faster one for simple edits or a stronger one for hard bugs.", example: "/model sonnet" },
  { name: "/diff", why: "Lets you read every change Claude made before you commit it.", example: "/diff" },
  { name: "/code-review", why: "Checks your current changes, or a pull request, for correctness bugs.", example: "/code-review high 1234" },
  { name: "/btw", why: "Asks a quick side question without adding it to the main conversation.", example: "/btw what does the -z flag in grep do?" },
  { name: "/mcp", why: "Connects and manages MCP servers that give Claude access to tools like GitHub, databases or browsers.", example: "/mcp reconnect github" },
  { name: "/memory", why: "Edits the CLAUDE.md files and memory Claude loads into every session.", example: "/memory" },
  { name: "/permissions", why: "Sets which tools and commands Claude can run without asking you each time.", example: "/permissions" },
  { name: "/usage", why: "Shows what the session cost and how close you are to your plan limits.", example: "/usage" },
];

export const commandGuide: Record<string, CommandGuide> = {
  "/add-dir": {
    category: "sessions",
    summary: "Give Claude access to another folder for this session.",
    details:
      "Use it when a task spans two repositories or needs files outside your project. Claude can read and edit files there, but most .claude/ settings in that folder are not picked up. Network share paths are generally not supported.",
  },
  "/advisor": {
    category: "settings",
    summary: "Turn on a second model that Claude consults at key moments.",
    details:
      "Pass fable, opus, sonnet, a full model ID, or off. With no argument you get a picker. Useful on long or tricky tasks where a second opinion can catch a wrong turn early.",
  },
  "/agents": {
    category: "planning",
    summary: "Reminds you how to create and manage subagents.",
    details:
      "In current versions it no longer opens a menu. Ask Claude to create a subagent for you, or edit the files in .claude/agents/ (project) or ~/.claude/agents/ (personal) directly.",
  },
  "/artifacts": {
    category: "integrations",
    summary: "List your artifacts and attach, open or share one.",
    details:
      "Shows artifacts you own or that were shared with you. You can attach one to the session, open it in the browser, or copy its link. Only available where artifacts are supported.",
  },
  "/auto-mode-setup": {
    category: "settings",
    summary: "Draft auto mode environment rules from your project.",
    details:
      "Claude looks at your project and recent sessions, proposes autoMode.environment entries, and saves them to your user settings once you approve. Needs a Pro, Max or Team plan.",
  },
  "/autocompact": {
    category: "sessions",
    summary: "Set how full the context gets before Claude compacts it.",
    details:
      "Pass a size such as 500k, or auto to go back to the default for your model. The value is saved to your user settings. Run it with no argument to see the current setting.",
  },
  "/autofix-pr": {
    category: "review",
    summary: "Start a cloud session that fixes CI failures and review comments on your PR.",
    details:
      "It finds the open pull request for your current branch and keeps pushing fixes as CI fails or reviewers comment. Add a prompt to narrow the job, for example only lint errors. Needs the gh CLI and cloud session access.",
  },
  "/background": {
    category: "planning",
    summary: "Send this session to the background and free your terminal.",
    details:
      "The session keeps running as a background agent. You can add one last instruction before it detaches, then check on it with claude agents. Use /fork instead if you want to keep working here too. Short form: /bg.",
  },
  "/batch": {
    category: "planning",
    summary: "Split a large codebase change into parallel units of work.",
    details:
      "Claude researches the change, breaks it into 5 to 30 independent pieces and shows you a plan. After you approve, each piece runs in its own git worktree and opens its own pull request. Good for migrations; requires a git repository.",
  },
  "/branch": {
    category: "sessions",
    summary: "Try a different direction without losing the current conversation.",
    details:
      "Creates a copy of the conversation at this point and switches you into it. The original stays intact and you can go back with /resume. Use /fork to run the copy in the background instead.",
  },
  "/btw": {
    category: "sessions",
    summary: "Ask a side question that does not go into the conversation.",
    details:
      "Handy for a quick lookup while Claude works on the main task. The answer is shown to you but not added to the history Claude uses. Run it with no question to see your earlier side answers.",
  },
  "/bug": {
    category: "help",
    summary: "Report a bug to Anthropic, with session context if you choose.",
    details:
      "You pick how much of the session to include and confirm before anything is sent. On third-party providers the report is saved locally for you to forward. Also available as /share.",
  },
  "/cd": {
    category: "sessions",
    summary: "Move the session to another working directory.",
    details:
      "Keeps your conversation but changes where Claude works. Unlike /add-dir, which adds a second folder, /cd switches the main one. Press Tab to accept a suggested path.",
  },
  "/chrome": {
    category: "integrations",
    summary: "Configure the Claude in Chrome browser integration.",
    details: "Opens the settings for the Chrome extension that lets Claude control your browser for testing and web tasks.",
  },
  "/claude-api": {
    category: "project",
    summary: "Load Claude API reference material for your project.",
    details:
      "A bundled skill that gives Claude up-to-date API and SDK details for your language. It also has subcommands such as migrate (move code to a newer model), prompt-audit and cost-optimize. It loads automatically when your code imports the Anthropic SDK.",
  },
  "/clear": {
    category: "sessions",
    summary: "Start a new conversation with an empty context.",
    details:
      "Use it when you switch to an unrelated task. Pass a name to label the old conversation so it is easy to find in /resume. To keep the thread but free space, use /compact instead. Also available as /new and /reset.",
  },
  "/code-review": {
    category: "review",
    summary: "Review your changes or a pull request for bugs.",
    details:
      "Reviews the current diff by default, or a PR number, branch or path you pass. Add an effort level such as high, --fix to apply the findings, or --comment to post them on the PR. The ultra level runs a deeper multi-agent review in the cloud. Also available as /review.",
  },
  "/color": {
    category: "settings",
    summary: "Change the prompt bar color for this session.",
    details:
      "Pick red, blue, green, yellow, purple, orange, pink or cyan, or default to reset. Useful for telling several terminal sessions apart at a glance.",
  },
  "/compact": {
    category: "sessions",
    summary: "Summarize the conversation so far to free up context.",
    details:
      "Claude replaces the long history with a summary and keeps going. You can pass instructions for what the summary must keep, such as file names or open questions. Run it before a long session starts to feel slow or forgetful.",
  },
  "/config": {
    category: "settings",
    summary: "Open settings, or change one directly.",
    details:
      "With no argument it opens the settings screen for theme, model, editor mode and more. Pass key=value pairs, such as /config theme=dark, to change a setting without the screen. Run /config --help to list the keys. Also available as /settings.",
  },
  "/context": {
    category: "sessions",
    summary: "See what is using your context window.",
    details:
      "Shows a colored grid of context usage, broken down by messages, tools, memory files and more, with tips for trimming. Pass all to expand every item. Check it when responses slow down or Claude seems to forget things.",
  },
  "/copy": {
    category: "sessions",
    summary: "Copy Claude's last response to the clipboard.",
    details:
      "Pass a number to copy an older response, such as /copy 2. When the response has code blocks you can pick a single block. Press w in the picker to save to a file instead, which helps over SSH.",
  },
  "/cost": {
    category: "account",
    summary: "Another name for /usage.",
    details: "Opens the same view as /usage, with session cost and plan limits.",
  },
  "/dataviz": {
    category: "integrations",
    summary: "Get design guidance for charts and dashboards.",
    details:
      "A bundled skill that helps Claude choose the right chart type, accessible colors and clear labels. It ships a neutral palette you can swap for your brand colors.",
  },
  "/debug": {
    category: "help",
    summary: "Turn on debug logging and troubleshoot a problem.",
    details:
      "Starts capturing a debug log from this point and has Claude read it to find the cause. Describe the issue to focus the search. To log from the very start of a session, launch with claude --debug.",
  },
  "/deep-research": {
    category: "planning",
    summary: "Research a question across many web sources and get a cited report.",
    details:
      "A bundled workflow that runs many searches in parallel, checks sources against each other and writes a report with citations. It runs in the background, so you can keep working.",
  },
  "/design": {
    category: "integrations",
    summary: "Draft UI mockups and screens as an editable design.",
    details:
      "Describe what you need, such as a settings screen, and Claude lays it out as artboards you can edit in the browser and export as PNG or PDF. Needs a session where artifacts are available.",
  },
  "/design-login": {
    category: "integrations",
    summary: "Authorize design-system access for /design-sync.",
    details: "Signs in with your claude.ai account so /design-sync can upload your design system.",
  },
  "/design-sync": {
    category: "integrations",
    summary: "Upload your React design system so designs use your real components.",
    details:
      "Converts the components in your repo for Claude Design. The first sync checks every component and can take hours on a large repo. Not available on Bedrock, Google Cloud or Foundry.",
  },
  "/desktop": {
    category: "remote",
    summary: "Continue this session in the Claude Code desktop app.",
    details: "Hands the session over to the desktop app. Needs macOS or x64 Windows and a Claude subscription. Also available as /app.",
  },
  "/diff": {
    category: "review",
    summary: "Review every change in your working tree.",
    details:
      "Shows the edits Claude made along with any other uncommitted changes. Read through it before committing, the same way you would review a teammate's work.",
  },
  "/doctor": {
    category: "help",
    summary: "Check your setup and fix common problems.",
    details:
      "Looks for broken or duplicate installs, PATH issues, bad settings files, slow hooks and unused skills or MCP servers. It reports first and asks before changing anything. For read-only checks from the shell, run claude doctor. Also available as /checkup.",
  },
  "/effort": {
    category: "settings",
    summary: "Set how much reasoning effort Claude uses.",
    details:
      "Choose from low up to xhigh, max, ultracode or auto, or pass status to see the current level. Higher effort helps on hard problems but uses more tokens and time. max and ultracode last for the current session only.",
  },
  "/exit": {
    category: "sessions",
    summary: "Quit Claude Code.",
    details: "Ends the session. In an attached background session it detaches and leaves the session running. Also available as /quit.",
  },
  "/export": {
    category: "sessions",
    summary: "Save the conversation as plain text.",
    details: "Pass a filename to write it straight to a file, or run it bare to copy to the clipboard or pick a location. Useful for sharing a session or keeping notes.",
  },
  "/fast": {
    category: "settings",
    summary: "Turn fast mode on or off.",
    details:
      "Fast mode gives quicker output on supported models at a higher price. You can toggle it mid-response; the current turn finishes at its original speed.",
  },
  "/feedback": {
    category: "help",
    summary: "Send product feedback about Claude Code.",
    details:
      "Opens the same consent dialog as /bug. If Claude has drafted feedback during the session, running it with no argument lets you review, edit or discard those drafts first.",
  },
  "/fewer-permission-prompts": {
    category: "project",
    summary: "Cut down on repeated permission prompts.",
    details:
      "A bundled skill that scans your past sessions for safe, read-only commands you approve often and adds them to the project allowlist in .claude/settings.json.",
  },
  "/focus": {
    category: "settings",
    summary: "Toggle a compact view of each turn.",
    details:
      "Shows only your last prompt, a one-line summary of tool calls and the final answer. Only works with fullscreen rendering. The choice is remembered across sessions.",
  },
  "/fork": {
    category: "planning",
    summary: "Copy the conversation into a new background session.",
    details:
      "The copy works on its own while you carry on here. Give it a prompt to start right away. Use /branch to switch into a copy yourself, or /subtask to get a result back in this conversation.",
  },
  "/goal": {
    category: "planning",
    summary: "Keep Claude working until a condition is met.",
    details:
      "Set a goal such as all tests passing and Claude continues across turns until it gets there. Run it with no argument to see the current goal, or pass clear to stop early.",
  },
  "/heapdump": {
    category: "help",
    summary: "Save a memory snapshot to diagnose high memory use.",
    details:
      "Writes a heap snapshot and a memory breakdown to your Desktop or home folder. Share only the -diagnostics.json file; the snapshot contains your conversation and credentials. Hidden from the menu, so type it in full.",
  },
  "/help": {
    category: "help",
    summary: "Show help and the commands available to you.",
    details: "A quick way to see what you can run in your current setup, since availability depends on your plan and platform.",
  },
  "/hooks": {
    category: "project",
    summary: "View the hooks configured for tool events.",
    details:
      "Hooks run your own scripts before or after events like a tool call or session start, for example to format files after edits. This shows which hooks are active and where they come from.",
  },
  "/ide": {
    category: "integrations",
    summary: "Manage IDE integrations.",
    details: "Shows and manages the connection to editors such as VS Code and JetBrains, so Claude can see your open files and show diffs in the editor.",
  },
  "/import": {
    category: "project",
    summary: "Bring settings over from Codex, Gemini CLI or Cursor.",
    details:
      "Copies instruction files, MCP servers, commands, subagents and skills into Claude Code. Add --dry-run to preview or --yes to skip the picker. Not available on Bedrock, Google Cloud or Foundry.",
  },
  "/init": {
    category: "project",
    summary: "Create a starter CLAUDE.md for your project.",
    details:
      "Claude studies the repo and writes a CLAUDE.md with build commands, structure and conventions, which it then reads at the start of every session. Run it once per project, then refine the file with /memory.",
  },
  "/insights": {
    category: "account",
    summary: "Get a report on how you use Claude Code.",
    details:
      "Builds an HTML report from your recent sessions on this machine: which projects you work in, where things go wrong and features worth trying. Not available in cloud sessions.",
  },
  "/install-github-app": {
    category: "integrations",
    summary: "Set up the Claude GitHub App for a repository.",
    details:
      "Walks you through installing the app and, optionally, GitHub Actions workflows and secrets, so you can mention Claude in issues and pull requests. Works with github.com repositories only.",
  },
  "/install-slack-app": {
    category: "integrations",
    summary: "Install the Claude Slack app.",
    details: "Opens your browser to finish the Slack sign-in and connect Claude to your workspace.",
  },
  "/keybindings": {
    category: "settings",
    summary: "Open your keyboard shortcuts file.",
    details: "Lets you rebind shortcuts, for example to change which key sends a message or opens the editor.",
  },
  "/list-agents": {
    category: "planning",
    summary: "List the agents and sessions Claude can message.",
    details:
      "Shows subagents, agent team members and other local sessions, with the name to use for each. Only available when cross-session messaging is turned on. Also available as /peers.",
  },
  "/login": {
    category: "account",
    summary: "Sign in to your Anthropic account.",
    details: "Use it to switch accounts or to sign in after logging out.",
  },
  "/logout": {
    category: "account",
    summary: "Sign out of your Anthropic account.",
    details: "Signs you out on this machine. Run /login to sign back in.",
  },
  "/loop": {
    category: "planning",
    summary: "Run a prompt again and again while the session is open.",
    details:
      "Give an interval and a prompt, such as /loop 5m check if the deploy finished. Leave out the interval and Claude paces itself. It only runs while this session stays open; use /schedule for jobs that run in the cloud. Also available as /proactive.",
  },
  "/mcp": {
    category: "integrations",
    summary: "Manage MCP server connections and sign-ins.",
    details:
      "Opens a list of your MCP servers with their status and OAuth sign-in. Pass reconnect with a server name to fix a dropped connection, or enable and disable to switch servers on and off without the menu. Add new servers from your shell with claude mcp add.",
  },
  "/memory": {
    category: "project",
    summary: "Edit CLAUDE.md files and auto memory.",
    details:
      "Opens the memory files Claude loads into each session, so you can add rules and project facts. You can also turn auto memory on or off and see what Claude has saved on its own.",
  },
  "/mobile": {
    category: "remote",
    summary: "Show a QR code to get the Claude mobile app.",
    details: "Scan it to install the app, which you can use with Remote Control. Also available as /ios and /android.",
  },
  "/model": {
    category: "settings",
    summary: "Switch models and set your default.",
    details:
      "With no argument it opens a picker; use the arrow keys to adjust effort on models that support it, or press s to switch for this session only. Passing a name such as sonnet or opus switches directly and saves it as your default.",
  },
  "/output-style": {
    category: "settings",
    summary: "List output styles or switch to one.",
    details: "Output styles change how Claude writes its responses, for example /output-style concise for shorter answers.",
  },
  "/passes": {
    category: "account",
    summary: "Share a free week of Claude Code with friends.",
    details: "Only shows up if your account is eligible to share passes.",
  },
  "/permissions": {
    category: "settings",
    summary: "Manage which tools Claude can use without asking.",
    details:
      "Add allow, ask and deny rules by scope, manage extra working directories and review what auto mode blocked. Well-tuned rules save a lot of approval clicks. Also available as /allowed-tools.",
  },
  "/plan": {
    category: "planning",
    summary: "Switch to plan mode before a big change.",
    details:
      "In plan mode Claude explores and proposes a plan without editing files, so you can agree on the approach first. Add a description to start right away, such as /plan fix the auth bug. You can also cycle into plan mode with Shift+Tab.",
  },
  "/plugin": {
    category: "integrations",
    summary: "Browse, install and manage plugins.",
    details:
      "Opens the plugin menu, or pass a subcommand such as install, list, enable or disable. Plugins can bundle skills, agents, hooks and MCP servers. If a change does not show up, run /reload-plugins.",
  },
  "/powerup": {
    category: "help",
    summary: "Learn Claude Code features through short interactive lessons.",
    details: "Quick guided lessons with animated demos, useful when you are new or want to find features you have not tried.",
  },
  "/pr-comments": {
    category: "review",
    summary: "Removed. Ask Claude to read the pull request comments instead.",
    details:
      "This command was removed in v2.1.91. Asking Claude directly, for example \"show me the comments on this PR\", does the same job.",
  },
  "/privacy-settings": {
    category: "account",
    summary: "View and update your privacy settings.",
    details: "Only available on Pro and Max plans.",
  },
  "/radio": {
    category: "extras",
    summary: "Open lo-fi radio in your browser.",
    details: "Plays Claude FM while you work. Prints the stream link if no browser is available.",
  },
  "/rate-limit-options": {
    category: "account",
    summary: "See your options when you hit a usage limit.",
    details:
      "Choose to wait and continue automatically when the limit resets, add usage credits, or upgrade. Needs a claude.ai subscription. Hidden from the menu, so type it in full.",
  },
  "/recap": {
    category: "sessions",
    summary: "Get a one-line summary of the session.",
    details: "Helpful when you come back to a session and want a quick reminder of where things stand.",
  },
  "/release-notes": {
    category: "help",
    summary: "Read the Claude Code changelog.",
    details: "Pick a version to see what changed. The notes appear on screen but are not added to the conversation.",
  },
  "/reload-plugins": {
    category: "integrations",
    summary: "Apply plugin changes without restarting.",
    details:
      "Reloads active plugins and reports any load errors. If the reload would change which MCP tools are loaded, it warns and skips unless you pass --force, because that resets the prompt cache.",
  },
  "/reload-skills": {
    category: "project",
    summary: "Pick up skills you added or changed during the session.",
    details: "Rescans your skill and command folders so new skills are usable without restarting, and reports how many were added or removed.",
  },
  "/remote-control": {
    category: "remote",
    summary: "Control this session from claude.ai or your phone.",
    details: "Makes the current session available through Remote Control, so you can keep going from another device. Needs a claude.ai subscription. Also available as /rc.",
  },
  "/remote-env": {
    category: "remote",
    summary: "Choose the default cloud environment.",
    details: "Sets which cloud environment new cloud sessions use when you start them from the CLI.",
  },
  "/rename": {
    category: "sessions",
    summary: "Rename the current session.",
    details: "The name shows on the prompt bar and in /resume. Run it with no name and Claude suggests one from the conversation.",
  },
  "/resume": {
    category: "sessions",
    summary: "Go back to an earlier conversation.",
    details:
      "Pass a session name or ID, or run it bare to pick from a list. The full history comes back, so you do not need to re-explain the task. Also available as /continue. From the shell, use claude -c or claude -r.",
  },
  "/review": {
    category: "review",
    summary: "Another name for /code-review.",
    details: "Takes the same effort levels and flags as /code-review, for example /review 1234 to review pull request 1234.",
  },
  "/rewind": {
    category: "sessions",
    summary: "Roll back code and conversation to an earlier point.",
    details:
      "Pick a checkpoint to restore the code, the conversation or both, or to summarize from that point on. Pressing Esc twice on an empty prompt opens the same menu. Also available as /checkpoint and /undo.",
  },
  "/run": {
    category: "review",
    summary: "Launch your app and see a change working.",
    details: "A bundled skill that has Claude start and drive your app, so a change is checked in the real app and not only by tests.",
  },
  "/run-skill-generator": {
    category: "review",
    summary: "Teach /run and /verify how to start your app.",
    details: "Writes a project skill with the steps to build, launch and drive your app from a clean environment, so /run and /verify work reliably.",
  },
  "/sandbox": {
    category: "settings",
    summary: "Turn sandbox mode on or off.",
    details: "Sandboxing limits what commands Claude runs can reach on your machine. Only available on supported platforms.",
  },
  "/schedule": {
    category: "planning",
    summary: "Create and manage routines that run in the cloud.",
    details:
      "Claude walks you through setting up a routine, such as a nightly dependency check, and can report on recent runs. Routines keep running when your laptop is closed. Also available as /routines.",
  },
  "/scroll-speed": {
    category: "settings",
    summary: "Adjust mouse wheel scroll speed.",
    details: "Preview the change live while the dialog is open. Only in fullscreen rendering, and not in the JetBrains terminal.",
  },
  "/security-review": {
    category: "review",
    summary: "Check your branch for security issues.",
    details:
      "Reviews the diff between your branch and the default branch for risks such as injection, broken auth and data leaks. Needs an origin remote.",
  },
  "/setup-bedrock": {
    category: "remote",
    summary: "Set up Amazon Bedrock with a guided wizard.",
    details: "Configures authentication, region and model choices. Hidden until CLAUDE_CODE_USE_BEDROCK=1 is set; type it in full.",
  },
  "/setup-vertex": {
    category: "remote",
    summary: "Set up Google Cloud with a guided wizard.",
    details: "Configures authentication, project, region and model choices. Hidden until CLAUDE_CODE_USE_VERTEX=1 is set; type it in full.",
  },
  "/simplify": {
    category: "review",
    summary: "Clean up changed code and apply the fixes.",
    details:
      "Four review agents look for reuse of existing helpers, simpler code, efficiency and the right level of abstraction. It does not hunt for bugs; use /code-review for that. Pass a path or PR to target something specific.",
  },
  "/skill-doctor": {
    category: "project",
    summary: "See what each skill costs in context and how often it is used.",
    details: "Helps you find skills that take up context but rarely get used, so you can turn them off.",
  },
  "/skills": {
    category: "project",
    summary: "List and filter your available skills.",
    details:
      "Type to filter by name or source, press t to sort by token cost, and press Space or Enter to change whether a skill is visible to Claude and the / menu.",
  },
  "/stats": {
    category: "account",
    summary: "Another name for /usage, opened on the Stats tab.",
    details: "Shows your activity statistics in the usage view.",
  },
  "/status": {
    category: "account",
    summary: "Show version, model, account and connection status.",
    details: "A quick health check of your current setup. It works even while Claude is responding.",
  },
  "/statusline": {
    category: "settings",
    summary: "Set up the status line at the bottom of the screen.",
    details: "Describe what you want to see, such as the git branch and model, or run it bare to copy your shell prompt style.",
  },
  "/stickers": {
    category: "extras",
    summary: "Order Claude Code stickers.",
    details: "Opens the sticker order form.",
  },
  "/stop": {
    category: "sessions",
    summary: "Stop the background session you are attached to.",
    details: "The transcript and any worktree are kept. To leave the session running and just detach, use /exit.",
  },
  "/subtask": {
    category: "planning",
    summary: "Hand a side task to a subagent that reports back here.",
    details:
      "The subagent gets the full conversation, works in the background, and its result lands back in this conversation. Use /fork if you want a fully separate session instead.",
  },
  "/tasks": {
    category: "planning",
    summary: "See and manage background work in this session.",
    details:
      "Lists running and finished background shells and subagents. This is different from Claude's to-do checklist, which you toggle with Ctrl+T. Also available as /bashes.",
  },
  "/team-onboarding": {
    category: "project",
    summary: "Write an onboarding guide for teammates from your usage.",
    details:
      "Claude looks at your last 30 days of sessions, commands and MCP servers and writes a guide a new teammate can paste in to get set up fast.",
  },
  "/teleport": {
    category: "remote",
    summary: "Pull a cloud session into this terminal.",
    details: "Pick a cloud session and Claude Code fetches its branch and conversation so you can continue locally. Needs a claude.ai subscription. Also available as /tp.",
  },
  "/terminal-setup": {
    category: "settings",
    summary: "Set up Shift+Enter for new lines in your terminal.",
    details:
      "Adds the keybinding in editors and terminals such as VS Code, Cursor, Alacritty and Zed. In Apple Terminal and iTerm2 it adjusts the settings Claude Code needs instead.",
  },
  "/theme": {
    category: "settings",
    summary: "Change the color theme.",
    details: "Includes light, dark, auto (follows your terminal), colorblind-friendly and custom themes.",
  },
  "/tui": {
    category: "settings",
    summary: "Switch the terminal renderer.",
    details: "Pass fullscreen for the flicker-free renderer or default to go back. Your conversation stays intact when it relaunches.",
  },
  "/ultraplan": {
    category: "planning",
    summary: "Removed. Use plan mode instead.",
    details: "This command used to send planning work to a cloud session. Use /plan or Shift+Tab to enter plan mode.",
  },
  "/ultrareview": {
    category: "review",
    summary: "Run a deep multi-agent code review in the cloud.",
    details:
      "The preferred way to run it is /code-review ultra; /ultrareview is an alias. Pass a PR or branch to review. Pro and Max include a few free runs, then it uses usage credits.",
  },
  "/update-config": {
    category: "settings",
    summary: "Describe a settings change and let Claude make it.",
    details:
      "For example, allow a command, set an environment variable or add a hook. Claude edits the right settings.json file. For simple options like theme or model, /config is quicker.",
  },
  "/upgrade": {
    category: "account",
    summary: "Upgrade to a higher plan.",
    details: "Opens the plan upgrade page in your browser.",
  },
  "/usage": {
    category: "account",
    summary: "Show session cost, plan limits and activity.",
    details:
      "On paid plans it breaks down what counts toward your limits. Check it on long sessions to avoid surprises. Also available as /cost and /stats.",
  },
  "/usage-credits": {
    category: "account",
    summary: "Add usage credits, or ask your admin for them.",
    details:
      "Opens billing settings in your browser. Team and Enterprise members without billing access send a request to their admin instead. Previously called /extra-usage.",
  },
  "/verify": {
    category: "review",
    summary: "Confirm a change works by running your app.",
    details: "A bundled skill that builds and runs your app and checks the result, instead of relying only on tests or type checks.",
  },
  "/vim": {
    category: "settings",
    summary: "Removed. Turn on Vim mode in /config instead.",
    details: "This command was removed in v2.1.92. Open /config and change Editor mode to switch between Vim and normal editing.",
  },
  "/voice": {
    category: "extras",
    summary: "Turn voice dictation on or off.",
    details: "Pass hold or tap to choose how recording works, or off to disable it. Needs a Claude.ai account.",
  },
  "/web-setup": {
    category: "remote",
    summary: "Connect GitHub for cloud sessions.",
    details: "Uses your local gh CLI credentials to link your GitHub account, so cloud sessions can work on your repositories.",
  },
  "/workflow-authoring": {
    category: "planning",
    summary: "Load the reference for writing workflow scripts.",
    details: "Claude usually loads this on its own before writing a workflow. Run it yourself before editing a saved workflow script by hand.",
  },
  "/workflows": {
    category: "planning",
    summary: "Watch, pause, resume or save workflows.",
    details: "Opens the progress view for running and finished multi-agent workflows.",
  },
};

// Key CLI flags explained in plain words. Names must match the docs exactly.
export const keyFlags: { flag: string; summary: string; example: string }[] = [
  { flag: "--print, -p", summary: "Run one prompt without the interactive screen and print the answer. The basis for scripts and CI.", example: 'claude -p "summarize the last 10 commits"' },
  { flag: "--continue, -c", summary: "Continue the most recent conversation in this folder.", example: "claude -c" },
  { flag: "--resume, -r", summary: "Resume a session by name or ID, or pick from a list.", example: 'claude -r "auth-refactor"' },
  { flag: "--model", summary: "Choose the model for this session, such as sonnet, opus or a full model name.", example: "claude --model opus" },
  { flag: "--effort", summary: "Set the reasoning effort for this session.", example: "claude --effort high" },
  { flag: "--permission-mode", summary: "Start in a permission mode such as plan, acceptEdits or auto.", example: "claude --permission-mode plan" },
  { flag: "--worktree, -w", summary: "Start in an isolated git worktree so parallel work does not collide.", example: "claude -w feature-auth" },
  { flag: "--add-dir", summary: "Give Claude access to extra folders from the start.", example: "claude --add-dir ../shared-lib" },
  { flag: "--allowed-tools", summary: "Pre-approve specific tools or commands so Claude does not ask.", example: 'claude --allowed-tools "Bash(npm test *)"' },
  { flag: "--output-format", summary: "Get text, json or stream-json output in print mode for scripts.", example: 'claude -p "list TODOs" --output-format json' },
  { flag: "--max-turns", summary: "Cap how many agent turns a print-mode run can take.", example: 'claude -p --max-turns 3 "fix the lint errors"' },
  { flag: "--mcp-config", summary: "Load MCP servers from a JSON file for this run.", example: "claude --mcp-config ./mcp.json" },
  { flag: "--append-system-prompt", summary: "Add your own instructions on top of the default system prompt.", example: 'claude --append-system-prompt "Always use TypeScript"' },
  { flag: "--bg, --background", summary: "Start a session in the background and get your terminal back.", example: 'claude --bg "update the changelog"' },
  { flag: "--safe-mode", summary: "Start with all customizations off to troubleshoot a broken setup.", example: "claude --safe-mode" },
  { flag: "--dangerously-skip-permissions", summary: "Skip all permission prompts. Only use in a sandbox or throwaway container.", example: "claude --dangerously-skip-permissions" },
];

// Commands people often expect but that are not in the official command list.
// Each entry was checked against the docs on the date shown on the page.
export const notCommands: { name: string; instead: string }[] = [
  { name: "/redo", instead: "There is no redo. /rewind (also /undo) restores an earlier checkpoint; pick a later one to move forward again if it is still listed." },
  { name: "/history", instead: "Press Ctrl+R to search your prompt history, or Up and Down to step through it. Use /resume for past conversations." },
  { name: "/search", instead: "Press Ctrl+R to search prompt history. In fullscreen mode, open the transcript with Ctrl+O to search the conversation." },
  { name: "/todos", instead: "Press Ctrl+T to show or hide Claude's to-do checklist. /tasks shows background shells and subagents." },
];

// Plain-word descriptions for the terminal commands, keyed by the exact usage
// string in the CLI reference.
export const cliGuide: Record<string, string> = {
  claude: "Start an interactive session in the current folder.",
  'claude "query"': "Start an interactive session with a first prompt already sent.",
  'claude -p "query"': "Run one prompt, print the answer and exit. Use it in scripts and CI.",
  'cat file | claude -p "query"': "Pipe a file or command output in and ask about it.",
  "claude -c": "Continue the most recent conversation in this folder.",
  'claude -c -p "query"': "Continue the last conversation non-interactively with a new prompt.",
  'claude -r "<session>" "query"': "Resume a named or specific session and send it a prompt.",
  "claude update": "Update Claude Code to the latest version.",
  "claude gateway": "Run the self-hosted gateway that admins put in front of Bedrock, Google Cloud or Foundry.",
  "claude install [version]": "Install or reinstall the native binary, optionally a specific version such as stable.",
  "claude auth login": "Sign in. Add --console to bill API usage to an Anthropic Console account.",
  "claude auth logout": "Sign out of your Anthropic account.",
  "claude auth status": "Print whether you are signed in, as JSON or with --text.",
  "claude agents": "Open agent view to watch and manage background sessions.",
  "claude attach <id>": "Attach this terminal to a running background session.",
  "claude auto-mode defaults": "Print the built-in auto mode rules as JSON.",
  "claude auto-mode reset": "Restore the default auto mode configuration.",
  "claude daemon status": "Show the state of the background-session supervisor.",
  "claude daemon stop --any": "Stop the background-session supervisor, for example when it stops responding.",
  "claude doctor": "Print read-only install and settings diagnostics without starting a session.",
  "claude import [source]": "Import settings from Codex, Gemini CLI or Cursor.",
  "claude logs <id>": "Print recent output from a background session.",
  "claude mcp": "Add, list and remove MCP servers, for example claude mcp add.",
  "claude mcp login <name>": "Run an MCP server's sign-in flow from the shell.",
  "claude mcp logout <name>": "Remove the saved sign-in for an MCP server.",
  "claude plugin": "Install and manage plugins from the shell.",
  "claude project purge [path]": "Delete all local Claude Code data for a project, including transcripts and history.",
  "claude remote-control": "Run a Remote Control server so you can drive Claude Code from claude.ai or the app.",
  "claude respawn <id>": "Restart a background session with its conversation intact.",
  "claude rm <id>": "Remove a background session from the list.",
  "claude self-hosted-runner": "Host Claude Code cloud sessions on your own infrastructure.",
  "claude setup-token": "Create a long-lived sign-in token for CI and scripts.",
  "claude stop <id>": "Stop a background session.",
  "claude ultrareview [target]": "Run a deep cloud code review from the shell and print the findings.",
};
