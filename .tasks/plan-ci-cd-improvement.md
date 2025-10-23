# CI/CD 개선 스프린트 계획

**Sprint Goal**: CI/CD 파이프라인 강화 및 자동화 개선

**Duration**: 2025-10-24 ~ (예정)

**Status**: 📋 PLANNING

---

## 개요

현재 프로젝트의 CI/CD는 기본적인 테스트 → 빌드 파이프라인만 갖추고 있음.
보안, 코드 품질, 커버리지 추적 등 중요한 자동화가 부재한 상태.

### 검토 결과

| 항목 | 현재 상태 | 개선 대상 |
|------|----------|---------|
| 의존성 보안 | ❌ 없음 | npm audit 추가 |
| 린팅 | ❌ 없음 | ESLint 설정 |
| 포맷팅 | ❌ 없음 | Prettier 설정 |
| 커버리지 추적 | ❌ 없음 | vitest 커버리지 리포트 |
| 타입 체크 | ❌ 없음 | TypeScript 설정 (선택) |

---

## 스프린트 작업

### Phase 1: 보안 & 기본 품질 (우선순위: HIGH)

#### Task CI-001: npm audit 자동 검사
- **Effort**: S (1-2시간)
- **DoD**:
  - [x] CI에 `npm audit` 단계 추가
  - [x] 취약점 발견 시 실패하도록 설정
  - [x] 검사 결과 로그 출력

#### Task CI-002: ESLint + Prettier 설정
- **Effort**: M (3-4시간)
- **Sub-tasks**:
  - `.eslintrc.json` 생성 (ES2020+, JS/TS 지원)
  - `.prettierrc` 생성
  - `package.json`에 `lint`, `format` 스크립트 추가
  - CI에 린트 체크 단계 추가
- **DoD**:
  - [x] ESLint가 기존 코드를 성공적으로 검사
  - [x] Prettier로 전체 코드 포맷팅 (auto-fix)
  - [x] CI 실행 시 린트 오류 감지
  - [x] 테스트 패스

### Phase 2: 신뢰도 & 모니터링 (우선순위: MEDIUM)

#### Task CI-003: 테스트 커버리지 리포트
- **Effort**: M (2-3시간)
- **Sub-tasks**:
  - Vitest 커버리지 플러그인 설정
  - `vitest.config.ts`에 coverage 설정 추가
  - CI에서 커버리지 리포트 생성
  - 커버리지 임계값 설정 (line: 80%, branch: 70%)
- **DoD**:
  - [x] 로컬에서 `npm test -- --coverage` 실행 가능
  - [x] 커버리지 리포트 생성
  - [x] CI에서 자동으로 리포트 생성 및 아티팩트 업로드
  - [x] 임계값 미만 시 실패

### Phase 3: 타입 안전성 (우선순위: LOW - 선택사항)

#### Task CI-004: TypeScript 마이그레이션
- **Effort**: L (3-4일)
- **Status**: BACKLOG (필요시 별도 스프린트)
- **Sub-tasks**:
  - `tsconfig.json` 생성
  - 기존 `.js` 파일 `.ts`로 변환
  - 타입 정의 파일 추가
  - CI에 `tsc --noEmit` 단계 추가

---

## CI/CD 개선 순서

```
Week 1:
├── Task CI-001: npm audit (보안, 1-2시간) ✓
└── Task CI-002: ESLint + Prettier (품질, 3-4시간) ✓

Week 2:
├── Task CI-003: Coverage Report (모니터링, 2-3시간) ✓
└── (선택) Task CI-004: TypeScript (별도 일정)
```

---

## 수정될 파일 목록

### `.github/workflows/ci.yml`
```diff
+ - name: Security Audit
+   run: npm audit

+ - name: Run Linter
+   run: npm run lint

+ - name: Generate Coverage Report
+   run: npm test -- --coverage
```

### `package.json`
```diff
+ "lint": "eslint src --max-warnings 0",
+ "format": "prettier --write src",
+ "format:check": "prettier --check src"
```

### 새로 추가될 파일
- `.eslintrc.json`
- `.prettierrc`
- `vitest.config.ts` (커버리지 설정)

---

## 메트릭 & 성공 기준

| 메트릭 | 현재 | 목표 | 상태 |
|--------|------|------|------|
| 의존성 취약점 | 미확인 | 0개 | ⏳ |
| 린트 오류 | 미확인 | 0개 | ⏳ |
| 테스트 커버리지 | >80% | >80% 유지 | ✅ |
| 타입 체크 | ❌ | (선택) | ⏳ |

---

## 검토 체크리스트

- [ ] CI 워크플로우 검증
- [ ] 린트 규칙이 팀 표준과 일치
- [ ] 포맷팅 규칙 명확화
- [ ] 커버리지 임계값 설정
- [ ] 모든 단계 실행 및 로그 검증
- [ ] 브랜치 보호 규칙 업데이트 (필요시)

---

## Notes

- ESLint 설정: TypeScript 대응 포함 (향후 TS 마이그레이션 대비)
- Prettier: `.prettierrc`로 엄격한 포맷팅 강제
- Coverage: 임계값 미만 시 CI 실패 (품질 유지)
- TypeScript는 선택사항이지만, 추후 권장됨
