# 코드 품질 개선 스프린트

**Sprint Goal**: 코드 유지보수성과 가독성 향상을 위한 리팩토링

**Duration**: 2025-10-23 ~ 2025-10-25 (예상 2-3일)

**Status**: 📋 PLANNED

---

## 스프린트 개요

현재 커버리지 93.75% 달성 후, 코드 가독성과 유지보수성 개선에 집중합니다.
매직 넘버 제거, 중복 코드 통합, 검증 로직 단일화를 목표로 합니다.

---

## 작업 분해 (Task Breakdown)

### Task 1: 에러 메시지 상수화 (HIGH PRIORITY)
- **Linked Spec**: `.spec/features/url-encoding/` & `.spec/features/url-decoding/`
- **Effort**: S (2-3시간)
- **DoD Checklist**:
  - [ ] `src/js/constants.js` 생성 및 `ERROR_MESSAGES` 객체 정의
  - [ ] app.js와 urlEncoder.js의 모든 하드코딩된 에러 메시지 대체
  - [ ] 8개 이상의 에러 메시지 상수화
  - [ ] 모든 테스트 통과 (GREEN)
  - [ ] 커버리지 유지 (≥93%)
- **Files to Modify**:
  - ✨ `src/js/constants.js` (새 파일)
  - 📝 `src/js/app.js` (수정)
  - 📝 `src/js/urlEncoder.js` (수정)
  - 📝 `test/main.test.js` (수정 필요시)
- **Trace**: SPEC-error-messages, TEST-error-messages

---

### Task 2: 검증 로직 통합 (HIGH PRIORITY)
- **Linked Spec**: `.spec/features/url-encoding/spec.md`
- **Effort**: M (3-4시간)
- **DoD Checklist**:
  - [ ] `src/js/validators.js` 생성
  - [ ] `validateEncodeParams()` 함수 구현
  - [ ] `validateDecodeCode()` 함수 구현
  - [ ] app.js의 분산된 검증 로직 통합 (라인 38-42, 68-70, 74-76)
  - [ ] 모든 테스트 통과 (GREEN)
  - [ ] 커버리지 개선 (미커버 라인 감소)
- **Files to Modify**:
  - ✨ `src/js/validators.js` (새 파일)
  - 📝 `src/js/app.js` (리팩토링)
  - 📝 `test/main.test.js` (수정 필요시)
- **Trace**: SPEC-validation, TEST-validation

---

### Task 3: 클립보드 & QR 함수 분리 (MEDIUM PRIORITY)
- **Linked Spec**: `.spec/features/url-encoding/api.md`
- **Effort**: M (3-4시간)
- **DoD Checklist**:
  - [ ] `src/js/uiHandlers.js` 생성
  - [ ] `handleCopyToClipboard(url)` 함수 추출
  - [ ] `handleGenerateQRCode(canvas, url)` 함수 추출
  - [ ] app.js의 이벤트 리스너 콜백 간소화 (현재 34줄 → <10줄)
  - [ ] 모든 테스트 통과 (GREEN)
  - [ ] 함수 재사용성 향상
- **Files to Modify**:
  - ✨ `src/js/uiHandlers.js` (새 파일)
  - 📝 `src/js/app.js` (리팩토링)
  - 📝 `test/main.test.js` (수정 필요시)
- **Trace**: SPEC-ui-handlers, TEST-clipboard-qr

---

### Task 4: 타입 검증 강화 (MEDIUM PRIORITY)
- **Linked Spec**: `.spec/features/url-encoding/api.md`
- **Effort**: S (2-3시간)
- **DoD Checklist**:
  - [ ] `validateNumericParams()` 함수 구현 (null/undefined 포함)
  - [ ] urlEncoder.js 라인 42 검증 로직 개선
  - [ ] 엣지 케이스 테스트 추가:
    - [ ] null 값
    - [ ] undefined 값
    - [ ] 정수가 아닌 부동소수점
  - [ ] 모든 테스트 통과 (GREEN)
  - [ ] 커버리지 유지/개선
- **Files to Modify**:
  - 📝 `src/js/validators.js` (확장)
  - 📝 `src/js/urlEncoder.js` (수정)
  - 📝 `test/index.test.js` (테스트 추가)
- **Trace**: SPEC-type-validation, TEST-type-validation

---

### Task 5: JSDoc 및 인라인 주석 추가 (LOW PRIORITY)
- **Linked Spec**: (해당사항 없음)
- **Effort**: S (1-2시간)
- **DoD Checklist**:
  - [ ] app.js의 주요 함수에 JSDoc 추가
  - [ ] validators.js의 모든 함수 문서화
  - [ ] uiHandlers.js의 모든 함수 문서화
  - [ ] 복잡한 로직에 인라인 주석 추가
  - [ ] 최소 10개 이상의 JSDoc 블록 추가
- **Files to Modify**:
  - 📝 `src/js/app.js`
  - 📝 `src/js/validators.js`
  - 📝 `src/js/uiHandlers.js`
  - 📝 `src/js/urlEncoder.js`
- **Trace**: SPEC-documentation, TEST-N/A

---

## 예상 개선 효과

| 항목 | 현재 | 예상 | 개선도 |
|------|------|------|--------|
| 라인 당 평균 복잡도 | 3.2 | <2.5 | 📉 -22% |
| 중복 코드 | 5개 | 0개 | ✅ 제거 |
| 매직 넘버 | 8개 | 0개 | ✅ 제거 |
| JSDoc 커버리지 | 20% | 80% | 📈 +60% |
| 함수 평균 길이 | 15줄 | <10줄 | 📉 -33% |
| 테스트 커버리지 | 93.75% | ≥95% | 📈 |

---

## 실행 순서

```mermaid
Task 1 (에러메시지)
    ↓
Task 2 (검증함수)
    ↓
Task 3 (UI함수)
    ↓
Task 4 (타입검증)
    ↓
Task 5 (문서화)
```

**병렬 가능**: Task 2, 3, 4는 Task 1 완료 후 병렬 실행 가능

---

## 위험 및 완화 전략

| 위험 | 영향도 | 완화 전략 |
|------|--------|---------|
| 리팩토링 중 기존 기능 파괴 | 높음 | TDD: 테스트 먼저, 모든 테스트 GREEN 유지 |
| 새 함수의 테스트 누락 | 중간 | 모든 신규 함수에 단위 테스트 작성 의무화 |
| 롤백 필요시 시간 소모 | 중간 | 매 Task 완료 후 커밋, 짧은 사이클 유지 |

---

## 검토 체크리스트

### 코드 품질 (DoD)
- [ ] 모든 테스트 통과
- [ ] 커버리지 ≥93% 유지
- [ ] Linting 통과
- [ ] 중복 코드 제거됨
- [ ] 매직 넘버 상수화됨

### 문서화
- [ ] 각 Task의 `.spec` 파일 업데이트
- [ ] 트레이스 정보 추가 (SPEC-ID, TEST-ID)
- [ ] 변경 내역 기록

### 커밋 규칙
```
refactor: 에러 메시지 상수화

Trace: SPEC-error-messages, TEST-error-messages
Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## 메트릭 (완료 후 측정)

| 메트릭 | 목표 | 실제 | 상태 |
|--------|------|------|------|
| Task 1 완료도 | 100% | - | ⏳ |
| Task 2 완료도 | 100% | - | ⏳ |
| Task 3 완료도 | 100% | - | ⏳ |
| Task 4 완료도 | 100% | - | ⏳ |
| Task 5 완료도 | 100% | - | ⏳ |
| 최종 커버리지 | ≥95% | - | ⏳ |
| 총 소요 시간 | 2-3일 | - | ⏳ |

---

## Notes

- 각 Task 완료 후 실행 로그 작성: `.tasks/log-refactor-<date>.md`
- 예기치 않은 이슈 발생시 `.tasks/backlog.md`에 기록
- 스프린트 종료 후 회고 진행

---

## 다음 스프린트 예상

- 성능 최적화 (번들 크기, QR 코드 생성 속도)
- 접근성 개선 (ARIA 레이블, 키보드 네비게이션)
- 추가 기능 (다국어 지원, 통계 수집)
