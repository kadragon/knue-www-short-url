# Tasks — 진행/완료

활성 작업 큐. 미착수 아이디어는 [`backlog.md`](backlog.md), 기능 사양은 [`docs/`](docs/README.md) 참조.

## 프로젝트 상태

- ✅ 핵심 기능 완료 (인코딩, 디코딩, QR 코드)
- ✅ 테스트 42/42 통과, 커버리지 93.22% (목표 80%)
- ✅ TypeScript 마이그레이션, ESLint + Prettier, npm audit 0 vulnerabilities
- ✅ CI (GitHub Actions `.github/workflows/ci.yml`), pre-commit (`lefthook.yml`: lint/format/test)

## 활성 (READY)

### GH-002: GitHub Pages 배포 자동화
- **Priority**: 🟡 MEDIUM · **Effort**: S (1-2h) · **Status**: READY
- Actions에서 `dist` 폴더 배포, GitHub Pages 설정, 도메인 설정
- **결정 필요**: 기본 도메인 vs 커스텀 도메인 (아래 미해결 질문 1)

## 완료 기록

| 작업 | 완료일 | 결과 |
|------|--------|------|
| GH-001: GitHub Actions CI 파이프라인 | 2025-10-23 | Run #18752789950 SUCCESS (34s) — audit 0, lint 0, 42/42, build 38.94 KB, coverage 93.22% |
| CI-001: npm audit 자동 검사 | 2025-10-23 | 0 vulnerabilities |
| CI-002: ESLint + Prettier 설정 | 2025-10-23 | `npm run lint`, `npm run format` |
| CI-003: 테스트 커버리지 리포트 | 2025-10-23 | 93.22% (stmts/lines), 100% funcs, 93.1% branches |
| CI-004: TypeScript 마이그레이션 | 2025-10-23 | PR #9, 전 파일 `.ts`, 42/42 통과 |
| CI-005: Vitest/coverage 버전 정렬 | — | `SPEC-CI-DEPS-001` 참조 |
| REFACTOR-001~005 | 2025-10-23 | 에러 메시지 상수화 · 검증 함수 통합 · UI 핸들러 분리 · 타입 검증 강화 · 문서화 |
| DEV-001: Pre-commit 훅 | — | `lefthook.yml`로 구현 (lint/format/test) |
| SEC: postcss ≥8.5.10 XSS 수정 | — | 커밋 `be62ce4` (PR #32) |

> 상세 실행 로그는 git 히스토리 참조 (구 `.tasks/log-*.md`, `.tasks/task-*.md`).
