# 프로젝트 메모리 인덱스

## 프로젝트 개요

**KNUE URL Shortener** - 한국교원대학교 게시판 URL 단축 및 디코딩 서비스 (클라이언트 사이드)

**기술 스택**: Vanilla JS (ES6+) + Sqids + qrcode.js + Vitest + Vite

**배포**: 정적 사이트 (DB 불필요, 클라이언트 사이드만 실행)

---

## 핵심 구성 요소

### 1. URL 인코딩/디코딩 (`src/js/urlEncoder.js`)
- **목적**: 4개 파라미터(site, key, bbsNo, nttNo) ↔ 단축 코드 변환
- **Spec**: `.spec/features/url-encoding/spec.md`, `.spec/features/url-decoding/spec.md`
- **테스트**: `test/index.test.js` (라인 4-54)
- **상태**: ✅ 완료 (100% 커버리지)
- **Sqids 설정**: 66자 알파벳, minLength=3, blocklist=["admin", "www", "api"]

### 2. 사이트 매핑 (`src/js/knueSites.js`)
- **목적**: KNUE 36개 서브도메인 ↔ 숫자 ID 매핑
- **구조**: siteMap (순방향), siteMapReverse (역매핑)
- **예시**: www → 1, grad → 2, ... idea → 32
- **상태**: ✅ 완료 (데이터 정적)

### 3. 애플리케이션 로직 (`src/js/app.js`)
- **목적**: URL 파라미터 → 3가지 모드 분기 (디코드/인코드/기본)
- **기능**:
  - 디코드 모드: 단축 코드 → 원본 URL 리다이렉트
  - 인코드 모드: 파라미터 → 단축 URL + QR 코드 생성
  - 기본 모드: 안내 메시지 표시
- **Spec**: `.spec/features/url-encoding/acceptance.md` (인코드 모드)
- **테스트**: `test/main.test.js` (라인 21-122)
- **상태**: ✅ 완료 (모든 모드 테스트됨)

### 4. QR 코드 생성
- **라이브러리**: qrcode.js
- **Spec**: `.spec/features/qr-code-generation/spec.md`
- **크기**: 300x300
- **상태**: ✅ 완료 (인코드 모드에서만 생성)

---

## 주요 수정 이력

| 날짜 | 커밋 | 변경 | 상태 |
|------|------|------|------|
| 2025-10-23 | (현재) | SDD/TDD 구조 생성 (.spec, .agents) | ✅ |
| - | ee38f3b | Vite 빌드 도구 업데이트 | ✅ |
| - | 33e4ccd | README.md 초안 작성 | ✅ |

---

## 보안 체크리스트

- ✅ CSP 헤더 (XSS 방지)
- ✅ 도메인 검증 (KNUE만 리다이렉트)
- ✅ 입력 검증 (site ∈ siteMap, 숫자값 범위 0~999999999)
- ✅ URL 생성 (URL API + URLSearchParams 사용)
- ✅ 오류 처리 (window.addEventListener 글로벌 핸들러)

---

## 테스트 커버리지 현황

| 파일 | 라인 | 브랜치 | 상태 |
|------|------|--------|------|
| urlEncoder.js | 100% | 100% | ✅ |
| app.js | >80% | >70% | ✅ |
| knueSites.js | 100% | N/A (데이터) | ✅ |

---

## 의존성

| 라이브러리 | 버전 | 용도 |
|-----------|------|------|
| sqids | ^0.3.0 | URL 인코딩/디코딩 |
| qrcode | ^1.5.4 | QR 코드 생성 |
| vite | ^7.1.11 | 빌드/개발 서버 |
| vitest | ^3.2.4 | 테스트 프레임워크 |
| jsdom | ^26.1.0 | DOM 환경 시뮬레이션 |

---

## 다음 단계 (Optional Enhancements)

- [ ] URL 통계 수집 (localStorage 또는 서버)
- [ ] 단축 URL 유효기간 설정
- [ ] 사용자 정의 도메인 지원 (예: knue.short/customAlias)
- [ ] Internationalization (i18n) - 영어/중국어 지원
- [ ] 모바일 UI 최적화 (반응형)

---

## 참고 링크

- **프로젝트 헌법**: `.agents/constitution.md`
- **코딩 패턴**: `.agents/patterns.md`
- **기능 스펙**: `.spec/features/`
- **테스트**: `test/`
- **빌드 설정**: `vite.config.js`
