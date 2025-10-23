# 인코딩 모드 - 수용 기준

## AC-1: 유효한 입력으로 단축 코드 생성
- **Condition**: site ∈ siteMap, key/bbsNo/nttNo ∈ [0, 999999999]
- **Expected**: {code: string} where length(code) ≥ 3
- **Test**: `should correctly encode and then decode the URL parameters`

## AC-2: 지원하지 않는 사이트 거부
- **Condition**: site ∉ siteMap
- **Expected**: {error: "지원하지 않는 사이트입니다: {site}"}
- **Test**: `should return an error for invalid encoding data`

## AC-3: 숫자가 아닌 파라미터 거부
- **Condition**: key/bbsNo/nttNo가 숫자로 변환 불가
- **Expected**: {error: "key, bbsNo, nttNo는 반드시 숫자여야 합니다."}
- **Test**: (별도 테스트 필요)

## AC-4: 결정성 보장
- **Condition**: 동일한 입력 2회 호출
- **Expected**: 동일한 코드 반환
- **Test**: (별도 테스트 필요)

---

## Test Strategy

**테스트 범위**: Unit (단위 테스트)

**Coverage Target**:
- Line coverage: 100% (핵심 함수)
- Branch coverage: 100% (오류 경로 포함)

**Test Files**:
- `test/index.test.js` - encodeURL 기본 테스트

---

## DoD (Definition of Done)

- [ ] AC-1~4 모두 구현됨
- [ ] 모든 테스트 통과
- [ ] 100% 라인 커버리지 달성
- [ ] JSDoc 주석 완성
- [ ] 오류 메시지 한글화
