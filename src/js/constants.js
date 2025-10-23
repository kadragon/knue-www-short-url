// GENERATED FROM SPEC-error-messages

/**
 * 애플리케이션 전체에서 사용되는 에러 메시지와 안내 메시지를 정의합니다.
 *
 * 중앙 집중식 관리로 다음 이점을 제공합니다:
 * - 메시지 일관성: 같은 에러는 항상 같은 메시지
 * - 유지보수성: 한 곳에서 모든 메시지 수정 가능
 * - i18n 준비: 향후 다국어 지원 시 쉬운 확장
 * - 타이핑 오류 방지: 문자열 리터럴 대신 상수 사용
 *
 * @type {Object}
 * @property {string} INVALID_CODE - 유효하지 않은 코드/주소
 * @property {string} INVALID_CODE_FORMAT - 코드 형식 오류
 * @property {string} UNKNOWN_SITE_CODE - 사이트 코드 미등록
 * @property {string} MISSING_PARAMETERS - 필수 파라미터 누락
 * @property {string} INVALID_PARAMETER_RANGE - 파라미터 범위 초과
 * @property {Function} UNSUPPORTED_SITE - 지원되지 않는 사이트 (동적 메시지)
 * @property {string} INVALID_NUMERIC_PARAMS - 숫자 파라미터 오류
 * @property {string} CLIPBOARD_COPIED - 클립보드 복사 성공
 * @property {string} CLIPBOARD_COPY_FAILED - 클립보드 복사 실패
 * @property {string} CLIPBOARD_NOT_SUPPORTED - Clipboard API 미지원
 * @property {string} QR_CODE_ERROR - QR 코드 생성 오류
 */
export const ERROR_MESSAGES = {
  // Decode errors
  INVALID_CODE: "잘못된 주소입니다.",
  INVALID_CODE_FORMAT: "잘못된 코드입니다.",
  UNKNOWN_SITE_CODE: "존재하지 않는 사이트 코드입니다.",

  // Encode errors
  MISSING_PARAMETERS: "오류: 필수 파라미터가 누락되었거나 잘못되었습니다.",
  INVALID_PARAMETER_RANGE: "오류: 파라미터 값이 유효 범위를 벗어났습니다.",
  UNSUPPORTED_SITE: (site) => `지원하지 않는 사이트입니다: ${site}`,
  INVALID_NUMERIC_PARAMS: "key, bbsNo, nttNo는 반드시 숫자여야 합니다.",

  // Clipboard messages
  CLIPBOARD_COPIED: "클립보드에 복사되었습니다.",
  CLIPBOARD_COPY_FAILED: "클립보드 복사에 실패했습니다.",
  CLIPBOARD_NOT_SUPPORTED: "자동 복사 기능이 지원되지 않는 환경입니다. 수동으로 복사해주세요.",

  // QR code messages
  QR_CODE_ERROR: "오류: QR 코드 생성 실패:",
};

/**
 * 입력값 검증 및 제약 조건에 사용되는 상수들을 정의합니다.
 *
 * 이 상수들은 validators.js에서 참조되며, 모든 검증 로직의 임계값을 관리합니다.
 *
 * @type {Object}
 * @property {number} MAX_CODE_LENGTH - 디코드 코드의 최대 길이 (문자)
 * @property {number} MAX_NUMERIC_VALUE - 숫자 파라미터의 최대값
 * @property {number} MIN_NUMERIC_VALUE - 숫자 파라미터의 최소값
 * @property {string} KNUE_DOMAIN - KNUE 도메인 (보안 검증용)
 */
export const VALIDATION = {
  MAX_CODE_LENGTH: 50,
  MAX_NUMERIC_VALUE: 999999999,
  MIN_NUMERIC_VALUE: 0,
  KNUE_DOMAIN: 'https://www.knue.ac.kr/'
};
