# 백로그

## 현재 상태
- ✅ 모든 핵심 기능 완료 (인코딩, 디코딩, QR 코드)
- ✅ 테스트 커버리지 93.22% (목표: 80%)
- ✅ TypeScript 마이그레이션 완료
- ✅ ESLint + Prettier 설정 완료
- ✅ 테스트 커버리지 리포트 설정 완료
- ✅ npm audit 통과 (0 vulnerabilities)
- ✅ SDD/TDD 문서화 완료

---

## 현재 스프린트: GitHub Actions 및 배포 자동화

**Priority**: 🔴 HIGH (운영 필수)

### Task GH-001: GitHub Actions CI/CD 파이프라인
- **Scope**: 자동화된 코드 검증 및 테스트
- **Description**:
  - `.github/workflows/ci.yml` 생성
  - npm audit, lint, test, build 자동 실행
  - PR 및 push 시 자동 검증
- **Effort**: M (2-3시간)
- **Priority**: 🔴 HIGH
- **Status**: 📋 READY

### Task GH-002: GitHub Pages 배포 자동화
- **Scope**: 자동화된 배포
- **Description**:
  - Actions에서 dist 폴더 배포
  - GitHub Pages 설정
  - 자동 도메인 설정
- **Effort**: S (1-2시간)
- **Priority**: 🟡 MEDIUM
- **Status**: 📋 READY

### Task DEV-001: Pre-commit 훅 설정
- **Scope**: 개발자 경험 개선
- **Description**:
  - husky + lint-staged 설치
  - 커밋 전 자동 lint/format
  - 로컬 검증 강화
- **Effort**: S (1-2시간)
- **Priority**: 🟡 MEDIUM
- **Status**: BACKLOG

---

## ✅ 완료된 스프린트: CI/CD 개선

**Completion Log**: `.tasks/log-ci-cd-completion.md`

### ✅ Task CI-001: npm audit 자동 검사
- **Status**: ✅ COMPLETED
- **Results**: 0 vulnerabilities found

### ✅ Task CI-002: ESLint + Prettier 설정
- **Status**: ✅ COMPLETED
- **Files**: `.prettierrc.json`, `.eslintrc`, `.prettierignore`
- **Scripts**: `npm run lint`, `npm run format`

### ✅ Task CI-003: 테스트 커버리지 리포트
- **Status**: ✅ COMPLETED
- **Results**: 93.22% coverage (target: 80%)
- **Config**: `vite.config.ts` coverage 설정

### ✅ Task CI-004: TypeScript 마이그레이션
- **Status**: ✅ COMPLETED (PR #9 merged)
- **Results**: All 42 tests passing, full type safety

---

## ✅ 완료된 리팩토링 작업들 (코드 품질 개선 스프린트)
- [x] REFACTOR-001: 에러 메시지 상수화 ✅
- [x] REFACTOR-002: 검증 함수 통합 ✅
- [x] REFACTOR-003: UI 핸들러 분리 ✅
- [x] REFACTOR-004: 타입 검증 강화 ✅
- [x] REFACTOR-005: 문서화 추가 ✅

---

## 대기 중인 작업 (우선순위 낮음)

### Enhancement: 에러 처리 개선
- **Scope**: 비결정적 오류 상황 처리
- **Description**: 현재는 console.error만 사용, Sentry 같은 모니터링 서비스 연동 고려
- **Effort**: M (1-2일)
- **Status**: BACKLOG

### Enhancement: 성능 최적화
- **Scope**: 번들 크기 감소
- **Description**: 현재 38.94 KB, qrcode.js 제거 옵션 검토 (별도 서버로 생성)
- **Effort**: M
- **Status**: BACKLOG

### Feature: 다국어 지원 (i18n)
- **Scope**: 영어/중국어/일본어 지원
- **Description**: 모든 사용자 메시지 `intl` 라이브러리로 국제화
- **Effort**: L (2-3일)
- **Status**: BACKLOG

### Feature: URL 유효기간 설정
- **Scope**: 단축 URL 만료 기능
- **Description**: localStorage 또는 서버에 생성 시간 저장, 유효기간 초과 시 오류
- **Effort**: L (3-4일)
- **Status**: BACKLOG

### Feature: 통계 수집
- **Scope**: 단축 URL 클릭 수/리다이렉트 추적
- **Description**: 사용자 프라이버시 고려하여 최소 데이터만 수집
- **Effort**: L
- **Status**: BACKLOG

---

## 해결된 이슈

- ✅ SDD/TDD 구조 구축 (2025-10-23)
- ✅ 코드 품질 개선 스프린트 (2025-10-23)
- ✅ CI/CD 개선 스프린트 (2025-10-23)
- ✅ URL 인코딩/디코딩 기능 구현 (이전)
- ✅ QR 코드 생성 기능 구현 (이전)
- ✅ 전역 오류 핸들링 추가 (이전)

---

## 질문/의사결정 필요 사항

1. **GitHub Pages 배포**: 도메인 설정할지? (기본 도메인 사용 vs 커스텀 도메인)
2. **모니터링 서비스**: Sentry 연동할지 로컬 로깅만 유지할지?
3. **다국어 지원**: 필수인가? i18n 라이브러리 선택?
4. **통계 데이터**: 서버 저장? 클라이언트 로컬스토리지?
5. **SEO**: 메타 태그/OG 이미지 추가 필요?
