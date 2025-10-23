# 디코딩 모드 - 수용 기준

## AC-1: 유효한 코드로 원본 URL 복원
- **Condition**: code는 올바른 encodeURL 결과
- **Expected**: {url: "https://www.knue.ac.kr/..."}
- **Test**: `should correctly encode and then decode the URL parameters`

## AC-2: 디코딩된 URL은 KNUE 도메인만
- **Condition**: 모든 유효한 디코딩
- **Expected**: url.startsWith("https://www.knue.ac.kr/")
- **Test**: (app.js에서 검증)

## AC-3: 잘못된 코드 거부
- **Condition**: code가 Sqids.decode()로 4개 배열 미생성
- **Expected**: {error: "잘못된 코드입니다."}
- **Test**: `should return an error for invalid decoding code`

## AC-4: 원본 파라미터 정확히 복원
- **Condition**: encodeURL() → decodeURL() 왕복
- **Expected**: URL 파라미터 정확히 일치
- **Test**: `should correctly encode and then decode the URL parameters`

## AC-5: 존재하지 않는 사이트 코드 거부
- **Condition**: siteNum ∉ siteMapReverse
- **Expected**: {error: "존재하지 않는 사이트 코드입니다."}
- **Test**: (별도 테스트 필요)

---

## Test Strategy

**테스트 범위**: Unit (단위 테스트)

**Coverage Target**:
- Line coverage: 100%
- Branch coverage: 100% (모든 오류 경로)

**Test Files**:
- `test/index.test.js` - decodeURL 기본 테스트

---

## DoD (Definition of Done)

- [ ] AC-1~5 모두 구현됨
- [ ] 모든 테스트 통과
- [ ] 100% 라인 커버리지 달성
- [ ] 원본 파라미터 왕복 검증 완료
- [ ] 보안: URL 도메인 검증 (app.js 포함)
