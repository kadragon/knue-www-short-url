# Architecture

Feature specs live in `docs/features/`; this document covers code structure and module boundaries.

## Overview

Serverless client-side SPA. `index.html` loads `src/app.ts`; Vite bundles to `dist/`. Deployment = static files. No runtime network calls (QR is generated client-side).

## Module boundaries (`src/`)

| File | Responsibility | Depends on |
|------|----------------|------------|
| `app.ts` | Entry point. Global error handlers, encode/decode routing, DOM wiring | everything below |
| `urlEncoder.ts` | Sqids encode/decode core: `encodeURL` / `decodeURL` | `knueSites`, `constants`, `validators` |
| `validators.ts` | Pure input-validation functions (number / code / parameter range) | `constants` |
| `uiHandlers.ts` | DOM side effects (clipboard copy, QR generation) | `constants`, `qrcode` |
| `knueSites.ts` | KNUE board site-name ↔ numeric-ID mapping table | — |
| `constants.ts` | Error messages, `VALIDATION.KNUE_DOMAIN`, other constants | — |

## Dependency direction

`app.ts` → (`urlEncoder`, `validators`, `uiHandlers`) → (`constants`, `knueSites`).
No reverse imports. `constants` / `knueSites` are leaves (import no other `src` module).
Pure logic (`urlEncoder`, `validators`) has no DOM/side effects — keeps it testable. DOM access is isolated to `app.ts` / `uiHandlers.ts`.

## Data flow

- **Encode**: user input (site + post identifiers) → `validateEncodeParams` → `encodeURL` (Sqids) → short code → QR.
- **Decode**: short code → `validateDecodeCode` → `decodeURL` → reconstructed `https://www.knue.ac.kr/...` → `app.ts:61` re-checks the `KNUE_DOMAIN` prefix before redirecting.

## Non-obvious constraints

- A decoded URL must start with `VALIDATION.KNUE_DOMAIN` (`https://www.knue.ac.kr/`) before it is redirected — open-redirect guard at `app.ts:61`. See Golden Principles.
- The `knueSites.ts` mapping is a bidirectional stability contract: reassigning an existing numeric ID breaks already-published short URLs. Add only, never reuse.
