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
| Format | `bun run format` (Prettier write) · `bun run format:check` to verify (non-mutating gate) |
| Build | `bun run build` → `dist/` |
| Dependency audit | `bun pm audit --audit-level=moderate` |

## Gates

- **pre-commit** (`lefthook.yml`): lint + format-check + test, in parallel. A failure blocks the commit.
- **CI** (`.github/workflows/ci.yml`, on push/PR to `main`/`develop`): audit (non-blocking) → lint → test with coverage → build. Coverage thresholds in `vite.config.ts` fail the run if unmet.

## Failure modes

- **Lockfile drift** — Bun and npm lockfiles both exist. `docs/ci/dependency-alignment.md` (`SPEC-CI-DEPS-001`) covers keeping Vitest/coverage versions aligned so `--frozen-lockfile` installs succeed.
- **Coverage gate fails** — add tests for the new branch/function; do not lower the thresholds in `vite.config.ts` to pass.
## Deploy

Production serves the app at `www.knue.ac.kr/s/` (KNUE web server), so short URLs read `www.knue.ac.kr/s/?<code>`. That path is hosted by KNUE, not GitHub Pages.

- **Build artifact (automated)** — CI (`quality-checks` job) builds and uploads `dist` as the `dist-build` artifact on every push/PR to `main`/`develop`. `vite.config.ts` sets `base: "./"` so the artifact is path-portable — the same `dist` works under `/s/` (or any subpath) without asset 404s.
- **Publish (manual)** — download the `dist-build` artifact from the CI run and copy its contents into the KNUE server's `/s/` directory. No automated `/s/` deploy (the target host is outside this repo's control).

## OG image

`public/og-image.png` (1200x630, referenced by `og:image`/`twitter:image` in `index.html`) is a
committed raster generated from `assets/og-image.svg`. Vite copies `public/` to the dist root, so it
deploys to `/s/og-image.png`, which is what the absolute `og:image` URL points at.

Regenerate after editing the SVG:

```sh
mkdir -p /tmp/ogrender
qlmanage -t -s 1200 -o /tmp/ogrender assets/og-image.svg
sips -c 630 1200 /tmp/ogrender/og-image.svg.png --out public/og-image.png
sips -g pixelWidth -g pixelHeight public/og-image.png   # must be 1200 x 630
```

Constraints worth knowing before editing the SVG:

- macOS `qlmanage` is the only rasterizer available here (no rsvg-convert / ImageMagick / Pillow).
  It always emits a **square** canvas and ignores a non-square SVG height — hence the source is
  authored at 1200x1200 with the card drawn in the `y 285..915` band that the centered crop keeps.
- The SVG must use a system font stack. The rasterizer has no network, so the Pretendard CDN font
  used by the page is unavailable.
- Keep `--` out of XML comments in the SVG: it is invalid XML and `qlmanage` silently renders a
  parse-error page instead of the card.

## Scratchpad convention

Intermediate agent artifacts live in the session scratchpad directory (path given in the system prompt), named `{phase:02d}_{agent}_{artifact}.{ext}`. Ephemeral — gone at session end, no cross-session resume.
