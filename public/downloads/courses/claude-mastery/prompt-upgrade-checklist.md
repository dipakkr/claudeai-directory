# Prompt Upgrade Checklist

Use this to turn a weak prompt into a reliable Claude task.

## Weak prompt

```text
[Paste the original prompt]
```

## Upgrade checks

### Context

- What background does Claude need?
- What source material is authoritative?
- What should Claude ignore?

### Task

- What exact action should Claude perform?
- Is the task one job or multiple jobs?
- Should Claude ask questions first?

### Constraints

- Audience
- Tone
- Length
- Format
- Non-goals
- Tools allowed or disallowed
- Verification requirement

### Examples

- Do you have examples of the desired style?
- Do you have examples of bad output to avoid?
- Can Claude infer the pattern from 2-5 examples?

### Output

- Should the result be a list, table, memo, JSON object, checklist or plan?
- What sections must be included?
- What evidence should be attached?

## Strong prompt structure

```text
<context>
[Relevant background and source material]
</context>

<task>
[One clear objective]
</task>

<constraints>
[Rules, audience, exclusions, tools, tone, length]
</constraints>

<examples>
[Optional examples of desired or undesired output]
</examples>

<output>
[Exact structure Claude should return]
</output>

<verification>
[How Claude should check the result before finalizing]
</verification>
```

## Upgrade prompt

```text
Improve this prompt using Context, Task, Constraints, Examples, Output and
Verification.

Return:
1. The rewritten prompt
2. What changed
3. Why the new version is stronger
4. Any remaining missing context

Weak prompt:
[paste]
```
