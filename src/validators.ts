// GENERATED FROM SPEC-validation

import { VALIDATION } from './constants';
import { t } from './i18n';

/**
 * Checks whether a value is a valid number.
 *
 * Performs typeof, NaN, and Infinity checks.
 * Rejects null, undefined, strings, NaN, Infinity, -Infinity, and similar values.
 *
 * @param value - Value to validate (any type).
 * @returns true for a valid number; otherwise false.
 *
 * @example
 * isValidNumber(123);        // true
 * isValidNumber(0);          // true
 * isValidNumber(-5);         // true
 * isValidNumber(3.14);       // true
 * isValidNumber(NaN);        // false
 * isValidNumber(Infinity);   // false
 * isValidNumber(null);       // false
 * isValidNumber(undefined);  // false
 * isValidNumber("123");      // false
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Checks whether all values are valid numbers.
 *
 * Accepts a variable number of arguments and checks each against isValidNumber().
 *
 * @param values - Values to validate (variadic, any type).
 * @returns true when every value is valid; otherwise false.
 *
 * @example
 * areAllValidNumbers(1, 2, 3);           // true
 * areAllValidNumbers(1, null, 3);        // false
 * areAllValidNumbers(1, NaN, 3);         // false
 * areAllValidNumbers(1, Infinity, 3);    // false
 * areAllValidNumbers(1, "2", 3);         // false
 */
export function areAllValidNumbers(...values: unknown[]): boolean {
  return values.every(isValidNumber);
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates the presence and length of a code entered in decode mode.
 *
 * @param code - Code to decode (extracted from a URL parameter).
 * @returns Validation result object.
 *
 * @example
 * validateDecodeCode('abc123');      // { valid: true }
 * validateDecodeCode('');            // { valid: false, error: localized invalid-address message }
 * validateDecodeCode(null);          // { valid: false, error: localized invalid-address message }
 * validateDecodeCode('a'.repeat(51)); // { valid: false, error: localized code-length message }
 */
export function validateDecodeCode(code: unknown): ValidationResult {
  if (!code || typeof code !== 'string') {
    return { valid: false, error: t('INVALID_CODE') };
  }

  if (code.length > VALIDATION.MAX_CODE_LENGTH) {
    return { valid: false, error: t('INVALID_CODE_LENGTH') };
  }

  return { valid: true };
}

interface EncodeParams {
  site?: string;
  key?: unknown;
  bbsNo?: unknown;
  nttNo?: unknown;
}

/**
 * Validates the presence of required parameters in encode mode.
 *
 * site must be a string, and key, bbsNo, and nttNo must be valid numbers.
 *
 * @param params - Parameter object to validate.
 * @returns Validation result object.
 *
 * @example
 * validateEncodeParams({ site: 'www', key: 1, bbsNo: 2, nttNo: 3 });
 * // { valid: true }
 *
 * @example
 * validateEncodeParams({ site: '', key: 1, bbsNo: 2, nttNo: 3 });
 * // { valid: false, error: localized missing-parameters message }
 */
export function validateEncodeParams(params: EncodeParams): ValidationResult {
  const { site, key, bbsNo, nttNo } = params;

  if (!site || !areAllValidNumbers(key, bbsNo, nttNo)) {
    return { valid: false, error: t('MISSING_PARAMETERS') };
  }

  return { valid: true };
}

/**
 * Validates the range of numeric parameters in encode mode.
 *
 * Every parameter must be between 0 and 999,999,999.
 *
 * @param params - Parameter object to validate (numbers only).
 * @returns Validation result object.
 *
 * @example
 * validateParameterRange({ key: 123, bbsNo: 456, nttNo: 789 });
 * // { valid: true }
 *
 * @example
 * validateParameterRange({ key: 9999999999, bbsNo: 2, nttNo: 3 });
 * // { valid: false, error: localized out-of-range message }
 */
export function validateParameterRange(params: {
  key: number;
  bbsNo: number;
  nttNo: number;
}): ValidationResult {
  const { key, bbsNo, nttNo } = params;
  const values = [key, bbsNo, nttNo];

  const isOutOfRange = values.some(
    (n) => n < VALIDATION.MIN_NUMERIC_VALUE || n > VALIDATION.MAX_NUMERIC_VALUE
  );

  if (isOutOfRange) {
    return { valid: false, error: t('INVALID_PARAMETER_RANGE') };
  }

  return { valid: true };
}

/**
 * Validates the optional expiry-days value (`expDays`) used by encode mode.
 *
 * Only an absent value (undefined/null/''/NaN) means "no expiry" and is treated
 * as valid — NaN is included because that is what `parseInt` yields for a
 * missing query parameter. Anything else must be an integer within
 * VALIDATION.MIN_EXPIRY_DAYS..MAX_EXPIRY_DAYS; non-numeric or non-finite values
 * such as the string '30' or Infinity are rejected rather than silently
 * degrading to "no expiry".
 *
 * @param expDays - expiry days to validate (absent means no expiry)
 * @returns validation result
 *
 * @example
 * validateExpiryDays(undefined);  // { valid: true }
 * validateExpiryDays(NaN);        // { valid: true }
 * validateExpiryDays(30);         // { valid: true }
 * validateExpiryDays(0);          // { valid: false, error: '...' }
 * validateExpiryDays(3.5);        // { valid: false, error: '...' }
 * validateExpiryDays(99999);      // { valid: false, error: '...' }
 * validateExpiryDays('30');       // { valid: false, error: '...' }
 * validateExpiryDays(Infinity);   // { valid: false, error: '...' }
 */
export function validateExpiryDays(expDays: unknown): ValidationResult {
  const isAbsent =
    expDays === undefined ||
    expDays === null ||
    expDays === '' ||
    (typeof expDays === 'number' && isNaN(expDays));

  if (isAbsent) {
    return { valid: true };
  }

  const isOutOfRange =
    !isValidNumber(expDays) ||
    !Number.isInteger(expDays) ||
    expDays < VALIDATION.MIN_EXPIRY_DAYS ||
    expDays > VALIDATION.MAX_EXPIRY_DAYS;

  if (isOutOfRange) {
    return { valid: false, error: t('INVALID_EXPIRY_RANGE') };
  }

  return { valid: true };
}

interface ExpiryDaysParamResult extends ValidationResult {
  /** Parsed integer day count — set only when the value was present and valid. */
  days?: number;
}

/**
 * Strictly parses and validates the raw `expDays` query-string parameter.
 *
 * Unlike `parseInt`, anything that is not digits-only (after trimming) is
 * rejected instead of silently coerced: `'30abc'`, `'3.5'` and `'foo'` would
 * otherwise become 30, 3 and NaN. The NaN case is the dangerous one — treating
 * a malformed value the same as an absent one would quietly issue a permanent
 * link to someone who asked for a temporary one.
 *
 * An absent parameter, or one that is empty after trimming, still means
 * "no expiry" and stays valid. Only a present-but-malformed value is rejected.
 *
 * @param raw - raw string value of the `expDays` query parameter (undefined if absent)
 * @returns validation result; `days` is set only when a valid value was present.
 *
 * @example
 * parseExpiryDaysParam(undefined); // { valid: true }
 * parseExpiryDaysParam('');        // { valid: true }
 * parseExpiryDaysParam('30');      // { valid: true, days: 30 }
 * parseExpiryDaysParam('foo');     // { valid: false, error: '...' }
 * parseExpiryDaysParam('30abc');   // { valid: false, error: '...' }
 * parseExpiryDaysParam('3.5');     // { valid: false, error: '...' }
 */
export function parseExpiryDaysParam(raw: string | undefined): ExpiryDaysParamResult {
  const trimmed = raw?.trim();

  if (!trimmed) {
    return { valid: true };
  }

  if (!/^\d+$/.test(trimmed)) {
    return { valid: false, error: t('INVALID_EXPIRY_RANGE') };
  }

  const days = Number(trimmed);
  const rangeCheck = validateExpiryDays(days);
  if (!rangeCheck.valid) {
    return rangeCheck;
  }

  return { valid: true, days };
}
