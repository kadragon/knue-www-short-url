# Task REFACTOR-004: 타입 검증 강화

**Linked Sprint**: `plan-refactor-code-quality.md`

**Linked Spec**: `.spec/features/url-encoding/api.md`

**Effort**: S (2-3시간)

**Priority**: 🟡 MEDIUM

**Status**: 📋 READY

---

## Goal

숫자 파라미터 검증을 강화하여 null, undefined, NaN, Infinity 등 엣지 케이스 처리

---

## Current State

**현재 검증 로직** (urlEncoder.js 라인 42):

```javascript
if ([key, bbsNo, nttNo].some(isNaN)) {
  return { error: "key, bbsNo, nttNo는 반드시 숫자여야 합니다." };
}
```

**문제점**:
- ❌ `isNaN(null)` → false (null이 넘어와도 체크 안됨)
- ❌ `isNaN(undefined)` → true (검증되지만 불명확)
- ❌ `isNaN(Infinity)` → false (무한대 허용)
- ❌ `isNaN("123")` → false ("123" 문자열 허용됨)

**테스트 코드에서 발견한 케이스**:
```javascript
// 현재: NaN 검증 테스트 3개 추가됨
it("should return an error when encoding with NaN bbsNo", () => {
  const invalidData = { ...originalData, bbsNo: NaN };
  const result = encodeURL(invalidData);
  expect(result.error).toBeDefined();
});
```

---

## Solution Design

### 1단계: `validators.js` 확장

```javascript
/**
 * 숫자 파라미터가 유효한지 검증
 * @param {number} value - 검증할 값
 * @returns {boolean} 유효한 숫자면 true
 *
 * 검증 항목:
 * - 타입: number 여야 함
 * - NaN 아님
 * - Infinity/-Infinity 아님
 * - 정수 또는 유효한 부동소수점
 */
export function isValidNumber(value) {
  if (typeof value !== 'number') {
    return false;
  }

  if (!isFinite(value)) {
    return false; // NaN, Infinity, -Infinity 모두 제외
  }

  return true;
}

/**
 * 숫자 배열의 모든 요소가 유효한 숫자인지 검증
 * @param {number[]} values - 검증할 값 배열
 * @returns {boolean} 모두 유효하면 true
 */
export function areAllValidNumbers(...values) {
  return values.every(isValidNumber);
}
```

### 2단계: `urlEncoder.js` 리팩토링

```javascript
import { isValidNumber, ERROR_MESSAGES } from "./validators.js";

export function encodeURL({ site, key, bbsNo, nttNo }) {
  const siteNum = siteMap[site];
  if (!siteNum) {
    return { error: `지원하지 않는 사이트입니다: ${site}` };
  }

  // 강화된 검증
  if (!isValidNumber(key) || !isValidNumber(bbsNo) || !isValidNumber(nttNo)) {
    return { error: ERROR_MESSAGES.INVALID_NUMERIC_PARAMS };
  }

  return { code: sqids.encode([siteNum, key, bbsNo, nttNo]) };
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
1. `validators.js`에 `isValidNumber()`, `areAllValidNumbers()` 함수 추가
2. `urlEncoder.js` 라인 42 검증 로직 업그레이드
3. 엣지 케이스 테스트 추가:
   - null 값
   - undefined 값
   - Infinity 값

```bash
npm test
# 예상: 모든 테스트 통과 (20개 이상)
```

### REFACTOR
- 검증 함수 명명 명확화
- 주석 개선

```bash
npm test && npm test -- --coverage
# 예상: 커버리지 ≥95%
```

---

## Definition of Done

### Mandatory
- [ ] `validators.js`에 `isValidNumber()` 함수 추가
- [ ] `validators.js`에 `areAllValidNumbers()` 함수 추가
- [ ] `urlEncoder.js` 검증 로직 업그레이드
- [ ] 엣지 케이스 테스트 3개 이상 추가:
  - [ ] null 검증
  - [ ] undefined 검증
  - [ ] Infinity 검증
- [ ] 모든 테스트 통과 (`npm test`)
- [ ] 커버리지 개선 (≥95%)

### Optional
- [ ] float 검증 (정수 강제 vs 부동소수점 허용)
- [ ] 음수 범위 검증

---

## Files to Modify

| 파일 | 변경 유형 | 라인 수 |
|------|---------|--------|
| `src/js/validators.js` | 📝 MODIFY | +15 |
| `src/js/urlEncoder.js` | 📝 MODIFY | -3 |
| `test/index.test.js` | 📝 ADD | +20 |

---

## Test Cases

```javascript
describe('Type Validation Edge Cases', () => {
  it('should reject null values', () => {
    const result = encodeURL({ site: 'www', key: null, bbsNo: 2, nttNo: 3 });
    expect(result.error).toBeDefined();
  });

  it('should reject undefined values', () => {
    const result = encodeURL({ site: 'www', key: undefined, bbsNo: 2, nttNo: 3 });
    expect(result.error).toBeDefined();
  });

  it('should reject Infinity', () => {
    const result = encodeURL({ site: 'www', key: Infinity, bbsNo: 2, nttNo: 3 });
    expect(result.error).toBeDefined();
  });

  it('should reject string numbers', () => {
    const result = encodeURL({ site: 'www', key: "123", bbsNo: 2, nttNo: 3 });
    expect(result.error).toBeDefined();
  });

  it('should accept valid integer', () => {
    const result = encodeURL({ site: 'www', key: 123, bbsNo: 456, nttNo: 789 });
    expect(result.code).toBeDefined();
  });
});
```

---

## Rollback Plan

```bash
git checkout HEAD -- src/js/urlEncoder.js src/js/validators.js
npm test
```

---

## Trace & Links

- **Spec**: `.spec/features/url-encoding/spec.md`
- **Tests**: `test/index.test.js`
- **Dependencies**: REFACTOR-001, REFACTOR-002 ✅
- **Related**: REFACTOR-003

---

## Notes

- `isFinite()`는 `isNaN()` + Infinity 검증을 동시에 처리
- typeof 체크 필수 (null은 typeof "object")
- 향후 정수 전용 vs 부동소수점 허용 정책 결정 필요
