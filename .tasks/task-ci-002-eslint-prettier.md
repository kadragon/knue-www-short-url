# Task CI-002: ESLint + Prettier 설정

**Linked Spec**: `.spec/ci-cd/eslint-prettier.md` (작성 필요)

**Goal**: 코드 품질 관리 및 자동 포맷팅 자동화

**Effort**: M (3-4시간)

---

## Definition of Done (DoD)

- [ ] ESLint 설정 파일 생성 (`.eslintrc.json`)
- [ ] Prettier 설정 파일 생성 (`.prettierrc`)
- [ ] `package.json`에 `lint`, `format`, `format:check` 스크립트 추가
- [ ] 기존 코드가 린트 규칙을 만족하도록 수정
- [ ] CI에 린트 체크 단계 추가
- [ ] 모든 테스트 및 빌드 성공

---

## Implementation Steps

### Step 1: 의존성 설치

```bash
npm install --save-dev eslint @eslint/js eslint-plugin-prettier prettier
```

### Step 2: 설정 파일 생성

**`.eslintrc.json`**
```json
{
  "env": {
    "browser": true,
    "es2020": true,
    "node": true
  },
  "extends": ["eslint:recommended"],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "no-console": "warn",
    "prettier/prettier": "error"
  },
  "plugins": ["prettier"]
}
```

**`.prettierrc`**
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always"
}
```

### Step 3: package.json 수정

추가할 스크립트:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "test": "vitest",
  "lint": "eslint src --max-warnings 0",
  "lint:fix": "eslint src --fix",
  "format": "prettier --write src",
  "format:check": "prettier --check src"
}
```

### Step 4: CI 워크플로우 수정

**File**: `.github/workflows/ci.yml`

추가할 단계:
```yaml
- name: Run Linter
  run: npm run lint

- name: Check Code Format
  run: npm run format:check
```

### Step 5: 기존 코드 포맷팅

```bash
npm run lint:fix
npm run format
```

---

## Expected Results

### ✅ 린트 성공
```
# npm run lint
  0 errors and 0 warnings
```

### ✅ 포맷팅 확인
```
# npm run format:check
All matched files use Prettier code style!
```

### ❌ 린트 실패 시
```
# npm run lint
src/js/urlEncoder.js
  42:1  error  Unexpected console statement  no-console
```

---

## 규칙 상세

| 규칙 | 설명 | 레벨 |
|------|------|------|
| `no-unused-vars` | 사용하지 않는 변수 | warn |
| `no-console` | console 문 사용 | warn |
| `prettier/prettier` | Prettier 포맷 불일치 | error |
| `semi` | 세미콜론 필수 | 자동 고정 |
| `singleQuote` | 작은 따옴표 사용 | 자동 고정 |

---

## Troubleshooting

### 린트 오류가 많은 경우
```bash
npm run lint:fix  # 자동 수정 가능한 부분 수정
npm run format    # 포맷팅 자동 적용
```

### VSCode 통합
`.vscode/settings.json` (선택사항):
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "eslint.validate": ["javascript"]
}
```

---

## 다음 단계

- Task CI-003: 테스트 커버리지 리포트
- (선택) Task CI-004: TypeScript 마이그레이션

---

## References

- ESLint Docs: https://eslint.org/docs/latest/
- Prettier Docs: https://prettier.io/docs/
