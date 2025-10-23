# 코딩 패턴 & 재사용 가능 구조

## 1. 입력 검증 패턴

### ✅ Recommended Pattern

```javascript
// 1. 상수로 검증 규칙 정의
const VALIDATION = {
  MAX_CODE_LENGTH: 50,
  MAX_NUMERIC_VALUE: 999999999,
  MIN_NUMERIC_VALUE: 0,
  KNUE_DOMAIN: 'https://www.knue.ac.kr/'
};

// 2. 경계에서 검증 (함수 시작)
function processInput(code) {
  // 먼저 유형과 범위 검증
  if (!code || code.length > VALIDATION.MAX_CODE_LENGTH) {
    return { error: "Invalid code length" };
  }

  // 그 다음 비즈니스 로직
  // ...
}

// 3. 함수 반환 시 Union Type {success, error}
return { code: "..." }; // 성공
return { error: "..." }; // 실패
```

### ❌ Avoid

```javascript
// 글로벌 검증 상수 (재정의 위험)
window.MAX_LENGTH = 50;

// 함수 중간에 검증 (일관성 없음)
const code = input;
// ... 50줄 로직 ...
if (code.length > 50) throw Error();

// throw 사용 (콜백 호출 불가)
throw new Error("Invalid");
```

---

## 2. 오류 처리 패턴

### ✅ Recommended: 오류 객체 반환

```javascript
// 함수 반환값에 error 필드
function decodeURL(code) {
  const arr = sqids.decode(code);
  if (arr.length !== 4) {
    return { error: "잘못된 코드입니다." };
  }
  return { url: "https://..." };
}

// 호출부: 오류 객체 확인
const result = decodeURL(code);
if (result.error) {
  console.error(result.error);
} else {
  window.location.href = result.url;
}
```

### ❌ Avoid

```javascript
// throw 사용 (비동기 콜백에서 처리 어려움)
throw new Error("Invalid");

// 콘솔 로그로 오류 전파 (호출자 모름)
console.error("Something bad");
return undefined;

// 부분 결과 반환 (호출자 혼동)
return { url: null, error: null }; // 둘 다 null인 경우?
```

---

## 3. URL 안전 패턴

### ✅ Recommended: URL API + URLSearchParams

```javascript
// 완전한 URL 생성 (도메인 검증 자동)
const url = new URL(`https://www.knue.ac.kr/${site}/selectBbsNttView.do`);

// 파라미터 안전 인코딩
url.search = new URLSearchParams({
  key: 123,
  bbsNo: 456,
  nttNo: 789,
}).toString();

// 결과: https://www.knue.ac.kr/www/selectBbsNttView.do?key=123&bbsNo=456&nttNo=789
// XSS 방지, 올바른 인코딩 자동

// 리다이렉트 전 도메인 검증
if (url.href.startsWith('https://www.knue.ac.kr/')) {
  window.location.href = url.href;
}
```

### ❌ Avoid

```javascript
// 수동 문자열 조합 (오류, XSS 위험)
const url = `https://www.knue.ac.kr/${site}?key=${key}&nttNo=${nttNo}`;
// site = "../../../admin" 인 경우?

// 도메인 검증 없이 리다이렉트
window.location.href = userProvidedUrl;

// innerHTML 사용 (XSS)
resultDiv.innerHTML = `<a href="${url}">Click</a>`;
```

---

## 4. 데이터 매핑 패턴

### ✅ Recommended: 양방향 Map 유지

```javascript
// knueSites.js - 원본 데이터
export const siteMap = {
  www: 1,
  grad: 2,
  // ...
};

// 역매핑 자동 생성
export const siteMapReverse = Object.fromEntries(
  Object.entries(siteMap).map(([k, v]) => [v, k])
);

// 사용: 인코딩/디코딩 시 서로 다른 맵 사용
const siteNum = siteMap[site];        // 인코딩
const siteName = siteMapReverse[num]; // 디코딩
```

### ❌ Avoid

```javascript
// 역매핑 없음 (디코딩 불가)
const siteMap = { www: 1, grad: 2 };

// 수동 양방향 맵 (DRY 위반)
const siteMap = { www: 1, ... };
const siteMapReverse = { 1: 'www', ... };
// 둘이 불일치할 위험
```

---

## 5. 테스트 패턴

### ✅ Recommended: GWT + Table-driven

```javascript
// 유닛 테스트: 정상 + 오류 경로
describe("encodeURL", () => {
  // 정상 경로
  it("should encode valid parameters", () => {
    const result = encodeURL({ site: "www", key: 123, bbsNo: 456, nttNo: 789 });
    expect(result.code).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  // 오류 경로
  it("should return error for invalid site", () => {
    const result = encodeURL({ site: "invalid", key: 123, bbsNo: 456, nttNo: 789 });
    expect(result.error).toBeDefined();
    expect(result.code).toBeUndefined();
  });
});

// 통합 테스트: 왕복 검증
it("should preserve data in round-trip", () => {
  const original = { site: "www", key: 123, bbsNo: 456, nttNo: 789 };
  const encoded = encodeURL(original);
  const decoded = decodeURL(encoded.code);
  const url = new URL(decoded.url);

  expect(url.searchParams.get("key")).toBe("123");
  // ...
});
```

### ❌ Avoid

```javascript
// Math.random() 사용 (비결정적)
it("should handle random input", () => {
  const code = Math.random().toString();
  const result = decodeURL(code);
  expect(result.error).toBeDefined(); // 불안정
});

// 타이밍 기반 테스트
it("should process quickly", (done) => {
  setTimeout(() => {
    expect(true).toBe(true);
    done();
  }, 100); // 느린 시스템에서 실패
});
```

---

## 6. 전역 에러 핸들링 패턴

### ✅ Recommended: window.addEventListener

```javascript
// app.js 상단
window.addEventListener('error', (event) => {
  console.error('Global error:', {
    message: event.error?.message,
    filename: event.filename,
    lineno: event.lineno,
    stack: event.error?.stack
  });
  // Sentry.captureException() 등에 연동 가능
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
```

### ❌ Avoid

```javascript
// try-catch 없이 전역 catch (놓친 오류 있음)
// window 객체에 직접 오류 핸들러 할당
window.onerror = () => { }; // addEventListener 표준화

// 오류를 무시
try {
  // ...
} catch (e) {
  // 아무것도 안 함
}
```

---

## 7. 보안 검증 패턴

### ✅ Recommended: 화이트리스트 검증

```javascript
// 설정: 지원하는 값만 명시
const SUPPORTED_SITES = Object.keys(siteMap);
const VALIDATION = {
  KNUE_DOMAIN: 'https://www.knue.ac.kr/',
};

// 검증: 사전 정의된 값만 허용
function validateSite(site) {
  if (!SUPPORTED_SITES.includes(site)) {
    return { error: `지원하지 않는 사이트입니다: ${site}` };
  }
}

// 호출 전: 필수 파라미터 확인
if (!site || isNaN(key) || isNaN(bbsNo) || isNaN(nttNo)) {
  return { error: "필수 파라미터 누락" };
}
```

### ❌ Avoid

```javascript
// 블랙리스트 (놓친 공격 있을 수 있음)
if (site === "admin" || site === "root") { /* ... */ }

// 느슨한 타입 검증
if (key) { /* key = 0이면 false 취급 */ }

// 내부 함수에서만 검증
function internalFunc(site) {
  if (!SUPPORTED_SITES.includes(site)) { /* ... */ }
  // 외부에서 직접 호출 가능
}
```

---

## 8. 성능 최적화 패턴

### ✅ Recommended: 싱글톤 Sqids 인스턴스

```javascript
// urlEncoder.js - 한 번만 생성
const sqids = new Sqids({
  alphabet: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~",
  minLength: 3,
  blocklist: ["admin", "www", "api"],
});

// 모든 인코딩/디코딩에서 재사용
export function encodeURL({ site, key, bbsNo, nttNo }) {
  return { code: sqids.encode([siteNum, key, bbsNo, nttNo]) };
}
```

### ❌ Avoid

```javascript
// 매번 새로 생성 (성능 저하)
export function encodeURL({ site, key, bbsNo, nttNo }) {
  const sqids = new Sqids({ /* ... */ }); // ❌
  return { code: sqids.encode([...]) };
}

// 전역 window 객체에 저장 (모듈성 깨짐)
window.sqids = new Sqids(...);
```

---

## 참고: 라이브러리별 최선의 관행

### Sqids
- 알파벳 설정: 66자 이상 권장 (더 짧은 코드)
- blocklist: 예약어 피하기 (충돌 방지)
- minLength: 3 이상 (사용성)

### qrcode.js
- toCanvas() 콜백에서 오류 처리 (프로미스 아님)
- Canvas 크기: 최소 300x300 권장 (QR 스캔 용이)
- 생성 실패 시 사용자 알림 없음 (단축 URL은 여전히 유효)

### Vitest + jsdom
- DOM 요소는 beforeEach에서 초기화
- window.location, window.alert 모킹 필수
- vi.clearAllMocks() 테스트 격리
