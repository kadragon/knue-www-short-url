# QR 코드 생성

**Intent**: 인코딩된 단축 URL의 QR 코드를 생성하여 사용자에게 표시

**Scope**:
- In: 단축 URL 문자열
- Out: Canvas 요소에 QR 코드 렌더링 또는 오류 처리
- 의존성: qrcode.js 라이브러리

---

## Behaviour (GWT)

- **AC-1**: 유효한 URL로 QR 코드 생성
  ```gherkin
  GIVEN 단축 URL "https://knue.url.kr/?ABC123"
  WHEN QRCode.toCanvas() 호출
  THEN Canvas에 QR 이미지 렌더링됨, 콜백 error = null
  ```

- **AC-2**: QR 코드 크기는 300x300
  ```gherkin
  GIVEN 인코드 모드 활성화
  WHEN QR 생성
  THEN Canvas의 QR 코드 크기는 {width: 300}
  ```

- **AC-3**: 생성 실패 시 콘솔 오류만 기록 (사용자 알림 없음)
  ```gherkin
  GIVEN QRCode.toCanvas() 실패
  WHEN 콜백의 error 전달됨
  THEN console.error() 호출, 사용자 알림 없음
  ```

- **AC-4**: 디코드/기본 모드에서는 QR 코드 미생성
  ```gherkin
  GIVEN search 파라미터에 "=" 미포함 (디코드/기본 모드)
  WHEN 페이지 로드
  THEN QRCode.toCanvas() 호출 안 됨
  ```

---

## Examples (Tabular)

| Mode | URL | QR Generated | Canvas ID | Width |
|------|-----|---|---|---|
| Encode (success) | "https://knue.url.kr/?ABC123" | Yes | qrCanvas | 300 |
| Encode (failure) | valid but encode error | No | - | - |
| Decode | "?validCode" | No | - | - |
| Default | "" | No | - | - |

---

## API (Summary)

**Library**: qrcode.js (`npm install qrcode`)

```javascript
QRCode.toCanvas(canvasElement, url, options, callback)
```

**Parameters**:
- `canvasElement` (HTMLCanvasElement): DOM canvas 요소 (ID = "qrCanvas")
- `url` (string): 인코딩된 단축 URL
- `options` (object): `{width: 300}`
- `callback` (function): `(error) => void`

**Error Handling**:
- error ≠ null인 경우: console.error() 기록, 사용자 알림 미제공
- Canvas 요소 미존재: 런타임 오류 (명시적 검증 필요)

---

## Data & State

**Configuration**:
- Canvas ID: "qrCanvas" (고정)
- QR size: 300x300 (고정)
- Format: PNG (기본값)

**Lifecycle**:
- 인코드 모드에서만 생성
- 성공 여부와 관계없이 콘솔에만 기록
- 사용자 경험 방해 없음

---

## Tracing

**Spec-ID**: `SPEC-QR-001`
**Trace-To**:
- `test/main.test.js` (lines 82-100)
- `src/js/app.js:QRCode.toCanvas()` (lines 108-113)
