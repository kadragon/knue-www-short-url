# Task REFACTOR-005: JSDoc 및 인라인 주석 추가

**Linked Sprint**: `plan-refactor-code-quality.md`

**Effort**: S (1-2시간)

**Priority**: 🟢 LOW

**Status**: 📋 READY

---

## Goal

코드 가독성과 개발자 경험 향상을 위해 JSDoc과 인라인 주석 추가

---

## Current State

**JSDoc 커버리지 현황**:
- `app.js`: 0% (주석 거의 없음)
- `urlEncoder.js`: 60% (함수 JSDoc 있음)
- `validators.js`: 0% (신규 파일, 문서화 필요)
- `uiHandlers.js`: 0% (신규 파일, 문서화 필요)
- `knueSites.js`: 0% (정적 데이터)

---

## Solution Design

### 1. `app.js` JSDoc 추가

```javascript
/**
 * 애플리케이션 초기화 및 라우팅
 *
 * 3가지 모드:
 * 1. Decode Mode: ?<code> → 원본 URL로 리다이렉트
 * 2. Encode Mode: ?site=...&key=...&bbsNo=...&nttNo=... → 단축 URL + QR 코드 생성
 * 3. Default Mode: / → 기본 메시지 표시
 *
 * @event window.onload
 * @returns {void}
 */
window.onload = function () {
  // ... 로직
};
```

### 2. `validators.js` JSDoc 추가

모든 함수에 다음 항목 포함:
- `@param` - 파라미터 설명 및 타입
- `@returns` - 반환값 설명
- `@example` - 사용 예제
- `@throws` - 예외 발생 조건 (해당시)

### 3. `uiHandlers.js` JSDoc 추가

모든 함수에 다음 항목 포함:
- `@async` - async 함수 표시
- `@throws` - 가능한 에러 케이스
- `@example` - 사용 예제

### 4. `urlEncoder.js` JSDoc 확장

기존 JSDoc 개선:
```javascript
/**
 * site, key, bbsNo, nttNo 값을 단축 코드로 인코딩합니다.
 *
 * @param {Object} param - 인코딩할 URL 파라미터들
 * @param {string} param.site - 사이트명 (예: "www", "education" 등)
 *                                siteMap.js에 정의된 값이어야 함
 * @param {number} param.key - key 파라미터 값 (0 이상의 정수)
 * @param {number} param.bbsNo - 게시판 번호 (0 이상의 정수)
 * @param {number} param.nttNo - 게시글 번호 (0 이상의 정수)
 * @returns {Object} 성공 시 {code: string}, 실패 시 {error: string}
 * @throws {Error} 예외는 발생하지 않음 (항상 Object 반환)
 *
 * @example
 * // 성공 사례
 * encodeURL({ site: "www", key: 123, bbsNo: 456, nttNo: 789 })
 * // Returns: { code: "AbC123" }
 *
 * @example
 * // 실패 사례 - 지원하지 않는 사이트
 * encodeURL({ site: "invalid", key: 123, bbsNo: 456, nttNo: 789 })
 * // Returns: { error: "지원하지 않는 사이트입니다: invalid" }
 */
export function encodeURL({ site, key, bbsNo, nttNo }) {
  // ...
}
```

### 5. 복잡한 로직에 인라인 주석 추가

```javascript
// URL 파라미터 파싱 및 타입 변환
const searchParams = new URLSearchParams(search);
const params = Object.fromEntries(searchParams.entries());

// 파라미터 추출 및 숫자 변환
const site = params.site?.trim();
const key = parseInt(params.key, 10);    // 10진법 파싱
const bbsNo = parseInt(params.bbsNo, 10);
const nttNo = parseInt(params.nttNo, 10);

// 필수 파라미터 및 범위 검증
const validation = validateEncodeParams({ site, key, bbsNo, nttNo });
if (!validation.valid) {
  resultDiv.innerText = validation.error;
  return;
}

// KNUE 도메인 검증 (보안)
if (decodeResult.url && decodeResult.url.startsWith(VALIDATION.KNUE_DOMAIN)) {
  window.location.href = decodeResult.url;
}
```

---

## Steps

### 1. `validators.js` 문서화 (15분)
- 4개 함수 전체 JSDoc 작성
- 각 함수에 `@example` 추가

### 2. `uiHandlers.js` 문서화 (15분)
- 3개 함수 전체 JSDoc 작성
- 에러 처리 명시

### 3. `app.js` 문서화 (20분)
- `window.onload` 함수 JSDoc 작성
- 복잡한 로직 인라인 주석 추가
- 모드별 섹션 주석 강화

### 4. `urlEncoder.js` JSDoc 개선 (10분)
- 기존 JSDoc 내용 확인
- 필요시 추가 설명

### 5. `constants.js` 문서화 (10분)
- 상수 그룹별 주석 추가

---

## Definition of Done

### Mandatory
- [ ] `validators.js` 모든 함수에 JSDoc 추가 (4개)
- [ ] `uiHandlers.js` 모든 함수에 JSDoc 추가 (3개)
- [ ] `app.js` `window.onload` 함수 JSDoc 추가
- [ ] 복잡한 로직에 인라인 주석 추가 (≥5개)
- [ ] 총 JSDoc 블록 수: ≥12개
- [ ] 모든 테스트 통과

### Optional
- [ ] TypeScript JSDoc 스타일 (향후 TS 마이그레이션 대비)
- [ ] VSCode IntelliSense 호버 테스트

---

## Files to Modify

| 파일 | 변경 유형 | 추가 라인 수 |
|------|---------|----------|
| `src/js/validators.js` | 📝 MODIFY | +35 |
| `src/js/uiHandlers.js` | 📝 MODIFY | +40 |
| `src/js/app.js` | 📝 MODIFY | +30 |
| `src/js/constants.js` | 📝 MODIFY | +15 |
| `src/js/urlEncoder.js` | 📝 MODIFY | +5 |

---

## Example JSDoc Blocks

### validators.js
```javascript
/**
 * 숫자 파라미터가 유효한지 검증합니다.
 *
 * null, undefined, NaN, Infinity 등을 모두 제외합니다.
 *
 * @param {number} value - 검증할 값
 * @returns {boolean} 유효한 숫자면 true, 아니면 false
 *
 * @example
 * isValidNumber(123);        // true
 * isValidNumber(NaN);        // false
 * isValidNumber(Infinity);   // false
 * isValidNumber(null);       // false
 * isValidNumber("123");      // false
 */
export function isValidNumber(value) {
  if (typeof value !== 'number') return false;
  if (!isFinite(value)) return false;
  return true;
}
```

### uiHandlers.js
```javascript
/**
 * 단축 URL을 클립보드에 복사하고 사용자 피드백을 제공합니다.
 *
 * Clipboard API 지원 여부를 확인하고:
 * - 지원: 비동기로 복사 진행
 * - 미지원: 사용자에게 안내
 *
 * @async
 * @param {string} url - 복사할 URL
 * @returns {Promise<void>} 복사 완료 또는 피드백 표시
 * @throws {void} 예외를 throw하지 않음 (alert로 처리)
 *
 * @example
 * await handleCopyToClipboard('https://knue.url.kr/?abc123');
 */
export async function handleCopyToClipboard(url) {
  // ...
}
```

---

## Expected Improvement

| 항목 | 현재 | 예상 | 개선 |
|------|------|------|------|
| JSDoc 블록 수 | 6개 | 18개 | +300% |
| 인라인 주석 | 5개 | 15개 | +200% |
| 함수 문서화율 | 30% | 90% | +60% |

---

## Quality Gates

- [ ] JSDoc 문법 정상 (JSDoc 유효성)
- [ ] IDE 호버 정보 표시 정상
- [ ] 테스트 통과 (문서화는 코드 변경 아님)
- [ ] 가독성 개선 확인

---

## Rollback Plan

```bash
# 한 번에 되돌리기 (문서화만 제거되므로 간단)
git checkout HEAD -- src/js/*.js
npm test
```

---

## Notes

- 주석과 코드가 불일치하면 주석이 더 혼란스러움
- 리팩토링 완료 후 진행하여 주석이 최신 코드를 반영하도록 함
- `@example` 섹션은 실제 동작하는 코드 기반 작성
- VSCode + JSDoc 플러그인으로 hover 정보 자동 표시 가능

---

## Post-Task Checklist

- [ ] README.md 또는 CONTRIBUTING.md에 문서화 가이드 추가 (옵션)
- [ ] .editorconfig에 JSDoc 포맷팅 규칙 추가 (옵션)

