// Interactive course content for the in-app player (/courses/[slug]/learn).
// Coursiv-style structure: modules -> bite-size lessons + knowledge-check quizzes.
// Paid role courses expose the first module as a preview; Claude Mastery is
// intentionally free and fully open.

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

const CLAUDE_MASTERY_CONTENT: CourseContent = {
  slug: "claude-mastery",
  modules: [
    {
      id: "m1",
      title: "Understanding Claude",
      free: true,
      lessons: [
        {
          id: "m1l1",
          type: "lesson",
          title: "Claude is not a search engine",
          minutes: 6,
          blocks: [
            {
              type: "text",
              text: "A search engine retrieves pages. Claude reasons from context and generates a response. That distinction matters because Claude can be useful without being independently correct.",
            },
            {
              type: "heading",
              text: "The working model",
            },
            {
              type: "list",
              items: [
                "Context: what Claude can see in the conversation or attached material.",
                "Reasoning: how Claude transforms that context into a plan, answer or draft.",
                "Tools: optional access to files, browsers, APIs, databases or terminal commands.",
                "Output: the answer, plan, code, table, checklist or artifact you asked for.",
              ],
            },
            {
              type: "prompt",
              title: "Use this when the task may need facts",
              text: "Before answering, separate what you know from the provided context, what you are inferring, and what must be verified with an external source. Do not present guesses as facts.",
            },
            {
              type: "tip",
              text: "The better question is not 'Can Claude answer this?' It is 'What context and verification would make this answer trustworthy?'",
            },
          ],
        },
        {
          id: "m1l2",
          type: "lesson",
          title: "Claude as a capable employee",
          minutes: 7,
          blocks: [
            {
              type: "text",
              text: "Treat Claude like a capable employee who is new to your environment. It can do a lot, but it needs onboarding, access, constraints and QA.",
            },
            {
              type: "list",
              items: [
                "You are the manager.",
                "Claude is the capable employee.",
                "Context is onboarding.",
                "Tools are access to the workplace.",
                "Instructions are the operating procedure.",
                "Verification is quality assurance.",
              ],
            },
            {
              type: "prompt",
              title: "Delegation prompt",
              text: "You are a capable operator who is new to my environment.\n\nGoal:\n[describe the outcome]\n\nContext:\n[paste relevant background]\n\nConstraints:\n[budget, time, audience, tone, tools, exclusions]\n\nBefore producing the final answer:\n1. Identify missing context.\n2. State your assumptions.\n3. Explain what should be verified by a human.",
            },
            {
              type: "tip",
              text: "If you would not give a new employee a one-line instruction for the task, do not give Claude a one-line prompt for it either.",
            },
          ],
        },
        {
          id: "m1l3",
          type: "lesson",
          title: "What Claude is actually good at",
          minutes: 8,
          blocks: [
            {
              type: "text",
              text: "Claude is strongest when the task has clear context, a clear transformation and a way to verify the output.",
            },
            {
              type: "heading",
              text: "Strong fits",
            },
            {
              type: "list",
              items: [
                "Summarization, synthesis and transformation.",
                "Drafting from a clear brief.",
                "Classifying, extracting and structuring information.",
                "Reasoning through tradeoffs.",
                "Coding when it can inspect the project and run checks.",
              ],
            },
            {
              type: "heading",
              text: "Needs caution",
            },
            {
              type: "list",
              items: [
                "Current facts it has not verified.",
                "Ambiguous requirements.",
                "Numerical accuracy.",
                "Consequential decisions.",
                "Large tasks without checkpoints.",
              ],
            },
            {
              type: "prompt",
              title: "Task judgment lab",
              text: "For each task below, decide whether Claude should answer directly, ask for more context, use a tool, or produce a draft that a human verifies. Explain the reason for each decision.\n\nTasks:\n[paste your list]",
            },
          ],
        },
        {
          id: "m1q1",
          type: "quiz",
          title: "Checkpoint: Claude judgment",
          minutes: 4,
          questions: [
            {
              question: "What is the safest way to frame Claude for serious work?",
              options: [
                "A search engine that always retrieves facts",
                "A capable employee who needs context, tools and QA",
                "A calculator for all numerical tasks",
                "A replacement for human judgment",
              ],
              correctIndex: 1,
              explanation: "The employee model keeps the right balance: Claude can do meaningful work, but it needs onboarding, constraints and verification.",
            },
            {
              question: "Which task most clearly requires verification?",
              options: [
                "Rewrite this paragraph in a calmer tone",
                "Extract action items from my meeting notes",
                "Tell me the latest legal requirements for my industry",
                "Turn this outline into an email draft",
              ],
              correctIndex: 2,
              explanation: "Current legal requirements are time-sensitive and high-stakes. Claude should use authoritative sources or tell you verification is required.",
            },
          ],
        },
      ],
    },
    {
      id: "m2",
      title: "Context Engineering",
      free: true,
      lessons: [
        {
          id: "m2l1",
          type: "lesson",
          title: "Context is the real prompt",
          minutes: 7,
          blocks: [
            {
              type: "text",
              text: "Most people obsess over wording. Advanced Claude users design context. The prompt is not only the instruction; it is the instruction plus context, constraints, examples and desired outcome.",
            },
            {
              type: "prompt",
              title: "Context-first structure",
              text: "<context>\nPaste the relevant background here.\n</context>\n\n<objective>\nState the outcome you want.\n</objective>\n\n<constraints>\nList limits, audience, tone, exclusions and verification needs.\n</constraints>\n\n<output>\nName the exact structure you want back.\n</output>",
            },
            {
              type: "tip",
              text: "A better prompt is often not longer. It is more selective about what Claude actually needs.",
            },
          ],
        },
        {
          id: "m2l2",
          type: "lesson",
          title: "The context hierarchy",
          minutes: 8,
          blocks: [
            {
              type: "text",
              text: "Separate durable context from task-specific input. This stops you from explaining everything every time and prevents irrelevant context from polluting the answer.",
            },
            {
              type: "list",
              items: [
                "Permanent context: your preferences, writing style and recurring standards.",
                "Project context: the product, repository, audience, architecture or customer.",
                "Task context: the exact job you want done now.",
                "Current input: the document, log, issue, notes or data Claude must transform.",
              ],
            },
            {
              type: "prompt",
              title: "Context package prompt",
              text: "Turn the notes below into a context package with four sections: Permanent context, Project context, Task context and Current input. Remove anything irrelevant to the task. Flag conflicts or missing information.\n\nNotes:\n[paste]",
            },
          ],
        },
        {
          id: "m2l3",
          type: "lesson",
          title: "Choose context, do not dump it",
          minutes: 8,
          blocks: [
            {
              type: "text",
              text: "More context is not automatically better. Claude can be distracted by irrelevant material, stale assumptions and conflicting notes.",
            },
            {
              type: "list",
              items: [
                "What does Claude need to complete the task?",
                "What should Claude ignore?",
                "Which source is authoritative if two inputs conflict?",
                "What should Claude inspect instead of relying on my summary?",
                "What needs verification after the draft is produced?",
              ],
            },
            {
              type: "prompt",
              title: "Messy context lab",
              text: "I am going to paste a messy context dump. Convert it into a clean task package using: Context, Objective, Constraints, Examples, Output and Verification. Remove irrelevant material and list any assumptions.\n\nDump:\n[paste]",
            },
          ],
        },
        {
          id: "m2q1",
          type: "quiz",
          title: "Checkpoint: context engineering",
          minutes: 4,
          questions: [
            {
              question: "Which context is usually reusable across many tasks?",
              options: ["Current error log", "Permanent writing style", "Today's CSV file", "One support ticket"],
              correctIndex: 1,
              explanation: "Permanent writing style can be reused. Logs, files and tickets are usually current input for one task.",
            },
            {
              question: "What is the main danger of dumping every note into Claude?",
              options: [
                "Claude refuses long prompts",
                "Claude may overweight irrelevant, stale or conflicting material",
                "The answer will always be shorter",
                "Claude cannot read structured sections",
              ],
              correctIndex: 1,
              explanation: "Context selection is a quality lever. Irrelevant material can make the answer worse.",
            },
          ],
        },
      ],
    },
    {
      id: "m3",
      title: "Prompting That Actually Works",
      free: true,
      lessons: [
        {
          id: "m3l1",
          type: "lesson",
          title: "Clear instructions beat clever prompts",
          minutes: 7,
          blocks: [
            {
              type: "text",
              text: "Good prompting is not template worship. It is clear task design: context, task, constraints, examples and output. Your goal is to make the work unambiguous.",
            },
            {
              type: "list",
              items: [
                "Define the task in one clear verb: analyze, draft, compare, extract, classify, critique.",
                "Explain the motivation when it affects judgment.",
                "Name constraints that would change the answer.",
                "Ask for the output shape you actually need.",
              ],
            },
            {
              type: "prompt",
              title: "Prompt upgrade pattern",
              text: "Improve this prompt using: Context, Task, Constraints, Examples and Output. Explain what changed and why.\n\nWeak prompt:\n[paste]",
            },
            {
              type: "tip",
              text: "If you cannot define the output contract, you probably have not defined the task.",
            },
          ],
        },
        {
          id: "m3l2",
          type: "lesson",
          title: "Use examples when behavior is hard to describe",
          minutes: 7,
          blocks: [
            {
              type: "text",
              text: "If you want Claude to match a voice, format, review style or decision pattern, examples often work better than abstract instructions.",
            },
            {
              type: "heading",
              text: "Bad vs better",
            },
            {
              type: "list",
              items: [
                "Weak: Write naturally.",
                "Better: Here are three examples of the style. Match the sentence length, directness and level of detail.",
                "Weak: Give useful feedback.",
                "Better: Here are two examples of feedback I consider useful and one example I consider too vague.",
              ],
            },
            {
              type: "prompt",
              title: "Few-shot style prompt",
              text: "Study these examples and infer the pattern. Then produce the requested output in the same style.\n\nGood examples:\n[example 1]\n[example 2]\n[example 3]\n\nAvoid this style:\n[bad example]\n\nTask:\n[paste]",
            },
          ],
        },
        {
          id: "m3l3",
          type: "lesson",
          title: "Output contracts make work usable",
          minutes: 8,
          blocks: [
            {
              type: "text",
              text: "Instead of asking Claude to 'analyze this,' tell it what usable result should look like. A strong output contract prevents rambling and makes verification easier.",
            },
            {
              type: "prompt",
              title: "Analysis output contract",
              text: "Return:\n1. One-paragraph summary\n2. Key findings with evidence\n3. Important uncertainties\n4. Risks or edge cases\n5. Recommended next steps\n\nUse only the provided material unless I explicitly ask you to research.",
            },
            {
              type: "tip",
              text: "Structured output is not only for neatness. It lets you see what Claude knows, what it inferred and what still needs checking.",
            },
          ],
        },
        {
          id: "m3q1",
          type: "quiz",
          title: "Checkpoint: prompt quality",
          minutes: 4,
          questions: [
            {
              question: "When are examples most useful?",
              options: [
                "When the desired behavior is hard to describe abstractly",
                "Only when asking for code",
                "When you want Claude to ignore context",
                "When the task has no constraints",
              ],
              correctIndex: 0,
              explanation: "Examples are powerful when tone, format, review criteria or judgment patterns are easier to show than describe.",
            },
            {
              question: "What is an output contract?",
              options: [
                "A legal agreement",
                "The exact structure Claude should return",
                "A longer version of the prompt",
                "A way to hide uncertainty",
              ],
              correctIndex: 1,
              explanation: "The output contract names the sections, fields or format that make the result usable.",
            },
          ],
        },
      ],
    },
    {
      id: "m4",
      title: "Working With Claude",
      free: true,
      lessons: [
        {
          id: "m4l1",
          type: "lesson",
          title: "Ask, collaborate, delegate, execute, verify",
          minutes: 9,
          blocks: [
            {
              type: "text",
              text: "Different tasks need different autonomy. Asking Claude to explain a concept is not the same as asking it to execute a tool-based workflow.",
            },
            {
              type: "list",
              items: [
                "Ask: explain or summarize.",
                "Collaborate: think with you.",
                "Delegate: produce a useful artifact.",
                "Execute: act through tools.",
                "Verify: check work against criteria.",
              ],
            },
            {
              type: "prompt",
              title: "Autonomy selector",
              text: "For this task, recommend the right mode: ask, collaborate, delegate, execute or verify. Explain the risk level, needed context, and human checkpoint.\n\nTask:\n[paste]",
            },
          ],
        },
        {
          id: "m4l2",
          type: "lesson",
          title: "Stop micromanaging every step",
          minutes: 7,
          blocks: [
            {
              type: "text",
              text: "Claude works better when you give the goal, constraints and success criteria instead of dictating every tiny action. Micromanagement often prevents Claude from investigating properly.",
            },
            {
              type: "list",
              items: [
                "Weak: Open file A, then file B, then search this exact line.",
                "Better: Investigate the authentication flow and identify the root cause.",
                "Weak: Write the first paragraph, then the second paragraph.",
                "Better: Draft a concise announcement for this audience, using these facts and this tone.",
              ],
            },
            {
              type: "prompt",
              title: "Goal-first delegation",
              text: "Investigate first. Do not speculate. Use the available evidence. Then explain the conclusion, the supporting evidence, and the smallest next action.\n\nGoal:\n[paste]",
            },
          ],
        },
        {
          id: "m4l3",
          type: "lesson",
          title: "Ask Claude to investigate before answering",
          minutes: 7,
          blocks: [
            {
              type: "text",
              text: "For complex tasks, the first answer is often worse than the first investigation. Ask Claude to inspect, compare or reason before it commits to a conclusion.",
            },
            {
              type: "prompt",
              title: "Investigation-first prompt",
              text: "Investigate this problem before proposing a fix.\n\nReturn:\n1. What you inspected\n2. Evidence found\n3. Likely root cause\n4. Alternative explanations\n5. Recommended fix\n6. Verification steps\n\nProblem:\n[paste]",
            },
          ],
        },
        {
          id: "m4q1",
          type: "quiz",
          title: "Checkpoint: autonomy",
          minutes: 4,
          questions: [
            {
              question: "Which mode gives Claude the most responsibility?",
              options: ["Ask", "Collaborate", "Execute", "Summarize"],
              correctIndex: 2,
              explanation: "Execute means Claude acts through tools or performs a workflow. That requires clearer constraints and verification.",
            },
            {
              question: "What should you provide when delegating work?",
              options: [
                "Only the first step",
                "Goal, context, constraints and success criteria",
                "No context so Claude can be creative",
                "A vague role only",
              ],
              correctIndex: 1,
              explanation: "Delegation works when Claude understands the desired outcome, boundaries and QA bar.",
            },
          ],
        },
      ],
    },
    {
      id: "m5",
      title: "Claude Code",
      free: true,
      lessons: [
        {
          id: "m5l1",
          type: "lesson",
          title: "What Claude Code actually adds",
          minutes: 7,
          blocks: [
            {
              type: "text",
              text: "Claude Code is not just chat with coding knowledge. It combines the model with filesystem access, terminal commands, Git context and project tools.",
            },
            {
              type: "list",
              items: [
                "Filesystem: Claude can inspect real project files.",
                "Terminal: Claude can run tests, scripts and searches.",
                "Git: Claude can inspect diffs and work in branches.",
                "Instructions: CLAUDE.md can preserve project-specific operating rules.",
              ],
            },
            {
              type: "tip",
              text: "The advantage is not that Claude can type code. The advantage is that it can investigate the existing system before changing it.",
            },
          ],
        },
        {
          id: "m5l2",
          type: "lesson",
          title: "Plan, implement, verify",
          minutes: 10,
          blocks: [
            {
              type: "text",
              text: "Claude Code works best when it reads the repository first, proposes a scoped plan, makes a narrow change and verifies the result.",
            },
            {
              type: "prompt",
              title: "Safe Claude Code workflow",
              text: "Inspect the repository first. Identify the relevant files and existing patterns. Propose a concise plan. Then implement the smallest appropriate change, run targeted checks, inspect the diff and summarize risks. Do not modify unrelated files.",
            },
          ],
        },
        {
          id: "m5l3",
          type: "lesson",
          title: "Write a useful CLAUDE.md",
          minutes: 9,
          blocks: [
            {
              type: "text",
              text: "CLAUDE.md is project onboarding. It should not be a giant essay. It should tell Claude how to work safely and effectively in this repo.",
            },
            {
              type: "list",
              items: [
                "Project purpose and architecture.",
                "Important commands for lint, test and build.",
                "Coding conventions and design rules.",
                "Files or commands Claude should avoid.",
                "Verification expectations before finishing.",
              ],
            },
            {
              type: "prompt",
              title: "CLAUDE.md generator",
              text: "Inspect this repository and draft a concise CLAUDE.md. Include project overview, architecture, commands, conventions, verification steps and restrictions. Keep it practical and remove anything speculative.",
            },
          ],
        },
        {
          id: "m5q1",
          type: "quiz",
          title: "Checkpoint: Claude Code safety",
          minutes: 4,
          questions: [
            {
              question: "What should Claude Code do before editing?",
              options: [
                "Immediately rewrite the suspected file",
                "Inspect the repo and identify existing patterns",
                "Skip tests to save time",
                "Run destructive Git commands",
              ],
              correctIndex: 1,
              explanation: "The safe workflow starts with understanding the existing system before changing it.",
            },
            {
              question: "What belongs in CLAUDE.md?",
              options: [
                "Project conventions and verification commands",
                "Private secrets",
                "Random blog notes",
                "Every file in the repository",
              ],
              correctIndex: 0,
              explanation: "CLAUDE.md should onboard Claude to the project and its safe operating rules, not expose secrets or duplicate the repo.",
            },
          ],
        },
      ],
    },
    {
      id: "m6",
      title: "Tools, MCP and Skills",
      free: true,
      lessons: [
        {
          id: "m6l1",
          type: "lesson",
          title: "When Claude needs tools",
          minutes: 9,
          blocks: [
            {
              type: "text",
              text: "Claude alone can reason over the conversation. Tools let Claude interact with files, browsers, APIs, databases and external systems.",
            },
            {
              type: "prompt",
              title: "Tool decision checklist",
              text: "For this task, decide whether Claude needs no tool, a saved prompt, a Skill, or MCP. Include permission risks and what success should look like.\n\nTask:\n[paste]",
            },
          ],
        },
        {
          id: "m6l2",
          type: "lesson",
          title: "MCP without the jargon",
          minutes: 8,
          blocks: [
            {
              type: "text",
              text: "MCP is a standardized way for AI apps to connect to external tools and data. Conceptually, it lets Claude interact with systems outside the conversation.",
            },
            {
              type: "list",
              items: [
                "MCP server: the connector that exposes capabilities.",
                "Tools: actions Claude can call.",
                "Resources: data Claude can inspect.",
                "Permissions: what Claude is allowed to access or change.",
                "Risk: every tool expands what a wrong instruction could affect.",
              ],
            },
            {
              type: "prompt",
              title: "MCP fit check",
              text: "Evaluate whether this workflow needs MCP. Identify the external system, required tools, required permissions, failure modes, and human approval checkpoints.\n\nWorkflow:\n[paste]",
            },
          ],
        },
        {
          id: "m6l3",
          type: "lesson",
          title: "Turn repeated instructions into a Skill",
          minutes: 8,
          blocks: [
            {
              type: "text",
              text: "If you repeatedly give Claude the same instructions, examples and criteria, package that behavior into a reusable Skill.",
            },
            {
              type: "prompt",
              title: "Skill design prompt",
              text: "Help me design a Claude Skill for this recurring task.\n\nReturn:\n1. Skill name\n2. When to use it\n3. Inputs required\n4. Step-by-step process\n5. Quality checks\n6. Output format\n7. Example invocation\n\nRecurring task:\n[paste]",
            },
          ],
        },
        {
          id: "m6q1",
          type: "quiz",
          title: "Checkpoint: ecosystem judgment",
          minutes: 4,
          questions: [
            {
              question: "When is a Skill a better fit than MCP?",
              options: [
                "When you need external API access",
                "When the repeated value is instructions, process and quality criteria",
                "When Claude must write to a database",
                "When no instructions are needed",
              ],
              correctIndex: 1,
              explanation: "Skills package repeatable instructions and workflows. MCP is for external tools and data access.",
            },
            {
              question: "What should you consider before adding MCP?",
              options: [
                "Only whether it sounds advanced",
                "Permissions, failure modes and approval checkpoints",
                "Whether it makes prompts shorter",
                "Whether it replaces all verification",
              ],
              correctIndex: 1,
              explanation: "MCP expands capability and risk. Permissions and safeguards matter.",
            },
          ],
        },
      ],
    },
    {
      id: "m7",
      title: "Agentic Workflows",
      free: true,
      lessons: [
        {
          id: "m7l1",
          type: "lesson",
          title: "Chat vs workflow vs agent",
          minutes: 9,
          blocks: [
            {
              type: "text",
              text: "A chat produces an answer. A workflow produces a repeatable result. An agent observes, reasons, acts and checks progress toward a goal.",
            },
            {
              type: "prompt",
              title: "Workflow mapper",
              text: "Turn this recurring task into a workflow. Identify inputs, steps, tool use, human checkpoints, failure cases and verification criteria.\n\nTask:\n[paste]",
            },
          ],
        },
        {
          id: "m7l2",
          type: "lesson",
          title: "When should you use an agent?",
          minutes: 8,
          blocks: [
            {
              type: "text",
              text: "Do not use agents just because the word sounds advanced. Use an agent when the task is multi-step, has observable progress, can use tools, and has objective success criteria.",
            },
            {
              type: "list",
              items: [
                "Is the task multi-step?",
                "Can intermediate decisions be made safely?",
                "Are tools available and scoped?",
                "Can success be objectively verified?",
                "What happens if the agent makes a mistake?",
              ],
            },
            {
              type: "prompt",
              title: "Agent fit prompt",
              text: "Decide whether this should be handled as chat, a workflow, or an agent. Explain the reason, risks, needed tools, checkpoints and verification criteria.\n\nTask:\n[paste]",
            },
          ],
        },
        {
          id: "m7l3",
          type: "lesson",
          title: "Subagents are for separable work",
          minutes: 8,
          blocks: [
            {
              type: "text",
              text: "Subagents help when work can be split into independent streams like research, analysis and testing. They add overhead when the task is simple or tightly coupled.",
            },
            {
              type: "list",
              items: [
                "Good split: research competitors, analyze pricing, test assumptions, synthesize final brief.",
                "Bad split: three agents all editing the same paragraph.",
                "Good split: one agent investigates logs while another reviews recent code changes.",
                "Bad split: using subagents to make a two-minute task look sophisticated.",
              ],
            },
            {
              type: "prompt",
              title: "Subagent decomposition",
              text: "Break this task into subagents only if the work is genuinely separable. For each proposed subagent, define objective, inputs, tools, output, and how the main agent should synthesize the result.\n\nTask:\n[paste]",
            },
          ],
        },
        {
          id: "m7q1",
          type: "quiz",
          title: "Checkpoint: agent judgment",
          minutes: 4,
          questions: [
            {
              question: "When does an agent make sense?",
              options: [
                "Any time you want a fancy prompt",
                "When the task is multi-step, observable, tool-supported and verifiable",
                "Only for writing emails",
                "When you do not know the goal",
              ],
              correctIndex: 1,
              explanation: "Agents need a goal, environment, actions, observations and verification. Otherwise a workflow or chat is usually better.",
            },
            {
              question: "When are subagents useful?",
              options: [
                "When work can be split into independent streams",
                "When every task has one paragraph",
                "When no synthesis is needed",
                "When you want to avoid verification",
              ],
              correctIndex: 0,
              explanation: "Subagents are useful for separable work that can be synthesized by the main agent.",
            },
          ],
        },
      ],
    },
    {
      id: "m8",
      title: "Reliability and Verification",
      free: true,
      lessons: [
        {
          id: "m8l1",
          type: "lesson",
          title: "Define success before execution",
          minutes: 9,
          blocks: [
            {
              type: "text",
              text: "The biggest difference between casual and advanced Claude use is verification. Define success before asking Claude to perform complicated work.",
            },
            {
              type: "prompt",
              title: "Verification loop",
              text: "Before executing this task, write success criteria. After producing the result, evaluate it against each criterion, list evidence, identify uncertainties and propose fixes.\n\nTask:\n[paste]",
            },
          ],
        },
        {
          id: "m8l2",
          type: "lesson",
          title: "Separate known, inferred and uncertain",
          minutes: 7,
          blocks: [
            {
              type: "text",
              text: "Reliable Claude work depends on keeping facts, inferences and uncertainties separate. This prevents confident unsupported output.",
            },
            {
              type: "prompt",
              title: "Evidence separation prompt",
              text: "Analyze the material below and separate your response into:\n1. Known from the provided source\n2. Inferred from the source\n3. Uncertain or missing\n4. Needs external verification\n\nMaterial:\n[paste]",
            },
            {
              type: "tip",
              text: "This pattern is useful for research, product decisions, legal-sensitive content, hiring, analytics and technical debugging.",
            },
          ],
        },
        {
          id: "m8l3",
          type: "lesson",
          title: "Make Claude critique its own output",
          minutes: 8,
          blocks: [
            {
              type: "text",
              text: "A draft is not the finish line. Ask Claude to review the draft against explicit criteria, then revise only the parts that fail.",
            },
            {
              type: "prompt",
              title: "Self-critique loop",
              text: "Review your previous answer against these criteria:\n[criteria]\n\nReturn:\n1. Pass/fail for each criterion\n2. Evidence from the answer\n3. Weak or unsupported parts\n4. Specific revisions needed\n5. A revised version that fixes only the failures",
            },
          ],
        },
        {
          id: "m8q1",
          type: "quiz",
          title: "Checkpoint: reliability",
          minutes: 4,
          questions: [
            {
              question: "What is the best time to define success criteria?",
              options: ["After shipping", "Before execution", "Only if something breaks", "Never"],
              correctIndex: 1,
              explanation: "Success criteria should guide the work and the verification, so define them before execution.",
            },
            {
              question: "Why separate known, inferred and uncertain?",
              options: [
                "To make output longer",
                "To prevent unsupported claims from looking like facts",
                "To avoid using evidence",
                "To hide missing context",
              ],
              correctIndex: 1,
              explanation: "The separation makes uncertainty visible and easier to verify.",
            },
          ],
        },
      ],
    },
    {
      id: "m9",
      title: "Capstone: Build Your Claude System",
      free: true,
      lessons: [
        {
          id: "m9l1",
          type: "lesson",
          title: "Package your reusable Claude system",
          minutes: 12,
          blocks: [
            {
              type: "text",
              text: "The course ends with a system you can keep: instructions, context, a reusable skill, a workflow and verification criteria.",
            },
            {
              type: "list",
              items: [
                "instructions.md: how Claude should work with you.",
                "CLAUDE.md: project or repository context.",
                "skill.md: one repeatable capability.",
                "workflow.md: a multi-step process.",
                "success.md: verification criteria.",
              ],
            },
            {
              type: "prompt",
              title: "Capstone prompt",
              text: "Help me package my personal Claude system. Ask for missing context, then create files for instructions, project context, one reusable skill, one workflow and success criteria.",
            },
          ],
        },
        {
          id: "m9l2",
          type: "lesson",
          title: "Choose one real workflow",
          minutes: 8,
          blocks: [
            {
              type: "text",
              text: "The capstone should be real enough that you will reuse it. Pick one recurring task that has context, steps, judgment and a verification standard.",
            },
            {
              type: "list",
              items: [
                "Good: review a pull request against project conventions.",
                "Good: turn customer calls into a product decision memo.",
                "Good: research a market and produce a sourced brief.",
                "Weak: make Claude generally helpful.",
              ],
            },
            {
              type: "prompt",
              title: "Workflow selection prompt",
              text: "Help me choose a capstone workflow. Ask me about recurring work, available context, tools, risk level and verification. Then recommend the best workflow to package first.",
            },
          ],
        },
        {
          id: "m9l3",
          type: "lesson",
          title: "Run the system once",
          minutes: 10,
          blocks: [
            {
              type: "text",
              text: "The final step is not writing a template. It is using the system on a real task, checking the result, and improving the workflow based on what failed.",
            },
            {
              type: "prompt",
              title: "System test prompt",
              text: "Use my Claude system on this real task. Follow the workflow, produce the artifact, evaluate against success.md, list failures, and suggest improvements to the system files.\n\nTask:\n[paste]",
            },
            {
              type: "tip",
              text: "A Claude system becomes valuable only after it survives a real run and a revision loop.",
            },
          ],
        },
        {
          id: "m9q1",
          type: "quiz",
          title: "Checkpoint: capstone",
          minutes: 4,
          questions: [
            {
              question: "What makes a good capstone workflow?",
              options: [
                "It sounds broad and impressive",
                "It is recurring, specific, context-rich and verifiable",
                "It has no success criteria",
                "It avoids real work",
              ],
              correctIndex: 1,
              explanation: "A useful system handles real recurring work and has a clear way to judge output quality.",
            },
            {
              question: "When is the capstone finished?",
              options: [
                "After writing one prompt",
                "After using the system once, verifying it and improving it",
                "Before testing it",
                "When Claude says it is done",
              ],
              correctIndex: 1,
              explanation: "The capstone should include a real run and a revision loop, not only a template.",
            },
          ],
        },
      ],
    },
  ],
};

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
  [CLAUDE_MASTERY_CONTENT.slug]: CLAUDE_MASTERY_CONTENT,
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
    free: course.isFree ? true : i === 0,
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
