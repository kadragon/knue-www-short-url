# Workflows

Standard cycles per work type. Pick one primary workflow per cycle. Small solo repo — `code` covers most of it; use `plan` / `draft` / `explore` as needed.

## `code` — Implementation (primary cycle)

The default cycle for behavioral changes. Delegation checkpoints are named steps, not optional suggestions.

**Step 0: Branch**
Ensure a feature branch before any edit. If on `main`, run `git checkout -b <type>/<slug>` (`feat/`, `fix/`, `refactor/` …). Never edit `main` directly.

**Step 1: Scope check (delegation gate)**
Check the objective triggers in `docs/delegation.md`:
- Target area >3 files AND not explored this session → delegate to `explorer`.
- Otherwise → proceed inline. (This repo is small, so most work stays inline.)

**Step 2: Sprint Contract**
Define "done" before writing code, using the `docs/eval-criteria.md` → "Sprint Contract" template. Write testable acceptance criteria per item. When starting from a `backlog.md` group, record the Sprint Contract in `tasks.md` (schema below).

**Step 3: Implement**
- ≤2 files AND not `[FEAT]`/`[REFACTOR]` → edit inline.
- Otherwise → delegate to the `implementer` agent (pass Sprint Contract + absolute paths + lint/test command). The implementer must not verify its own work.

**Step 4: QA (mandatory delegation)**
Always spawn `qa-verifier` as a separate agent. The agent that implemented must not verify. Returns pass/fail against Sprint Contract criteria, with evidence.

**Step 5: Feature-complete evaluation (optional)**
For features where user-facing / subjective quality matters, spawn `product-evaluator`. Skip for pure-logic bug fixes.

**Step 6: Cleanup → handoff**
Sync version/tracking files, leave changes uncommitted, and hand off to `dev-review-cycle` (commit · PR · CI · merge). The `dev-tools:next-tasks` skill drives this orchestration.

### Testing approach

Vitest is present → for bug fixes write a reproducing test first, then a minimal pass. Ship new logic with tests. Never weaken a valid test just to make an implementation pass.

### `tasks.md` schema (exists only during an active sprint)

```markdown
# <Sprint title>
status: active   # open | active | done

## Covers            # when sourced from backlog.md, copy target items verbatim
- [ ] <backlog item>

## Scope
## Acceptance criteria   # one testable checkbox per item
- [ ] <criterion 1>
## Out of scope
## Lint/test command
```

## `plan` — Spec generation

Expand a short prompt into `docs/design/{feature}.md` (user stories, tech design, phased features). No granular implementation details. After user approval, generate `backlog.md` items. Skip for trivial features.

## `draft` — Documentation

Write/update `docs/`. Ground every claim in current code. Never modify production code. Record any missing constraint discovered into `backlog.md` / `tasks.md`.

## `explore` — Research

State the question → research/prototype → report options and tradeoffs → do not commit. On approval, flow into `plan` / `code`.

## `sweep` — Garbage collection

Fight entropy between features: lint scan, doc drift, dead code. Fix trivials inline; push complex items to `backlog.md`.

---

## Context anxiety

If quality degrades late in a session (later items stubbed, sudden summarizing), prefer a context reset plus a handoff file over in-place compaction. Work units in this repo are small, so a single session is usually enough.
