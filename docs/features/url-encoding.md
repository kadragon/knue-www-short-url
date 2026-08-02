# URL 인코딩 (단축 URL 생성)

**Spec-ID**: `SPEC-URL-ENC-001`

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

- **AC-5**: 선택적 `expDays`를 주면 만료일(KST epoch day)을 포함한 5-요소 코드를 생성
  ```gherkin
  GIVEN site="www", key=123, bbsNo=456, nttNo=789, expDays=30
  WHEN encodeURL() 호출
  THEN {code, expiryEpochDay} 반환. expiryEpochDay = toKstEpochDay(now) + expDays
  ```
  `expDays`를 생략하면 기존과 동일하게 4-요소(만료 없음) 코드를 생성하므로,
  발급된 기존 단축 코드는 하위호환이 유지된다. 만료일 경계는 열람자의
  로컬 타임존이 아닌 Asia/Seoul(KST, 고정 +9시간)에 고정된다 — 코드는
  여러 수신자에게 공유되므로 날짜 경계가 모든 수신자에게 동일해야 한다.

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

## API

**Module**: `src/js/urlEncoder.js` — **Export**: `encodeURL` (named export)

```typescript
function encodeURL(
  param: {
    site: string;
    key: number;
    bbsNo: number;
    nttNo: number;
    expDays?: number; // 만료까지 남은 일수(1~3650). 생략 시 만료 없음(4-요소 코드).
  },
  now?: number // epoch ms, 테스트용 시계 고정 인자. 기본값 Date.now()
): { code?: string; error?: string; expiryEpochDay?: number }
```

**Parameters**:
- `site` (string): 사이트명 (siteMap.js에 정의된 값)
- `key` / `bbsNo` / `nttNo` (number): 0 이상의 정수
- `expDays` (number, optional): 만료까지 남은 일수 (1~3650). 생략 시 만료 없는
  레거시 4-요소 코드를 생성

**Returns**:
- Success: `{code: string}` - 3자 이상의 단축 코드. `expDays`를 준 경우
  `expiryEpochDay`(KST epoch day)도 함께 반환
- Failure: `{error: string}` - 한글 오류 메시지

**Errors**:
- `"지원하지 않는 사이트입니다: {site}"` - 유효하지 않은 사이트
- `"key, bbsNo, nttNo는 반드시 숫자여야 합니다."` - 숫자 파라미터 검증 실패
- `"오류: 유효기간은 1일에서 3650일 사이여야 합니다."` - `expDays`가 1~3650 범위를 벗어남 (validators.ts에서 검증)

### Input Validation

| Field | Type | Min | Max | Required | Notes |
|-------|------|-----|-----|----------|-------|
| site | string | 1 char | 20 chars | yes | siteMap 키 필수 |
| key | number | 0 | 999999999 | yes | 정수만 |
| bbsNo | number | 0 | 999999999 | yes | 정수만 |
| nttNo | number | 0 | 999999999 | yes | 정수만 |
| expDays | number | 1 | 3650 | no | 생략 시 만료 없음 |

### Error Contract

| Error | HTTP Status | Retryable | Notes |
|-------|-------------|-----------|-------|
| Invalid site | 400 | No | 사용자 입력 오류, 즉시 실패 |
| Non-numeric param | 400 | No | 입력값 타입 오류, 재시도 불가 |

### Performance SLO

- **Encoding latency**: < 5ms (Sqids O(n), n = 파라미터 개수 ≈ 4)
- **Throughput**: 1000+ encodes/sec on modern browser
- **Memory**: O(1) - 글로벌 Sqids 싱글톤 사용

### Dependencies

```json
{ "sqids": "^0.3.0" }
```

**Compatibility**: Node.js 14+, 모던 브라우저 (ES2020+)

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

## Acceptance / DoD

- [x] AC-1~4 구현
- [x] 모든 테스트 통과
- [x] 100% 라인 커버리지(핵심 함수)
- [x] JSDoc 주석
- [x] 오류 메시지 한글화

**Test Files**: `test/index.test.js` — encodeURL 테스트

---

## Tracing

**Trace-To**:
- `test/index.test.js` (lines 4-48)
- `src/js/urlEncoder.js:encodeURL()` (lines 37-46)
