import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';

// Mock dependencies
vi.mock('../src/js/urlEncoder.js', () => ({
  encodeURL: vi.fn(),
  decodeURL: vi.fn(),
}));
vi.mock('qrcode', () => ({
  default: {
    toCanvas: vi.fn(),
  },
}));

// Import the mocked functions
import { encodeURL, decodeURL } from '../src/js/urlEncoder.js';
import QRCode from 'qrcode';

// Import app.js AFTER mocks are set up
import '../src/js/app.js';

describe('main.js Logic', () => {
  let originalLocation;
  let originalAlert;

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

    // Set up DOM structure similar to index.html
    document.body.innerHTML = `
      <div id="container">
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
      decodeURL.mockReturnValue({ url: 'https://www.knue.ac.kr/decoded' });

      window.onload();

      expect(decodeURL).toHaveBeenCalledWith('validCode');
      expect(window.location.href).toBe('https://www.knue.ac.kr/decoded');
    });

    it('should show an alert and redirect to home on failed decode', () => {
      window.location.search = '?invalidCode';
      decodeURL.mockReturnValue({ error: 'Invalid code' });

      window.onload();

      expect(window.alert).toHaveBeenCalledWith('잘못된 주소입니다.');
      expect(window.location.href).toBe('/');
    });
  });

  describe('Encode Mode', () => {
    it('should display the shortened URL and QR code on successful encode', () => {
      window.location.search = '?site=www&key=1&bbsNo=2&nttNo=3';
      encodeURL.mockReturnValue({ code: 'shortCode' });

      window.onload();

      const resultDiv = document.getElementById('result');
      const link = resultDiv.querySelector('a');
      const copyInfoDiv = document.getElementById('copy-info');
      const qrCanvas = document.getElementById('qrCanvas');
      const expectedUrl = 'https://knue.url.kr/?shortCode';

      expect(encodeURL).toHaveBeenCalledWith({ site: 'www', key: 1, bbsNo: 2, nttNo: 3 });
      expect(link).not.toBeNull();
      expect(link.href).toBe(expectedUrl);
      expect(link.textContent).toBe('knue.url.kr/?shortCode'); // Protocol removed for display
      expect(copyInfoDiv.textContent).toBe('(주소를 클릭하면 클립보드에 복사됩니다.)');
      expect(QRCode.toCanvas).toHaveBeenCalledWith(qrCanvas, expectedUrl, expect.any(Object), expect.any(Function));
    });

    it('should display an error message on failed encode', () => {
      window.location.search = '?site=invalid&key=1&bbsNo=2&nttNo=3';
      encodeURL.mockReturnValue({ error: 'Invalid site' });

      window.onload();

      const resultDiv = document.getElementById('result');
      expect(resultDiv.innerText).toBe('오류: Invalid site');
      expect(QRCode.toCanvas).not.toHaveBeenCalled();
    });

    it('should display an error when required parameters are missing', () => {
      window.location.search = '?site=www&key=1&bbsNo=2';

      window.onload();

      const resultDiv = document.getElementById('result');
      expect(resultDiv.innerText).toBe('오류: 필수 파라미터가 누락되었거나 잘못되었습니다.');
      expect(QRCode.toCanvas).not.toHaveBeenCalled();
    });

    it('should display an error when parameters are out of valid range', () => {
      window.location.search = '?site=www&key=9999999999&bbsNo=2&nttNo=3';

      window.onload();

      const resultDiv = document.getElementById('result');
      expect(resultDiv.innerText).toBe('오류: 파라미터 값이 유효 범위를 벗어났습니다.');
      expect(QRCode.toCanvas).not.toHaveBeenCalled();
    });

    it('should copy to clipboard on successful clipboard write', () => {
      window.location.search = '?site=www&key=1&bbsNo=2&nttNo=3';
      encodeURL.mockReturnValue({ code: 'shortCode' });

      const mockClipboard = {
        writeText: vi.fn().mockResolvedValue(undefined)
      };
      Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        writable: true
      });

      window.onload();

      const resultDiv = document.getElementById('result');
      const link = resultDiv.querySelector('a');
      const expectedUrl = 'https://knue.url.kr/?shortCode';

      link.click();

      expect(mockClipboard.writeText).toHaveBeenCalledWith(expectedUrl);
    });

    it('should handle clipboard write failure', () => {
      window.location.search = '?site=www&key=1&bbsNo=2&nttNo=3';
      encodeURL.mockReturnValue({ code: 'shortCode' });

      const mockClipboard = {
        writeText: vi.fn().mockRejectedValue(new Error('Clipboard failed'))
      };
      Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        writable: true
      });

      window.onload();

      const resultDiv = document.getElementById('result');
      const link = resultDiv.querySelector('a');

      link.click();

      expect(mockClipboard.writeText).toHaveBeenCalled();
    });

    it('should show alert when clipboard is not available', () => {
      window.location.search = '?site=www&key=1&bbsNo=2&nttNo=3';
      encodeURL.mockReturnValue({ code: 'shortCode' });

      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true
      });

      window.onload();

      const resultDiv = document.getElementById('result');
      const link = resultDiv.querySelector('a');

      link.click();

      expect(window.alert).toHaveBeenCalledWith(
        '자동 복사 기능이 지원되지 않는 환경입니다. 수동으로 복사해주세요.'
      );
    });

    it('should handle QR code generation error', () => {
      window.location.search = '?site=www&key=1&bbsNo=2&nttNo=3';
      encodeURL.mockReturnValue({ code: 'shortCode' });

      QRCode.toCanvas.mockImplementation((canvas, url, options, callback) => {
        callback(new Error('QR code generation failed'));
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      window.onload();

      expect(consoleSpy).toHaveBeenCalledWith(
        '오류: QR 코드 생성 실패:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Default Mode', () => {
    it('should display the default message when no query string is present', () => {
      window.location.search = '';
      window.onload();

      const resultDiv = document.getElementById('result');
      expect(resultDiv.innerText).toBe('KNUE 단축 URL 생성기');
    });
  });
});