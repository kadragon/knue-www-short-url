# KNUE WWW Short URL

한국교원대학교 게시판용 단축 URL 생성기

---

## 소개

- 본 프로젝트는 **KNUE(한국교원대학교) 공식 홈페이지의 공지사항·게시글 등 긴 URL을 짧고 관리하기 쉽게 변환**하는 웹 유틸리티입니다.
- [Sqids](https://github.com/sqids/sqids-javascript) 라이브러리를 활용하여, 게시글 번호 등 주요 파라미터를 안전하게 인코딩/디코딩합니다.
- 데이터베이스 등 별도의 서버 없이 **클라이언트에서 즉시 인코딩/디코딩 및 리다이렉트**가 가능합니다.
- 현재는 API 서버처럼 동작하며, URL 파라미터에 따라 JSON 응답을 반환하거나 특정 조건에서 리다이렉트를 수행합니다.

---

## 주요 특징

- **긴 게시판 URL → 짧은 단축 URL** 변환
- 원본 파라미터(site, key, bbsNo, nttNo)만 포함, 예측 어려운 랜덤 문자열
- 별도의 서버 저장 없이 인코딩 값만으로 원본 URL 완전 복원
- **API 방식 동작**: 인코딩 요청 시 JSON 응답 반환, 디코딩 성공 시 원본 URL로 리다이렉트, 실패 시 알림 후 기본 페이지로 리다이렉트.
- **확장된 사이트 매핑**: `sitemap.xml`을 기반으로 다양한 KNUE 서브도메인 지원.

---

## 프로젝트 구조

```
. (프로젝트 루트)
├── src/
│   ├── index.js        # 핵심 인코딩/디코딩 로직
│   ├── main.js         # 클라이언트 사이드 진입점 및 URL 파싱/처리
│   └── siteMap.js      # KNUE 사이트 이름과 숫자 매핑
├── test/
│   ├── index.test.js   # 핵심 로직 테스트
│   └── main.test.js    # 클라이언트 사이드 로직 테스트
├── index.html          # 메인 HTML 파일
├── package.json        # 프로젝트 의존성 및 스크립트 관리 (npm)
├── vite.config.js       # Vite 빌드 및 Vitest 테스트 설정
├── README.md           # 프로젝트 설명 (현재 파일)
```

---

## 개발 환경 설정 및 실행

이 프로젝트는 `npm`을 통한 의존성 관리와 `Vite`를 통한 개발 및 빌드를 사용합니다.

### 의존성 설치

프로젝트 루트에서 다음 명령어를 실행하여 필요한 의존성을 설치합니다.

```bash
npm install
```

### 개발 서버 실행

개발 중에는 다음 명령어를 사용하여 로컬 개발 서버를 실행할 수 있습니다. 코드를 변경하면 자동으로 새로고침됩니다.

```bash
npm run dev
```

### 프로젝트 빌드

배포를 위해 프로젝트를 빌드하려면 다음 명령어를 실행합니다. 최적화된 정적 파일들이 `dist` 디렉토리에 생성됩니다.

```bash
npm run build
```

### 테스트 실행

인코딩/디코딩 로직 및 클라이언트 사이드 동작을 테스트하려면 다음 명령어를 실행합니다.

```bash
npm test
```

---

## 사용 방법

이 유틸리티는 주로 백그라운드에서 동작하는 API처럼 사용됩니다. 웹 브라우저에서 URL 파라미터를 통해 접근합니다.

### URL 인코딩 (단축 URL 생성)

긴 KNUE 게시판 URL의 `site`, `key`, `bbsNo`, `nttNo` 파라미터를 사용하여 단축 URL을 생성합니다. 결과는 JSON 형태로 반환됩니다.

**예시 URL:**
`http://localhost:5173/?site=www&key=12345&bbsNo=678&nttNo=9012`

**반환되는 JSON 예시:**

```json
{
  "code": "encodedCodeString"
}
```

### URL 디코딩 (원본 URL 복원 및 리다이렉트)

생성된 단축 코드를 사용하여 원본 URL을 복원하고 해당 페이지로 리다이렉트합니다.

**예시 URL:**
`http://localhost:5173/?encodedCodeString`

**동작:**

- 디코딩 성공 시: `https://www.knue.ac.kr/{site}/selectBbsNttView.do?key={key}&bbsNo={bbsNo}&nttNo={nttNo}` 로 즉시 리다이렉트됩니다.
- 디코딩 실패 시: "잘못된 주소입니다." 알림 후 `https://www.knue.ac.kr/www/index.do` 로 리다이렉트됩니다.

---

## 기여

이 프로젝트에 기여하고 싶으시다면, 언제든지 이슈를 등록하거나 Pull Request를 보내주세요.
