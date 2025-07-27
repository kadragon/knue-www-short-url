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