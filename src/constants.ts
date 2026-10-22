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
  INSPECT_TITLE: { ko: '공지 배포 전 링크 일괄 검사', en: 'Check links before publishing' },
  INSPECT_HELP: {
    ko: '한 줄에 단축 URL 하나를 입력하세요. 기대한 원본 URL은 탭으로 구분해 함께 입력할 수 있습니다.',
    en: 'Enter one short URL per line. Optionally add the expected original URL separated by a tab.',
  },
  INSPECT_NOTICE: {
    ko: '복원 정상은 게시글의 존재·내용·접근 권한을 확인했다는 뜻이 아닙니다. 입력은 저장하거나 외부로 전송하지 않으며, 검사 중 페이지 이동이나 접속 통계 전송은 없습니다.',
    en: 'Successful restoration does not verify post existence, content, or access permissions. Inputs are not stored or transmitted; inspection does not navigate or send redirect analytics.',
  },
  INSPECT_INPUT: { ko: '검사할 링크', en: 'Links to inspect' },
  INSPECT_RUN: { ko: '링크 검사', en: 'Inspect links' },
  INSPECT_COPY: { ko: '문제 행만 복사', en: 'Copy problem rows' },
  INSPECT_LINE: { ko: '행', en: 'Line' },
  INSPECT_ORIGINAL: { ko: '복원 주소', en: 'Restored URL' },
  INSPECT_STATUS: { ko: '상태', en: 'Status' },
  INSPECT_REASON: { ko: '사유', en: 'Reason' },
  INSPECT_VALID: { ko: '복원 정상', en: 'Restored' },
  INSPECT_EXPIRED: { ko: '만료', en: 'Expired' },
  INSPECT_INVALID: { ko: '형식 오류', en: 'Invalid format' },
  INSPECT_MISMATCH: { ko: '원본 불일치', en: 'Original mismatch' },
  INSPECT_URL_ERROR: {
    ko: 'https://www.knue.ac.kr/s/?코드 형식의 단축 URL을 입력하세요.',
    en: 'Enter a short URL in the form https://www.knue.ac.kr/s/?code.',
  },
  INSPECT_EXPIRED_MISMATCH: {
    ko: '만료된 코드입니다. 기대한 원본 URL과 복원 주소가 다르거나 원본 URL 형식이 잘못되었습니다.',
    en: 'This code has expired. The expected original differs from the restored URL or has an invalid format.',
  },
  INSPECT_MISMATCH_REASON: {
    ko: '기대한 원본 URL과 복원 주소가 다르거나 원본 URL 형식이 잘못되었습니다.',
    en: 'The expected original differs from the restored URL or has an invalid format.',
  },
  INSPECT_COLUMNS_ERROR: {
    ko: '한 행에는 단축 URL과 선택 사항인 원본 URL만 입력하세요.',
    en: 'Each row must contain a short URL and at most one expected original URL.',
  },
  INSPECT_EMPTY: { ko: '검사할 링크를 입력하세요.', en: 'Enter links to inspect.' },
  INSPECT_DONE: {
    ko: (count: string) => `${count}개 링크 검사 완료`,
    en: (count: string) => `Inspected ${count} links`,
  },
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
  SHORT_URL_BASE: 'https://www.knue.ac.kr/s/',
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
