# Task CI-005: Align Vitest & Coverage Versions

- **Spec**: `SPEC-CI-DEPS-001` (`.spec/ci-cd/dependency-alignment.md`)
- **Goal**: Resolve the `npm ci` peer dependency conflict by keeping `vitest` and `@vitest/coverage-v8` on the same major/minor release line.
- **Status**: Done (2025-11-21)
- **Owner**: Autonomous agent
- **Trace**: package.json, package-lock.json, npm scripts/tests

---

## Definition of Done
- `npm ci` completes without `ERESOLVE` on CI.
- `npm test` passes with coverage enabled (Vitest + V8).
- package-lock.json reflects the resolved compatible versions.
- Spec `SPEC-CI-DEPS-001` remains satisfied.

---

## Plan
1) Bump `vitest` and `@vitest/coverage-v8` to the latest matching version (>=4.0.12).  
2) Regenerate `package-lock.json` with the new resolution.  
3) Run `npm test` to verify the toolchain.  
4) Update task status and memory notes.

---

## Test References
- `npm test` (Vitest suite)
- (Indirect) Coverage configuration in `vite.config.ts`

---

## Outcome
- Versions aligned to `^4.0.12` for both Vitest packages.
- `npm install` refreshed `package-lock.json`.
- `npm test` succeeded (42 tests, Vitest 4.0.12) with no peer dependency warnings.
