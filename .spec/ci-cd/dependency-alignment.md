# CI Dependency Alignment

**Spec-ID**: `SPEC-CI-DEPS-001`  
**Intent**: Keep CI tooling dependencies mutually compatible so that `npm ci` succeeds without peer-resolution failures.  
**Scope**: Vitest test runner and coverage plugin versions; lockfile consistency for CI environments.

---

## Behaviour (GWT)

- **AC-1**  
  ```gherkin
  GIVEN the repository is freshly cloned
  WHEN developers run `npm ci`
  THEN installation completes without peer dependency conflicts
  ```

- **AC-2**  
  ```gherkin
  GIVEN dependencies are installed
  WHEN `npm test` executes
  THEN Vitest loads with the coverage provider configured using the same major version and all tests pass
  ```

- **AC-3**  
  ```gherkin
  GIVEN the coverage plugin is enabled
  WHEN the tooling is upgraded
  THEN the lockfile reflects the compatible versions used by CI runners
  ```

---

## Acceptance Tests

- Dependency install via `npm ci` exits with code 0.
- `npm test` exits with code 0 using Vitest + `@vitest/coverage-v8` of the same major version.
- `package-lock.json` records the resolved versions used in CI.

---

## Tracing

- Linked Task: `TASK-CI-005`
- Implementation Artifacts: `package.json`, `package-lock.json`
