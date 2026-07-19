// GENERATED FROM SPEC-error-messages

/**
 * 애플리케이션 전체에서 사용되는 에러 메시지와 안내 메시지를 정의합니다.
 *
 * 중앙 집중식 관리로 다음 이점을 제공합니다:
 * - 메시지 일관성: 같은 에러는 항상 같은 메시지
 * - 유지보수성: 한 곳에서 모든 메시지 수정 가능
 * - i18n: each value is a `{ ko, en }` pair resolved at runtime via `t()`
 *   (see `src/i18n.ts`); string values or `(...) => string` function values.
 * - 타이핑 오류 방지: 문자열 리터럴 대신 상수 사용
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
 * 입력값 검증 및 제약 조건에 사용되는 상수들을 정의합니다.
 *
 * 이 상수들은 validators.ts에서 참조되며, 모든 검증 로직의 임계값을 관리합니다.
 */
export const VALIDATION = {
  MAX_CODE_LENGTH: 50,
  MAX_NUMERIC_VALUE: 999999999,
  MIN_NUMERIC_VALUE: 0,
  KNUE_DOMAIN: 'https://www.knue.ac.kr/',
} as const;
