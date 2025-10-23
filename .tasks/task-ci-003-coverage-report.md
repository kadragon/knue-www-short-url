# Task CI-003: 테스트 커버리지 리포트

**Linked Spec**: `.spec/ci-cd/coverage-report.md` (작성 필요)

**Goal**: 테스트 커버리지 자동 추적 및 모니터링

**Effort**: M (2-3시간)

---

## Definition of Done (DoD)

- [ ] Vitest 커버리지 플러그인 설정
- [ ] `vitest.config.ts`에 coverage 설정 추가
- [ ] 로컬에서 `npm test -- --coverage` 실행 가능
- [ ] CI에서 커버리지 리포트 생성 및 아티팩트 업로드
- [ ] 커버리지 임계값 설정 (line 80%, branch 70%)
- [ ] 임계값 미만 시 CI 실패
- [ ] 모든 테스트 성공

---

## Implementation Steps

### Step 1: 의존성 설치

```bash
npm install --save-dev @vitest/coverage-v8
```

### Step 2: Vitest 설정 파일 생성

**`vitest.config.ts`** (또는 `vitest.config.js`)

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.js',
        '**/src/**/*.spec.js',
      ],
      lines: 80,
      functions: 80,
      branches: 70,
      statements: 80,
      all: true,
      skipFull: false,
    },
  },
});
```

### Step 3: package.json 스크립트 추가 (선택사항)

```json
"scripts": {
  "test": "vitest",
  "test:coverage": "vitest --coverage",
  "test:ui": "vitest --ui"
}
```

### Step 4: CI 워크플로우 수정

**File**: `.github/workflows/ci.yml`

수정할 부분:
```yaml
- name: Run tests
  run: npm test -- --coverage

- name: Upload coverage reports
  uses: actions/upload-artifact@v4
  with:
    name: coverage-report
    path: coverage
```

---

## Coverage 설명

### 메트릭

| 메트릭 | 의미 |
|--------|------|
| **Lines** | 실행된 코드 라인 비율 |
| **Functions** | 호출된 함수 비율 |
| **Branches** | 실행된 조건 분기 비율 |
| **Statements** | 실행된 문(statement) 비율 |

### 임계값 설정

```typescript
coverage: {
  lines: 80,      // 최소 80% 라인 커버리지
  functions: 80,  // 최소 80% 함수 커버리지
  branches: 70,   // 최소 70% 분기 커버리지
  statements: 80, // 최소 80% 문 커버리지
}
```

---

## 사용 방법

### 로컬에서 커버리지 확인

```bash
npm test -- --coverage
```

### 리포트 확인

```
coverage/
├── index.html        (브라우저에서 열기)
├── coverage-final.json
├── lcov.info
└── lcov-report/
```

### 브라우저에서 보기
```bash
# macOS/Linux
open coverage/index.html

# Windows
start coverage/index.html
```

---

## Expected Output

```bash
$ npm test -- --coverage

✓ src/js/urlEncoder.spec.js (10)

═══════════════════════════════════════════════════════════════════
File          | % Stmts | % Branch | % Funcs | % Lines | Uncovered
═══════════════════════════════════════════════════════════════════
All files     |   85.2  |   78.9   |   88.5  |   85.2  |
 urlEncoder.js|   85.2  |   78.9   |   88.5  |   85.2  | 42,55
═══════════════════════════════════════════════════════════════════
```

---

## 고급 설정 (선택사항)

### Codecov 연동

GitHub Actions에서 Codecov에 자동 업로드:
```yaml
- name: Upload to Codecov
  uses: codecov/codecov-action@v4
  with:
    files: ./coverage/lcov.info
    fail_ci_if_error: true
```

### 커버리지 배지 생성

`README.md`에 추가:
```markdown
[![codecov](https://codecov.io/gh/kadragon/knue-www-short-url/branch/main/graph/badge.svg)](https://codecov.io/gh/kadragon/knue-www-short-url)
```

---

## Troubleshooting

### 커버리지가 낮은 경우
1. `.spec/` 및 `.tasks/` 파일 제외 확인
2. 테스트 누락 부분 파악
3. 기존 임계값 재검토

### CI 실패 원인
```
FAIL coverage threshold check
  100% line coverage expected but only 82% achieved
```

해결: `vitest.config.ts`의 `lines` 값 조정 또는 테스트 추가

---

## 다음 단계

- Task CI-002: ESLint + Prettier (먼저 완료)
- (선택) Task CI-004: TypeScript 마이그레이션
- (선택) Codecov 연동 고도화

---

## References

- Vitest Coverage: https://vitest.dev/guide/coverage.html
- V8 Coverage: https://v8.dev/blog/code-coverage
