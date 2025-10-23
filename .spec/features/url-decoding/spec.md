# URL 디코딩 (원본 URL 복원)

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

---

## Examples (Tabular)

| Case | Code | Expected Result | Notes |
|------|------|---|---|
| Valid decode | "ABC123" (인코딩된) | {url: "https://www.knue.ac.kr/..."} | 왕복 테스트 |
| Invalid code | "invalid" | {error: "잘못된 코드입니다."} | Sqids.decode([]) 반환 |
| Wrong length | "XYZ" (3개 미만 값) | {error: "잘못된 코드입니다."} | 배열 길이 ≠ 4 |
| Bad siteNum | code가 36을 디코드 | {error: "존재하지 않는 사이트 코드입니다."} | siteMapReverse 누락 |

---

## API (Summary)

```javascript
function decodeURL(code: string)
```

**Parameters**:
- `code` (string): Sqids로 인코딩된 단축 코드

**Returns**:
- Success: `{url: string}` - https://www.knue.ac.kr/로 시작하는 완전한 URL
- Failure: `{error: string}` - 한글 오류 메시지

**Errors**:
- `"잘못된 코드입니다."` - 코드 형식 오류 또는 배열 길이 ≠ 4
- `"존재하지 않는 사이트 코드입니다."` - siteMapReverse 누락

---

## Data & State

**Input Constraints**:
- code는 Sqids.decode() 호출로 배열 변환
- 배열 길이는 정확히 4 ([siteNum, key, bbsNo, nttNo])
- siteNum ∈ siteMapReverse 키

**Output Format**:
- URL: `https://www.knue.ac.kr/{site}/selectBbsNttView.do?key={key}&bbsNo={bbsNo}&nttNo={nttNo}`
- site: siteMapReverse[siteNum]

---

## Security

- **Domain Whitelisting**: 모든 반환 URL은 https://www.knue.ac.kr/로 제한 (app.js에서 검증)
- **No Injection**: URLSearchParams로 안전한 파라미터 인코딩

---

## Tracing

**Spec-ID**: `SPEC-URL-DEC-001`
**Trace-To**:
- `test/index.test.js` (lines 12-42, 50-54)
- `src/js/urlEncoder.js:decodeURL()` (lines 66-86)
