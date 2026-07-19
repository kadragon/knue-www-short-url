# Delegation

The orchestrator plans, routes, and verifies — it does not do the heavy lifting. This repo is small, so inline is usually correct; delegate only when an objective trigger below is met.

## When NOT to delegate

<3 files / <200 LOC change, all agents need identical context, or heavy inter-agent dependencies → a single session is cheaper. Most work in this repo falls here.

## Routing table (objective triggers)

Triggers must be measurable. No subjective conditions like "complex change" — agents always rationalize skipping them.

| Trigger (objective) | Delegate to | Mode | Gate |
|---|---|---|---|
| Target area >3 files AND not explored this session | `explorer` (sonnet) | sub-agent | Conditional |
| Backlog implementation task, ≥1 file to edit | `implementer` (sonnet) | sub-agent | Conditional (≤2 files & non-`[FEAT]` → inline) |
| After implementation (always) | `qa-verifier` (sonnet) | sub-agent | **Mandatory, blocking** |
| User-facing feature complete | `product-evaluator` (opus) | sub-agent | Optional |
| Same failure twice | `codex:rescue` / deep investigation | sub-agent | Escalation |

The QA gate is a hard stop: if the agent that implemented also verifies, that is a violation.

## Spawn Prompt Contract (all 4 fields mandatory)

Every subagent spawn passes 4 fields — missing any → reject the spawn.

```markdown
- Objective: what to accomplish (which backlog item, which acceptance criteria)
- Output format: diff / table / report / verdict — be concrete
- Tools to use: which of the role's allowlist to prioritize
- Boundaries: files/modules that must NOT be touched
```

Pass context as absolute **file paths**, not inline content — subagents start with zero context.

## Effort Tier (state it in the spawn prompt)

| Tier | Use for | Tool calls | Model |
|------|---------|------------|-------|
| Simple | Single-file edit, mechanical check | 3-10 | sonnet |
| Comparison | Multi-file review, 2-4 option compare | 10-15 | sonnet |
| Complex | Unknown root cause, cross-layer | 15+ | opus lead |

## Model selection

- Structural checks (file exists? line count?) → haiku
- Implementation / exploration / code review → sonnet
- Subjective judgment / deep debugging (2nd attempt) → opus

## Roles

Define reusable roles once in `.claude/agents/{role}.md`. Starter pack: `implementer`, `explorer`, `qa-verifier`, `product-evaluator`. The routing table cites roles by name; the body is auto-appended to the system prompt, so a spawn only passes dynamic context (files, Sprint Contract path).

## Applying subagent output

- Structural fix (typo, missing import) → apply in the current cycle.
- Behavioral change (new feature, changed logic) → record in `backlog.md`, do not apply directly.
- Contradicts a design doc → report both options to the user, do not choose.
