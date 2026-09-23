# Claude Task Judgment Checklist

Use this before giving Claude a task.

## 1. What kind of task is this?

- Direct answer
- Explanation
- Drafting
- Transformation
- Analysis
- Research
- Coding
- Tool execution
- Verification

## 2. What should Claude do first?

Choose one:

- Answer directly
- Ask for missing context
- Inspect provided material
- Use a tool or source
- Create a draft for human review
- Verify an existing result

## 3. What context is required?

- Goal
- Audience
- Source material
- Constraints
- Examples
- Output format
- Known risks

## 4. What should not be trusted without checking?

- Current facts
- Legal, financial or medical claims
- Numbers and calculations
- Source citations
- Security-sensitive code
- Destructive commands
- High-impact decisions

## 5. What does success look like?

Write 3-5 checks:

- The output must...
- The output must not...
- A human should verify...

## Starter prompt

```text
Before doing the task, classify it.

Should you answer directly, ask for more context, use a tool, produce a draft,
or require human verification?

Explain the reason, list missing context, and state what must be verified.

Task:
[paste task]
```
