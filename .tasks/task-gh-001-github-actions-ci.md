# Task GH-001: GitHub Actions CI/CD 파이프라인

**Linked Sprint**: `backlog.md` (현재 스프린트)

**Linked Spec**: GitHub Actions 자동화 파이프라인

**Effort**: M (2-3시간)

**Priority**: 🔴 HIGH (운영 필수)

**Status**: ✅ COMPLETED

---

## Goal

GitHub에서 자동으로 코드를 검증하고 테스트하는 CI/CD 파이프라인 구축

---

## Current State

GitHub Actions workflow 파일이 이미 존재하지만:
- ❌ npm audit 보안 검사 없음
- ❌ ESLint 검사 없음
- ❌ 커버리지 리포트 업로드 없음

---

## Solution Design

### 단계별 자동화 검증 (Sequential Quality Gates)

1. **보안 검사** (npm audit)
   - 의존성 취약점 검사
   - `audit-level=moderate` 설정으로 중간 이상 취약점만 실패

2. **코드 품질 검사** (ESLint)
   - TypeScript 린팅
   - 코드 스타일 검증

3. **테스트 실행** (Vitest)
   - 모든 테스트 실행
   - 커버리지 리포트 생성 (80% 이상 목표)

4. **빌드 검증** (Vite)
   - 번들 생성
   - 빌드 실패 감지

5. **아티팩트 업로드**
   - dist 폴더 (배포용)
   - coverage 폴더 (리포트용)

### Workflow 트리거

- **Push**: main, develop 브랜치에 push 시
- **Pull Request**: main, develop 브랜치로의 PR 생성/업데이트 시

---

## Steps

### 구현 (COMPLETED)

1. `.github/workflows/ci.yml` 업데이트
2. 모든 검증 단계 추가:
   - npm audit --audit-level=moderate
   - npm run lint
   - npm test -- --coverage
   - npm run build

### 검증 (COMPLETED)

```bash
# 로컬에서 전체 파이프라인 시뮬레이션
npm audit --audit-level=moderate     # ✅ 0 vulnerabilities
npm run lint                          # ✅ 0 errors
npm test -- --coverage               # ✅ 42/42 tests, 93.22% coverage
npm run build                         # ✅ built in 121ms
```

---

## Definition of Done

### Mandatory
- [x] `.github/workflows/ci.yml` 파일 존재
- [x] npm audit 검사 포함
- [x] ESLint 검사 포함
- [x] 테스트 + 커버리지 실행
- [x] 빌드 검증 포함
- [x] main, develop 브랜치 트리거 설정
- [x] PR 검증 활성화
- [x] 아티팩트 업로드 설정

### Optional
- [ ] Status checks 설정 (branch protection)
- [ ] Slack 알림 통합
- [ ] 커버리지 리포트 자동 코멘트

---

## Files Modified

| 파일 | 변경 유형 | 상세 |
|------|---------|------|
| `.github/workflows/ci.yml` | 📝 UPDATE | 보안 검사, 린팅, 커버리지 추가 |

---

## Acceptance Criteria

### AC-1: 모든 검증 단계 포함
```gherkin
GIVEN .github/workflows/ci.yml 파일 존재
WHEN GitHub Actions 실행
THEN 다음 단계들이 순차적으로 실행됨:
- npm audit
- npm run lint
- npm test -- --coverage
- npm run build
```

### AC-2: 성공 조건
```gherkin
GIVEN 모든 코드가 품질 기준 충족
WHEN 파이프라인 실행
THEN 모든 검사가 성공하고 녹색(✓) 표시됨
```

### AC-3: PR 검증
```gherkin
GIVEN GitHub에 PR 생성
WHEN main 또는 develop 브랜치로 PR
THEN 자동으로 CI 파이프라인 실행됨
AND PR 체크 상태 표시됨
```

### AC-4: 아티팩트 업로드
```gherkin
GIVEN 빌드 성공
WHEN GitHub Actions 완료
THEN dist 폴더와 coverage 폴더가 업로드됨
AND 웹에서 다운로드 가능
```

---

## Workflow Details

### Triggers
```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
```

### Jobs
- **quality-checks**: 모든 검증 및 테스트 실행

### Steps
1. Checkout (코드 다운로드)
2. Node.js 20 설정
3. npm 캐시 (빠른 설치)
4. npm ci (의존성 설치)
5. npm audit (보안)
6. npm run lint (코드 품질)
7. npm test -- --coverage (테스트 + 커버리지)
8. npm run build (빌드)
9. 아티팩트 업로드

---

## Performance

### 실행 시간
- 예상: 2-3분
- 캐시 활용 시: 1-2분

### 자원 사용
- Runner: ubuntu-latest
- Node.js: v20
- npm cache: 활성화

---

## Monitoring & Maintenance

### 체크할 사항
- PR에서 체크 상태 확인
- 실패 시 로그 분석
- 아티팩트 다운로드 확인

### 문제 해결
- **npm audit 실패**: 의존성 업데이트 필요
- **Lint 실패**: `npm run format`으로 자동 수정
- **테스트 실패**: 코드 로직 검토
- **빌드 실패**: 타입 에러 확인

---

## Security Considerations

### 권한
- `permissions.contents: read` - 읽기 권한만 필요
- 빌드 후 배포 권한은 별도 설정 필요

### 보안 검사
- npm audit: moderate 수준의 취약점 차단
- 모든 의존성 자동 검증

---

## Next Steps

### 즉시 실행
1. 이 파일을 메인 브랜치에 커밋
2. GitHub 저장소 확인 > Actions 탭 확인
3. 첫 번째 실행 로그 확인

### 향후 개선
1. **Task GH-002**: GitHub Pages 배포 자동화
   - dist 폴더 자동 배포
   - 별도 workflow 필요

2. **Status checks**: branch protection 설정
   - PR 병합 전 필수 검사 설정

3. **알림**: Slack 또는 이메일 통합
   - 실패 알림 설정

---

## Trace & Links

- **Related**: Task GH-002 (GitHub Pages 배포)
- **Related**: Task DEV-001 (Pre-commit 훅)
- **Spec**: CI/CD 개선 스프린트 완료 로그

---

## Notes

- 모든 검증이 자동화되어 인적 오류 감소
- PR 단계에서 품질 관리로 main 브랜치 안정성 보장
- 아티팩트 저장으로 배포 시 빌드 재실행 불필요

---

## Checklist

### 완료 확인
- [x] CI 파이프라인 작성 완료
- [x] 로컬 검증 모두 통과
- [x] npm audit 통과 (0 vulnerabilities)
- [x] ESLint 통과 (0 errors)
- [x] 테스트 통과 (42/42)
- [x] 빌드 성공
- [x] 아티팩트 업로드 설정
- [x] Task 문서화 완료

**상태**: ✅ READY FOR MERGE
