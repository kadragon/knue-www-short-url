import { encodeURL, decodeURL } from "./urlEncoder.js";
import { ERROR_MESSAGES, VALIDATION } from "./constants.js";
import { validateDecodeCode, validateEncodeParams, validateParameterRange } from "./validators.js";
import { createCopyClickHandler, handleGenerateQRCode } from "./uiHandlers.js";

// Global error handling and monitoring
window.addEventListener('error', (event) => {
  console.error('Global error:', {
    message: event.error?.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

/**
 * 애플리케이션 메인 로직 초기화 및 라우팅을 수행합니다.
 *
 * 3가지 모드로 동작합니다:
 * 1. Decode Mode: ?<code> → 원본 URL 디코딩 후 리다이렉트
 * 2. Encode Mode: ?site=...&key=...&bbsNo=...&nttNo=... → 단축 URL 생성 + QR 코드
 * 3. Default Mode: / → 기본 메시지 표시
 *
 * URL 파라미터를 파싱하여 적절한 모드로 라우팅합니다.
 * 모든 입력값은 validators.js의 함수로 검증합니다.
 *
 * @event window.onload
 * @fires window.location.href (Decode 모드에서 리다이렉트)
 * @returns {void}
 */
window.onload = function () {
  // DOM 요소 참조 (페이지 로드 시 요소가 존재해야 함)
  const search = window.location.search;
  const resultDiv = document.getElementById("result");
  const qrCanvas = document.getElementById("qrCanvas");
  const copyInfoDiv = document.getElementById("copy-info");

  /**
   * MODE 1: Decode Mode
   * 형식: ?<code> (예: ?XyZ123)
   * 동작: 단축 코드를 원본 URL로 디코딩하여 리다이렉트
   */
  if (search && !search.includes("=")) {
    // URL에서 '?' 제거하고 공백 정리
    const code = search.substring(1).trim();

    // 코드 길이 및 형식 검증 (validators.js 사용)
    const validation = validateDecodeCode(code);
    if (!validation.valid) {
      alert(validation.error);
      window.location.href = "/";
      return;
    }

    // 코드를 원본 URL로 디코딩 (urlEncoder.js 사용)
    const decodeResult = decodeURL(code);

    // 보안: 디코딩된 URL이 KNUE 도메인인지 검증 후 리다이렉트
    // KNUE 도메인이 아니면 홈으로 리다이렉트 (도메인 하이재킹 방지)
    if (decodeResult.url && decodeResult.url.startsWith(VALIDATION.KNUE_DOMAIN)) {
      window.location.href = decodeResult.url;
    } else {
      alert(ERROR_MESSAGES.INVALID_CODE);
      window.location.href = "/";
    }
    return;
  }

  /**
   * MODE 2: Encode Mode
   * 형식: ?site=<site>&key=<key>&bbsNo=<bbsNo>&nttNo=<nttNo>
   * 동작: URL 파라미터를 단축 코드로 인코딩하고 QR 코드 생성
   */
  if (search && search.includes("=")) {
    // URL 쿼리 문자열 파싱 (예: "?site=www&key=123" → {site: "www", key: "123"})
    const searchParams = new URLSearchParams(search);
    const params = Object.fromEntries(searchParams.entries());

    // 파라미터 추출 및 타입 변환 (문자열 → 숫자)
    // parseInt(value, 10)은 10진법으로 파싱하고, 숫자가 아니면 NaN 반환
    const site = params.site?.trim();
    const key = parseInt(params.key, 10);
    const bbsNo = parseInt(params.bbsNo, 10);
    const nttNo = parseInt(params.nttNo, 10);

    // 필수 파라미터 검증 (validators.js 사용)
    // site 존재 여부, key/bbsNo/nttNo가 유효한 숫자인지 확인
    const encodeParamsValidation = validateEncodeParams({ site, key, bbsNo, nttNo });
    if (!encodeParamsValidation.valid) {
      resultDiv.innerText = encodeParamsValidation.error;
      return;
    }

    // 범위 검증: 모든 숫자가 0 ~ 999,999,999 범위 내인지 확인
    // 너무 큰 숫자는 Sqids 인코딩 오류 및 보안 문제 야기 가능
    const rangeValidation = validateParameterRange({ key, bbsNo, nttNo });
    if (!rangeValidation.valid) {
      resultDiv.innerText = rangeValidation.error;
      return;
    }

    // 파라미터를 Sqids로 인코딩하여 단축 코드 생성 (urlEncoder.js 사용)
    const result = encodeURL({ site, key, bbsNo, nttNo });

    // 인코딩 성공 시: 단축 URL 생성 및 QR 코드 렌더링
    if (result.code) {
      // 짧은 URL 구성: 현재 도메인 + 짧은 코드
      // 예: https://knue.url.kr/?abc123
      const shortUrl = `${window.location.origin}${window.location.pathname}?${result.code}`;

      // 단축 URL을 표시할 <a> 요소 생성
      const link = document.createElement("a");
      link.href = shortUrl;
      // 사용자 표시용: 프로토콜 제거 (knue.url.kr/?abc123로 표시)
      link.textContent = shortUrl.replace(/^https?:\/\//, "");
      resultDiv.appendChild(link);

      // 클립보드 복사 안내 텍스트 표시
      copyInfoDiv.textContent = "(주소를 클릭하면 클립보드에 복사됩니다.)";

      // 링크 클릭 시 클립보드에 복사하는 이벤트 핸들러 등록
      link.addEventListener("click", createCopyClickHandler(shortUrl));

      // QR 코드 생성 (Canvas에 렌더링, uiHandlers.js 사용)
      handleGenerateQRCode(qrCanvas, shortUrl);
    } else {
      // 인코딩 실패 시: 에러 메시지 표시 (지원되지 않는 사이트 등)
      resultDiv.innerText = `오류: ${result.error}`;
    }
    return; // Encode 모드 처리 완료
  }

  /**
   * MODE 3: Default Mode
   * 형식: / (쿼리 문자열 없음)
   * 동작: 기본 안내 메시지 표시
   */
  resultDiv.innerText = "KNUE 단축 URL 생성기";
};
