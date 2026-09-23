# Claude Context Package Template

Use this when a task needs more than a one-line prompt.

## Permanent context

Reusable preferences, standards or background.

```text
[Your writing style, recurring constraints, company standards, personal preferences]
```

## Project context

Information about the product, repository, customer, workflow or business.

```text
[Project facts Claude needs to understand the environment]
```

## Task context

The specific job to complete now.

```text
[Goal, scope, audience, constraints, deadline, non-goals]
```

## Current input

The material Claude should transform or analyze.

```text
[Notes, code, transcript, data, error log, brief, document]
```

## Output contract

Tell Claude exactly what to return.

```text
Return:
1. Summary
2. Key findings
3. Evidence
4. Uncertainties
5. Recommended next steps
```

## Verification criteria

```text
A successful result must:
- use only the provided source material unless explicitly asked to research;
- flag assumptions;
- distinguish known facts from inferences;
- identify what a human should verify;
- follow the requested output format.
```

## Starter prompt

```text
Use the context package below to complete the task.

If the context is insufficient, ask for the missing information before
producing the final answer.

<permanent_context>
...
</permanent_context>

<project_context>
...
</project_context>

<task_context>
...
</task_context>

<current_input>
...
</current_input>

<output_contract>
...
</output_contract>

<verification_criteria>
...
</verification_criteria>
```
