import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  afterAll,
  vi,
  type MockedFunction,
} from 'vitest';
import {
  validateDecodeCode,
  validateEncodeParams,
  validateParameterRange,
  isValidNumber,
} from '../src/validators';
import type { encodeURL as encodeURLType, decodeURL as decodeURLType } from '../src/urlEncoder';
import type { QRCodeRenderersOptions, QRCodeSegment } from 'qrcode';
import { setLocale } from '../src/i18n';

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

// Validator Unit Tests
describe('Validators Module', () => {
  describe('validateDecodeCode', () => {
    it('should reject empty code', () => {
      const result = validateDecodeCode('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('잘못된 주소입니다.');
    });

    it('should reject null code', () => {
      const result = validateDecodeCode(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('잘못된 주소입니다.');
    });

    it('should reject code exceeding max length', () => {
      const longCode = 'a'.repeat(51);
      const result = validateDecodeCode(longCode);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('오류: 코드 길이가 너무 깁니다.');
    });

    it('should accept valid code', () => {
      const result = validateDecodeCode('validCode123');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept code at max length', () => {
      const maxCode = 'a'.repeat(50);
      const result = validateDecodeCode(maxCode);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('validateEncodeParams', () => {
    it('should reject missing site', () => {
      const result = validateEncodeParams({ site: '', key: 1, bbsNo: 2, nttNo: 3 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('필수 파라미터');
    });

    it('should reject NaN key', () => {
      const result = validateEncodeParams({ site: 'www', key: NaN, bbsNo: 2, nttNo: 3 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('필수 파라미터');
    });

    it('should reject NaN bbsNo', () => {
      const result = validateEncodeParams({ site: 'www', key: 1, bbsNo: NaN, nttNo: 3 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('필수 파라미터');
    });

    it('should reject NaN nttNo', () => {
      const result = validateEncodeParams({ site: 'www', key: 1, bbsNo: 2, nttNo: NaN });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('필수 파라미터');
    });

    it('should accept valid params', () => {
      const result = validateEncodeParams({ site: 'www', key: 1, bbsNo: 2, nttNo: 3 });
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('validateParameterRange', () => {
    it('should reject key out of range (too high)', () => {
      const result = validateParameterRange({ key: 9999999999, bbsNo: 2, nttNo: 3 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('유효 범위');
    });

    it('should reject bbsNo out of range (negative)', () => {
      const result = validateParameterRange({ key: 1, bbsNo: -1, nttNo: 3 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('유효 범위');
    });

    it('should reject nttNo out of range (too high)', () => {
      const result = validateParameterRange({ key: 1, bbsNo: 2, nttNo: 1000000000 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('유효 범위');
    });

    it('should accept valid parameters within range', () => {
      const result = validateParameterRange({ key: 123, bbsNo: 456, nttNo: 789 });
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept parameters at min boundary', () => {
      const result = validateParameterRange({ key: 0, bbsNo: 0, nttNo: 0 });
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept parameters at max boundary', () => {
      const result = validateParameterRange({ key: 999999999, bbsNo: 999999999, nttNo: 999999999 });
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('isValidNumber', () => {
    it('should return true for valid numbers', () => {
      expect(isValidNumber(123)).toBe(true);
      expect(isValidNumber(0)).toBe(true);
      expect(isValidNumber(-1)).toBe(true);
      expect(isValidNumber(3.14)).toBe(true);
    });

    it('should return false for NaN', () => {
      expect(isValidNumber(NaN)).toBe(false);
    });

    it('should return false for Infinity', () => {
      expect(isValidNumber(Infinity)).toBe(false);
      expect(isValidNumber(-Infinity)).toBe(false);
    });

    it('should return false for non-numbers', () => {
      expect(isValidNumber('123')).toBe(false);
      expect(isValidNumber(null)).toBe(false);
      expect(isValidNumber(undefined)).toBe(false);
      expect(isValidNumber({})).toBe(false);
    });
  });
});

// Mock dependencies
vi.mock('../src/urlEncoder', () => ({
  encodeURL: vi.fn(),
  decodeURL: vi.fn(),
}));
vi.mock('qrcode', () => ({
  default: {
    toCanvas: vi.fn(),
  },
}));

// Import the mocked functions
import { encodeURL, decodeURL } from '../src/urlEncoder';
import QRCode from 'qrcode';

// Type the mocked functions
const mockedEncodeURL = encodeURL as MockedFunction<encodeURLType>;
const mockedDecodeURL = decodeURL as MockedFunction<decodeURLType>;
const mockedQRCodeToCanvas = QRCode.toCanvas as MockedFunction<
  (
    canvas: HTMLCanvasElement | string,
    text: string | QRCodeSegment[],
    options?: QRCodeRenderersOptions,
    callback?: (error: Error | null | undefined) => void
  ) => void
>;

// Import app.ts AFTER mocks are set up
import '../src/app';

// Flush pending microtasks/macrotasks. `handleGenerateQRCode` now awaits a
// dynamic `import('qrcode')` before calling `toCanvas`, and `window.onload`
// invokes it fire-and-forget, so QR assertions must wait a tick.
const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('main.ts Logic', () => {
  let originalLocation: Location;
  let originalAlert: typeof window.alert;

  beforeEach(() => {
    // Reset mocks and DOM before each test
    vi.clearAllMocks();

    // Mock window.location and alert
    originalLocation = window.location;
    originalAlert = window.alert;
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        href: '',
        search: '',
        origin: 'https://knue.url.kr',
        pathname: '/',
      },
    });
    window.alert = vi.fn();

    // Fix navigator.language to Korean and clear any persisted locale so
    // `initLocale()` (called by `window.onload`) always resolves to 'ko'
    // unless a test explicitly opts into English.
    Object.defineProperty(navigator, 'language', {
      value: 'ko-KR',
      configurable: true,
    });
    localStorage.clear();

    // Set up DOM structure similar to index.html
    document.body.innerHTML = `
      <div id="container">
        <button id="locale-toggle" type="button"></button>
        <div id="result"></div>
        <div id="copy-info"></div>
        <canvas id="qrCanvas"></canvas>
      </div>
    `;
  });

  afterAll(() => {
    // Restore original window properties
    Object.defineProperty(window, 'location', { value: originalLocation });
    window.alert = originalAlert;
  });

  describe('Decode Mode', () => {
    it('should redirect to the decoded URL on successful decode', () => {
      window.location.search = '?validCode';
      mockedDecodeURL.mockReturnValue({ url: 'https://www.knue.ac.kr/decoded' });

      window.onload();

      expect(mockedDecodeURL).toHaveBeenCalledWith('validCode');
      expect(window.location.href).toBe('https://www.knue.ac.kr/decoded');
    });

    it('should show an alert and redirect to home on failed decode', () => {
      window.location.search = '?invalidCode';
      mockedDecodeURL.mockReturnValue({ error: 'Invalid code' });

      window.onload();

      expect(window.alert).toHaveBeenCalledWith('잘못된 주소입니다.');
      expect(window.location.href).toBe('/');
    });

    it('should redirect to the app root (not the domain root) on a sub-path deployment', () => {
      // Deployed under `/s/`: a failed decode must stay inside the app.
      window.location.pathname = '/s/';
      window.location.search = '?invalidCode';
      mockedDecodeURL.mockReturnValue({ error: 'Invalid code' });

      window.onload();

      expect(window.location.href).toBe('/s/');
    });
  });

  describe('Encode Mode', () => {
    it('should display the shortened URL and QR code on successful encode', async () => {
      window.location.search = '?site=www&key=1&bbsNo=2&nttNo=3';
      mockedEncodeURL.mockReturnValue({ code: 'shortCode' });

      window.onload();
      await flushPromises(); // wait for the lazily imported qrcode module

      const resultDiv = document.getElementById('result');
      const link = resultDiv?.querySelector('a');
      const copyInfoDiv = document.getElementById('copy-info');
      const qrCanvas = document.getElementById('qrCanvas');
      const expectedUrl = 'https://knue.url.kr/?shortCode';

      expect(mockedEncodeURL).toHaveBeenCalledWith({ site: 'www', key: 1, bbsNo: 2, nttNo: 3 });
      expect(link).not.toBeNull();
      expect(link?.href).toBe(expectedUrl);
      expect(link?.textContent).toBe('knue.url.kr/?shortCode'); // Protocol removed for display
      expect(copyInfoDiv?.textContent).toBe('(주소를 클릭하면 클립보드에 복사됩니다.)');
      expect(QRCode.toCanvas).toHaveBeenCalledWith(
        qrCanvas,
        expectedUrl,
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('should display an error message on failed encode', () => {
      window.location.search = '?site=invalid&key=1&bbsNo=2&nttNo=3';
      mockedEncodeURL.mockReturnValue({ error: 'Invalid site' });

      window.onload();

      const resultDiv = document.getElementById('result');
      expect(resultDiv?.innerText).toBe('오류: Invalid site');
      expect(QRCode.toCanvas).not.toHaveBeenCalled();
    });

    it('should display an error when required parameters are missing', () => {
      window.location.search = '?site=www&key=1&bbsNo=2';

      window.onload();

      const resultDiv = document.getElementById('result');
      expect(resultDiv?.innerText).toBe('오류: 필수 파라미터가 누락되었거나 잘못되었습니다.');
      expect(QRCode.toCanvas).not.toHaveBeenCalled();
    });

    it('should display an error when parameters are out of valid range', () => {
      window.location.search = '?site=www&key=9999999999&bbsNo=2&nttNo=3';

      window.onload();

      const resultDiv = document.getElementById('result');
      expect(resultDiv?.innerText).toBe('오류: 파라미터 값이 유효 범위를 벗어났습니다.');
      expect(QRCode.toCanvas).not.toHaveBeenCalled();
    });

    it('should copy to clipboard on successful clipboard write', async () => {
      window.location.search = '?site=www&key=1&bbsNo=2&nttNo=3';
      mockedEncodeURL.mockReturnValue({ code: 'shortCode' });

      const mockClipboard = {
        writeText: vi.fn().mockResolvedValue(undefined),
      };
      Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        writable: true,
      });

      window.onload();

      const resultDiv = document.getElementById('result');
      const link = resultDiv?.querySelector('a') as HTMLElement;
      const expectedUrl = 'https://knue.url.kr/?shortCode';

      link.click();

      expect(mockClipboard.writeText).toHaveBeenCalledWith(expectedUrl);
    });

    it('should handle clipboard write failure', () => {
      window.location.search = '?site=www&key=1&bbsNo=2&nttNo=3';
      mockedEncodeURL.mockReturnValue({ code: 'shortCode' });

      const mockClipboard = {
        writeText: vi.fn().mockRejectedValue(new Error('Clipboard failed')),
      };
      Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        writable: true,
      });

      window.onload();

      const resultDiv = document.getElementById('result');
      const link = resultDiv?.querySelector('a') as HTMLElement;

      link.click();

      expect(mockClipboard.writeText).toHaveBeenCalled();
    });

    it('should show alert when clipboard is not available', () => {
      window.location.search = '?site=www&key=1&bbsNo=2&nttNo=3';
      mockedEncodeURL.mockReturnValue({ code: 'shortCode' });

      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
      });

      window.onload();

      const resultDiv = document.getElementById('result');
      const link = resultDiv?.querySelector('a') as HTMLElement;

      link.click();

      expect(window.alert).toHaveBeenCalledWith(
        '자동 복사 기능이 지원되지 않는 환경입니다. 수동으로 복사해주세요.'
      );
    });

    it('should handle QR code generation error', async () => {
      window.location.search = '?site=www&key=1&bbsNo=2&nttNo=3';
      mockedEncodeURL.mockReturnValue({ code: 'shortCode' });

      mockedQRCodeToCanvas.mockImplementation(
        (
          canvas: HTMLCanvasElement,
          url: string,
          options: object,
          callback: (error: Error | null) => void
        ) => {
          callback(new Error('QR code generation failed'));
        }
      );

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      window.onload();
      await flushPromises(); // wait for the lazily imported qrcode module

      // Failure path now logs via the central structured logError('QRCode', ...).
      expect(consoleSpy).toHaveBeenCalledWith(
        '[QRCode]',
        expect.stringContaining('QR code generation failed')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Default Mode', () => {
    it('should display the default message when no query string is present', () => {
      window.location.search = '';
      window.onload();

      const resultDiv = document.getElementById('result');
      expect(resultDiv?.innerText).toBe('KNUE 단축 URL 생성기');
    });
  });

  describe('Locale (i18n)', () => {
    afterEach(() => {
      setLocale('ko'); // avoid leaking locale state into unrelated tests
    });

    it('should display English strings when the locale is set to en', () => {
      setLocale('en');
      window.location.search = '';

      window.onload();

      const resultDiv = document.getElementById('result');
      expect(resultDiv?.innerText).toBe('KNUE Short URL Generator');
      expect(document.title).toBe('KNUE Short URL');
    });

    it('should show the English encode error message in en locale', () => {
      setLocale('en');
      window.location.search = '?site=www&key=1&bbsNo=2&nttNo=3';
      mockedEncodeURL.mockReturnValue({ error: 'Invalid site' });

      window.onload();

      const resultDiv = document.getElementById('result');
      expect(resultDiv?.innerText).toBe('Error: Invalid site');
    });

    it('should flip visible strings ko -> en -> ko when the locale toggle is clicked', () => {
      window.location.search = '';
      window.onload();

      const resultDiv = document.getElementById('result');
      const toggle = document.getElementById('locale-toggle') as HTMLButtonElement;

      expect(resultDiv?.innerText).toBe('KNUE 단축 URL 생성기');
      expect(toggle.textContent).toBe('EN');

      toggle.click();

      expect(resultDiv?.innerText).toBe('KNUE Short URL Generator');
      expect(toggle.textContent).toBe('한국어');

      toggle.click();

      expect(resultDiv?.innerText).toBe('KNUE 단축 URL 생성기');
      expect(toggle.textContent).toBe('EN');
    });
  });
});
