# URL 디코딩 (원본 URL 복원)

**Spec-ID**: `SPEC-URL-DEC-001`

**Intent**: 단축 코드를 원본 KNUE URL로 복원

**Scope**:
- In: 단축 코드 (문자열)
- Out: 완전한 KNUE URL 또는 오류 메시지
- 의존성: Sqids (reversible decoding), knueSites.js (역매핑)

---

## Behaviour (GWT)

- **AC-1**: 유효한 단축 코드가 주어지면 원본 URL을 반환
  ```gherkin
  GIVEN 단축 코드 "ABC123"이 올바른 인코딩 결과
  WHEN decodeURL("ABC123") 호출
  THEN {url: "https://www.knue.ac.kr/..."} 반환, 오류 없음
  ```

- **AC-2**: 디코딩한 URL은 항상 KNUE 도메인
  ```gherkin
  GIVEN 유효한 단축 코드
  WHEN decodeURL() 호출
  THEN URL은 https://www.knue.ac.kr/ 로 시작
  ```

- **AC-3**: 잘못된 코드면 오류 반환
  ```gherkin
  GIVEN 단축 코드 "invalid"이 등록되지 않음
  WHEN decodeURL("invalid") 호출
  THEN {error: "잘못된 코드입니다."} 반환
  ```

- **AC-4**: 디코딩한 URL 파라미터는 인코딩 전과 동일
  ```gherkin
  GIVEN encodeURL({site, key, bbsNo, nttNo}) → code
  WHEN decodeURL(code) 호출
  THEN URL에 key, bbsNo, nttNo 파라미터 정확히 포함
  ```

- **AC-5**: 존재하지 않는 사이트 코드면 오류
  ```gherkin
  GIVEN 디코딩된 사이트 ID가 siteMapReverse에 없음
  WHEN decodeURL() 호출
  THEN {error: "존재하지 않는 사이트 코드입니다."} 반환
  ```

- **AC-6**: 만료일이 지난 코드는 만료 오류를 반환 (KST 기준)
  ```gherkin
  GIVEN 5-요소 코드([siteNum, key, bbsNo, nttNo, expiryEpochDay])이며
        expiryEpochDay가 나타내는 KST 날짜가 이미 지남
  WHEN decodeURL(code, now) 호출
  THEN {error: "만료된 코드입니다."} 반환
  ```
  만료 여부는 `toKstEpochDay(now) > expiryEpochDay`로 판정한다. 날짜 경계는
  항상 Asia/Seoul(KST, 고정 +9시간, DST 없음)에 고정된다 — 단축 코드는
  여러 수신자에게 공유되므로, 열람자의 로컬 타임존으로 경계를 계산하면
  같은 코드가 사람마다 다른 날짜에 만료된 것처럼 보이게 된다.

---

## Examples (Tabular)

| Case | Code | Expected Result | Notes |
|------|------|---|---|
| Valid decode | "ABC123" (인코딩된) | {url: "https://www.knue.ac.kr/..."} | 왕복 테스트 (4-요소, 만료 없음) |
| Valid decode with expiry | 5-요소 코드, 만료일 미도래 | {url: "https://www.knue.ac.kr/..."} | 왕복 테스트 |
| Invalid code | "invalid" | {error: "잘못된 코드입니다."} | Sqids.decode([]) 반환 |
| Wrong length | "XYZ" (3개 미만 값) | {error: "잘못된 코드입니다."} | 배열 길이가 4도 5도 아님 |
| Bad siteNum | code가 36을 디코드 | {error: "존재하지 않는 사이트 코드입니다."} | siteMapReverse 누락 |
| Expired | 5-요소 코드, expiryEpochDay(KST)가 지남 | {error: "만료된 코드입니다."} | `toKstEpochDay(now) > expiryEpochDay` |

---

## API

```javascript
function decodeURL(code: string)
```

**Parameters**:
- `code` (string): Sqids로 인코딩된 단축 코드

**Returns**:
- Success: `{url: string}` - `https://www.knue.ac.kr/`로 시작하는 완전한 URL
- Failure: `{error: string}` - 한글 오류 메시지

**Errors**:
- `"잘못된 코드입니다."` - 코드 형식 오류 또는 배열 길이가 4(만료 없음)도 5(만료 포함)도 아님
- `"존재하지 않는 사이트 코드입니다."` - siteMapReverse 누락
- `"만료된 코드입니다."` - 5-요소 코드이며 KST 기준 만료일이 지남

---

## Data & State

**Input Constraints**:
- code는 Sqids.decode() 호출로 배열 변환
- 배열 길이는 4 ([siteNum, key, bbsNo, nttNo], 만료 없음) 또는 5
  ([siteNum, key, bbsNo, nttNo, expiryEpochDay], 만료 포함)
- siteNum ∈ siteMapReverse 키
- expiryEpochDay(있는 경우)는 KST(Asia/Seoul, 고정 +9시간) 기준 epoch day

**Output Format**:
- URL: `https://www.knue.ac.kr/{site}/selectBbsNttView.do?key={key}&bbsNo={bbsNo}&nttNo={nttNo}`
- site: siteMapReverse[siteNum]

---

## Security

- **Domain Whitelisting**: 모든 반환 URL은 `https://www.knue.ac.kr/`로 제한 (app.js에서 검증)
- **No Injection**: URLSearchParams로 안전한 파라미터 인코딩

---

## Acceptance / DoD

- [x] AC-1~5 구현
- [x] 모든 테스트 통과
- [x] 100% 라인 커버리지
- [x] 원본 파라미터 왕복 검증
- [x] 보안: URL 도메인 검증 (app.js 포함)

**Test Files**: `test/index.test.js` — decodeURL 테스트

---

## Tracing

**Trace-To**:
- `test/index.test.js` (lines 12-42, 50-54)
- `src/js/urlEncoder.js:decodeURL()` (lines 66-86)
