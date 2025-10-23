# URL 인코딩 (단축 URL 생성)

**Intent**: KNUE 게시판 URL의 파라미터(site, key, bbsNo, nttNo)를 짧은 단축 코드로 변환

**Scope**:
- In: site명, key, bbsNo, nttNo (4개 파라미터)
- Out: 3자 이상의 단축 코드 또는 오류 메시지
- 의존성: Sqids (reversible encoding), knueSites.js (사이트 매핑)

---

## Behaviour (GWT)

- **AC-1**: 유효한 사이트명과 숫자 파라미터가 주어지면 단축 코드를 반환
  ```gherkin
  GIVEN 사이트명 "www", key 12345, bbsNo 678, nttNo 9012
  WHEN encodeURL() 호출
  THEN 3자 이상의 문자열 코드를 받고 오류는 없음
  ```

- **AC-2**: 지원하지 않는 사이트명이면 오류 반환
  ```gherkin
  GIVEN 사이트명 "invalid-site"
  WHEN encodeURL() 호출
  THEN {error: "지원하지 않는 사이트입니다: invalid-site"} 반환
  ```

- **AC-3**: 숫자가 아닌 파라미터 값이면 오류 반환
  ```gherkin
  GIVEN key = "abc" (문자)
  WHEN encodeURL() 호출
  THEN {error: "key, bbsNo, nttNo는 반드시 숫자여야 합니다."} 반환
  ```

- **AC-4**: 같은 입력은 항상 같은 코드를 생성 (결정적)
  ```gherkin
  GIVEN site="www", key=123, bbsNo=456, nttNo=789
  WHEN encodeURL() 호출 2회
  THEN 동일한 코드 반환
  ```

---

## Examples (Tabular)

| Case | site | key | bbsNo | nttNo | Expected Result | Note |
|------|------|-----|-------|-------|---|---|
| Valid encode | www | 12345 | 678 | 9012 | {code: "..."} | 모든 파라미터 정수 |
| Invalid site | invalid | 123 | 456 | 789 | {error: "..."} | siteMap에 없는 사이트 |
| Non-numeric | www | abc | 456 | 789 | {error: "..."} | key가 문자 |
| Edge case | www | 0 | 0 | 0 | {code: "..."} | 최소값 |
| Large numbers | www | 999999999 | 999999999 | 999999999 | {code: "..."} | 큰 수 |

---

## API (Summary)

```javascript
function encodeURL({ site, key, bbsNo, nttNo })
```

**Parameters**:
- `site` (string): 사이트명 (siteMap.js에 정의된 값)
- `key` (number): 0 이상의 정수
- `bbsNo` (number): 0 이상의 정수
- `nttNo` (number): 0 이상의 정수

**Returns**:
- Success: `{code: string}` - 3자 이상의 단축 코드
- Failure: `{error: string}` - 한글 오류 메시지

**Errors**:
- `"지원하지 않는 사이트입니다: {site}"` - 유효하지 않은 사이트
- `"key, bbsNo, nttNo는 반드시 숫자여야 합니다."` - 숫자 파라미터 검증 실패

---

## Data & State

**Immutable Data**:
- Sqids 인스턴스는 전역 싱글톤 (설정 불변)
- 알파벳: `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~` (66자)
- minLength: 3 (최소 코드 길이)
- blocklist: ["admin", "www", "api"] (피해야 할 단어)

**siteMap**:
- 36개 KNUE 서브도메인 → 숫자 ID 매핑
- Reverse map도 유지 (복호화 시 사용)

---

## Tracing

**Spec-ID**: `SPEC-URL-ENC-001`
**Trace-To**:
- `test/index.test.js` (lines 4-48)
- `src/js/urlEncoder.js:encodeURL()` (lines 37-46)
