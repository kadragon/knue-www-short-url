import { describe, it, expect } from 'vitest';
import Sqids from 'sqids';
import { encodeURL, decodeURL, toKstEpochDay } from '../src/urlEncoder';

// Mirrors the Sqids config in src/urlEncoder.ts so we can craft a code that
// decodes to a 6-element array (a shape decodeURL must always reject).
const sqids = new Sqids({
  alphabet: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~',
  minLength: 3,
  blocklist: new Set(['admin', 'www', 'api']),
});

describe('URL Encoding/Decoding', () => {
  const originalData = {
    site: 'www',
    key: 12345,
    bbsNo: 678,
    nttNo: 9012,
  };

  it('should correctly encode and then decode the URL parameters', () => {
    // 인코딩
    const encodeResult = encodeURL(originalData);
    expect(encodeResult.code).toBeTypeOf('string');
    expect(encodeResult.error).toBeUndefined();

    // 디코딩
    const decodeResult = decodeURL(encodeResult.code!);
    expect(decodeResult.url).toBeTypeOf('string');
    expect(decodeResult.error).toBeUndefined();

    const url = new URL(decodeResult.url!);

    // 검증
    expect(url.hostname).toBe('www.knue.ac.kr');
    expect(url.pathname).toBe(`/${originalData.site}/selectBbsNttView.do`);
    expect(url.searchParams.get('key')).toBe(originalData.key.toString());
    expect(url.searchParams.get('bbsNo')).toBe(originalData.bbsNo.toString());
    expect(url.searchParams.get('nttNo')).toBe(originalData.nttNo.toString());

    // Verify all original data is preserved
    const preservedData = {
      key: parseInt(url.searchParams.get('key') || '', 10),
      bbsNo: parseInt(url.searchParams.get('bbsNo') || '', 10),
      nttNo: parseInt(url.searchParams.get('nttNo') || '', 10),
    };
    expect(preservedData.key).toBe(originalData.key);
    expect(preservedData.bbsNo).toBe(originalData.bbsNo);
    expect(preservedData.nttNo).toBe(originalData.nttNo);
  });

  it('should return an error for invalid encoding data', () => {
    const invalidData = { ...originalData, site: 'invalid-site' };
    const result = encodeURL(invalidData);
    expect(result.error).toBeDefined();
    expect(result.code).toBeUndefined();
  });

  it('should return an error for invalid decoding code', () => {
    const result = decodeURL('invalid-code');
    expect(result.error).toBeDefined();
    expect(result.url).toBeUndefined();
  });

  it('should return an error when encoding with non-numeric values', () => {
    const invalidData = { ...originalData, key: 'not-a-number' };
    const result = encodeURL(invalidData);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('반드시 숫자여야');
    expect(result.code).toBeUndefined();
  });

  it('should return an error when encoding with NaN bbsNo', () => {
    const invalidData = { ...originalData, bbsNo: NaN };
    const result = encodeURL(invalidData);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('반드시 숫자여야');
    expect(result.code).toBeUndefined();
  });

  it('should return an error when encoding with NaN nttNo', () => {
    const invalidData = { ...originalData, nttNo: NaN };
    const result = encodeURL(invalidData);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('반드시 숫자여야');
    expect(result.code).toBeUndefined();
  });

  it('should return an error when encoding with null key', () => {
    const invalidData = { ...originalData, key: null };
    const result = encodeURL(invalidData);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('반드시 숫자여야');
    expect(result.code).toBeUndefined();
  });

  it('should return an error when encoding with undefined bbsNo', () => {
    const invalidData = { ...originalData, bbsNo: undefined };
    const result = encodeURL(invalidData);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('반드시 숫자여야');
    expect(result.code).toBeUndefined();
  });

  it('should return an error when encoding with Infinity', () => {
    const invalidData = { ...originalData, nttNo: Infinity };
    const result = encodeURL(invalidData);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('반드시 숫자여야');
    expect(result.code).toBeUndefined();
  });

  it('should return an error when encoding with negative Infinity', () => {
    const invalidData = { ...originalData, key: -Infinity };
    const result = encodeURL(invalidData);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('반드시 숫자여야');
    expect(result.code).toBeUndefined();
  });

  it('should return an error when encoding with string number', () => {
    const invalidData = { ...originalData, key: '123' };
    const result = encodeURL(invalidData);
    expect(result.error).toBeDefined();
    expect(result.error).toContain('반드시 숫자여야');
    expect(result.code).toBeUndefined();
  });
});

describe('URL Expiry Encoding/Decoding', () => {
  const originalData = {
    site: 'www',
    key: 12345,
    bbsNo: 678,
    nttNo: 9012,
  };

  // REGRESSION GUARD: this exact code was captured by running encodeURL()
  // for these inputs *before* the expiry feature was implemented (no
  // expDays argument). Published short URLs must keep decoding forever, so
  // omitting expDays must still produce this exact 4-element-array code.
  it('produces the same code as before the expiry feature when expDays is omitted', () => {
    const result = encodeURL(originalData);
    expect(result.code).toBe('~joeGJWlxyyLo');
  });

  it('should round-trip encode and decode with an expiry set', () => {
    const now = Date.UTC(2026, 0, 1); // 2026-01-01
    const encodeResult = encodeURL({ ...originalData, expDays: 10 }, now);
    expect(encodeResult.code).toBeTypeOf('string');
    expect(encodeResult.error).toBeUndefined();

    const decodeResult = decodeURL(encodeResult.code!, now);
    expect(decodeResult.url).toBeTypeOf('string');
    expect(decodeResult.error).toBeUndefined();

    const url = new URL(decodeResult.url!);
    expect(url.searchParams.get('key')).toBe(String(originalData.key));
  });

  it('should still decode a legacy 4-element code without expiry', () => {
    const encodeResult = encodeURL(originalData);
    const decodeResult = decodeURL(encodeResult.code!);
    expect(decodeResult.url).toBeTypeOf('string');
    expect(decodeResult.error).toBeUndefined();
  });

  it('should be valid through the end of the expiry day (boundary, KST)', () => {
    const encodeTime = Date.UTC(2026, 0, 1); // 2026-01-01T00:00:00Z == 2026-01-01T09:00 KST
    const encodeResult = encodeURL({ ...originalData, expDays: 1 }, encodeTime);
    // expiryEpochDay (KST) = toKstEpochDay(encodeTime) + 1 → KST date 2026-01-02.
    // Still within the expiry day (2026-01-02T23:59:59+09:00, late in the
    // KST day) → valid.
    const stillValidTime = Date.UTC(2026, 0, 2, 14, 59, 59); // 2026-01-02T23:59:59+09:00
    const decodeResult = decodeURL(encodeResult.code!, stillValidTime);
    expect(decodeResult.url).toBeTypeOf('string');
    expect(decodeResult.error).toBeUndefined();
  });

  it('should be expired the day after the expiry day (KST)', () => {
    const encodeTime = Date.UTC(2026, 0, 1); // 2026-01-01T00:00:00Z == 2026-01-01T09:00 KST
    const encodeResult = encodeURL({ ...originalData, expDays: 1 }, encodeTime);
    // expiryEpochDay (KST) → 2026-01-02; the following KST day (2026-01-03) is expired.
    const expiredTime = Date.UTC(2026, 0, 3); // 2026-01-03T00:00:00Z == 2026-01-03T09:00 KST
    const decodeResult = decodeURL(encodeResult.code!, expiredTime);
    expect(decodeResult.error).toBe('만료된 코드입니다.');
    expect(decodeResult.url).toBeUndefined();
  });

  it('TZ regression: expDays=1 encoded at 00:30 KST must not expire the same KST day', () => {
    // 2026-03-02T00:30:00+09:00 == 2026-03-01T15:30:00Z. A naive
    // `Math.floor(now / MS_PER_DAY)` (UTC epoch day) would compute the
    // encode-time's day as 2026-03-01 (one day earlier than its actual KST
    // calendar date, 2026-03-02), causing a 1-day expiry to render as
    // "today" instead of "tomorrow" for KST viewers.
    const encodeTime = Date.UTC(2026, 2, 1, 15, 30, 0);
    const encodeKstDay = toKstEpochDay(encodeTime);
    const encodeResult = encodeURL({ ...originalData, expDays: 1 }, encodeTime);

    expect(encodeResult.expiryEpochDay).not.toBe(encodeKstDay);
    expect(encodeResult.expiryEpochDay).toBe(encodeKstDay + 1);

    // Still valid late on the encode's own KST calendar day (2026-03-02).
    const sameKstDayLate = Date.UTC(2026, 2, 2, 14, 59, 0); // 2026-03-02T23:59:00+09:00
    expect(decodeURL(encodeResult.code!, sameKstDayLate).url).toBeTypeOf('string');
  });

  it('TZ regression: a code stays valid through 09:00 KST on the expiry day, but is expired by 09:00 KST the day after', () => {
    // Old (buggy) behavior compared a UTC epoch day against a KST-shifted
    // expiryEpochDay, which kept 5-element codes "valid" for an extra 9
    // hours past the intended KST-midnight cutoff — i.e. until 09:00 KST
    // the day after the labeled expiry date, instead of expiring right at
    // KST midnight.
    const encodeTime = Date.UTC(2026, 2, 1); // 2026-03-01T09:00:00+09:00
    const encodeResult = encodeURL({ ...originalData, expDays: 2 }, encodeTime);
    // expiryEpochDay (KST) → 2026-03-03.

    // 09:00 KST *on* the expiry day itself → still valid.
    const nineAmOnExpiryDay = Date.UTC(2026, 2, 3, 0, 0, 0); // 2026-03-03T09:00:00+09:00
    expect(decodeURL(encodeResult.code!, nineAmOnExpiryDay).url).toBeTypeOf('string');

    // 09:00 KST the day *after* the expiry day → must be expired.
    const nineAmDayAfterExpiry = Date.UTC(2026, 2, 4, 0, 0, 0); // 2026-03-04T09:00:00+09:00
    const decodeResult = decodeURL(encodeResult.code!, nineAmDayAfterExpiry);
    expect(decodeResult.error).toBe('만료된 코드입니다.');
    expect(decodeResult.url).toBeUndefined();
  });

  it('should reject a 6-element decoded array as invalid format', () => {
    const sixElementCode = sqids.encode([1, 12345, 678, 9012, 20000, 1]);
    const result = decodeURL(sixElementCode);
    expect(result.error).toBe('잘못된 코드입니다.');
    expect(result.url).toBeUndefined();
  });
});
