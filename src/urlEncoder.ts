import Sqids from 'sqids';
import { siteMap, siteMapReverse } from './knueSites';
import { t } from './i18n';
import { areAllValidNumbers } from './validators';

/**
 * Sqids 인스턴스 - 생성되는 단축 코드를 최적화하는 설정
 *
 * Sqids는 숫자 배열을 짧은 ID 문자열로 인코딩하는 라이브러리입니다.
 * 구성 요소:
 * - alphabet: 사용할 문자 (영문 대소문자, 숫자, 일부 기호)
 * - minLength: 생성되는 코드의 최소 길이 (3 이상 권장)
 * - blocklist: 생성하지 않을 단어들 (SEO 친화적, 부적절한 단어 제외)
 *
 * @private
 */
const sqids = new Sqids({
  // 일반적인 영문자, 숫자, URL 안전 문자 포함
  alphabet: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~',
  // 최소 3글자 이상 코드 생성 (너무 짧으면 충돌 위험)
  minLength: 3,
  // 예약어 및 특수 단어는 생성하지 않음
  blocklist: ['admin', 'www', 'api'],
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
  /** 만료일(KST epoch day). `expDays`가 주어졌을 때만 설정됩니다. */
  expiryEpochDay?: number;
}

/**
 * URL 파라미터들을 Sqids로 인코딩하여 단축 코드를 생성합니다.
 *
 * 알고리즘:
 * 1. site 문자열 → siteMap에서 사이트 번호(1~N) 변환
 * 2. 숫자 배열 [siteNum, key, bbsNo, nttNo] → Sqids 인코딩
 * 3. 결과: 짧은 ID 문자열 (예: "AbC123")
 *
 * 에러 케이스:
 * - 지원되지 않는 사이트명
 * - 유효하지 않은 숫자 (null, undefined, NaN, Infinity 등)
 *
 * 주의: 이 함수는 예외를 throw하지 않으며, 항상 Object를 반환합니다.
 * 호출자는 result.error 또는 result.code로 성공/실패 판정합니다.
 *
 * `expDays`가 주어지면 만료일(KST epoch day, `toKstEpochDay` 참고)을 배열의
 * 5번째 요소로 추가해 인코딩합니다. `expDays`가 없으면 기존과 동일하게
 * 4개 요소만 인코딩하므로, 만료 없이 발급된 기존 단축 코드는 하위호환이
 * 유지됩니다(항상 같은 4-요소 배열 → 같은 코드).
 *
 * @param params - 인코딩할 파라미터 객체 (expDays는 선택)
 * @param now - 현재 시각(epoch ms). 테스트에서 시계를 고정하기 위한 선택 인자이며,
 *   기본값은 `Date.now()`입니다.
 * @returns 인코딩 결과. 성공 시 `code`(및 `expDays` 지정 시 `expiryEpochDay`),
 *   실패 시 `error`.
 *
 * @example
 * // 성공 사례
 * const result = encodeURL({ site: "www", key: 123, bbsNo: 456, nttNo: 789 });
 * // result: { code: "AbC123" }
 *
 * @example
 * // 만료일 포함 사례 (30일 후 만료)
 * const result = encodeURL({ site: "www", key: 123, bbsNo: 456, nttNo: 789, expDays: 30 });
 *
 * @example
 * // 실패 사례 - 지원하지 않는 사이트
 * const result = encodeURL({ site: "invalid", key: 123, bbsNo: 456, nttNo: 789 });
 * // result: { error: "지원하지 않는 사이트입니다: invalid" }
 */
export function encodeURL(
  { site, key, bbsNo, nttNo, expDays }: EncodeParams,
  now: number = Date.now()
): EncodeResult {
  const siteNum = siteMap[site];
  if (!siteNum) {
    return { error: t('UNSUPPORTED_SITE', site) };
  }
  if (!areAllValidNumbers(key, bbsNo, nttNo)) {
    return { error: t('INVALID_NUMERIC_PARAMS') };
  }

  if (expDays === undefined) {
    return { code: sqids.encode([siteNum, key, bbsNo, nttNo]) };
  }

  const expiryEpochDay = toKstEpochDay(now) + expDays;
  return {
    code: sqids.encode([siteNum, key, bbsNo, nttNo, expiryEpochDay]),
    expiryEpochDay,
  };
}

interface DecodeResult {
  url?: string;
  error?: string;
}

/**
 * 단축 코드(문자열)를 원본 KNUE URL로 디코딩합니다.
 *
 * 배열 길이가 4(레거시, 만료 없음) 또는 5(만료일 포함)인 코드만 유효한
 * 것으로 간주합니다. 그 외 길이는 형식 오류로 처리합니다. 5-요소 코드는
 * 인코딩된 만료일(KST epoch day)의 KST 자정까지 유효하며, 그 다음
 * KST 날짜부터 만료로 취급됩니다.
 *
 * @param code - Sqids로 인코딩된 단축 코드 (영문자, 숫자, 일부 특수문자 조합)
 * @param now - 현재 시각(epoch ms). 테스트에서 시계를 고정하기 위한 선택 인자이며,
 *   기본값은 `Date.now()`입니다.
 * @returns 성공 시 {url: string} (완전한 KNUE URL), 실패 시 {error: string} (오류 메시지)
 *
 * @example
 * // 성공 사례
 * decodeURL("AbC123")
 * // Returns: {url: "https://www.knue.ac.kr/www/selectBbsNttView.do?key=123&bbsNo=456&nttNo=789"}
 *
 * @example
 * // 실패 사례 - 잘못된 코드
 * decodeURL("invalid")
 * // Returns: {error: "잘못된 코드입니다."}
 *
 * @example
 * // 실패 사례 - 만료된 코드
 * decodeURL("expiredCode")
 * // Returns: {error: "만료된 코드입니다."}
 *
 * @security 반환되는 URL은 항상 https://www.knue.ac.kr/ 도메인으로 제한됩니다
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
