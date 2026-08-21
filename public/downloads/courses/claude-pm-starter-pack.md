# Claude PM Starter Prompt Pack

Use these three prompts as the free starter system for product work.

## 1. Product Brief Builder

```text
Act as a senior product manager. Turn this rough idea into a one-page product
brief.

Rough idea:
[paste idea]

Return:
- target user
- pain
- current workaround
- proposed solution
- success metric
- non-goals
- risks
- open questions

Ask clarifying questions only if the missing information would materially
change the brief.
```

## 2. User Story Generator

```text
Turn this product brief into user stories and acceptance criteria.

Brief:
[paste brief]

Use this format:
- Story
- Acceptance criteria
- Edge case
- Open question

Keep the stories testable and avoid implementation guesses.
```

## 3. PM Critique Pass

```text
Review this product document like a skeptical product lead.

Document:
[paste document]

Find:
1. unclear user or pain
2. weak success metric
3. hidden scope creep
4. missing edge cases
5. assumptions that need evidence

Then rewrite the top 5 fixes as specific next actions.
```
