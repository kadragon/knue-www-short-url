# Backlog — 미착수 큐

활성 스프린트는 [`tasks.md`](tasks.md), 기능 사양은 [`docs/`](docs/README.md) 참조.
항목 상태: `- [ ]` 큐 · `- [>]` 진행 중(스프린트 승격) · `- [x]` 완료.

## Features

- [ ] 다국어 지원(i18n) — 한국어+영어만. 라이브러리 없이 `ERROR_MESSAGES`를 `{ ko, en }` 딕셔너리로 확장, locale은 `navigator.language` 기본 + 수동 토글, 의존성 0. Effort L.
- [ ] URL 유효기간 설정 — localStorage에 생성 시간 저장, 만료 시 오류(no-server). Effort L.
- [ ] 통계 수집 — 인바운드(축약 주소 접속) 시점에만 Umami로 short code + timestamp 전송(최소 데이터, PII 없음). 앱은 정적 유지, CSP `connect-src`/`script-src`에 Umami 호스트 화이트리스트 추가 선행. Effort L.
- [ ] SEO — 최소 범위: description 메타 + OG/twitter 카드(og:title/description/type/image) + 정적 OG 이미지 1장. sitemap·structured data 제외(내부 도구). Effort S.

---

## 미해결 질문 / 의사결정

1. ~~**GitHub Pages 배포**: 기본 도메인 vs 커스텀 도메인?~~ — 해결(2026-07-19): GH Pages 미사용. 프로덕션은 KNUE 서버 `www.knue.ac.kr/s/`, CI가 `dist-build` 아티팩트 자동 빌드(`base:'./'`), `/s/` 배포는 수동.
2. ~~**모니터링**: Sentry 연동 vs 로컬 로깅 유지?~~ — 해결(2026-07-19): 경량 로컬 로깅 유지. 중앙 `logError` 로거(`src/errorLogger.ts`)로 통합, 외부 SDK 미도입(no-server·번들 최적화 유지). 향후 모니터링 교체 시 `logError` 단일 seam.
3. ~~**다국어**: 필수인가? i18n 라이브러리 선택?~~ — 해결(2026-07-19): 한국어+영어만. 라이브러리 미도입, `ERROR_MESSAGES`를 `{ ko, en }`로 확장 + `navigator.language` 기본/수동 토글, 의존성 0.
4. ~~**통계 데이터**: 서버 저장 vs 클라이언트 로컬스토리지?~~ — 해결(2026-07-19): 인바운드 접속 시점에만 Umami로 최소 데이터(code+timestamp, PII 없음) 전송. 앱 정적 유지, no-server 원칙에 "외부 수집 1곳(Umami)" 예외. CSP 화이트리스트 추가 선행.
5. ~~**SEO**: 메타 태그/OG 이미지 필요?~~ — 해결(2026-07-19): 최소 범위(description + OG/twitter 카드 + 정적 OG 이미지 1장)만. 공유 미리보기 개선 목적, 검색 랭킹용 machinery 제외.
