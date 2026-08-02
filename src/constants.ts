// GENERATED FROM SPEC-error-messages

/**
 * Defines error and guidance messages used throughout the application.
 *
 * Centralized management provides:
 * - Message consistency: the same error always uses the same message.
 * - Maintainability: all messages can be changed in one place.
 * - i18n: each value is a `{ ko, en }` pair resolved at runtime via `t()`
 *   (see `src/i18n.ts`); string values or `(...) => string` function values.
 * - Fewer typing errors: use constants instead of string literals.
 */
export const ERROR_MESSAGES = {
  // Decode errors
  INVALID_CODE: { ko: '잘못된 주소입니다.', en: 'Invalid address.' },
  INVALID_CODE_FORMAT: { ko: '잘못된 코드입니다.', en: 'Invalid code.' },
  UNKNOWN_SITE_CODE: {
    ko: '존재하지 않는 사이트 코드입니다.',
    en: 'Nonexistent site code.',
  },

  // Encode errors
  MISSING_PARAMETERS: {
    ko: '오류: 필수 파라미터가 누락되었거나 잘못되었습니다.',
    en: 'Error: Required parameters are missing or invalid.',
  },
  INVALID_PARAMETER_RANGE: {
    ko: '오류: 파라미터 값이 유효 범위를 벗어났습니다.',
    en: 'Error: Parameter value is out of the valid range.',
  },
  INVALID_CODE_LENGTH: {
    ko: '오류: 코드 길이가 너무 깁니다.',
    en: 'Error: Code is too long.',
  },
  UNSUPPORTED_SITE: {
    ko: (site: string) => `지원하지 않는 사이트입니다: ${site}`,
    en: (site: string) => `Unsupported site: ${site}`,
  },
  INVALID_NUMERIC_PARAMS: {
    ko: 'key, bbsNo, nttNo는 반드시 숫자여야 합니다.',
    en: 'key, bbsNo, nttNo must be numbers.',
  },
  INVALID_EXPIRY_RANGE: {
    ko: '오류: 유효기간은 1일에서 3650일 사이여야 합니다.',
    en: 'Error: Expiry must be between 1 and 3650 days.',
  },

  // Expiry-related messages
  EXPIRED_CODE: { ko: '만료된 코드입니다.', en: 'This code has expired.' },
  EXPIRES_ON: {
    ko: (date: string) => `유효기간: ${date}까지`,
    en: (date: string) => `Expires on: ${date}`,
  },

  // Clipboard messages
  CLIPBOARD_COPIED: { ko: '클립보드에 복사되었습니다.', en: 'Copied to clipboard.' },
  CLIPBOARD_COPY_FAILED: {
    ko: '클립보드 복사에 실패했습니다.',
    en: 'Failed to copy to clipboard.',
  },
  CLIPBOARD_NOT_SUPPORTED: {
    ko: '자동 복사 기능이 지원되지 않는 환경입니다. 수동으로 복사해주세요.',
    en: 'Automatic copy is not supported in this environment. Please copy manually.',
  },

  // UI / app-level strings
  APP_TITLE: { ko: '한국교원대학교 단축 URL', en: 'KNUE Short URL' },
  DEFAULT_MESSAGE: { ko: 'KNUE 단축 URL 생성기', en: 'KNUE Short URL Generator' },
  COPY_INFO: {
    ko: '(주소를 클릭하면 클립보드에 복사됩니다.)',
    en: '(Click the address to copy it to the clipboard.)',
  },
  ERROR_PREFIX: { ko: '오류: ', en: 'Error: ' },
  LOCALE_TOGGLE: { ko: 'EN', en: '한국어' },
} as const;

/**
 * Defines constants used for input validation and constraints.
 *
 * validators.ts references these values to centralize validation thresholds.
 */
export const VALIDATION = {
  MAX_CODE_LENGTH: 50,
  MAX_NUMERIC_VALUE: 999999999,
  MIN_NUMERIC_VALUE: 0,
  MIN_EXPIRY_DAYS: 1,
  MAX_EXPIRY_DAYS: 3650,
  KNUE_DOMAIN: 'https://www.knue.ac.kr/',
} as const;

/**
 * Inbound (decode-mode) redirect tracking via Umami Cloud.
 *
 * Best-effort, PII-free: only the short code is sent, no client-side
 * timestamp (Umami records server-side). See analytics.ts.
 */
export const ANALYTICS = {
  ENABLED: true,
  ENDPOINT: 'https://cloud.umami.is/api/send',
  WEBSITE_ID: 'a365996d-4929-412a-8624-9fa0ad9a912d',
} as const;
