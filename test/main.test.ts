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
  validateExpiryDays,
  parseExpiryDaysParam,
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

  describe('validateExpiryDays', () => {
    it('should accept absent expDays as "no expiry"', () => {
      const result = validateExpiryDays(undefined);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept NaN expDays as "no expiry" (parseInt of a missing query param)', () => {
      const result = validateExpiryDays(NaN);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept the minimum boundary (1)', () => {
      const result = validateExpiryDays(1);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept the maximum boundary (3650)', () => {
      const result = validateExpiryDays(3650);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject 0 (below minimum)', () => {
      const result = validateExpiryDays(0);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('오류: 유효기간은 1일에서 3650일 사이여야 합니다.');
    });

    it('should reject a negative value', () => {
      const result = validateExpiryDays(-1);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('오류: 유효기간은 1일에서 3650일 사이여야 합니다.');
    });

    it('should reject a value above the maximum (3651)', () => {
      const result = validateExpiryDays(3651);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('오류: 유효기간은 1일에서 3650일 사이여야 합니다.');
    });

    it('should reject a non-integer value', () => {
      const result = validateExpiryDays(3.5);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('오류: 유효기간은 1일에서 3650일 사이여야 합니다.');
    });

    it('should reject a numeric string instead of coercing it', () => {
      const result = validateExpiryDays('30');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('오류: 유효기간은 1일에서 3650일 사이여야 합니다.');
    });

    it('should reject Infinity', () => {
      const result = validateExpiryDays(Infinity);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('오류: 유효기간은 1일에서 3650일 사이여야 합니다.');
    });
  });

  describe('parseExpiryDaysParam', () => {
    it('should treat an absent parameter as "no expiry"', () => {
      const result = parseExpiryDaysParam(undefined);
      expect(result.valid).toBe(true);
      expect(result.days).toBeUndefined();
    });

    it('should treat an empty string as "no expiry"', () => {
      const result = parseExpiryDaysParam('');
      expect(result.valid).toBe(true);
      expect(result.days).toBeUndefined();
    });

    it('should parse a valid digit string', () => {
      const result = parseExpiryDaysParam('30');
      expect(result.valid).toBe(true);
      expect(result.days).toBe(30);
    });

    it('should reject a non-numeric string instead of silently issuing a permanent link', () => {
      const result = parseExpiryDaysParam('foo');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('오류: 유효기간은 1일에서 3650일 사이여야 합니다.');
      expect(result.days).toBeUndefined();
    });

    it('should reject a string with trailing garbage instead of truncating it', () => {
      const result = parseExpiryDaysParam('30abc');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('오류: 유효기간은 1일에서 3650일 사이여야 합니다.');
    });

    it('should reject a decimal string instead of truncating it', () => {
      const result = parseExpiryDaysParam('3.5');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('오류: 유효기간은 1일에서 3650일 사이여야 합니다.');
    });

    it('should still enforce the numeric range for a well-formed digit string', () => {
      const result = parseExpiryDaysParam('99999');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('오류: 유효기간은 1일에서 3650일 사이여야 합니다.');
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
vi.mock('../src/urlEncoder', async (importOriginal) => {
  // `kstEpochDayToDate` is pure (no DOM/network side effects), so keep the
  // real implementation; only encodeURL/decodeURL need per-test mocking.
  const actual = await importOriginal<typeof import('../src/urlEncoder')>();
  return {
    ...actual,
    encodeURL: vi.fn(),
    decodeURL: vi.fn(),
  };
});
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

    // Mock fetch so decode-mode's analytics ping never hits the network.
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));

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
    vi.unstubAllGlobals();
  });

  describe('Decode Mode', () => {
    it('should redirect to the decoded URL on successful decode', () => {
      window.location.search = '?validCode';
      mockedDecodeURL.mockReturnValue({ url: 'https://www.knue.ac.kr/decoded' });

      window.onload();

      expect(mockedDecodeURL).toHaveBeenCalledWith('validCode');
      expect(window.location.href).toBe('https://www.knue.ac.kr/decoded');
      // Analytics ping fires once for a successful (KNUE-valid) decode.
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should show an alert and redirect to home on failed decode, surfacing the decode error', () => {
      window.location.search = '?invalidCode';
      mockedDecodeURL.mockReturnValue({ error: 'Invalid code' });

      window.onload();

      // decodeResult.error is surfaced verbatim (e.g. so an expired code
      // shows the expiry message rather than the generic invalid-code one).
      expect(window.alert).toHaveBeenCalledWith('Invalid code');
      expect(window.location.href).toBe('/');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should fall back to the generic invalid-code message when decodeResult.error is absent', () => {
      window.location.search = '?invalidCode';
      mockedDecodeURL.mockReturnValue({});

      window.onload();

      expect(window.alert).toHaveBeenCalledWith('잘못된 주소입니다.');
      expect(window.location.href).toBe('/');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should redirect to the app root (not the domain root) on a sub-path deployment', () => {
      // Deployed under `/s/`: a failed decode must stay inside the app.
      window.location.pathname = '/s/';
      window.location.search = '?invalidCode';
      mockedDecodeURL.mockReturnValue({ error: 'Invalid code' });

      window.onload();

      expect(window.location.href).toBe('/s/');
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should alert the expiry message and skip trackRedirect for an expired code', () => {
      window.location.search = '?expiredCode';
      mockedDecodeURL.mockReturnValue({ error: '만료된 코드입니다.' });

      window.onload();

      expect(window.alert).toHaveBeenCalledWith('만료된 코드입니다.');
      expect(window.location.href).toBe('/');
      expect(fetch).not.toHaveBeenCalled();
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

    it('should render the expiry date under the short URL when expDays is set', async () => {
      window.location.search = '?site=www&key=1&bbsNo=2&nttNo=3&expDays=30';
      mockedEncodeURL.mockReturnValue({ code: 'shortCode', expiryEpochDay: 20500 });

      window.onload();
      await flushPromises();

      expect(mockedEncodeURL).toHaveBeenCalledWith({
        site: 'www',
        key: 1,
        bbsNo: 2,
        nttNo: 3,
        expDays: 30,
      });

      const resultDiv = document.getElementById('result');
      expect(resultDiv?.textContent).toContain('유효기간:');
    });

    it('renders the expiry date from the encoded expiryEpochDay rather than recomputing it from a fresh clock read', async () => {
      window.location.search = '?site=www&key=1&bbsNo=2&nttNo=3&expDays=30';
      // KST epoch day for 2026-06-15 (see src/urlEncoder.ts `toKstEpochDay`).
      const expiryEpochDay = Math.floor(Date.UTC(2026, 5, 15) / 86_400_000);
      mockedEncodeURL.mockReturnValue({ code: 'shortCode', expiryEpochDay });

      window.onload();
      await flushPromises();

      const resultDiv = document.getElementById('result');
      // ko-KR rendering (Asia/Seoul) of 2026-06-15, independent of the
      // machine's local clock/timezone at test-run time.
      expect(resultDiv?.textContent).toContain('2026. 6. 15.');
    });

    it('should display an error when expDays is out of the valid range', () => {
      window.location.search = '?site=www&key=1&bbsNo=2&nttNo=3&expDays=99999';

      window.onload();

      const resultDiv = document.getElementById('result');
      expect(resultDiv?.innerText).toBe('오류: 유효기간은 1일에서 3650일 사이여야 합니다.');
      expect(QRCode.toCanvas).not.toHaveBeenCalled();
    });

    it('should reject a malformed expDays instead of silently issuing a permanent link', () => {
      window.location.search = '?site=www&key=1&bbsNo=2&nttNo=3&expDays=foo';

      window.onload();

      const resultDiv = document.getElementById('result');
      expect(resultDiv?.innerText).toBe('오류: 유효기간은 1일에서 3650일 사이여야 합니다.');
      expect(mockedEncodeURL).not.toHaveBeenCalled();
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

    it('should not accumulate duplicate links when toggling locale in encode mode', () => {
      window.location.search = '?site=www&key=1&bbsNo=2&nttNo=3';
      mockedEncodeURL.mockReturnValue({ code: 'shortCode' });

      window.onload();

      const resultDiv = document.getElementById('result');
      const toggle = document.getElementById('locale-toggle') as HTMLButtonElement;
      expect(resultDiv?.querySelectorAll('a')).toHaveLength(1);

      // Re-rendering on locale toggle must be idempotent — a single <a>, not stacked.
      toggle.click();
      expect(resultDiv?.querySelectorAll('a')).toHaveLength(1);

      toggle.click();
      expect(resultDiv?.querySelectorAll('a')).toHaveLength(1);
    });
  });
});
