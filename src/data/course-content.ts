// Interactive course content for the in-app player (/courses/[slug]/learn).
// Coursiv-style structure: modules -> bite-size lessons + knowledge-check quizzes.
// The first module of each course is free; everything after is locked behind
// the upgrade funnel.

import { COURSES, type Course } from "./courses";

export type LessonBlock =
  | { type: "heading"; text: string }
  | { type: "text"; text: string }
  | { type: "list"; items: string[] }
  | { type: "prompt"; title: string; text: string }
  | { type: "tip"; text: string };

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface PlayerLessonBase {
  id: string;
  title: string;
  minutes: number;
}

export type PlayerLesson =
  | (PlayerLessonBase & { type: "lesson"; blocks: LessonBlock[] })
  | (PlayerLessonBase & { type: "quiz"; questions: QuizQuestion[] });

export interface CourseModule {
  id: string;
  title: string;
  free: boolean;
  lessons: PlayerLesson[];
}

export interface CourseContent {
  slug: string;
  modules: CourseModule[];
}

const PM_CONTENT: CourseContent = {
  slug: "claude-for-product-managers",
  modules: [
    {
      id: "m1",
      title: "Start here: Claude as your PM copilot",
      free: true,
      lessons: [
        {
          id: "m1l1",
          type: "lesson",
          title: "What Claude actually does for PM work",
          minutes: 4,
          blocks: [
            {
              type: "text",
              text: "Most PMs use AI like a search engine: one vague question, one generic answer, close the tab. This course teaches the opposite motion: treating Claude like a sharp junior PM who drafts, and you direct.",
            },
            {
              type: "heading",
              text: "The three jobs Claude is great at",
            },
            {
              type: "list",
              items: [
                "Structuring mess: turning call notes, Slack threads and founder rants into briefs with named sections.",
                "First drafts: PRDs, user stories, launch notes: 70% quality in 2 minutes, which you edit to 95%.",
                "Critique: attacking your own spec for gaps, edge cases and untested assumptions before engineering does.",
              ],
            },
            {
              type: "prompt",
              title: "Try this now",
              text: "You are a senior product manager. Here are my raw notes about a feature idea: [paste notes]. Extract: the target user, their pain, the promise, what's in scope, what's explicitly out of scope, and 3 open questions I haven't answered.",
            },
            {
              type: "tip",
              text: "Always give Claude a role and an output format. \"You are a senior PM… extract into these 6 sections\" beats \"summarize this\" every time.",
            },
          ],
        },
        {
          id: "m1l2",
          type: "lesson",
          title: "The 5-part prompt that replaces a blank page",
          minutes: 5,
          blocks: [
            {
              type: "text",
              text: "Every strong PM prompt in this course follows the same skeleton. Learn it once and you can improvise the rest.",
            },
            { type: "heading", text: "Role → Context → Task → Format → Constraints" },
            {
              type: "list",
              items: [
                "Role: who Claude should act as (senior PM, skeptical engineer, first-time user).",
                "Context: paste the raw material: notes, feedback, the old spec. More context beats cleverer wording.",
                "Task: one verb: extract, draft, compare, critique, prioritize.",
                "Format: name the sections or table columns you want back.",
                "Constraints: length limits, tone, what to leave out.",
              ],
            },
            {
              type: "prompt",
              title: "The skeleton, filled in",
              text: "You are a senior PM at a B2B SaaS startup. Context: [paste customer interview notes]. Task: cluster the feedback into themes. Format: a table with columns Theme | Evidence (quotes) | Severity | Suggested action. Constraints: max 6 themes, do not invent feedback that isn't in my notes.",
            },
            {
              type: "tip",
              text: "The last constraint: \"do not invent\": is the single biggest quality lever when you paste real data.",
            },
          ],
        },
        {
          id: "m1l3",
          type: "lesson",
          title: "Day 1 workflow: messy idea → one-page brief",
          minutes: 6,
          blocks: [
            {
              type: "text",
              text: "Time to produce your first artifact. Take a real feature idea from your backlog: the messier the better: and run it through the brief workflow.",
            },
            { type: "heading", text: "The workflow" },
            {
              type: "list",
              items: [
                "Step 1: Dump: paste everything you have. Notes, Slack messages, half-sentences.",
                "Step 2: Extract: run the brief prompt below.",
                "Step 3: Interrogate: ask Claude \"what are the 3 weakest assumptions in this brief?\"",
                "Step 4: Tighten: fix the weak spots yourself. You own the judgment; Claude owns the typing.",
              ],
            },
            {
              type: "prompt",
              title: "One-page brief prompt",
              text: "You are a senior product manager. Turn my raw notes into a one-page product brief with sections: Problem, Target user, Promise (one sentence), Proposed solution, In scope, Out of scope, Risks, Open questions. Keep it under 400 words. Notes: [paste]",
            },
            {
              type: "tip",
              text: "Save your best output as a template. By Day 7 you'll have a personal PM prompt library: that's the real product of this course.",
            },
          ],
        },
        {
          id: "m1q1",
          type: "quiz",
          title: "Checkpoint: prompt fundamentals",
          minutes: 3,
          questions: [
            {
              question: "What's the biggest quality lever when asking Claude to analyze real customer feedback?",
              options: [
                "Asking it to be creative",
                "Telling it not to invent anything beyond the pasted data",
                "Keeping the prompt as short as possible",
                "Asking for bullet points",
              ],
              correctIndex: 1,
              explanation: "Grounding constraints (\"only use my notes, don't invent\") keep the output anchored to real evidence: the #1 fix for generic AI answers.",
            },
            {
              question: "In the 5-part prompt skeleton, which part is 'a table with columns Theme | Evidence | Severity'?",
              options: ["Role", "Context", "Format", "Constraints"],
              correctIndex: 2,
              explanation: "Naming the exact sections or columns you want back is the Format part: it's what makes output copy-paste ready.",
            },
            {
              question: "After Claude drafts your brief, what's the recommended next move?",
              options: [
                "Ship it to engineering as-is",
                "Ask Claude to make it longer",
                "Ask Claude to attack its weakest assumptions, then fix them yourself",
                "Start over with a different prompt",
              ],
              correctIndex: 2,
              explanation: "Draft → critique → human judgment is the core loop. Claude drafts and attacks; you decide.",
            },
          ],
        },
      ],
    },
    {
      id: "m2",
      title: "From stories to strategy",
      free: false,
      lessons: [
        {
          id: "m2l1",
          type: "lesson",
          title: "User stories & acceptance criteria that engineers respect",
          minutes: 6,
          blocks: [
            {
              type: "text",
              text: "Vague stories create rework. This lesson turns your Day 1 brief into testable behavior: stories with acceptance criteria an engineer can actually build against.",
            },
            {
              type: "prompt",
              title: "Story generator",
              text: "Using this product brief [paste], write user stories in the format: As a [user], I want [action] so that [outcome]. For each story add 3-5 acceptance criteria in Given/When/Then format, plus edge cases for empty states, errors and permissions.",
            },
            {
              type: "tip",
              text: "Ask Claude to play a skeptical engineer and estimate which criteria are ambiguous: it catches the fights before sprint planning does.",
            },
          ],
        },
        {
          id: "m2l2",
          type: "lesson",
          title: "Competitor research without 40 open tabs",
          minutes: 6,
          blocks: [
            {
              type: "text",
              text: "Paste competitor pricing pages, changelogs and reviews, then have Claude build the comparison you'd normally spend an afternoon on.",
            },
            {
              type: "prompt",
              title: "Competitor table",
              text: "Compare these competitors based on the material I paste. Columns: Positioning (their words) | Key features | Pricing model | Gap we can exploit. End with 3 positioning angles none of them own. Material: [paste]",
            },
          ],
        },
        {
          id: "m2l3",
          type: "lesson",
          title: "Feedback → prioritized decisions",
          minutes: 6,
          blocks: [
            {
              type: "text",
              text: "The Day 4 workflow: cluster raw feedback, score friction, and rank what to fix first: with evidence attached so stakeholders stop debating vibes.",
            },
            {
              type: "prompt",
              title: "Feedback synthesizer",
              text: "Cluster this feedback into themes with quotes as evidence. Score each theme by frequency and severity. Recommend a ranked fix-first list with one-line justification per item. Do not invent feedback. Data: [paste]",
            },
          ],
        },
        {
          id: "m2q1",
          type: "quiz",
          title: "Checkpoint: stories & synthesis",
          minutes: 3,
          questions: [
            {
              question: "What format makes acceptance criteria testable?",
              options: ["Free-form paragraphs", "Given/When/Then", "A numbered wishlist", "Emoji checklists"],
              correctIndex: 1,
              explanation: "Given/When/Then forces each criterion to name a starting state, an action, and an observable result.",
            },
            {
              question: "Why attach quotes as evidence when synthesizing feedback?",
              options: [
                "It makes the doc longer",
                "It stops stakeholder debates about whether the theme is real",
                "Claude requires it",
                "It improves SEO",
              ],
              correctIndex: 1,
              explanation: "Evidence-linked themes turn prioritization arguments into decisions: the quote is the receipt.",
            },
          ],
        },
      ],
    },
    {
      id: "m3",
      title: "Ship it: PRD, launch packet, operating system",
      free: false,
      lessons: [
        {
          id: "m3l1",
          type: "lesson",
          title: "Assemble the full PRD",
          minutes: 8,
          blocks: [
            {
              type: "text",
              text: "Everything from Days 1-4 becomes input. Claude assembles; you edit the judgment calls: goals, non-goals, edge cases, risks, open questions.",
            },
            {
              type: "prompt",
              title: "PRD assembler",
              text: "Assemble a PRD from these inputs: brief [paste], stories [paste], competitor table [paste], feedback synthesis [paste]. Sections: Goals, Non-goals, User stories, Edge cases, Risks, Metrics, Open questions. Flag any section where my inputs are too thin and say what's missing.",
            },
          ],
        },
        {
          id: "m3l2",
          type: "lesson",
          title: "The launch packet",
          minutes: 6,
          blocks: [
            {
              type: "text",
              text: "One input, five outputs: release notes, customer FAQ, support notes, internal announcement, and a launch checklist: each in the right voice for its audience.",
            },
            {
              type: "prompt",
              title: "Launch packet generator",
              text: "From this PRD [paste], generate: 1) customer-facing release notes (benefit-first, no jargon), 2) a support FAQ with the 8 most likely questions, 3) an internal launch announcement, 4) a day-of launch checklist. Keep each under 250 words.",
            },
          ],
        },
        {
          id: "m3l3",
          type: "lesson",
          title: "Your reusable PM operating system",
          minutes: 5,
          blocks: [
            {
              type: "text",
              text: "The final artifact: your personal prompt library. Collect the prompts you actually used, generalize them, and store them where your next feature starts.",
            },
            {
              type: "list",
              items: [
                "Generalize: replace project specifics with [placeholders].",
                "Name each prompt by the artifact it produces, not by cleverness.",
                "Store them in a doc/Notion: or a CLAUDE.md if you use Claude Projects.",
              ],
            },
            {
              type: "tip",
              text: "Next feature, you start at Step 2. That compounding speed is the whole point.",
            },
          ],
        },
        {
          id: "m3q1",
          type: "quiz",
          title: "Final checkpoint",
          minutes: 4,
          questions: [
            {
              question: "What should Claude do when your PRD inputs are too thin in a section?",
              options: [
                "Fill the gap with plausible content",
                "Skip the section silently",
                "Flag the section and say what's missing",
                "Refuse to generate the PRD",
              ],
              correctIndex: 2,
              explanation: "You explicitly instruct Claude to flag thin inputs: surfacing gaps is more valuable than papering over them.",
            },
            {
              question: "Why generalize prompts with [placeholders] at the end of the course?",
              options: [
                "So they can be reused on every future feature",
                "Placeholders make prompts shorter",
                "Claude only accepts placeholder syntax",
                "To hide confidential data",
              ],
              correctIndex: 0,
              explanation: "A generalized prompt library means your next feature starts from a working system, not a blank page.",
            },
          ],
        },
      ],
    },
  ],
};

const CONTENT: Record<string, CourseContent> = {
  [PM_CONTENT.slug]: PM_CONTENT,
};

// Courses without hand-written interactive content get a structured preview
// generated from their day-by-day curriculum in courses.ts.
function generateFromCurriculum(course: Course): CourseContent {
  const days = course.lessons;
  const chunkSize = Math.ceil(days.length / 3);
  const chunks = [days.slice(0, chunkSize), days.slice(chunkSize, chunkSize * 2), days.slice(chunkSize * 2)].filter(
    (c) => c.length > 0
  );

  const modules: CourseModule[] = chunks.map((chunk, i) => ({
    id: `m${i + 1}`,
    title:
      i === 0
        ? `Start here: ${course.title.replace("Claude for ", "")} foundations`
        : i === 1
          ? "Build the core workflow"
          : "Ship the final system",
    free: i === 0,
    lessons: [
      ...chunk.map((day): PlayerLesson => ({
        id: `d${day.day}`,
        type: "lesson",
        title: day.title,
        minutes: course.dailyMinutes,
        blocks: [
          { type: "text", text: day.outcome },
          { type: "heading", text: "What you'll produce" },
          { type: "list", items: [`Artifact: ${day.artifact}`, `Time: ~${course.dailyMinutes} minutes`] },
          {
            type: "prompt",
            title: "Starter prompt",
            text: `You are helping me with: ${day.title.toLowerCase()}. My goal: ${day.outcome} Produce: ${day.artifact}. Ask me for any missing context before you start.`,
          },
          {
            type: "tip",
            text: "This course is in preview: full interactive lessons are being written. The prompts above are functional starting points.",
          },
        ],
      })),
      {
        id: `m${i + 1}q`,
        type: "quiz",
        title: "Checkpoint quiz",
        minutes: 3,
        questions: [
          {
            question: `What is the main outcome of this module of ${course.title}?`,
            options: [
              chunk[0]?.outcome ?? "Learn the basics",
              "Memorizing AI terminology",
              "Writing longer prompts",
              "Replacing your own judgment with Claude's",
            ],
            correctIndex: 0,
            explanation: "Each module is built around shipping a concrete artifact, not theory.",
          },
          {
            question: "What should you always give Claude before asking for a draft?",
            options: [
              "A tip",
              "Role, context, task, format and constraints",
              "As little context as possible",
              "A single keyword",
            ],
            correctIndex: 1,
            explanation: "The 5-part skeleton (Role → Context → Task → Format → Constraints) is the backbone of every workflow in these courses.",
          },
        ],
      },
    ],
  }));

  return { slug: course.slug, modules };
}

export function getCourseContent(slug: string): CourseContent | undefined {
  if (CONTENT[slug]) return CONTENT[slug];
  const course = COURSES.find((c) => c.slug === slug);
  return course ? generateFromCurriculum(course) : undefined;
}

export function flattenLessons(content: CourseContent): { lesson: PlayerLesson; moduleId: string; free: boolean }[] {
  return content.modules.flatMap((m) => m.lessons.map((lesson) => ({ lesson, moduleId: m.id, free: m.free })));
}
