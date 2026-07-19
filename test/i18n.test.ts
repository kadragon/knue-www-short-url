import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { detectLocale, getLocale, setLocale, initLocale, t } from '../src/i18n';

// Node 26+ ships an experimental global `localStorage` (gated behind
// `--localstorage-file`) that shadows jsdom's implementation, and vitest's
// jsdom environment does not override an already-present global (see
// vitest's `populateGlobal` allow-list). Polyfill with a plain in-memory
// Storage so `localStorage` behaves as it does in a real browser.
if (typeof localStorage === 'undefined' || typeof localStorage.setItem !== 'function') {
  const store = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, String(value));
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => {
        store.clear();
      },
      key: (index: number) => Array.from(store.keys())[index] ?? null,
      get length() {
        return store.size;
      },
    } satisfies Storage,
  });
}

describe('i18n Module', () => {
  let originalLanguage: string;

  beforeEach(() => {
    originalLanguage = navigator.language;
    setLocale('ko'); // reset module state before each test
    localStorage.clear(); // ...then clear so setLocale's own persistence doesn't leak in
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'language', {
      value: originalLanguage,
      configurable: true,
    });
  });

  describe('detectLocale', () => {
    it('prefers a locale stored in localStorage over navigator.language', () => {
      localStorage.setItem('locale', 'en');
      Object.defineProperty(navigator, 'language', { value: 'ko-KR', configurable: true });

      expect(detectLocale()).toBe('en');
    });

    it('falls back to navigator.language when nothing is stored', () => {
      Object.defineProperty(navigator, 'language', { value: 'en-US', configurable: true });

      expect(detectLocale()).toBe('en');
    });

    it('falls back to ko when navigator.language is not English', () => {
      Object.defineProperty(navigator, 'language', { value: 'ko-KR', configurable: true });

      expect(detectLocale()).toBe('ko');
    });

    it('ignores an invalid stored value and falls back to navigator.language', () => {
      localStorage.setItem('locale', 'fr');
      Object.defineProperty(navigator, 'language', { value: 'en-GB', configurable: true });

      expect(detectLocale()).toBe('en');
    });
  });

  describe('setLocale / getLocale', () => {
    it('round-trips the current locale', () => {
      setLocale('en');
      expect(getLocale()).toBe('en');

      setLocale('ko');
      expect(getLocale()).toBe('ko');
    });

    it('persists the locale to localStorage', () => {
      setLocale('en');
      expect(localStorage.getItem('locale')).toBe('en');
    });

    it('updates document.documentElement.lang', () => {
      setLocale('en');
      expect(document.documentElement.lang).toBe('en');

      setLocale('ko');
      expect(document.documentElement.lang).toBe('ko');
    });
  });

  describe('initLocale', () => {
    it('applies the detected locale on init', () => {
      localStorage.setItem('locale', 'en');
      initLocale();
      expect(getLocale()).toBe('en');
    });
  });

  describe('t', () => {
    it('resolves plain string keys in Korean by default', () => {
      setLocale('ko');
      expect(t('INVALID_CODE')).toBe('잘못된 주소입니다.');
    });

    it('resolves plain string keys in English', () => {
      setLocale('en');
      expect(t('INVALID_CODE')).toBe('Invalid address.');
    });

    it('resolves function keys with interpolation in Korean', () => {
      setLocale('ko');
      expect(t('UNSUPPORTED_SITE', 'invalid')).toBe('지원하지 않는 사이트입니다: invalid');
    });

    it('resolves function keys with interpolation in English', () => {
      setLocale('en');
      expect(t('UNSUPPORTED_SITE', 'invalid')).toBe('Unsupported site: invalid');
    });
  });
});
