import type { GeneratorConfig, BehaviorKey, Strictness, TeamSize, Stack } from "./config";

function stackLabel(stack: Stack): string {
  const labels: Record<Stack, string> = {
    nextjs: "Next.js (App Router)",
    react: "React",
    fastapi: "FastAPI",
    django: "Django",
    flask: "Flask",
    express: "Express.js",
    rails: "Ruby on Rails",
    go: "Go",
    rust: "Rust",
    general: "General",
  };
  return labels[stack];
}

function corePrinciples(strictness: Strictness): string {
  if (strictness === "relaxed") {
    return `## Core Principles

- Work autonomously — minimize interruptions and questions
- Use best judgement for implementation details
- Creating new files is fine when it makes sense
- Completing tasks end-to-end without checking in is preferred
- If something is ambiguous, make a reasonable choice and note it`;
  }
  if (strictness === "strict") {
    return `## Core Principles

- Ask before making any non-trivial change
- Never create new files without explicit approval
- Never run destructive commands (rm, drop, truncate) without confirmation
- Present a plan before implementing features
- Keep changes minimal and focused — do exactly what was asked, no more
- Do not refactor surrounding code unless explicitly requested`;
  }
  // balanced
  return `## Core Principles

- Ask before making major architectural decisions
- Prefer editing existing files over creating new ones
- Don't auto-commit — always check before running git commit
- Keep changes focused on the task at hand
- If a task requires touching many files, summarize the plan first
- Do not add unrequested features or refactors`;
}

function codeStyle(config: GeneratorConfig): string {
  const { stack, language, styling } = config;

  if (stack === "nextjs") {
    return `## Code Style — Next.js

- Use the App Router (\`app/\` directory) — no Pages Router patterns
- Prefer React Server Components; only add \`"use client"\` when truly needed (event handlers, hooks, browser APIs)
- Co-locate page-specific components in the route folder
- Use \`next/image\` for all images with explicit \`width\`/\`height\`
- Use \`next/link\` for all internal navigation
- Data fetching: fetch in Server Components, pass data as props; avoid client-side fetching unless interactive
${styling === "tailwind" ? "- Use Tailwind CSS utility classes; avoid inline styles and custom CSS where a utility exists" : ""}
- Keep \`page.tsx\` thin — extract logic into dedicated client/server components
- Name files in kebab-case, components in PascalCase`;
  }

  if (stack === "react") {
    return `## Code Style — React

- Functional components only — no class components
- Custom hooks for shared stateful logic (prefix with \`use\`)
${styling === "tailwind" ? "- Use Tailwind CSS utility classes" : ""}
- Keep components small and focused — one responsibility per component
- Lift state up only as far as necessary
- Avoid prop drilling beyond 2 levels — use context or state management`;
  }

  if (stack === "fastapi") {
    return `## Code Style — FastAPI

- Always add type hints to function signatures and return types
- Use Pydantic models for request/response schemas — no raw dicts in endpoints
- Prefer async/await for I/O operations
- Use dependency injection for shared resources (DB sessions, auth)
- Group related endpoints in routers (\`APIRouter\`)
- Keep route handlers thin — business logic in service modules`;
  }

  if (stack === "django") {
    return `## Code Style — Django

- Follow Django's MVT pattern — keep views thin, logic in models/services
- Use class-based views for CRUD; function-based views for one-off logic
- Always use Django ORM — no raw SQL unless absolutely necessary
- Use Django forms or DRF serializers for input validation
- Keep settings split by environment (base / local / production)`;
  }

  if (stack === "flask") {
    return `## Code Style — Flask

- Use application factory pattern (\`create_app()\`)
- Blueprint per feature/domain
- Always validate request data before processing
- Use Flask-SQLAlchemy or SQLAlchemy for DB access
- Environment config via \`python-dotenv\` or Flask config objects`;
  }

  if (stack === "express") {
    return `## Code Style — Express

- Structure: routes → controllers → services → models
- Always use async/await with proper error handling middleware
- Validate request bodies with Zod or Joi
- Never trust \`req.body\` — sanitize all user input
${language === "typescript" ? "- Use TypeScript strict mode — no implicit any" : ""}`;
  }

  if (stack === "rails") {
    return `## Code Style — Rails

- Follow Rails conventions — convention over configuration
- Fat models, thin controllers
- Use ActiveRecord scopes for reusable queries
- Service objects for complex business logic
- Prefer partials over helpers for view logic`;
  }

  if (stack === "go") {
    return `## Code Style — Go

- Follow the official Go style guide and \`gofmt\` formatting
- Explicit error handling — never ignore errors (\`_ = err\`)
- Interfaces should be small and defined by the consumer
- Use \`context.Context\` for cancellation and timeouts
- Prefer table-driven tests`;
  }

  if (stack === "rust") {
    return `## Code Style — Rust

- Prefer owned types over references when ownership is clear
- Use \`Result\` and \`Option\` — never \`unwrap()\` in production code
- Follow Clippy recommendations
- Use \`thiserror\` for library errors, \`anyhow\` for application errors
- Document public APIs with \`///\` doc comments`;
  }

  // general
  return `## Code Style

- Consistent naming: camelCase for variables/functions, PascalCase for types/classes
- Keep functions small and focused — single responsibility
- Avoid deeply nested conditionals — prefer early returns
- Self-documenting code over comments; add comments only where logic is non-obvious`;
}

function testingSection(config: GeneratorConfig): string {
  const { testing } = config;
  if (testing === "none") return "";

  const toolName =
    testing === "vitest"
      ? "Vitest"
      : testing === "jest"
      ? "Jest"
      : testing === "playwright"
      ? "Playwright"
      : testing === "pytest"
      ? "pytest"
      : testing === "rspec"
      ? "RSpec"
      : testing === "gotest"
      ? "go test"
      : "the existing test suite";

  if (testing === "existing") {
    return `\n## Testing

- Run the existing test suite before and after changes
- Don't delete or skip existing tests
- When fixing a bug, add a regression test if one doesn't exist`;
  }

  return `\n## Testing

- Use ${toolName} for all tests
- Write tests for new functions and components
- Keep tests close to the code they test
- Prefer unit tests for pure logic; integration tests for API endpoints
- Run \`${testing === "pytest" ? "pytest" : testing === "rspec" ? "bundle exec rspec" : testing === "gotest" ? "go test ./..." : `npx ${testing}`}\` before declaring a task complete`;
}

function gitPractices(config: GeneratorConfig): string {
  const { strictness, behaviors } = config;
  const nocommit = behaviors.includes("nocommit");
  const conventional = behaviors.includes("conventional");

  let lines = ["## Git Practices", ""];

  if (nocommit || strictness !== "relaxed") {
    lines.push("- Never run `git commit` without explicit instruction");
  }

  if (conventional) {
    lines.push(
      "- Use Conventional Commits format: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`"
    );
    lines.push("- Keep commit messages concise and in the imperative mood");
  }

  if (strictness === "strict") {
    lines.push("- Never force-push or rewrite published history");
    lines.push("- Always stage specific files — never `git add .` blindly");
    lines.push("- Show a diff summary before committing");
  }

  lines.push("- Never push to main/master directly — use feature branches");

  return lines.join("\n");
}

function communicationStyle(teamSize: TeamSize): string {
  if (teamSize === "solo") {
    return `## Communication Style

- Keep responses concise — skip preamble, get to the point
- Personal preferences and shortcuts are fine
- You can assume context from previous messages
- Skip boilerplate explanations unless something is genuinely unexpected`;
  }
  if (teamSize === "large") {
    return `## Communication Style

- Document non-obvious decisions with inline comments
- PR descriptions should explain the why, not just the what
- Avoid personal hacks or undocumented workarounds
- All public APIs and exports must have docstrings/JSDoc
- Changes to shared infrastructure need a summary of impact`;
  }
  // small
  return `## Communication Style

- Explain significant architectural choices briefly
- PR hygiene: clear title, short description, link to relevant issue
- Consistent style is more important than individual preference
- Flag breaking changes explicitly`;
}

function behaviorRules(behaviors: BehaviorKey[]): string {
  if (behaviors.length === 0) return "";

  const ruleMap: Record<BehaviorKey, string> = {
    nocommit: "- Never run `git commit` without being explicitly asked",
    nofiles:
      "- Always prefer editing an existing file over creating a new one",
    conventional:
      "- Use Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`",
    concise:
      "- Keep explanations short — one paragraph max unless more is asked for",
    nologs:
      "- Do not add `console.log`, `print`, or debug logging to the code",
    noany: "- Never use TypeScript `any` — always use proper types or `unknown`",
    checkfirst: "- Always read a file before attempting to edit it",
    testnew: "- Write tests for every new function, hook, or component added",
  };

  const lines = ["## Explicit Rules", ""];
  behaviors.forEach((b) => {
    if (ruleMap[b]) lines.push(ruleMap[b]);
  });

  return "\n" + lines.join("\n");
}

export function generateClaudeMd(config: GeneratorConfig): string {
  const stackName = stackLabel(config.stack);
  const stylingLine =
    config.styling !== "none"
      ? `- Styling: ${
          config.styling === "tailwind"
            ? "Tailwind CSS"
            : config.styling === "cssmodules"
            ? "CSS Modules"
            : "Styled Components"
        }\n`
      : "";
  const testingLine =
    config.testing !== "none"
      ? `- Testing: ${
          config.testing === "vitest"
            ? "Vitest"
            : config.testing === "jest"
            ? "Jest"
            : config.testing === "playwright"
            ? "Playwright"
            : config.testing === "pytest"
            ? "pytest"
            : config.testing === "rspec"
            ? "RSpec"
            : config.testing === "gotest"
            ? "go test"
            : config.testing === "existing"
            ? "Existing test suite"
            : "None"
        }\n`
      : "";

  const pmLabel =
    config.packageManager === "gomod" ? "go mod" : config.packageManager;

  const sections = [
    `# Project — Claude Instructions

<!-- Replace "Project" above with your project name -->
<!-- Add a 1–2 sentence project overview here -->`,

    `## Tech Stack

- Framework: ${stackName}
- Language: ${
      config.language.charAt(0).toUpperCase() + config.language.slice(1)
    }
${stylingLine}- Package Manager: ${pmLabel}
${testingLine}`,

    corePrinciples(config.strictness),

    codeStyle(config),

    testingSection(config),

    gitPractices(config),

    communicationStyle(config.teamSize),

    behaviorRules(config.behaviors),
  ];

  return sections.filter(Boolean).join("\n\n") + "\n";
}
