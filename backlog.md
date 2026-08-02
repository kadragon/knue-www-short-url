# Backlog — 미착수 큐

활성 스프린트는 [`tasks.md`](tasks.md), 기능 사양은 [`docs/`](docs/README.md) 참조.
항목 상태: `- [ ]` 큐 · `- [>]` 진행 중(스프린트 승격) · `- [x]` 완료.

## Tech Debt

- [ ] [TOOLING] 주석 언어 정책 불일치 — AGENTS.md Language Policy는 코드 주석을 영어로 규정하지만 `src/*.ts` 기존 주석은 전부 한국어. 신규 코드만 영어로 쓰면 파일 내부가 뒤섞임. 기존 주석을 영어로 일괄 이행하거나(권장), 정책을 실제 관행에 맞게 개정할 것. 어느 쪽이든 lint 규칙으로 강제 불가하므로 리뷰 체크리스트 항목으로 남김. Effort M.
- [ ] [TOOLING] `test/` 타입 안전성 — `tsconfig.json` `include`가 `["src"]`라 테스트는 tsc 검사 대상 밖이고, `@types/node`는 vitest 경유 전이 설치(24.9.1)만 있을 뿐 직접 devDependency로 선언돼 있지 않음. 그 결과 `test/seo.test.ts`의 `node:fs`/`node:path`/`process`가 런타임에만 동작하고 에디터·standalone `tsc`에서는 TS2591로 보임. `@types/node` 직접 선언 + 테스트 포함 tsconfig(또는 별도 typecheck 스크립트)로 가드. Effort S.
- [ ] [TEST] open-redirect guard의 non-KNUE truthy-url 브랜치 미테스트 — `decodeURL`이 `{url:'https://evil.example/'}`처럼 truthy지만 `KNUE_DOMAIN`으로 시작하지 않는 값을 반환할 때 `alert(INVALID_CODE)` + fetch 미호출을 검증. 현재 else-branch 테스트는 `url` undefined(falsy 단락)만 커버해 실제 가드 브랜치(`src/app.ts:85` `&&` 우변)가 미검증 상태. 이번 스프린트 이전부터 존재하던 갭. Effort S.

---

## 미해결 질문 / 의사결정

1. ~~**GitHub Pages 배포**: 기본 도메인 vs 커스텀 도메인?~~ — 해결(2026-07-19): GH Pages 미사용. 프로덕션은 KNUE 서버 `www.knue.ac.kr/s/`, CI가 `dist-build` 아티팩트 자동 빌드(`base:'./'`), `/s/` 배포는 수동.
2. ~~**모니터링**: Sentry 연동 vs 로컬 로깅 유지?~~ — 해결(2026-07-19): 경량 로컬 로깅 유지. 중앙 `logError` 로거(`src/errorLogger.ts`)로 통합, 외부 SDK 미도입(no-server·번들 최적화 유지). 향후 모니터링 교체 시 `logError` 단일 seam.
3. ~~**다국어**: 필수인가? i18n 라이브러리 선택?~~ — 해결(2026-07-19): 한국어+영어만. 라이브러리 미도입, `ERROR_MESSAGES`를 `{ ko, en }`로 확장 + `navigator.language` 기본/수동 토글, 의존성 0.
4. ~~**통계 데이터**: 서버 저장 vs 클라이언트 로컬스토리지?~~ — 해결(2026-07-19): 인바운드 접속 시점에만 Umami로 최소 데이터(code+timestamp, PII 없음) 전송. 앱 정적 유지, no-server 원칙에 "외부 수집 1곳(Umami)" 예외. CSP 화이트리스트 추가 선행.
5. ~~**SEO**: 메타 태그/OG 이미지 필요?~~ — 해결(2026-07-19): 최소 범위(description + OG/twitter 카드 + 정적 OG 이미지 1장)만. 공유 미리보기 개선 목적, 검색 랭킹용 machinery 제외.
