export type Stack =
  | "nextjs"
  | "react"
  | "fastapi"
  | "django"
  | "flask"
  | "express"
  | "rails"
  | "go"
  | "rust"
  | "general";

export type Language =
  | "typescript"
  | "javascript"
  | "python"
  | "ruby"
  | "go"
  | "rust";

export type Styling = "tailwind" | "cssmodules" | "styledcomponents" | "none";

export type PackageManager =
  | "npm"
  | "yarn"
  | "pnpm"
  | "bun"
  | "pip"
  | "poetry"
  | "uv"
  | "cargo"
  | "gomod";

export type Strictness = "relaxed" | "balanced" | "strict";

export type TeamSize = "solo" | "small" | "large";

export type Testing =
  | "vitest"
  | "jest"
  | "playwright"
  | "pytest"
  | "rspec"
  | "gotest"
  | "existing"
  | "none";

export type BehaviorKey =
  | "nocommit"
  | "nofiles"
  | "conventional"
  | "concise"
  | "nologs"
  | "noany"
  | "checkfirst"
  | "testnew";

export interface GeneratorConfig {
  stack: Stack;
  language: Language;
  styling: Styling;
  packageManager: PackageManager;
  strictness: Strictness;
  teamSize: TeamSize;
  testing: Testing;
  behaviors: BehaviorKey[];
}

export const DEFAULT_CONFIG: GeneratorConfig = {
  stack: "nextjs",
  language: "typescript",
  styling: "tailwind",
  packageManager: "pnpm",
  strictness: "balanced",
  teamSize: "small",
  testing: "vitest",
  behaviors: ["nocommit", "conventional"],
};

export interface StackOption {
  value: Stack;
  label: string;
  defaultLanguage: Language;
  defaultPM: PackageManager;
  defaultTesting: Testing;
  defaultStyling: Styling;
  isWeb: boolean;
}

export const STACK_OPTIONS: StackOption[] = [
  {
    value: "nextjs",
    label: "Next.js",
    defaultLanguage: "typescript",
    defaultPM: "pnpm",
    defaultTesting: "vitest",
    defaultStyling: "tailwind",
    isWeb: true,
  },
  {
    value: "react",
    label: "React",
    defaultLanguage: "typescript",
    defaultPM: "pnpm",
    defaultTesting: "vitest",
    defaultStyling: "tailwind",
    isWeb: true,
  },
  {
    value: "fastapi",
    label: "FastAPI",
    defaultLanguage: "python",
    defaultPM: "uv",
    defaultTesting: "pytest",
    defaultStyling: "none",
    isWeb: false,
  },
  {
    value: "django",
    label: "Django",
    defaultLanguage: "python",
    defaultPM: "uv",
    defaultTesting: "pytest",
    defaultStyling: "none",
    isWeb: false,
  },
  {
    value: "flask",
    label: "Flask",
    defaultLanguage: "python",
    defaultPM: "uv",
    defaultTesting: "pytest",
    defaultStyling: "none",
    isWeb: false,
  },
  {
    value: "express",
    label: "Express",
    defaultLanguage: "typescript",
    defaultPM: "pnpm",
    defaultTesting: "jest",
    defaultStyling: "none",
    isWeb: false,
  },
  {
    value: "rails",
    label: "Rails",
    defaultLanguage: "ruby",
    defaultPM: "yarn",
    defaultTesting: "rspec",
    defaultStyling: "none",
    isWeb: true,
  },
  {
    value: "go",
    label: "Go",
    defaultLanguage: "go",
    defaultPM: "gomod",
    defaultTesting: "gotest",
    defaultStyling: "none",
    isWeb: false,
  },
  {
    value: "rust",
    label: "Rust",
    defaultLanguage: "rust",
    defaultPM: "cargo",
    defaultTesting: "existing",
    defaultStyling: "none",
    isWeb: false,
  },
  {
    value: "general",
    label: "General",
    defaultLanguage: "typescript",
    defaultPM: "npm",
    defaultTesting: "none",
    defaultStyling: "none",
    isWeb: false,
  },
];

export interface PillOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

export const LANGUAGE_OPTIONS: PillOption<Language>[] = [
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "ruby", label: "Ruby" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
];

export const STYLING_OPTIONS: PillOption<Styling>[] = [
  { value: "tailwind", label: "Tailwind" },
  { value: "cssmodules", label: "CSS Modules" },
  { value: "styledcomponents", label: "Styled Components" },
  { value: "none", label: "None" },
];

export const PM_OPTIONS: PillOption<PackageManager>[] = [
  { value: "npm", label: "npm" },
  { value: "yarn", label: "yarn" },
  { value: "pnpm", label: "pnpm" },
  { value: "bun", label: "bun" },
  { value: "pip", label: "pip" },
  { value: "poetry", label: "poetry" },
  { value: "uv", label: "uv" },
  { value: "cargo", label: "cargo" },
  { value: "gomod", label: "go mod" },
];

export const STRICTNESS_OPTIONS: PillOption<Strictness>[] = [
  {
    value: "relaxed",
    label: "Relaxed",
    description: "Autonomous, minimal interruptions",
  },
  {
    value: "balanced",
    label: "Balanced",
    description: "Ask for major decisions",
  },
  {
    value: "strict",
    label: "Strict",
    description: "Explicit approval for everything",
  },
];

export const TEAM_SIZE_OPTIONS: PillOption<TeamSize>[] = [
  {
    value: "solo",
    label: "Solo",
    description: "Just you, move fast",
  },
  {
    value: "small",
    label: "Small Team",
    description: "2–10 people, PR hygiene",
  },
  {
    value: "large",
    label: "Large Team",
    description: "10+ people, docs required",
  },
];

export const TESTING_OPTIONS: PillOption<Testing>[] = [
  { value: "vitest", label: "Vitest" },
  { value: "jest", label: "Jest" },
  { value: "playwright", label: "Playwright" },
  { value: "pytest", label: "pytest" },
  { value: "rspec", label: "RSpec" },
  { value: "gotest", label: "go test" },
  { value: "existing", label: "Existing setup" },
  { value: "none", label: "No tests" },
];

export interface BehaviorOption {
  key: BehaviorKey;
  label: string;
  description: string;
}

export const BEHAVIOR_OPTIONS: BehaviorOption[] = [
  {
    key: "nocommit",
    label: "Never auto-commit",
    description: "Always ask before running git commit",
  },
  {
    key: "nofiles",
    label: "Prefer editing over creating",
    description: "Modify existing files rather than creating new ones",
  },
  {
    key: "conventional",
    label: "Conventional commits",
    description: "Use feat:, fix:, chore: prefixes in commit messages",
  },
  {
    key: "concise",
    label: "Concise responses",
    description: "Keep explanations short and focused",
  },
  {
    key: "nologs",
    label: "No debug logs",
    description: "Don't add console.log / print statements",
  },
  {
    key: "noany",
    label: "No TypeScript any",
    description: "Never use `any` type, always use proper types",
  },
  {
    key: "checkfirst",
    label: "Read before editing",
    description: "Always read a file before modifying it",
  },
  {
    key: "testnew",
    label: "Test new features",
    description: "Write tests for every new function or component",
  },
];
