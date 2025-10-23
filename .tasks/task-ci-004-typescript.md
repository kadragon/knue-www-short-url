# Task CI-004: TypeScript 마이그레이션

**Linked Spec**: `.spec/ci-cd/typescript.md` (작성 필요)

**Goal**: 타입 안전성 확보 및 개발자 경험 개선

**Effort**: L (3-4일)

**Status**: BACKLOG (선택사항, 별도 스프린트 권장)

---

## Definition of Done (DoD)

- [ ] `tsconfig.json` 생성
- [ ] 기존 `.js` 파일을 `.ts`로 변환
- [ ] 모든 함수 및 변수에 타입 정의 추가
- [ ] 타입 정의 파일 (`*.d.ts`) 추가 (필요시)
- [ ] CI에 `tsc --noEmit` 타입 체크 단계 추가
- [ ] 기존 테스트 TypeScript 대응
- [ ] 모든 테스트 및 빌드 성공

---

## Implementation Steps

### Step 1: 의존성 설치

```bash
npm install --save-dev typescript @types/node
```

### Step 2: TypeScript 설정 생성

**`tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**`tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

### Step 3: Vite 설정 업데이트

**`vite.config.ts`** 생성:
```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
  },
});
```

**`vitest.config.ts`** 업데이트:
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
```

### Step 4: 기존 코드 마이그레이션

#### 마이그레이션 순서
1. 유틸리티 함수 (의존성 적음)
2. 메인 모듈
3. UI 핸들러
4. 테스트 파일

#### 예시: `src/js/urlEncoder.js` → `src/js/urlEncoder.ts`

**Before**:
```javascript
export function encodeUrl(siteId, articleId) {
  if (!Number.isInteger(siteId)) {
    throw new Error('Site ID must be an integer');
  }
  // ...
}
```

**After**:
```typescript
export function encodeUrl(siteId: number, articleId: number): string {
  if (!Number.isInteger(siteId)) {
    throw new Error('Site ID must be an integer');
  }
  // ...
}
```

### Step 5: package.json 업데이트

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "test": "vitest",
  "type-check": "tsc --noEmit",
  "type-check:watch": "tsc --noEmit --watch"
}
```

### Step 6: CI 워크플로우 추가

**File**: `.github/workflows/ci.yml`

```yaml
- name: Type Check
  run: npm run type-check
```

---

## Type Definitions 예시

### 함수 타입

```typescript
// 기본 함수
export function add(a: number, b: number): number {
  return a + b;
}

// 선택사항 파라미터
export function greet(name: string, greeting?: string): string {
  return `${greeting || 'Hello'}, ${name}`;
}

// 제네릭
export function reverse<T>(array: T[]): T[] {
  return array.reverse();
}
```

### 인터페이스/타입

```typescript
interface EncodedUrl {
  shortCode: string;
  siteId: number;
  articleId: number;
}

type ErrorResponse = {
  code: string;
  message: string;
};
```

### 클래스

```typescript
class UrlEncoder {
  private sqids: any;

  constructor() {
    // ...
  }

  encode(siteId: number, articleId: number): string {
    // ...
  }
}
```

---

## Expected Results

### ✅ 타입 체크 성공
```bash
$ npm run type-check
# 출력 없음 (성공)
```

### ❌ 타입 오류
```bash
$ npm run type-check
src/js/urlEncoder.ts(42,10): error TS2322:
Type 'string' is not assignable to type 'number'.
```

---

## 마이그레이션 전략

### Phase 1: 기본 설정 (1일)
- [ ] TypeScript 설정 파일 생성
- [ ] Vite/Vitest 설정 업데이트
- [ ] package.json 스크립트 추가

### Phase 2: 핵심 모듈 마이그레이션 (2일)
- [ ] `urlEncoder.js` → `urlEncoder.ts`
- [ ] `qrCodeGenerator.js` → `qrCodeGenerator.ts`
- [ ] 테스트 파일 마이그레이션

### Phase 3: 검증 & CI 통합 (1일)
- [ ] 모든 타입 오류 해결
- [ ] CI에 `type-check` 단계 추가
- [ ] 빌드 및 테스트 성공 확인

---

## Troubleshooting

### 타입 오류 많은 경우
1. `"strict": false` 임시로 설정 (점진적 마이그레이션)
2. `any` 타입으로 임시 처리 (나중에 개선)
3. 타입 정의 라이브러리 설치: `npm install --save-dev @types/qrcode @types/sqids`

### 빌드 실패
```
error TS5042: Option 'jsx' is not valid.
```
→ `tsconfig.json`에서 `jsx` 제거 (필요 없으면)

---

## 고급 기능 (선택사항)

### 1. JSDoc + TypeScript
```typescript
/**
 * URL을 단축 코드로 인코딩합니다.
 * @param siteId - 사이트 ID (정수)
 * @param articleId - 기사 ID (정수)
 * @returns 단축 코드
 * @throws {Error} 파라미터가 정수가 아닌 경우
 */
export function encodeUrl(siteId: number, articleId: number): string {
  // ...
}
```

### 2. 타입 테스트
```typescript
// 타입이 올바른지 확인
const encoded: string = encodeUrl(123, 456);
// @ts-expect-error - 타입 오류 예상
const invalid: number = encodeUrl(123, 456);
```

### 3. 자동 타입 생성
```bash
npm run type-check -- --declaration  # .d.ts 파일 생성
```

---

## 다음 단계

- CI/CD 개선 완료 후 별도 스프린트로 진행
- TypeScript 기반 새로운 기능 개발

---

## References

- TypeScript Handbook: https://www.typescriptlang.org/docs/
- Vite + TypeScript: https://vitejs.dev/guide/features.html#typescript
- Vitest + TypeScript: https://vitest.dev/guide/
