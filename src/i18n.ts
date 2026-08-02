// GENERATED FROM SPEC-i18n

import { ERROR_MESSAGES } from './constants';

/**
 * Lightweight i18n layer for supported locales and the active locale state.
 *
 * Without an external library, provides the `t()` helper that selects the
 * `{ ko, en }` pair in `ERROR_MESSAGES` (constants.ts), plus locale detection,
 * persistence, and switching functions.
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
 * Determines the locale from stored localStorage or the browser language.
 * Priority: stored value > navigator.language > 'ko'.
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
 * Returns the active locale.
 */
export function getLocale(): Locale {
  return currentLocale;
}

/**
 * Sets the locale, persists it to localStorage, and updates `<html lang>`.
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
 * Detects and applies the locale when the app starts.
 */
export function initLocale(): void {
  setLocale(detectLocale());
}

type MessageEntry = string | ((...args: string[]) => string);

/**
 * Gets the message for the active locale from `ERROR_MESSAGES`.
 * Calls function values with the supplied arguments and returns string values as-is.
 *
 * @example
 * t('INVALID_CODE');                    // localized invalid-address message
 * t('UNSUPPORTED_SITE', 'invalid');     // localized unsupported-site message
 */
export function t(key: keyof typeof ERROR_MESSAGES, ...args: string[]): string {
  const entry = ERROR_MESSAGES[key][currentLocale] as MessageEntry;
  return typeof entry === 'function' ? entry(...args) : entry;
}
