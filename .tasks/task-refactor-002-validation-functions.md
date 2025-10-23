# Task REFACTOR-002: 검증 로직 통합

**Linked Sprint**: `plan-refactor-code-quality.md`

**Linked Spec**: `.spec/features/url-encoding/spec.md`

**Effort**: M (3-4시간)

**Priority**: 🔴 HIGH

**Dependency**: REFACTOR-001 ✅

**Status**: 📋 READY

---

## Goal

분산된 검증 로직을 `validators.js` 모듈로 통합하여 코드 중복 제거 및 재사용성 향상

---

## Current State

**검증 로직 분산 현황** (app.js):

```javascript
// 라인 38-42: 코드 길이 검증 (decode 모드)
if (!code || code.length > VALIDATION.MAX_CODE_LENGTH) {
  alert(ERROR_MESSAGES.INVALID_CODE);
  window.location.href = "/";
  return;
}

// 라인 68-70: 필수 파라미터 검증 (encode 모드)
if (!site || isNaN(key) || isNaN(bbsNo) || isNaN(nttNo)) {
  resultDiv.innerText = "오류: 필수 파라미터가 누락되었거나 잘못되었습니다.";
  return;
}

// 라인 74-76: 범위 검증 (encode 모드)
if ([key, bbsNo, nttNo].some(n => n < VALIDATION.MIN_NUMERIC_VALUE || n > VALIDATION.MAX_NUMERIC_VALUE)) {
  resultDiv.innerText = "오류: 파라미터 값이 유효 범위를 벗어났습니다.";
  return;
}
```

**문제점**:
- ❌ 검증 로직이 UI 로직과 혼재
- ❌ 같은 패턴의 검증이 여러 곳에 반복
- ❌ 범위 검증 로직이 복잡 (one-liner)
- ❌ 테스트 불가능 (함수가 아닌 인라인 코드)
- ❌ urlEncoder.js와 app.js 간 검증 불일치 위험

---

## Solution Design

### 1단계: `src/js/validators.js` 생성

```javascript
import { VALIDATION, ERROR_MESSAGES } from "./constants.js";

/**
 * Decode 모드: 코드 길이 및 형식 검증
 * @param {string} code - Decode할 코드
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateDecodeCode(code) {
  if (!code) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_CODE };
  }

  if (code.length > VALIDATION.MAX_CODE_LENGTH) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_CODE_LENGTH };
  }

  return { valid: true };
}

/**
 * Encode 모드: 파라미터 필수값 검증
 * @param {Object} params - { site, key, bbsNo, nttNo }
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateEncodeParams(params) {
  const { site, key, bbsNo, nttNo } = params;

  if (!site || isNaN(key) || isNaN(bbsNo) || isNaN(nttNo)) {
    return { valid: false, error: ERROR_MESSAGES.MISSING_PARAMETERS };
  }

  return { valid: true };
}

/**
 * Encode 모드: 파라미터 범위 검증
 * @param {Object} params - { key, bbsNo, nttNo }
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateParameterRange(params) {
  const { key, bbsNo, nttNo } = params;
  const values = [key, bbsNo, nttNo];

  const isOutOfRange = values.some(
    n => n < VALIDATION.MIN_NUMERIC_VALUE || n > VALIDATION.MAX_NUMERIC_VALUE
  );

  if (isOutOfRange) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_PARAMETER_RANGE };
  }

  return { valid: true };
}

/**
 * 숫자 파라미터 타입 검증
 * @param {number} value - 검증할 값
 * @returns {boolean} 유효한 숫자면 true
 */
export function isValidNumber(value) {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}
```

### 2단계: `app.js` 리팩토링

```javascript
import { validateDecodeCode, validateEncodeParams, validateParameterRange } from "./validators.js";

// Decode Mode (라인 34-54)
if (search && !search.includes("=")) {
  const code = search.substring(1).trim();

  const validation = validateDecodeCode(code);
  if (!validation.valid) {
    alert(validation.error);
    window.location.href = "/";
    return;
  }

  const decodeResult = decodeURL(code);

  if (decodeResult.url && decodeResult.url.startsWith(VALIDATION.KNUE_DOMAIN)) {
    window.location.href = decodeResult.url;
  } else {
    alert(ERROR_MESSAGES.INVALID_CODE);
    window.location.href = "/";
  }
  return;
}

// Encode Mode (라인 57-118)
if (search && search.includes("=")) {
  const searchParams = new URLSearchParams(search);
  const params = Object.fromEntries(searchParams.entries());

  const site = params.site?.trim();
  const key = parseInt(params.key, 10);
  const bbsNo = parseInt(params.bbsNo, 10);
  const nttNo = parseInt(params.nttNo, 10);

  // 필수 파라미터 검증
  let validation = validateEncodeParams({ site, key, bbsNo, nttNo });
  if (!validation.valid) {
    resultDiv.innerText = validation.error;
    return;
  }

  // 범위 검증
  validation = validateParameterRange({ key, bbsNo, nttNo });
  if (!validation.valid) {
    resultDiv.innerText = validation.error;
    return;
  }

  // ... 나머지 로직 (URL 생성, QR 코드, 클립보드)
}
```

---

## Steps

### RED (테스트 선행)
```bash
# 현재 테스트 상태 확인
npm test

# 예상: 모든 테스트 통과 (17개)
```

### GREEN (최소 구현)
1. `src/js/validators.js` 생성
2. 4개 함수 구현: `validateDecodeCode()`, `validateEncodeParams()`, `validateParameterRange()`, `isValidNumber()`
3. `app.js` 라인 38-42, 68-70, 74-76 교체
4. imports 추가

```bash
npm test
# 예상: 모든 테스트 통과 (17개)
```

### REFACTOR
- 검증 함수 인라인 주석 정리
- 에러 반환 구조 일관화
- urlEncoder.js 검증 통일 (Task-004에서 수행)

```bash
npm test && npm test -- --coverage
# 예상: 커버리지 ≥94% (미커버 라인 감소)
```

---

## Definition of Done

### Mandatory
- [ ] `src/js/validators.js` 파일 생성
- [ ] 4개 검증 함수 구현
  - [ ] `validateDecodeCode(code)`
  - [ ] `validateEncodeParams(params)`
  - [ ] `validateParameterRange(params)`
  - [ ] `isValidNumber(value)`
- [ ] `app.js` 인라인 검증 코드 모두 함수 호출로 대체
- [ ] 검증 로직 작동 확인:
  - [ ] 코드 길이 초과 시 에러
  - [ ] 필수 파라미터 누락 시 에러
  - [ ] 범위 초과 시 에러
- [ ] 모든 테스트 통과 (`npm test`)
- [ ] 커버리지 개선 (≥94%)

### Optional
- [ ] `validators.js`에 JSDoc 추가
- [ ] 테스트 파일에서 validator 함수 직접 테스트

---

## Files to Modify

| 파일 | 변경 유형 | 라인 수 |
|------|---------|--------|
| `src/js/validators.js` | ✨ CREATE | ~50 |
| `src/js/app.js` | 📝 MODIFY | -15 (코드 간소화) |
| `test/main.test.js` | 📝 OPTIONAL | ±5 |

---

## Acceptance Criteria

### AC-1: 검증 함수 정상 작동
```gherkin
GIVEN 빈 코드 값
WHEN validateDecodeCode("")
THEN { valid: false, error: "잘못된 주소입니다." } 반환
```

### AC-2: 범위 검증
```gherkin
GIVEN 범위 초과 파라미터 { key: 9999999999, bbsNo: 2, nttNo: 3 }
WHEN validateParameterRange()
THEN { valid: false, error: "파라미터 값이 유효 범위..." } 반환
```

### AC-3: 코드 간소화
```gherkin
GIVEN app.js의 인라인 검증 로직
WHEN validators.js 함수로 대체
THEN app.js 라인 수 감소 (현재 122줄 → <110줄)
AND 함수 가독성 향상
```

### AC-4: 테스트 통과
```gherkin
GIVEN 17개의 기존 테스트
WHEN npm test 실행
THEN 모든 테스트 통과
AND 커버리지 94% 이상
```

---

## Integration Points

### Task-001과의 연계
- ✅ `constants.js`의 `VALIDATION` 및 `ERROR_MESSAGES` 사용
- ✅ imports 경로: `import { VALIDATION, ERROR_MESSAGES } from "./constants.js"`

### Task-003, 004와의 준비
- 검증 로직 일원화로 다음 Task 의존성 감소
- urlEncoder.js의 검증도 같은 함수 사용 가능하도록 설계

---

## Testing Strategy

### 단위 테스트 (validators.js 직접 테스트)
```javascript
import { validateDecodeCode } from '../src/js/validators.js';

describe('Validators', () => {
  it('should reject empty code', () => {
    const result = validateDecodeCode('');
    expect(result.valid).toBe(false);
  });
});
```

### 통합 테스트 (app.js와의 호환성)
```javascript
// main.test.js에서 기존 테스트 재실행
// 동작 동일성 확인
```

---

## Rollback Plan

```bash
# 1. 변경 사항 되돌리기
git checkout HEAD -- src/js/app.js
rm src/js/validators.js

# 2. 테스트 재확인
npm test
```

---

## Trace & Links

- **Spec**: `.spec/features/url-encoding/spec.md`
- **Tests**: `test/main.test.js` (라인 113-131), `test/index.test.js`
- **Dependencies**: REFACTOR-001 ✅
- **Related**: REFACTOR-003, REFACTOR-004

---

## Notes

- 검증 함수는 **순수 함수** (부작용 없음): 에러 메시지만 반환, alert/redirect 안함
- 반환 구조 통일: `{ valid: boolean, error?: string }`로 일관화
- 숫자 범위 검증에 `isFinite()` 포함 (Infinity 체크)
- 향후 타입스크립트 전환 시 쉽게 타입 정의 가능한 구조

