# URL 인코딩 API 명세

## Surface

**Module**: `src/js/urlEncoder.js`
**Export**: `encodeURL` (named export)

---

## Function Signature

```typescript
function encodeURL(param: {
  site: string;
  key: number;
  bbsNo: number;
  nttNo: number;
}): { code?: string; error?: string }
```

---

## Input Validation

| Field | Type | Min | Max | Required | Notes |
|-------|------|-----|-----|----------|-------|
| site | string | 1 char | 20 chars | yes | siteMap 키 필수 |
| key | number | 0 | 999999999 | yes | 정수만 |
| bbsNo | number | 0 | 999999999 | yes | 정수만 |
| nttNo | number | 0 | 999999999 | yes | 정수만 |

---

## Error Contract

| Error | HTTP Status | Retryable | Notes |
|-------|-------------|-----------|-------|
| Invalid site | 400 | No | 사용자 입력 오류, 즉시 실패 |
| Non-numeric param | 400 | No | 입력값 타입 오류, 재시도 불가 |

---

## Performance SLO

- **Encoding latency**: < 5ms (Sqids는 O(n) where n = 파라미터 개수, 보통 4개)
- **Throughput**: 1000+ encodes/sec on modern browser
- **Memory**: O(1) - 글로벌 Sqids 싱글톤 사용

---

## Rate Limiting

클라이언트 사이드 함수이므로 레이트 리미팅 없음. 서버 배포 시 필요시 추가.

---

## Dependencies

```json
{
  "sqids": "^0.3.0"
}
```

**Compatibility**: Node.js 14+, 모던 브라우저 (ES2020+)
