# Task CI-001: npm audit 자동 검사 추가

**Linked Spec**: `.spec/ci-cd/npm-audit.md` (작성 필요)

**Goal**: CI/CD 파이프라인에 의존성 보안 검사 자동화

**Steps**:
1. GitHub Actions CI 워크플로우에 `npm audit` 단계 추가
2. 보안 취약점 발견 시 CI 실패하도록 설정
3. 검사 결과 로그 확인

---

## Definition of Done (DoD)

- [ ] `npm audit` 스크립트가 CI 파이프라인에 통합됨
- [ ] 취약점 발견 시 CI가 실패함
- [ ] 워크플로우 실행 로그에서 감사 결과 확인 가능
- [ ] 테스트 및 빌드 파이프라인 성공

---

## Implementation Details

### 1. 로컬 테스트
```bash
npm audit
```

### 2. CI 워크플로우 수정
**File**: `.github/workflows/ci.yml`

추가할 단계 (Install dependencies 다음):
```yaml
- name: Security Audit
  run: npm audit --audit-level=moderate
```

### 3. npm audit 옵션 설명
- `--audit-level=moderate`: 중간 이상 취약점에서 실패
- `--audit-level=high`: 높은 이상 취약점에서만 실패 (선택사항)
- `--audit-level=critical`: 치명적 취약점에서만 실패 (선택사항)

---

## 검사 결과 예시

### ✅ 취약점 없음
```
up to date, audited 2 packages in 100ms
found 0 vulnerabilities
```

### ❌ 취약점 있음
```
2 moderate vulnerabilities found
npm ERR! code AUDIT
```

---

## Rollback Plan

취약점이 발견되면:
1. `npm audit fix` 자동 패치 시도
2. 수동 패치 필요한 경우 `.spec/ci-cd/npm-audit.md`에 기록
3. 일시적으로 무시하려면: `npm audit --audit-level=high` 변경

---

## Linked Files

- Spec: `.spec/ci-cd/npm-audit.md`
- Workflow: `.github/workflows/ci.yml`
- Backlog: `.tasks/backlog.md`
