# Backlog — 미착수 큐

활성 스프린트는 [`tasks.md`](tasks.md), 기능 사양은 [`docs/`](docs/README.md) 참조.
항목 상태: `- [ ]` 큐 · `- [>]` 진행 중(스프린트 승격) · `- [x]` 완료.

## Features

- [ ] URL 유효기간 설정 — 만료 시각을 short code 자체에 인코딩(Sqids 배열에 expiry 추가). localStorage는 origin·브라우저 스코프라 공유 URL(타 기기/브라우저 수신자)에서 만료 검증 불가하므로 배제. 기존 코드 하위호환(만료 없는 레거시 코드) 및 code 길이 증가 고려 필요. Effort L.

## Tech Debt

- [ ] [TEST] open-redirect guard의 non-KNUE truthy-url 브랜치 미테스트 — `decodeURL`이 `{url:'https://evil.example/'}`처럼 truthy지만 `KNUE_DOMAIN`으로 시작하지 않는 값을 반환할 때 `alert(INVALID_CODE)` + fetch 미호출을 검증. 현재 else-branch 테스트는 `url` undefined(falsy 단락)만 커버해 실제 가드 브랜치(`app.ts:62` `&&` 우변)가 미검증 상태. 이번 스프린트 이전부터 존재하던 갭. Effort S.

---

## 미해결 질문 / 의사결정

1. ~~**GitHub Pages 배포**: 기본 도메인 vs 커스텀 도메인?~~ — 해결(2026-07-19): GH Pages 미사용. 프로덕션은 KNUE 서버 `www.knue.ac.kr/s/`, CI가 `dist-build` 아티팩트 자동 빌드(`base:'./'`), `/s/` 배포는 수동.
2. ~~**모니터링**: Sentry 연동 vs 로컬 로깅 유지?~~ — 해결(2026-07-19): 경량 로컬 로깅 유지. 중앙 `logError` 로거(`src/errorLogger.ts`)로 통합, 외부 SDK 미도입(no-server·번들 최적화 유지). 향후 모니터링 교체 시 `logError` 단일 seam.
3. ~~**다국어**: 필수인가? i18n 라이브러리 선택?~~ — 해결(2026-07-19): 한국어+영어만. 라이브러리 미도입, `ERROR_MESSAGES`를 `{ ko, en }`로 확장 + `navigator.language` 기본/수동 토글, 의존성 0.
4. ~~**통계 데이터**: 서버 저장 vs 클라이언트 로컬스토리지?~~ — 해결(2026-07-19): 인바운드 접속 시점에만 Umami로 최소 데이터(code+timestamp, PII 없음) 전송. 앱 정적 유지, no-server 원칙에 "외부 수집 1곳(Umami)" 예외. CSP 화이트리스트 추가 선행.
5. ~~**SEO**: 메타 태그/OG 이미지 필요?~~ — 해결(2026-07-19): 최소 범위(description + OG/twitter 카드 + 정적 OG 이미지 1장)만. 공유 미리보기 개선 목적, 검색 랭킹용 machinery 제외.
