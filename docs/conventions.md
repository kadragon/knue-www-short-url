# Conventions

Anything the linter/formatter already enforces is not repeated here (ESLint recommended + typescript-eslint, Prettier via `.prettierrc.json`). Below are only the project conventions tooling cannot catch.

## Language

- Code / identifiers / commits / PRs / this `docs/`: English.
- User-facing strings (alerts, DOM text, error messages): Korean.
- Do not hardcode user-facing strings — route them through constants such as `ERROR_MESSAGES` in `constants.ts` (i18n readiness, consistency).

## Constants

- Magic values (domain, thresholds, messages) live in `constants.ts`. Do not scatter literals like `KNUE_DOMAIN` across the code.
- Files with a `// GENERATED FROM SPEC-*` header (`constants.ts`, `validators.ts`, `uiHandlers.ts`) stay in sync with their matching `docs/features/*` spec — update the spec doc when the logic changes.

## Purity boundary

- `urlEncoder.ts`, `validators.ts`: pure functions only. No `document` / `window` / `alert` / network — keeps them testable.
- DOM side effects belong only in `app.ts` and `uiHandlers.ts`.

## Validation

- Validate external/user input at the boundary via `validators.ts` functions, then trust it. Do not re-validate deep in business logic.
- Reuse `areAllValidNumbers` / `validateParameterRange` for number checks — no duplicated `typeof` / `NaN` / `Infinity` checks.

## Tests

- Tests are `test/**/*.test.ts` (Vitest, jsdom). The `.js` mirror files are legacy — write new tests in `.ts` only.
- Coverage thresholds are enforced in `vite.config.ts` (lines/functions/statements ≥80, branches ≥70). Ship new logic with tests.

## Commits

- Single-line `[TYPE] description`. TYPE: `FEAT` / `FIX` / `REFACTOR` / `TEST` / `DOCS` / `CONSTRAINT` / `HARNESS`.
- Never commit to `main` directly — always a feature branch.
