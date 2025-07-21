import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';

// Mock index.js globally so that main.js imports the mocked versions
vi.mock('../src/index.js', () => ({
  encodeURL: vi.fn(),
  decodeURL: vi.fn(),
}));

// Import the mocked functions
import { encodeURL, decodeURL } from '../src/index.js';

// Import main.js AFTER index.js is mocked
import '../src/main.js'; // This will set window.onload using the mocked functions

describe('Main Application Logic', () => {
  let originalLocation;
  let originalAlert;

  beforeEach(() => {
    // Reset mocks for each test
    vi.clearAllMocks(); // Clears all mocks, including encodeURL and decodeURL

    // Mock window.location and alert
    originalLocation = window.location;
    originalAlert = window.alert;

    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        href: '',
        search: '',
        assign: vi.fn(),
        replace: vi.fn(),
      },
    });
    window.alert = vi.fn();

    // Reset DOM
    document.body.innerHTML = '<div id="result"></div>';
  });

  // Restore original window.location and alert after all tests
  // This is important to avoid affecting other tests or the test runner itself
  afterAll(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
    window.alert = originalAlert;
  });

  it('should redirect to the decoded URL on successful decode', () => {
    window.location.search = '?validCode';
    // Set the mock implementation for this specific test
    decodeURL.mockReturnValue({ url: 'https://www.knue.ac.kr/www/selectBbsNttView.do?key=1&bbsNo=2&nttNo=3' });

    // Manually trigger window.onload
    window.onload();

    expect(window.location.href).toBe('https://www.knue.ac.kr/www/selectBbsNttView.do?key=1&bbsNo=2&nttNo=3');
    expect(window.alert).not.toHaveBeenCalled();
  });

  it('should show an alert and redirect to default URL on failed decode', () => {
    window.location.search = '?invalidCode';
    decodeURL.mockReturnValue({ error: '잘못된 코드입니다.' });

    window.onload();

    expect(window.alert).toHaveBeenCalledWith('잘못된 주소입니다.');
    expect(window.location.href).toBe('https://www.knue.ac.kr/www/index.do');
  });

  it('should display JSON for encoding mode', () => {
    window.location.search = '?site=www&key=1&bbsNo=2&nttNo=3';
    encodeURL.mockReturnValue({ code: 'encodedCode' });

    window.onload();

    const resultDiv = document.getElementById('result');
    expect(resultDiv.innerText).toContain('"code": "encodedCode"');
    expect(window.location.href).toBe(''); // No redirection in encoding mode
    expect(window.alert).not.toHaveBeenCalled();
  });

  it('should display JSON for no query string', () => {
    window.location.search = '';
    window.onload();

    const resultDiv = document.getElementById('result');
    expect(resultDiv.innerText).toContain('"message": "KNUE 단축 URL 생성기"');
    expect(window.location.href).toBe(''); // No redirection
    expect(window.alert).not.toHaveBeenCalled();
  });
});