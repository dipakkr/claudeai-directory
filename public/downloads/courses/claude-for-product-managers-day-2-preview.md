# Free Preview: Claude for Product Managers

## Day 2: User Stories and Acceptance Criteria

### Outcome

Turn yesterday's product brief into user stories an engineer or designer can
actually discuss.

### Input Needed

- Product brief from Day 1
- Primary user
- Main workflow
- Known constraints
- What should not be included

### Claude Prompt

```text
You are a senior product manager helping me turn a product brief into user
stories and acceptance criteria.

Use this brief:
[paste brief]

Create:
1. 5-7 user stories in "As a / I want / so that" format.
2. Acceptance criteria for each story.
3. Edge cases and failure states.
4. Open questions that must be answered before engineering starts.
5. A short note on what is explicitly out of scope.

Do not invent technical details. If something is missing, mark it as an open
question.
```

### Worksheet

| Story | Acceptance Criteria | Edge Case | Open Question |
| --- | --- | --- | --- |
| As a..., I want..., so that... | Given / when / then | What can break? | What must be clarified? |

### Quality Check

Before you move on, ask:

- Can every story be tested?
- Did Claude invent details that were not in the brief?
- Are the non-goals still visible?
- Would a designer understand the intended user flow?
- Would an engineer know what still needs clarification?
