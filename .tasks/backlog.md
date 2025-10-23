# 백로그

## 현재 상태
- 모든 핵심 기능 완료 (인코딩, 디코딩, QR 코드)
- 테스트 커버리지 > 80%
- SDD/TDD 문서화 완료

---

## 대기 중인 작업 (우선순위 낮음)

### Enhancement: 에러 처리 개선
- **Scope**: 비결정적 오류 상황 처리
- **Description**: 현재는 console.error만 사용, Sentry 같은 모니터링 서비스 연동 고려
- **Linked Spec**: `.spec/features/` (모든 기능)
- **Effort**: M (1-2일)
- **Status**: BACKLOG

### Enhancement: 성능 최적화
- **Scope**: 번들 크기 감소
- **Description**: 현재 <50KB, qrcode.js 제거 옵션 검토 (별도 서버로 생성)
- **Linked Spec**: (없음)
- **Effort**: M
- **Status**: BACKLOG

### Feature: 다국어 지원 (i18n)
- **Scope**: 영어/중국어/일본어 지원
- **Description**: 모든 사용자 메시지 `intl` 라이브러리로 국제화
- **Linked Spec**: 신규 작성 필요
- **Effort**: L (2-3일)
- **Status**: BACKLOG

### Feature: URL 유효기간 설정
- **Scope**: 단축 URL 만료 기능
- **Description**: localStorage 또는 서버에 생성 시간 저장, 유효기간 초과 시 오류
- **Linked Spec**: 신규 작성 필요
- **Effort**: L (3-4일)
- **Status**: BACKLOG

### Feature: 통계 수집
- **Scope**: 단축 URL 클릭 수/리다이렉트 추적
- **Description**: 사용자 프라이버시 고려하여 최소 데이터만 수집
- **Linked Spec**: 신규 작성 필요
- **Effort**: L
- **Status**: BACKLOG

---

## 해결된 이슈

- ✅ SDD/TDD 구조 구축 (2025-10-23)
- ✅ URL 인코딩/디코딩 기능 구현 (이전)
- ✅ QR 코드 생성 기능 구현 (이전)
- ✅ 전역 오류 핸들링 추가 (이전)

---

## 질문/의사결정 필요 사항

1. **모니터링 서비스**: Sentry 연동할지 로컬 로깅만 유지할지?
2. **다국어 지원**: 필수인가? i18n 라이브러리 선택?
3. **통계 데이터**: 서버 저장? 클라이언트 로컬스토리지?
4. **SEO**: 메타 태그/OG 이미지 추가 필요?
