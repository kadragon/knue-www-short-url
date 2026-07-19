# AGENTS

KNUE bulletin-board URL shortener. Client-side, Sqids-based encode/decode + QR generation. No server.

## Docs Index (read on demand)

| File | When to read |
|------|--------------|
| `docs/architecture.md` | Before changing module structure/boundaries |
| `docs/conventions.md` | Before writing code/tests |
| `docs/workflows.md` | When starting an implementation cycle |
| `docs/delegation.md` | Before delegating to sub-agents |
| `docs/eval-criteria.md` | When evaluating a completed feature |
| `docs/runbook.md` | For build/test/deploy commands |
| `docs/features/*` · `docs/ci/*` | Feature/CI specs (`SPEC-*`) |

## Golden Principles

Mechanically enforced invariants. Violations block commit/CI.

1. **Domain whitelist** — decoded/redirect URLs must start with `https://www.knue.ac.kr/`. Open-redirect guard, enforced at `app.ts:61` + tests.
2. **Coverage gate** — lines/functions/statements ≥80, branches ≥70. Thresholds in `vite.config.ts` enforced by CI and pre-commit.
3. **Lint/format clean** — `bun run lint` and `prettier --check` pass. Enforced by `lefthook.yml` pre-commit + CI.
4. **Agent Integrity** — never state a value (port, endpoint, schema field, version …) as fact unless read directly from a file/command/tool result this session. Otherwise write `[unknown — read {source} to verify]`.

## Delegation

Delegation is a golden principle — skipping a mandatory gate is a violation. Full routing/model/brief format in `docs/delegation.md`. Small repo → inline is usually correct.

- After implementation, **always** spawn `qa-verifier` (the implementing agent must not self-verify — hard stop).
- Target area >3 files AND not explored → `explorer`. Backlog implementation (≥1 file, non-trivial) → `implementer`.
- Role definitions: `.claude/agents/{implementer,explorer,qa-verifier,product-evaluator}.md`.

## Token Economy

Applies every message — keep the context window lean.

1. Do not re-read a file already read this session; check only the changed region.
2. Do not call tools to confirm what you already know.
3. Run independent tool calls in parallel.
4. Delegate any analysis that would produce >20 lines of output to a sub-agent; return only the conclusion.

## Working with Existing Code

| | |
|---|---|
| ✅ | Use messages/domain via `constants.ts`; keep pure logic in `urlEncoder`/`validators` |
| ⚠️ | `knueSites.ts` numeric IDs are add-only — reassigning breaks published short URLs; `.js` tests are legacy (new tests in `.ts`) |
| 🚫 | DOM/network side effects in `urlEncoder`/`validators`; committing to `main` directly |

## Language Policy

- Code / comments / commits / PRs / `docs/` / this `AGENTS.md`: English.
- User-facing strings (alert · DOM · errors): Korean, via `ERROR_MESSAGES`.
- User-facing conversation: Korean.

## Work Queue

- Active/done: `tasks.md` (exists only during an active sprint) · unstarted backlog: `backlog.md`. Items use `- [ ]` / `- [>]` / `- [x]` checkboxes.

## Maintenance

Edit this file **only** when ALL four hold:

1. Not directly discoverable from code / config / manifests / `docs`
2. Operationally significant (affects build, test, deploy, or runtime safety)
3. Would likely cause mistakes if undocumented
4. Stable and not task-specific

**Never add:** architecture summaries, directory overviews, tooling-enforced style, anything already visible in the repo, or temporary instructions. Prefer editing/removing stale entries over appending. Move long content to `docs/*.md` and leave a pointer here.

**Memory boundary:** durable code/repo facts live here and in `docs/` (version-controlled). Auto-memory (`MEMORY.md`) holds the model's discovered preferences and cross-session learnings only — never promote a code fact into it.
