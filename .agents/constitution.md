# KNUE URL Shortener - 개발 헌법

## 1. 금지 사항 (Forbidden)

- ❌ **전역 상태 변경**: window 객체에 직접 추가, 모듈 레벨 전역 변수 남용
- ❌ **검증되지 않은 I/O**: 모든 URL 파라미터/입력값은 명시적 검증 필수
- ❌ **라이선스 위반**: ISC 라이선스만 호환 가능 (AGPL 등 제외)
- ❌ **비결정적 테스트**: Math.random() 또는 시간 기반 테스트 (항상 같은 결과여야 함)
- ❌ **콘솔 노출**: 프로덕션에서 민감한 정보(API 키, URL 파라미터 전체) 노출 금지

---

## 2. 필수 사항 (Required)

- ✅ **순수 함수**: URL 인코딩/디코딩은 입출력만으로 동작 (부수 효과 최소)
- ✅ **경계 검증**: 모든 외부 입력(URL 파라미터, 사용자 입력)은 경계에서 검증
- ✅ **로깅 레벨**: console.error만 사용 (프로덕션 모니터링용)
- ✅ **한글화**: 모든 사용자 메시지는 한글 (국내 대학 사용 기준)
- ✅ **접근성**:
  - Canvas QR 코드는 alt 텍스트 검토 필요
  - 키보드 네비게이션 고려 (Copy URL 링크)
- ✅ **보안 기본**:
  - CSP 헤더 설정 (index.html)
  - 도메인 검증 (KNUE만)
  - XSS 방지 (innerHTML 대신 textContent/createElement)

---

## 3. 코드 스타일

### 파일 구조

```
src/js/
├── urlEncoder.js      # 핵심 로직 (순수 함수)
├── knueSites.js       # 설정 데이터
└── app.js             # UI/이벤트 바인딩
```

### 함수 규칙

```javascript
// ✅ Good: 순수 함수 + JSDoc
/**
 * @param {Object} param
 * @returns {Object} {code?: string, error?: string}
 */
export function encodeURL({ site, key, bbsNo, nttNo }) { }

// ❌ Bad: 부수 효과, 문서화 부재
window.encode = (site, key) => { /* ... */ }
```

### 변수/상수 명명

| 타입 | 규칙 | 예시 |
|------|------|------|
| 상수 | UPPER_SNAKE_CASE | `MAX_CODE_LENGTH`, `KNUE_DOMAIN` |
| 일반 변수 | camelCase | `searchParams`, `siteNum` |
| 불린 함수 | `is*` / `has*` | `isNaN()`, `hasError()` |

---

## 4. 커밋 규칙

### 형식: Conventional Commits

```
<type>(<scope>): <subject>

<body>

Trace: <SPEC-ID>, <TEST-ID>
Co-Authored-By: Claude <noreply@anthropic.com>
```

### Type

| Type | Scope | Example |
|------|-------|---------|
| `feat` | `encoding` / `decoding` / `ui` | feat(encoding): add Sqids minLength optimization |
| `fix` | (위와 동일) | fix(decoding): handle invalid site code |
| `test` | `encoding` / `decoding` / `ui` | test(encoding): add edge case for zero values |
| `refactor` | | refactor: extract validation logic to helper |
| `docs` | `.spec` / `.agents` | docs(.spec): update encoding acceptance criteria |

### Trace 메타데이터

```
Trace: SPEC-URL-ENC-001, TEST-001
```

- `SPEC-*`: .spec 폴더의 Spec-ID
- `TEST-*`: 테스트 파일의 test 이름 또는 라인 번호

---

## 5. 테스트 기준 (DoD - Definition of Done)

### 모든 커밋

- [ ] ✅ `npm test` 통과 (100% 성공률)
- [ ] ✅ 라인 커버리지 ≥ 80%
- [ ] ✅ 브랜치 커버리지 ≥ 70% (오류 경로 포함)
- [ ] ✅ `npm run build` 성공

### 기능별 추가

**인코딩/디코딩 (urlEncoder.js)**:
- [ ] 정상 경로 + 모든 오류 경로 테스트
- [ ] 왕복 검증 (encode → decode)
- [ ] 엣지 케이스: 0, 999999999, 빈 문자열

**UI/이벤트 (app.js)**:
- [ ] 인코드 모드, 디코드 모드, 기본 모드 각각 테스트
- [ ] 보안 검증: URL 도메인 체크
- [ ] Clipboard API 폴백 테스트

---

## 6. 보안 체크리스트

- [ ] 모든 외부 입력 검증 (URL 파라미터, 숫자값 범위)
- [ ] URL.toString() / URLSearchParams 사용 (수동 문자열 조합 금지)
- [ ] window.location.href 사전 도메인 검증
- [ ] innerHTML 금지, createElement / textContent 사용
- [ ] 민감 정보(전체 원본 URL 등) 콘솔에 노출 금지

---

## 7. 성능 기준

| 지표 | 목표 | 측정 방법 |
|------|------|---------|
| 인코딩 지연 | < 5ms | Browser DevTools |
| 번들 크기 | < 50KB | `npm run build` 후 dist 확인 |
| 테스트 실행 | < 1s | `npm test` 시간 |

---

## 8. 문서화 기준

### 코드 주석 (JSDoc)

```javascript
/**
 * 단축 URL 생성 함수
 *
 * @param {Object} param
 * @param {string} param.site - 사이트명
 * @param {number} param.key - 키 값
 * @returns {Object} {code: string} | {error: string}
 *
 * @example
 * encodeURL({site: "www", key: 123, bbsNo: 456, nttNo: 789})
 * // Returns: {code: "ABC123"}
 *
 * @throws 없음 (error 객체로 반환)
 */
```

### Spec 업데이트

- 구현 후 `.spec/<feature>/spec.md` 의 "Tracing" 섹션 검증
- 새로운 AC 발견 시 즉시 `.spec` 추가

---

## 9. Review 체크리스트 (Pull Request)

- [ ] 커밋이 Conventional Commits 형식
- [ ] 모든 테스트 통과 (CI/CD 자동 확인)
- [ ] 커버리지 임계값 충족
- [ ] JSDoc 주석 완성도 ≥ 80%
- [ ] 보안: 검증 누락, XSS 위험, URL 도메인 검증 확인
- [ ] .spec 문서 동기화 (변경 시)

---

## 10. 메모리 위생 (Memory Hygiene)

### .agents/memory 정책

- 📝 인덱스/요약만 (≤ 200줄)
- ❌ 긴 컨텍스트 덤프 금지
- 📌 대신 링크로 참조: `See .spec/features/...`

### 예시

```markdown
# Memory Index

## URL Encoding & Decoding
- Core: `src/js/urlEncoder.js`
- Spec: `.spec/features/url-encoding/spec.md`
- Test: `test/index.test.js`
- Status: ✅ Complete (100% coverage)

## App UI Logic
- Core: `src/js/app.js`
- Spec: `.spec/features/url-encoding/acceptance.md`
- Test: `test/main.test.js`
- Status: ⚠️ Clipboard fallback needs QA
```
