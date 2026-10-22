import Sqids from 'sqids';
import { describe, it, expect, beforeEach } from 'vitest';
import { encodeURL, decodeURL, inspectShortUrl } from '../src/urlEncoder';
import { setLocale } from '../src/i18n';
const now = Date.parse('2026-10-22T03:00:00Z');
const params = { site: 'www', key: 1, bbsNo: 2, nttNo: 3 };
const code = encodeURL(params, now).code!;
const short = `https://www.knue.ac.kr/s/?${code}`;
const original = decodeURL(code, now).url!;
describe('short URL inspection', () => {
  beforeEach(() => setLocale('ko'));
  it('classifies valid, expired, invalid and mismatched links without losing restored URLs', () => {
    expect(inspectShortUrl(short, undefined, now)).toMatchObject({
      status: 'valid',
      url: original,
    });
    const expired = encodeURL({ ...params, expDays: 1 }, now - 3 * 86400000).code!;
    expect(inspectShortUrl(`https://www.knue.ac.kr/s/?${expired}`, undefined, now)).toMatchObject({
      status: 'expired',
      url: original,
    });
    expect(inspectShortUrl('bad', undefined, now).status).toBe('invalid');
    expect(inspectShortUrl(short, original.replace('nttNo=3', 'nttNo=4'), now).status).toBe(
      'mismatch'
    );
  });
  it('compares normalized query order but rejects duplicate identity fields and other hosts', () => {
    expect(
      inspectShortUrl(
        short,
        'https://www.knue.ac.kr/www/selectBbsNttView.do?nttNo=3&key=1&bbsNo=2',
        now
      ).status
    ).toBe('valid');
    for (const expected of [
      original + '&key=1',
      original.replace('www.knue.ac.kr', 'evil.test'),
      'bad',
    ]) {
      expect(inspectShortUrl(short, expected, now).status).toBe('mismatch');
    }
  });
  it.each([
    'http://www.knue.ac.kr/s/?CODE',
    'https://evil.test/s/?CODE',
    'https://www.knue.ac.kr/?CODE',
    'https://www.knue.ac.kr/s/?CODE#fragment',
    'https://user@www.knue.ac.kr/s/?CODE',
    'https://www.knue.ac.kr/s/?CODE&x=1',
    'https://www.knue.ac.kr/s/?%41',
    'https://www.knue.ac.kr/s/?' + 'a'.repeat(51),
  ])('rejects malformed input %s', (input) => {
    expect(inspectShortUrl(input.replace('CODE', code), undefined, now).status).toBe('invalid');
  });
  it('rejects invalid code shapes and unknown expired sites before labeling expiry', () => {
    const sqids = new Sqids({
      alphabet: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~',
      minLength: 3,
      blocklist: new Set(['admin', 'www', 'api']),
    });
    for (const numbers of [
      [999999, 1, 2, 3, 1],
      [1, 2],
      [1, 2, 3, 4, 5, 6],
    ]) {
      const invalid = sqids.encode(numbers);
      expect(inspectShortUrl(`https://www.knue.ac.kr/s/?${invalid}`, undefined, now).status).toBe(
        'invalid'
      );
    }
  });
  it('remains valid throughout its KST expiry date', () => {
    const exp = encodeURL({ ...params, expDays: 1 }, now).code!;
    const input = `https://www.knue.ac.kr/s/?${exp}`;
    expect(inspectShortUrl(input, undefined, Date.parse('2026-10-23T14:59:59Z')).status).toBe(
      'valid'
    );
    expect(inspectShortUrl(input, undefined, Date.parse('2026-10-23T15:00:00Z')).status).toBe(
      'expired'
    );
  });
});
