# 백로그

## 현재 상태
- 모든 핵심 기능 완료 (인코딩, 디코딩, QR 코드)
- 테스트 커버리지 > 80%
- SDD/TDD 문서화 완료

---

## 현재 스프린트: 코드 품질 개선

**Sprint Plan**: `.tasks/plan-refactor-code-quality.md`

### Task REFACTOR-001: 에러 메시지 상수화 ✅ READY
- **Spec**: `.tasks/task-refactor-001-error-messages.md`
- **Status**: 📋 READY
- **Effort**: S (2-3시간)

### Task REFACTOR-002: 검증 함수 통합 ✅ READY
- **Spec**: `.tasks/task-refactor-002-validation-functions.md`
- **Status**: 📋 READY
- **Effort**: M (3-4시간)

### Task REFACTOR-003: UI 핸들러 분리 ✅ READY
- **Spec**: `.tasks/task-refactor-003-ui-handlers.md`
- **Status**: 📋 READY
- **Effort**: M (3-4시간)

### Task REFACTOR-004: 타입 검증 강화 ✅ READY
- **Spec**: `.tasks/task-refactor-004-type-validation.md`
- **Status**: 📋 READY
- **Effort**: S (2-3시간)

### Task REFACTOR-005: 문서화 추가 ✅ READY
- **Spec**: `.tasks/task-refactor-005-documentation.md`
- **Status**: 📋 READY
- **Effort**: S (1-2시간)

---

## 다음 스프린트: CI/CD 개선

### Task CI-001: npm audit 자동 검사 추가
- **Scope**: 의존성 보안 검사 추가
- **Description**: CI/CD 파이프라인에 `npm audit` 단계 추가, 취약점 자동 감지
- **Linked Spec**: `.spec/ci-cd/npm-audit.md` (작성 필요)
- **Effort**: S (1-2시간)
- **Status**: BACKLOG
- **Priority**: 🔴 HIGH (보안)

### Task CI-002: ESLint + Prettier 설정
- **Scope**: 린팅 및 포맷팅 자동화
- **Description**:
  - ESLint + TypeScript 플러그인 설정
  - Prettier 포맷팅 규칙 정의
  - `package.json`에 `lint`, `format` 스크립트 추가
  - CI에서 린트 체크 추가
- **Linked Spec**: `.spec/ci-cd/eslint-prettier.md` (작성 필요)
- **Effort**: M (3-4시간)
- **Status**: BACKLOG
- **Priority**: 🟡 MEDIUM (코드 품질)

### Task CI-003: 테스트 커버리지 리포트
- **Scope**: 커버리지 추적 및 리포트 생성
- **Description**:
  - Vitest 커버리지 플러그인 설정
  - CI에서 커버리지 리포트 생성
  - `codecov` 또는 `coveralls` 연동 (선택)
  - 커버리지 임계값 설정 (80% 유지)
- **Linked Spec**: `.spec/ci-cd/coverage-report.md` (작성 필요)
- **Effort**: M (2-3시간)
- **Status**: BACKLOG
- **Priority**: 🟡 MEDIUM (신뢰도)

### Task CI-004: TypeScript 마이그레이션
- **Scope**: 타입 안전성 확보
- **Description**:
  - TypeScript 설정 및 프로젝트 마이그레이션
  - 기존 `.js` 파일을 `.ts`로 변환
  - 타입 정의 작성
  - CI에서 `tsc --noEmit` 타입 체크 추가
- **Linked Spec**: `.spec/ci-cd/typescript.md` (작성 필요)
- **Effort**: L (3-4일)
- **Status**: BACKLOG
- **Priority**: 🟢 LOW (선택사항)

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
