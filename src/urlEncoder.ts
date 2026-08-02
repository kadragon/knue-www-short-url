import Sqids from 'sqids';
import { siteMap, siteMapReverse } from './knueSites';
import { t } from './i18n';
import { areAllValidNumbers } from './validators';

/**
 * Sqids instance configured to optimize generated short codes.
 *
 * Sqids encodes arrays of numbers as short ID strings.
 * Configuration:
 * - alphabet: characters to use (upper/lowercase letters, numbers, and symbols)
 * - minLength: minimum generated code length (3 or more recommended)
 * - blocklist: words that must not be generated (excluding inappropriate words)
 *
 * @private
 */
const sqids = new Sqids({
  // Include common letters, numbers, and URL-safe characters.
  alphabet: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~',
  // Generate codes at least 3 characters long (shorter codes risk collisions).
  minLength: 3,
  // Do not generate reserved or special words.
  blocklist: new Set(['admin', 'www', 'api']),
});

interface EncodeParams {
  site: string;
  key: unknown;
  bbsNo: unknown;
  nttNo: unknown;
  /** Days until expiry. Omitted → a legacy 4-element code that never expires. */
  expDays?: number;
}

/** One day in milliseconds. Used for epoch-day arithmetic. */
const MS_PER_DAY = 86_400_000;

/** Fixed offset of KST (Asia/Seoul, UTC+9, no DST) in milliseconds. */
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * Converts an epoch timestamp (ms) to a KST "epoch day" — the number of days
 * since 1970-01-01 00:00 KST.
 *
 * A short code is a link that gets shared around. If the expiry boundary were
 * derived from whoever opens it (e.g. `getTimezoneOffset()`), the same code
 * would appear to expire on different dates for different recipients. Pinning
 * the boundary to KST — a fixed +9 with no DST, and the timezone of this app's
 * KNUE audience — is what makes one code mean one expiry date for everyone,
 * regardless of where it was encoded or opened.
 *
 * @param now - epoch timestamp (ms) to convert
 * @returns KST epoch day (integer)
 */
export function toKstEpochDay(now: number): number {
  return Math.floor((now + KST_OFFSET_MS) / MS_PER_DAY);
}

/**
 * Turns a KST epoch day back into the `Date` (a UTC instant) representing
 * midnight KST of that day. Used to display the expiry date, paired with
 * `toLocaleDateString(..., { timeZone: 'Asia/Seoul' })`.
 *
 * @param epochDay - a KST epoch day as returned by `toKstEpochDay`
 * @returns Date at 00:00 KST of that day
 */
export function kstEpochDayToDate(epochDay: number): Date {
  return new Date(epochDay * MS_PER_DAY - KST_OFFSET_MS);
}

interface EncodeResult {
  code?: string;
  error?: string;
  /** Expiry date (KST epoch day), set only when `expDays` is provided. */
  expiryEpochDay?: number;
}

/**
 * Encodes URL parameters with Sqids to create a short code.
 *
 * Algorithm:
 * 1. Convert the site string to a site number (1..N) using siteMap.
 * 2. Encode the number array [siteNum, key, bbsNo, nttNo] with Sqids.
 * 3. Return the short ID string (for example, "AbC123").
 *
 * Error cases:
 * - Unsupported site name.
 * - Invalid numbers (null, undefined, NaN, Infinity, and so on).
 *
 * This function does not throw and always returns an object.
 * Callers determine success or failure from result.error or result.code.
 *
 * When `expDays` is provided, adds the expiry date (KST epoch day; see
 * `toKstEpochDay`) as the fifth array element. Without `expDays`, encodes only
 * the original four elements, preserving compatibility for existing links
 * issued without expiry (the same four-element array always produces the same code).
 *
 * @param params - Parameters to encode (`expDays` is optional).
 * @param now - Current time (epoch ms), optional for fixed-clock tests;
 *   defaults to `Date.now()`.
 * @returns Encoding result: `code` (and `expiryEpochDay` when `expDays` is set)
 *   on success, or `error` on failure.
 *
 * @example
 * // Success case
 * const result = encodeURL({ site: "www", key: 123, bbsNo: 456, nttNo: 789 });
 * // result: { code: "AbC123" }
 *
 * @example
 * // Case with expiry (expires after 30 days)
 * const result = encodeURL({ site: "www", key: 123, bbsNo: 456, nttNo: 789, expDays: 30 });
 *
 * @example
 * // Failure case - unsupported site
 * const result = encodeURL({ site: "invalid", key: 123, bbsNo: 456, nttNo: 789 });
 * // result: { error: localized unsupported-site message }
 */
export function encodeURL(
  { site, key, bbsNo, nttNo, expDays }: EncodeParams,
  now: number = Date.now()
): EncodeResult {
  const siteNum = siteMap[site];
  if (!siteNum) {
    return { error: t('UNSUPPORTED_SITE', site) };
  }
  const numericValues = [key, bbsNo, nttNo];
  if (!areAllValidNumbers(...numericValues)) {
    return { error: t('INVALID_NUMERIC_PARAMS') };
  }
  const [numericKey, numericBbsNo, numericNttNo] = numericValues as [number, number, number];

  if (expDays === undefined) {
    return { code: sqids.encode([siteNum, numericKey, numericBbsNo, numericNttNo]) };
  }

  const expiryEpochDay = toKstEpochDay(now) + expDays;
  return {
    code: sqids.encode([siteNum, numericKey, numericBbsNo, numericNttNo, expiryEpochDay]),
    expiryEpochDay,
  };
}

interface DecodeResult {
  url?: string;
  error?: string;
}

/**
 * Decodes a short code string to its original KNUE URL.
 *
 * Only codes with four elements (legacy, no expiry) or five elements (with
 * expiry) are valid. Other lengths are treated as format errors. Five-element
 * codes remain valid through KST midnight on the encoded expiry day and expire
 * starting on the following KST date.
 *
 * @param code - Sqids-encoded short code (letters, numbers, and some symbols).
 * @param now - Current time (epoch ms), optional for fixed-clock tests;
 *   defaults to `Date.now()`.
 * @returns `{url: string}` (complete KNUE URL) on success, or `{error: string}`
 *   (error message) on failure.
 *
 * @example
 * // Success case
 * decodeURL("AbC123")
 * // Returns: {url: "https://www.knue.ac.kr/www/selectBbsNttView.do?key=123&bbsNo=456&nttNo=789"}
 *
 * @example
 * // Failure case - invalid code
 * decodeURL("invalid")
 * // Returns: {error: localized invalid-code message}
 *
 * @example
 * // Failure case - expired code
 * decodeURL("expiredCode")
 * // Returns: {error: localized expired-code message}
 *
 * @security Returned URLs are always restricted to the https://www.knue.ac.kr/ domain.
 */
export function decodeURL(code: string, now: number = Date.now()): DecodeResult {
  const arr = sqids.decode(code);
  if (arr.length !== 4 && arr.length !== 5) {
    return { error: t('INVALID_CODE_FORMAT') };
  }

  const [siteNum, key, bbsNo, nttNo, expiryEpochDay] = arr;

  if (arr.length === 5 && toKstEpochDay(now) > expiryEpochDay) {
    return { error: t('EXPIRED_CODE') };
  }

  const site = siteMapReverse[siteNum];
  if (!site) {
    return { error: t('UNKNOWN_SITE_CODE') };
  }

  const url = new URL(`https://www.knue.ac.kr/${site}/selectBbsNttView.do`);
  url.search = new URLSearchParams({
    key: String(key),
    bbsNo: String(bbsNo),
    nttNo: String(nttNo),
  }).toString();

  return { url: url.toString() };
}
