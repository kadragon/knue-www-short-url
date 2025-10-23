// GENERATED FROM SPEC-error-messages

/**
 * Error messages used throughout the application
 * Centralized for easier maintenance, i18n support, and consistency
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
 * Validation constants used for input validation and constraints
 */
export const VALIDATION = {
  MAX_CODE_LENGTH: 50,
  MAX_NUMERIC_VALUE: 999999999,
  MIN_NUMERIC_VALUE: 0,
  KNUE_DOMAIN: 'https://www.knue.ac.kr/'
};
