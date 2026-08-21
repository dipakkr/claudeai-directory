export const COURSE_CHECKOUT_PLACEHOLDER = "REPLACE_ME";
const STORE = "https://claudeaidirectory.lemonsqueezy.com/buy";

export type CourseStatus = "ready-preview" | "launching" | "planned";

export interface CourseLesson {
  day: number;
  title: string;
  outcome: string;
  artifact: string;
}

export interface CoursePreviewAsset {
  label: string;
  description: string;
  href: string;
}

export interface Course {
  slug: string;
  title: string;
  eyebrow: string;
  audience: string;
  promise: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  durationDays: number;
  dailyMinutes: number;
  status: CourseStatus;
  level: "Beginner" | "Intermediate";
  category: "Product" | "Marketing" | "Excel" | "Freelance" | "Claude Code";
  checkoutUrl: string;
  previewHref?: string;
  previewAssets?: CoursePreviewAsset[];
  includes: string[];
  outcomes: string[];
  lessons: CourseLesson[];
}

export const COURSES: Course[] = [
  {
    slug: "claude-for-product-managers",
    title: "Claude for Product Managers",
    eyebrow: "First course",
    audience: "Product managers, founders and operators who write specs",
    promise: "Turn rough product ideas into PRDs, launch plans and stakeholder-ready docs in 7 days.",
    description:
      "A practical 7-day Claude course for PM work: product requirements, customer feedback, competitor research, prioritization, release notes and launch planning.",
    price: 19,
    compareAtPrice: 49,
    durationDays: 7,
    dailyMinutes: 15,
    status: "ready-preview",
    level: "Beginner",
    category: "Product",
    checkoutUrl: `${STORE}/${COURSE_CHECKOUT_PLACEHOLDER}-claude-for-product-managers`,
    previewHref: "/downloads/courses/claude-for-product-managers-preview.md",
    previewAssets: [
      {
        label: "Day 1 lesson preview",
        description: "Turn a messy feature idea into a one-page product brief.",
        href: "/downloads/courses/claude-for-product-managers-preview.md",
      },
      {
        label: "Day 2 worksheet preview",
        description: "Convert the brief into user stories and acceptance criteria.",
        href: "/downloads/courses/claude-for-product-managers-day-2-preview.md",
      },
      {
        label: "Starter prompt pack",
        description: "Three prompts for briefs, user stories and PM critique.",
        href: "/downloads/courses/claude-pm-starter-pack.md",
      },
    ],
    includes: [
      "7 short lessons built around one PM workflow per day",
      "PRD prompt pack and reusable feature-spec template",
      "Customer feedback analyzer prompt",
      "Competitor research and positioning worksheet",
      "Launch brief, release notes and stakeholder update templates",
    ],
    outcomes: [
      "Write a cleaner PRD from a messy idea or founder note.",
      "Convert feedback into prioritized product decisions.",
      "Create a launch packet that a designer, engineer or stakeholder can actually use.",
    ],
    lessons: [
      {
        day: 1,
        title: "Turn a messy idea into a crisp product brief",
        outcome: "Use Claude to extract the user, pain, promise, scope and non-goals.",
        artifact: "One-page product brief",
      },
      {
        day: 2,
        title: "Write user stories and acceptance criteria",
        outcome: "Move from vague feature request to testable product behavior.",
        artifact: "User-story set",
      },
      {
        day: 3,
        title: "Analyze competitors without drowning in tabs",
        outcome: "Compare messaging, feature gaps, pricing and positioning.",
        artifact: "Competitor comparison table",
      },
      {
        day: 4,
        title: "Turn customer feedback into priorities",
        outcome: "Cluster feedback, identify friction and rank what to fix first.",
        artifact: "Feedback synthesis memo",
      },
      {
        day: 5,
        title: "Draft the PRD",
        outcome: "Assemble goals, scope, edge cases, risks and open questions.",
        artifact: "Complete PRD draft",
      },
      {
        day: 6,
        title: "Prepare the launch packet",
        outcome: "Create release notes, FAQ, support notes and launch comms.",
        artifact: "Launch packet",
      },
      {
        day: 7,
        title: "Build your reusable PM operating system",
        outcome: "Save a repeatable Claude workflow for future features.",
        artifact: "Reusable PM prompt library",
      },
    ],
  },
  {
    slug: "claude-for-marketers",
    title: "Claude for Marketers",
    eyebrow: "Next course",
    audience: "Founders, marketers and creators who need campaigns faster",
    promise: "Build a 7-day campaign system: positioning, content, landing copy and emails.",
    description:
      "A role-based Claude course for turning one offer into campaign assets without generic AI copy.",
    price: 19,
    compareAtPrice: 49,
    durationDays: 7,
    dailyMinutes: 15,
    status: "launching",
    level: "Beginner",
    category: "Marketing",
    checkoutUrl: `${STORE}/${COURSE_CHECKOUT_PLACEHOLDER}-claude-for-marketers`,
    includes: [
      "Campaign planner",
      "Content repurposing prompt pack",
      "Landing page copy prompt",
      "Email sequence templates",
      "Social post generator",
    ],
    outcomes: [
      "Clarify ICP, pain and promise.",
      "Turn one idea into a week of content.",
      "Draft a small campaign without starting from a blank page.",
    ],
    lessons: [
      { day: 1, title: "Define the audience", outcome: "Turn a broad market into one painful use case.", artifact: "ICP brief" },
      { day: 2, title: "Shape the offer", outcome: "Clarify promise, proof and objection handling.", artifact: "Offer page outline" },
      { day: 3, title: "Create content pillars", outcome: "Build repeatable topics from audience pain.", artifact: "Content map" },
      { day: 4, title: "Repurpose one source", outcome: "Turn one input into posts, emails and scripts.", artifact: "Repurposing sheet" },
      { day: 5, title: "Write landing copy", outcome: "Draft hero, benefits, FAQ and CTA.", artifact: "Landing page draft" },
      { day: 6, title: "Build the email sequence", outcome: "Create a short nurture path.", artifact: "3-email sequence" },
      { day: 7, title: "Ship the campaign kit", outcome: "Package the campaign into a reusable workflow.", artifact: "Campaign kit" },
    ],
  },
  {
    slug: "claude-for-excel-sheets",
    title: "Claude for Excel & Google Sheets",
    eyebrow: "Beginner favorite",
    audience: "Analysts, operators, assistants and spreadsheet-heavy teams",
    promise: "Clean messy data, write formulas and create useful reports with Claude in 7 days.",
    description:
      "A practical course for using Claude as a spreadsheet assistant for formulas, cleanup, analysis, charts and recurring reports.",
    price: 9,
    compareAtPrice: 29,
    durationDays: 7,
    dailyMinutes: 10,
    status: "launching",
    level: "Beginner",
    category: "Excel",
    checkoutUrl: `${STORE}/${COURSE_CHECKOUT_PLACEHOLDER}-claude-for-excel-sheets`,
    includes: [
      "Sample messy spreadsheet",
      "Formula prompt pack",
      "Data-cleaning checklist",
      "Dashboard prompt",
      "Executive report template",
    ],
    outcomes: [
      "Ask Claude for the exact formulas you need.",
      "Clean and summarize spreadsheet data faster.",
      "Create a readable report from raw rows.",
    ],
    lessons: [
      { day: 1, title: "Clean a messy sheet", outcome: "Find duplicates, missing values and inconsistent columns.", artifact: "Cleaned data checklist" },
      { day: 2, title: "Generate formulas", outcome: "Describe formula needs in plain English.", artifact: "Formula library" },
      { day: 3, title: "Analyze sales data", outcome: "Ask better questions of spreadsheet data.", artifact: "Analysis prompt" },
      { day: 4, title: "Create summaries", outcome: "Turn rows into simple executive insights.", artifact: "Summary memo" },
      { day: 5, title: "Design a small dashboard", outcome: "Choose metrics, charts and sections.", artifact: "Dashboard plan" },
      { day: 6, title: "Automate recurring reports", outcome: "Build a repeatable monthly reporting workflow.", artifact: "Report workflow" },
      { day: 7, title: "Package the final report", outcome: "Create a shareable executive update.", artifact: "Finished report" },
    ],
  },
  {
    slug: "claude-for-freelancers",
    title: "Claude for Freelancers",
    eyebrow: "Client work",
    audience: "Freelancers, consultants and solo service providers",
    promise: "Use Claude to win, scope and deliver client work without drowning in admin.",
    description:
      "A 7-day course for proposals, discovery calls, client research, project plans and delivery docs.",
    price: 19,
    durationDays: 7,
    dailyMinutes: 15,
    status: "planned",
    level: "Beginner",
    category: "Freelance",
    checkoutUrl: `${STORE}/${COURSE_CHECKOUT_PLACEHOLDER}-claude-for-freelancers`,
    includes: ["Proposal template", "Discovery call question bank", "Client research prompt", "SOW checklist", "Delivery recap template"],
    outcomes: ["Write sharper proposals.", "Scope projects with fewer surprises.", "Deliver more polished client updates."],
    lessons: [
      { day: 1, title: "Package your offer", outcome: "Clarify your service promise.", artifact: "Offer one-pager" },
      { day: 2, title: "Research the client", outcome: "Prep for calls faster.", artifact: "Client brief" },
      { day: 3, title: "Run discovery", outcome: "Ask better questions.", artifact: "Call guide" },
      { day: 4, title: "Write the proposal", outcome: "Turn notes into a sellable proposal.", artifact: "Proposal draft" },
      { day: 5, title: "Scope the project", outcome: "Define timeline, deliverables and boundaries.", artifact: "SOW checklist" },
      { day: 6, title: "Manage delivery", outcome: "Write updates and handle blockers.", artifact: "Update template" },
      { day: 7, title: "Close the loop", outcome: "Package outcomes and next steps.", artifact: "Recap email" },
    ],
  },
  {
    slug: "claude-code-for-non-developers",
    title: "Claude Code for Non-Developers",
    eyebrow: "Advanced starter",
    audience: "Operators and founders who want safe Claude Code workflows",
    promise: "Understand Claude Code, set guardrails and ship one simple automation in 10 days.",
    description:
      "A non-technical introduction to Claude Code focused on setup, safety, prompts, files, and small useful automations.",
    price: 29,
    durationDays: 10,
    dailyMinutes: 20,
    status: "planned",
    level: "Intermediate",
    category: "Claude Code",
    checkoutUrl: `${STORE}/${COURSE_CHECKOUT_PLACEHOLDER}-claude-code-for-non-developers`,
    includes: ["Safe setup checklist", "CLAUDE.md starter file", "Permissions guide", "First automation tutorial", "Troubleshooting map"],
    outcomes: ["Use Claude Code without reckless permissions.", "Create a small automation safely.", "Know when to stop and ask for review."],
    lessons: [
      { day: 1, title: "What Claude Code is for", outcome: "Understand fit and limits.", artifact: "Use-case map" },
      { day: 2, title: "Install and configure safely", outcome: "Set up without broad permissions.", artifact: "Setup checklist" },
      { day: 3, title: "Write CLAUDE.md", outcome: "Give Claude useful project context.", artifact: "CLAUDE.md draft" },
      { day: 4, title: "Read before editing", outcome: "Explore code or files safely.", artifact: "Inspection prompt" },
      { day: 5, title: "Make a tiny change", outcome: "Practice scoped edits.", artifact: "Change log" },
      { day: 6, title: "Verify work", outcome: "Run checks and inspect diffs.", artifact: "Verification checklist" },
      { day: 7, title: "Build a simple workflow", outcome: "Create one repeatable task.", artifact: "Workflow prompt" },
      { day: 8, title: "Use MCP carefully", outcome: "Understand connected tools.", artifact: "MCP checklist" },
      { day: 9, title: "Recover from mistakes", outcome: "Use git checkpoints.", artifact: "Recovery playbook" },
      { day: 10, title: "Final automation", outcome: "Ship one useful local workflow.", artifact: "Automation spec" },
    ],
  },
];

export const COURSE_LIBRARY = {
  slug: "claude-work-courses",
  title: "Claude Work Courses",
  price: 49,
  description:
    "All role-based Claude micro-courses as they launch: product, marketing, spreadsheets, freelance work and Claude Code.",
  checkoutUrl: `${STORE}/${COURSE_CHECKOUT_PLACEHOLDER}-claude-work-courses`,
};

export function getCourse(slug: string): Course | undefined {
  return COURSES.find((course) => course.slug === slug);
}

export function getFeaturedCourses(): Course[] {
  return COURSES.slice(0, 3);
}

export function isCourseCheckoutLive(url: string): boolean {
  return !url.includes(COURSE_CHECKOUT_PLACEHOLDER);
}

export function getCourseStatusLabel(status: CourseStatus): string {
  if (status === "ready-preview") return "Preview ready";
  if (status === "launching") return "Launching next";
  return "Planned";
}
