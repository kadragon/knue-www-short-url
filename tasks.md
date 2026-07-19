# Tasks — 진행/완료

활성 스프린트 큐. 진행 중 작업이 없으면 이 파일에 활성 스프린트 블록은 없음.
미착수 큐는 [`backlog.md`](backlog.md), 기능 사양은 [`docs/`](docs/README.md) 참조.
활성 스프린트 스키마는 [`docs/workflows.md`](docs/workflows.md) → "`tasks.md` schema" 참조.

## 프로젝트 상태

- ✅ 핵심 기능 완료 (인코딩, 디코딩, QR 코드)
- ✅ 테스트 42/42 통과, 커버리지 93.22% (게이트 80%)
- ✅ TypeScript 마이그레이션, ESLint + Prettier, npm audit 0 vulnerabilities
- ✅ CI (GitHub Actions `.github/workflows/ci.yml`), pre-commit (`lefthook.yml`: lint/format/test)

## 완료 기록

| 작업 | 완료일 | 결과 |
|------|--------|------|
| GH-001: GitHub Actions CI 파이프라인 | 2025-10-23 | Run #18752789950 SUCCESS (34s) — audit 0, lint 0, 42/42, build 38.94 KB, coverage 93.22% |
| CI-001: npm audit 자동 검사 | 2025-10-23 | 0 vulnerabilities |
| CI-002: ESLint + Prettier 설정 | 2025-10-23 | `bun run lint`, `bun run format` |
| CI-003: 테스트 커버리지 리포트 | 2025-10-23 | 93.22% (stmts/lines), 100% funcs, 93.1% branches |
| CI-004: TypeScript 마이그레이션 | 2025-10-23 | PR #9, 전 파일 `.ts`, 42/42 통과 |
| CI-005: Vitest/coverage 버전 정렬 | — | `SPEC-CI-DEPS-001` 참조 |
| REFACTOR-001~005 | 2025-10-23 | 에러 메시지 상수화 · 검증 함수 통합 · UI 핸들러 분리 · 타입 검증 강화 · 문서화 |
| DEV-001: Pre-commit 훅 | — | `lefthook.yml`로 구현 (lint/format/test) |
| SEC: postcss ≥8.5.10 XSS 수정 | — | 커밋 `be62ce4` (PR #32) |

> 상세 실행 로그는 git 히스토리 참조.
