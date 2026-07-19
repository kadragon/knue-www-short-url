# Runbook

Runtime: Bun. Build: Vite. Test: Vitest. No server — the build output is static files.

## Commands

| Task | Command |
|------|---------|
| Install | `bun install --frozen-lockfile` |
| Dev server | `bun run dev` (Vite) |
| Test | `bun run test --run` |
| Test + coverage | `bun run test -- --coverage` |
| Lint | `bun run lint` (`eslint src test`) |
| Format | `bun run format` (Prettier write) · `bun run format --check` to verify |
| Build | `bun run build` → `dist/` |
| Dependency audit | `bun pm audit --audit-level=moderate` |

## Gates

- **pre-commit** (`lefthook.yml`): lint + format-check + test, in parallel. A failure blocks the commit.
- **CI** (`.github/workflows/ci.yml`, on push/PR to `main`/`develop`): audit (non-blocking) → lint → test with coverage → build. Coverage thresholds in `vite.config.ts` fail the run if unmet.

## Failure modes

- **Lockfile drift** — Bun and npm lockfiles both exist. `docs/ci/dependency-alignment.md` (`SPEC-CI-DEPS-001`) covers keeping Vitest/coverage versions aligned so `--frozen-lockfile` installs succeed.
- **Coverage gate fails** — add tests for the new branch/function; do not lower the thresholds in `vite.config.ts` to pass.
- **Deploy** — output is `dist/`; deployment is static-file hosting (GitHub Pages automation is a queued backlog item).

## Scratchpad convention

Intermediate agent artifacts live in the session scratchpad directory (path given in the system prompt), named `{phase:02d}_{agent}_{artifact}.{ext}`. Ephemeral — gone at session end, no cross-session resume.
