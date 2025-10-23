# Task REFACTOR-001: 에러 메시지 상수화

**Linked Sprint**: `plan-refactor-code-quality.md`

**Linked Spec**: `.spec/features/url-encoding/` & `.spec/features/url-decoding/`

**Effort**: S (2-3시간)

**Priority**: 🔴 HIGH

**Status**: 📋 READY

---

## Goal

현재 하드코딩된 에러 메시지들을 단일 상수 객체로 관리하여 유지보수성 향상

---

## Current State

**에러 메시지 분산 현황**:

```javascript
// app.js 라인 39
alert("잘못된 주소입니다.");

// app.js 라인 50
alert("잘못된 주소입니다.");

// app.js 라인 69
resultDiv.innerText = "오류: 필수 파라미터가 누락되었거나 잘못되었습니다.";

// app.js 라인 75
resultDiv.innerText = "오류: 파라미터 값이 유효 범위를 벗어났습니다.";

// app.js 라인 95, 98, 103
alert("클립보드에 복사되었습니다.");
alert("클립보드 복사에 실패했습니다.");
alert("자동 복사 기능이 지원되지 않는 환경입니다. 수동으로 복사해주세요.");

// urlEncoder.js 라인 40
return { error: `지원하지 않는 사이트입니다: ${site}` };

// urlEncoder.js 라인 43
return { error: "key, bbsNo, nttNo는 반드시 숫자여야 합니다." };

// urlEncoder.js 라인 69
return { error: "잘못된 코드입니다." };

// urlEncoder.js 라인 75
return { error: "존재하지 않는 사이트 코드입니다." };
```

**문제점**:
- ❌ 메시지 중복 (예: "잘못된 주소입니다" 2번)
- ❌ 유지보수 어려움 (여러 파일에 분산)
- ❌ i18n 미지원 (다국어 확장 불가)
- ❌ 오타 위험

---

## Solution Design

### 1단계: `src/js/constants.js` 생성

```javascript
export const ERROR_MESSAGES = {
  // Decode errors
  INVALID_CODE: "잘못된 주소입니다.",
  INVALID_CODE_FORMAT: "잘못된 코드입니다.",
  UNKNOWN_SITE_CODE: "존재하지 않는 사이트 코드입니다.",

  // Encode errors
  MISSING_PARAMETERS: "오류: 필수 파라미터가 누락되었거나 잘못되었습니다.",
  INVALID_CODE_LENGTH: "오류: 코드 길이가 너무 깁니다.",
  INVALID_PARAMETER_RANGE: "오류: 파라미터 값이 유효 범위를 벗어났습니다.",
  UNSUPPORTED_SITE: (site) => `지원하지 않는 사이트입니다: ${site}`,
  INVALID_NUMERIC_PARAMS: "key, bbsNo, nttNo는 반드시 숫자여야 합니다.",

  // Clipboard messages
  CLIPBOARD_COPIED: "클립보드에 복사되었습니다.",
  CLIPBOARD_COPY_FAILED: "클립보드 복사에 실패했습니다.",
  CLIPBOARD_NOT_SUPPORTED: "자동 복사 기능이 지원되지 않는 환경입니다. 수동으로 복사해주세요.",

  // QR code messages
  QR_CODE_ERROR: "QR 코드 생성 실패:",
};

export const VALIDATION = {
  MAX_CODE_LENGTH: 50,
  MAX_NUMERIC_VALUE: 999999999,
  MIN_NUMERIC_VALUE: 0,
  KNUE_DOMAIN: 'https://www.knue.ac.kr/'
};
```

### 2단계: `app.js` 업데이트

```javascript
import { ERROR_MESSAGES, VALIDATION } from "./constants.js";

// 라인 39-40 리팩토링
if (!code || code.length > VALIDATION.MAX_CODE_LENGTH) {
  alert(ERROR_MESSAGES.INVALID_CODE);
  window.location.href = "/";
  return;
}
```

### 3단계: `urlEncoder.js` 업데이트

```javascript
import { ERROR_MESSAGES } from "./constants.js";

export function encodeURL({ site, key, bbsNo, nttNo }) {
  const siteNum = siteMap[site];
  if (!siteNum) {
    return { error: ERROR_MESSAGES.UNSUPPORTED_SITE(site) };
  }
  if ([key, bbsNo, nttNo].some(isNaN)) {
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

# 예상: 모든 테스트 통과 (8개)
```

### GREEN (최소 구현)
1. `src/js/constants.js` 생성
2. `ERROR_MESSAGES` & `VALIDATION` 객체 정의
3. `app.js`에서 에러 메시지 → `ERROR_MESSAGES.XXX` 치환
4. `urlEncoder.js`에서 에러 메시지 → `ERROR_MESSAGES.XXX` 치환

```bash
npm test
# 예상: 모든 테스트 통과 (변경 없음, 동작 동일)
```

### REFACTOR
- 불필요한 주석 정리
- `VALIDATION` 객체도 활용하기 (기존 하드코딩된 값들)

```bash
npm test && npm test -- --coverage
# 예상: 커버리지 93.75% 이상 유지
```

---

## Definition of Done

### Mandatory
- [ ] `src/js/constants.js` 파일 생성 및 `ERROR_MESSAGES` 정의
- [ ] `src/js/constants.js` 파일 생성 및 `VALIDATION` 정의
- [ ] `app.js` 모든 하드코딩 메시지 → 상수 대체
- [ ] `urlEncoder.js` 모든 하드코딩 메시지 → 상수 대체
- [ ] 모든 테스트 통과 (`npm test`)
- [ ] 커버리지 유지 (≥93%)
- [ ] 0개의 린팅 에러 (`npm run lint` if available)

### Optional
- [ ] `constants.js`에 JSDoc 추가
- [ ] 테스트 파일에서 상수 참조 (하드코딩 제거)

---

## Files to Modify

| 파일 | 변경 유형 | 라인 수 |
|------|---------|--------|
| `src/js/constants.js` | ✨ CREATE | ~30 |
| `src/js/app.js` | 📝 MODIFY | -20 |
| `src/js/urlEncoder.js` | 📝 MODIFY | -10 |
| `test/main.test.js` | 📝 OPTIONAL | ±0 |
| `test/index.test.js` | 📝 OPTIONAL | ±0 |

---

## Acceptance Criteria

### AC-1: 상수 파일 정상 생성
```gherkin
GIVEN src/js/constants.js 파일이 없을 때
WHEN Task 실행 완료
THEN ERROR_MESSAGES 객체가 8개 이상의 메시지 포함
AND VALIDATION 객체가 3개 이상의 값 포함
```

### AC-2: 모든 에러 메시지 대체됨
```gherkin
GIVEN 기존 app.js에 5개의 하드코딩 메시지
WHEN app.js 리팩토링 완료
THEN 모든 메시지가 ERROR_MESSAGES.XXX 형태로 대체됨
AND 중복 메시지(예: "잘못된 주소") 제거됨
```

### AC-3: 테스트 통과
```gherkin
GIVEN 17개의 존재하는 테스트
WHEN npm test 실행
THEN 모든 17개 테스트 통과
AND 커버리지 93.75% 이상 유지
```

### AC-4: 동작 변화 없음
```gherkin
GIVEN 사용자가 잘못된 코드 입력
WHEN 디코드 시도
THEN 동일한 alert 메시지 표시됨
AND 동일한 리다이렉트 동작
```

---

## Rollback Plan

만약 Task 실패 시:

```bash
# 1. 이전 커밋으로 복구
git revert <commit-hash>

# 2. 또는 변경 파일만 복구
git checkout HEAD -- src/js/app.js src/js/urlEncoder.js
rm src/js/constants.js

# 3. 테스트 재확인
npm test
```

---

## Trace & Links

- **Spec**: `.spec/features/url-encoding/spec.md`, `.spec/features/url-decoding/spec.md`
- **Tests**: `test/main.test.js` (라인 60-100), `test/index.test.js`
- **Related**: REFACTOR-002 (검증 함수 통합)

---

## Notes

- 함수형 메시지 (예: `UNSUPPORTED_SITE(site)`)는 동적 값 포함을 위함
- `VALIDATION` 상수는 향후 Task-002에서 활용됨
- 메시지 다국어화를 대비하여 구조 단순 유지

