import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { encodeURL, decodeURL } from '../src/urlEncoder';
import { renderInspection } from '../src/uiHandlers';
import { setLocale } from '../src/i18n';
vi.mock('../src/analytics', () => ({ trackRedirect: vi.fn() }));
import { trackRedirect } from '../src/analytics';
const code = encodeURL({ site: 'www', key: 1, bbsNo: 2, nttNo: 3 }).code!;
const link = `https://www.knue.ac.kr/s/?${code}`;
const original = decodeURL(code).url!;
function input() {
  return document.querySelector('textarea')!;
}
function run() {
  document.querySelector<HTMLButtonElement>('#inspect-run')!.click();
}
describe('inspection screen', () => {
  beforeEach(() => {
    setLocale('ko');
    document.body.innerHTML =
      '<div id="result"></div><canvas id="qrCanvas"></canvas><div id="copy-info"></div><button id="locale-toggle"></button>';
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('alert', vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });
  it('renders safely, preserves line numbers and input/results across locale changes, copies only problems', async () => {
    renderInspection(document.getElementById('result')!);
    input().value = `${link}\n\n<img src=x onerror=alert(1)>\n${link}\t${original.replace('nttNo=3', 'nttNo=9')}`;
    input().dispatchEvent(new Event('input'));
    run();
    expect(document.querySelectorAll('tbody tr')).toHaveLength(3);
    expect(document.querySelectorAll('tbody tr')[1].firstChild!.textContent).toBe('3');
    expect(document.querySelector('img')).toBeNull();
    const text = input().value;
    setLocale('en');
    renderInspection(document.getElementById('result')!);
    expect(input().value).toBe(text);
    expect(document.querySelectorAll('tbody tr')).toHaveLength(3);
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    document.querySelector<HTMLButtonElement>('#inspect-copy')!.click();
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledOnce());
    expect(writeText.mock.calls[0][0]).toContain('3\t<img');
    expect(writeText.mock.calls[0][0]).not.toContain(`1\t${link}`);
    writeText.mockRejectedValue(new Error('denied'));
    document.querySelector<HTMLButtonElement>('#inspect-copy')!.click();
    await vi.waitFor(() =>
      expect(document.querySelector('[role="status"]')!.textContent).toContain('Failed')
    );
    expect(fetch).not.toHaveBeenCalled();
    expect(trackRedirect).not.toHaveBeenCalled();
  });
  it('handles empty input, excess columns, expiry, unavailable clipboard and edited drafts', async () => {
    renderInspection(document.getElementById('result')!);
    input().value = '  ';
    run();
    expect(document.querySelector('[role="status"]')!.textContent).toContain('입력');
    const expired = encodeURL({ site: 'www', key: 1, bbsNo: 2, nttNo: 3, expDays: 1 }, 0).code!;
    input().value = `${link}\textra\tcolumn\nhttps://www.knue.ac.kr/s/?${expired}`;
    run();
    expect(document.querySelector('tbody')!.textContent).toContain('만료');
    expect(document.querySelector('tbody')!.textContent).toContain(original);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    document.querySelector<HTMLButtonElement>('#inspect-copy')!.click();
    expect(document.querySelector('[role="status"]')!.textContent).toContain('지원되지');
    input().value = link;
    input().dispatchEvent(new Event('input'));
    expect(document.querySelector('tbody')).toBeNull();
    expect(document.querySelector<HTMLButtonElement>('#inspect-copy')!.disabled).toBe(true);
  });
  it('continues inspecting valid rows after an unsafe numeric code', () => {
    renderInspection(document.getElementById('result')!);
    input().value = `https://www.knue.ac.kr/s/?${'a'.repeat(20)}\n${link}`;
    run();
    const rows = document.querySelectorAll<HTMLTableRowElement>('tbody tr');
    expect(rows).toHaveLength(2);
    expect(rows[0].dataset.status).toBe('invalid');
    expect(rows[1].dataset.status).toBe('valid');
    expect(rows[1].textContent).toContain(original);
  });
  it('copies both expiry and expected-original mismatch reasons', async () => {
    renderInspection(document.getElementById('result')!);
    const expired = encodeURL({ site: 'www', key: 1, bbsNo: 2, nttNo: 3, expDays: 1 }, 0).code!;
    input().value = `https://www.knue.ac.kr/s/?${expired}\t${original.replace('nttNo=3', 'nttNo=9')}`;
    run();
    expect(document.querySelector('tbody')!.textContent).toContain('만료');
    expect(document.querySelector('tbody')!.textContent).toContain('다르거나');
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    document.querySelector<HTMLButtonElement>('#inspect-copy')!.click();
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledOnce());
    expect(writeText.mock.calls[0][0]).toContain('만료');
    expect(writeText.mock.calls[0][0]).toContain('다르거나');
  });
  it('routes inspection before encoding without changing location or calling analytics', async () => {
    window.history.replaceState(null, '', '/s/?inspect=1');
    const href = window.location.href;
    await import('../src/app');
    window.onload!(new Event('load'));
    input().value = link;
    input().dispatchEvent(new Event('input'));
    run();
    expect(document.querySelector('tbody')!.textContent).toContain(original);
    expect(window.location.href).toBe(href);
    expect(fetch).not.toHaveBeenCalled();
    expect(trackRedirect).not.toHaveBeenCalled();
  });
});
