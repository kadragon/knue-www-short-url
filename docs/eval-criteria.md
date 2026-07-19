# Evaluation Criteria

The evaluator is a **separate role** from the generator. Agents grading their own work drift toward leniency — an independent `qa-verifier` / `product-evaluator` is far more tractable.

## Sprint Contract (pre-implementation agreement)

Before each `code` cycle, define "done" in concrete, testable terms. Recorded in `tasks.md` for the active sprint.

```markdown
### Sprint Contract: {feature}

**Scope:** {specific files/areas in scope}
**Out of scope:** {explicit exclusions}
**Lint/test command:** {e.g. `bun run lint && bun run test --run`}

**Acceptance criteria** (one testable checkbox per item):
- [ ] {criterion 1 — specific and testable}
- [ ] {criterion 2}
```

Without a written contract the evaluator grades against vague expectations and the generator builds against vague goals. Both drift.

## Quality dimensions

Weighted for this client-side URL tool.

### 1. Correctness (40%)

Does the feature work end-to-end? Encode → decode round-trips; validation rejects bad input; redirect only fires for `KNUE_DOMAIN` URLs.

**How to test:** run `bun run test --run`; exercise the changed flow manually in `bun run dev`.

### 2. Domain safety (25%)

No path allows a decoded/redirect URL outside `https://www.knue.ac.kr/`. Open-redirect guard at `app.ts:61` intact.

**How to test:** confirm the whitelist check is present and covered by a test; try a crafted code that decodes outside the domain — it must not redirect.

### 3. Test coverage (20%)

New logic is covered; thresholds hold (lines/functions/statements ≥80, branches ≥70 per `vite.config.ts`).

**How to test:** `bun run test -- --coverage` passes the threshold gate.

### 4. Consistency (15%)

Follows `docs/conventions.md`: constants centralized, purity boundary respected, user-facing strings Korean via `ERROR_MESSAGES`.

**How to test:** `bun run lint` clean; read the diff against conventions.

## Pass threshold

- Every dimension ≥3/5 (no single dimension broken).
- Any failed Sprint Contract checkbox → the feature fails, regardless of other scores. Do not average away a real failure.

## Evaluator protocol

1. Read the Sprint Contract acceptance criteria.
2. Exercise the feature (run tests, drive `bun run dev`, or read the diff).
3. Grade each criterion with specific evidence (evidence first, score second).
4. Below threshold → findings become new `backlog.md` / `tasks.md` items → fix → re-evaluate.

Be skeptical by default: look for what is broken, not what works. The common failure mode is finding a bug and then talking yourself out of it — resist that.
