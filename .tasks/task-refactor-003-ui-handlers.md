# Task REFACTOR-003: 클립보드 & QR 함수 분리

**Linked Sprint**: `plan-refactor-code-quality.md`

**Linked Spec**: `.spec/features/url-encoding/api.md`

**Effort**: M (3-4시간)

**Priority**: 🟡 MEDIUM

**Status**: 📋 READY

---

## Goal

복잡한 UI 이벤트 핸들러 로직을 독립 함수로 분리하여 테스트 용이성 및 재사용성 향상

---

## Current State

**복잡한 이벤트 핸들러** (app.js 라인 90-106):

```javascript
link.addEventListener("click", (event) => {
  event.preventDefault();
  if (navigator.clipboard) {
    navigator.clipboard.writeText(shortUrl).then(
      () => {
        alert("클립보드에 복사되었습니다.");
      },
      () => {
        alert("클립보드 복사에 실패했습니다.");
      }
    );
  } else {
    alert(
      "자동 복사 기능이 지원되지 않는 환경입니다. 수동으로 복사해주세요."
    );
  }
});
```

**문제점**:
- ❌ 이벤트 핸들러가 34줄 (라인 90-106, 포함 QR 코드)
- ❌ Promise 체이닝이 복잡
- ❌ 에러 처리 및 UI 로직 혼재
- ❌ 테스트하기 어려움 (인라인 함수)
- ❌ QR 코드 생성 에러도 같은 섹션

**컨텍스트 (app.js 라인 108-113)**:
```javascript
QRCode.toCanvas(qrCanvas, shortUrl, { width: 300 }, (error) => {
  if (error) {
    console.error("오류: QR 코드 생성 실패:", error);
  }
});
```

---

## Solution Design

### 1단계: `src/js/uiHandlers.js` 생성

```javascript
import { ERROR_MESSAGES } from "./constants.js";

/**
 * 단축 URL을 클립보드에 복사하고 사용자 피드백 제공
 * @param {string} url - 복사할 URL
 * @returns {Promise<void>}
 */
export async function handleCopyToClipboard(url) {
  try {
    if (!navigator.clipboard) {
      alert(ERROR_MESSAGES.CLIPBOARD_NOT_SUPPORTED);
      return;
    }

    await navigator.clipboard.writeText(url);
    alert(ERROR_MESSAGES.CLIPBOARD_COPIED);
  } catch (error) {
    console.error("Clipboard error:", error);
    alert(ERROR_MESSAGES.CLIPBOARD_COPY_FAILED);
  }
}

/**
 * QR 코드를 Canvas에 생성
 * @param {HTMLCanvasElement} canvas - QR 코드를 그릴 canvas
 * @param {string} url - 인코딩할 URL
 * @returns {Promise<void>}
 */
export function handleGenerateQRCode(canvas, url) {
  return new Promise((resolve) => {
    import('qrcode').then(({ default: QRCode }) => {
      QRCode.toCanvas(canvas, url, { width: 300 }, (error) => {
        if (error) {
          console.error(ERROR_MESSAGES.QR_CODE_ERROR, error);
        }
        resolve(); // 에러 여부와 관계없이 resolve
      });
    });
  });
}

/**
 * 클릭 이벤트: 클립보드 복사
 * @param {string} url - 복사할 URL
 * @returns {Function} 클릭 이벤트 핸들러
 */
export function createCopyClickHandler(url) {
  return async (event) => {
    event.preventDefault();
    await handleCopyToClipboard(url);
  };
}
```

### 2단계: `app.js` 리팩토링

```javascript
import { handleCopyToClipboard, createCopyClickHandler, handleGenerateQRCode } from "./uiHandlers.js";

// Encode Mode에서 링크 생성 시 (라인 79-113)
if (result.code) {
  const shortUrl = `${window.location.origin}${window.location.pathname}?${result.code}`;
  const link = document.createElement("a");
  link.href = shortUrl;
  link.textContent = shortUrl.replace(/^https?:\/\//, "");
  resultDiv.appendChild(link);

  copyInfoDiv.textContent = "(주소를 클릭하면 클립보드에 복사됩니다.)";

  // 클립보드 복사 핸들러 연결 (라인 90-106 → 1줄로 단순화)
  link.addEventListener("click", createCopyClickHandler(shortUrl));

  // QR 코드 생성 (라인 108-113 → 1줄로 단순화)
  await handleGenerateQRCode(qrCanvas, shortUrl);
} else {
  resultDiv.innerText = `오류: ${result.error}`;
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
1. `src/js/uiHandlers.js` 생성
2. 3개 함수 구현:
   - `handleCopyToClipboard(url)`
   - `handleGenerateQRCode(canvas, url)`
   - `createCopyClickHandler(url)`
3. `app.js` 라인 90-106, 108-113 함수 호출로 대체

```bash
npm test
# 예상: 모든 테스트 통과 (17개)
```

### REFACTOR
- 함수 인라인 주석 정리
- 에러 처리 일관화
- Promise/async 패턴 명확화

```bash
npm test && npm test -- --coverage
# 예상: 커버리지 ≥94% (기존 라인 재사용)
```

---

## Definition of Done

### Mandatory
- [ ] `src/js/uiHandlers.js` 파일 생성
- [ ] 3개 UI 핸들러 함수 구현
  - [ ] `handleCopyToClipboard(url)`
  - [ ] `handleGenerateQRCode(canvas, url)`
  - [ ] `createCopyClickHandler(url)`
- [ ] `app.js` 라인 90-106 → `createCopyClickHandler()` 호출로 대체
- [ ] `app.js` 라인 108-113 → `handleGenerateQRCode()` 호출로 대체
- [ ] 모든 테스트 통과 (`npm test`)
- [ ] 커버리지 유지 (≥93%)

### Optional
- [ ] `uiHandlers.js`에 JSDoc 추가
- [ ] UI 핸들러 단위 테스트 작성
- [ ] 에러 핸들링 개선 (try-catch 명시화)

---

## Files to Modify

| 파일 | 변경 유형 | 라인 수 |
|------|---------|--------|
| `src/js/uiHandlers.js` | ✨ CREATE | ~60 |
| `src/js/app.js` | 📝 MODIFY | -18 (코드 간소화) |
| `test/main.test.js` | 📝 OPTIONAL | ±10 |

---

## Before & After Comparison

### Before (현재 - 34줄)
```javascript
link.addEventListener("click", (event) => {
  event.preventDefault();
  if (navigator.clipboard) {
    navigator.clipboard.writeText(shortUrl).then(
      () => {
        alert("클립보드에 복사되었습니다.");
      },
      () => {
        alert("클립보드 복사에 실패했습니다.");
      }
    );
  } else {
    alert("자동 복사 기능이 지원되지 않는 환경입니다. 수동으로 복사해주세요.");
  }
});

QRCode.toCanvas(qrCanvas, shortUrl, { width: 300 }, (error) => {
  if (error) {
    console.error("QR 코드 생성 실패:", error);
  }
});
```

### After (리팩토링 - 2줄)
```javascript
link.addEventListener("click", createCopyClickHandler(shortUrl));
await handleGenerateQRCode(qrCanvas, shortUrl);
```

**개선 효과**:
- ✅ 코드 라인 감소: 34줄 → 2줄 (-94%)
- ✅ 함수 가독성 향상
- ✅ 재사용성 증가 (다른 곳에서도 사용 가능)
- ✅ 테스트 용이성 향상

---

## Acceptance Criteria

### AC-1: 클립보드 기능 정상 작동
```gherkin
GIVEN 사용자가 단축 URL 클릭
WHEN handleCopyToClipboard() 실행
THEN navigator.clipboard.writeText() 호출됨
AND 성공 시 "클립보드에 복사되었습니다" alert
AND 실패 시 "클립보드 복사에 실패했습니다" alert
```

### AC-2: QR 코드 생성 정상 작동
```gherkin
GIVEN handleGenerateQRCode() 호출
WHEN QR 코드 생성 완료
THEN Canvas에 QR 코드 렌더링
AND 에러 시 console.error에 로깅 (alert 없음)
```

### AC-3: 코드 간소화 달성
```gherkin
GIVEN app.js의 현재 이벤트 핸들러 로직
WHEN uiHandlers.js 함수로 대체
THEN app.js 이벤트 관련 코드 라인 수 >70% 감소
AND 함수 추상화 수준 향상
```

### AC-4: 기존 테스트 통과
```gherkin
GIVEN 17개의 기존 테스트
WHEN npm test 실행
THEN 모든 테스트 통과
AND 클립보드/QR 관련 테스트 정상 작동
```

---

## Error Handling Strategy

| 상황 | 처리 방식 | 사용자 피드백 |
|------|---------|-----------|
| Clipboard API 미지원 | if 검사 | alert() |
| Clipboard 쓰기 실패 | catch 문 | alert() |
| QR 코드 생성 실패 | callback error | console.error만 |

> QR 코드 실패는 UI를 차단하지 않으므로 alert 생략

---

## Integration Points

### Task-001과의 연계
- ✅ `ERROR_MESSAGES` 상수 사용
- ✅ imports 경로: `import { ERROR_MESSAGES } from "./constants.js"`

### 기존 테스트와의 호환성
- 기존 테스트의 `QRCode.toCanvas` 모킹 유지
- 기존 테스트의 `navigator.clipboard` 모킹 유지
- 동작 동일성 보장

---

## Testing Strategy

### 단위 테스트 (uiHandlers.js)
```javascript
import { handleCopyToClipboard } from '../src/js/uiHandlers.js';

describe('UI Handlers', () => {
  it('should show success alert on clipboard copy', async () => {
    const mockClipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
    Object.defineProperty(navigator, 'clipboard', { value: mockClipboard });

    await handleCopyToClipboard('https://test.com');
    expect(window.alert).toHaveBeenCalledWith('클립보드에 복사되었습니다.');
  });
});
```

### 통합 테스트
- 기존 `main.test.js`의 클립보드/QR 테스트 그대로 실행
- 동작 동일성 확인

---

## Rollback Plan

```bash
# 1. 변경 사항 되돌리기
git checkout HEAD -- src/js/app.js
rm src/js/uiHandlers.js

# 2. 테스트 재확인
npm test
```

---

## Trace & Links

- **Spec**: `.spec/features/url-encoding/api.md`
- **Tests**: `test/main.test.js` (라인 133-197)
- **Dependencies**: REFACTOR-001 ✅
- **Related**: REFACTOR-002

---

## Notes

- async/await 패턴 사용으로 가독성 향상
- 클립보드 API 지원 여부 체크는 함수 내부에서 처리
- QR 코드 에러는 조용히 처리 (사용자 경험 우선)
- 향후 React/Vue 마이그레이션 시 쉽게 컴포넌트화 가능한 구조

