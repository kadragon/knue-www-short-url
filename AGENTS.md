# AGENTS

KNUE 게시판 URL 단축기. 클라이언트 사이드, Sqids 기반 인코딩/디코딩 + QR 생성. 서버 없음.

## Docs (`docs/`)
- 기능 사양: `docs/features/{url-encoding,url-decoding,qr-code-generation}.md`
- CI: `docs/ci/dependency-alignment.md`
- 색인: `docs/README.md`

## 작업 큐
- 활성/완료: `tasks.md` · 미착수 백로그: `backlog.md`

## 개발
- Runtime: Bun · Build: Vite · Test: Vitest (`bun run test`)
- 검증: `bun run lint`, `bun run format` · pre-commit: `lefthook.yml` (lint/format/test)
- CI: `.github/workflows/ci.yml`

## 제약
- 디코딩 반환 URL은 항상 `https://www.knue.ac.kr/`로 제한 (도메인 whitelist)
- 사용자 메시지는 한국어. 코드/주석/커밋은 영어.
