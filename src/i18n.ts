// GENERATED FROM SPEC-i18n

import { ERROR_MESSAGES } from './constants';

/**
 * 지원하는 로케일 목록과 현재 로케일 상태를 관리하는 경량 i18n 레이어입니다.
 *
 * 외부 라이브러리 없이 `ERROR_MESSAGES`(constants.ts)의 `{ ko, en }` 쌍을
 * 현재 로케일에 맞게 조회하는 `t()` 헬퍼와, 로케일 감지/저장/전환 함수를 제공합니다.
 */
export type Locale = 'ko' | 'en';

export const SUPPORTED_LOCALES: Locale[] = ['ko', 'en'];

const STORAGE_KEY = 'locale';

// Default is 'ko'; auto-detection only happens when `initLocale()` is called.
let currentLocale: Locale = 'ko';

function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as string[]).includes(value);
}

/**
 * 저장된 로케일(localStorage) 또는 브라우저 언어 설정을 기반으로
 * 사용할 로케일을 결정합니다. 우선순위: 저장된 값 > navigator.language > 'ko'.
 */
export function detectLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) {
      return stored;
    }
  } catch {
    // localStorage may be unavailable (e.g. private browsing) — ignore.
  }

  return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'ko';
}

/**
 * 현재 활성화된 로케일을 반환합니다.
 */
export function getLocale(): Locale {
  return currentLocale;
}

/**
 * 로케일을 설정하고 localStorage에 저장하며, `<html lang>` 속성을 갱신합니다.
 */
export function setLocale(locale: Locale): void {
  currentLocale = locale;

  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Swallow storage errors (e.g. private browsing / quota exceeded).
  }

  if (document?.documentElement) {
    document.documentElement.lang = locale;
  }
}

/**
 * 앱 시작 시 로케일을 감지하여 적용합니다.
 */
export function initLocale(): void {
  setLocale(detectLocale());
}

type MessageEntry = string | ((...args: string[]) => string);

/**
 * `ERROR_MESSAGES`에서 현재 로케일에 해당하는 메시지를 조회합니다.
 * 값이 함수이면 전달된 인자로 호출한 결과를, 문자열이면 그대로 반환합니다.
 *
 * @example
 * t('INVALID_CODE');                    // '잘못된 주소입니다.' (ko) / 'Invalid address.' (en)
 * t('UNSUPPORTED_SITE', 'invalid');     // '지원하지 않는 사이트입니다: invalid'
 */
export function t(key: keyof typeof ERROR_MESSAGES, ...args: string[]): string {
  const entry = ERROR_MESSAGES[key][currentLocale] as MessageEntry;
  return typeof entry === 'function' ? entry(...args) : entry;
}
