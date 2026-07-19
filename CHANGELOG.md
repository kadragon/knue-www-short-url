# Changelog

## Unreleased

- [done] Features: 다국어 지원(i18n) — `ERROR_MESSAGES` `{ ko, en }` 확장 + `src/i18n.ts` 로케일 리졸버(`navigator.language` 기본 + localStorage 지속 수동 토글), 의존성 0 (2026-07-19)
- [done] Enhancements: 경량 중앙 에러 로거(`logError`) 통합 + qrcode 지연 로딩(코드 분할, 메인 진입 청크 38.94→14.05 kB) (2026-07-19)
- [done] GH-002: 빌드 아티팩트 자동화 + 경로 이식성 (2026-07-19)
- [done] Redirect path portability: 잘못된 코드 리다이렉트가 도메인 루트 대신 앱 루트(`window.location.pathname`)로 이동 (2026-07-19)
