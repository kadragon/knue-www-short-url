// GENERATED FROM SPEC-validation

import { VALIDATION, ERROR_MESSAGES } from "./constants";

/**
 * 값이 유효한 숫자인지 검증합니다.
 *
 * typeof 체크, NaN 체크, Infinity 체크를 모두 수행합니다.
 * null, undefined, 문자열, NaN, Infinity, -Infinity 등을 모두 거부합니다.
 *
 * @param value - 검증할 값 (모든 타입 가능)
 * @returns 유효한 숫자면 true, 아니면 false
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
 * 모든 값들이 유효한 숫자인지 검증합니다.
 *
 * 가변 개수의 인자를 받아서 모든 값이 isValidNumber() 조건을 만족하는지 확인합니다.
 *
 * @param values - 검증할 값들 (가변 인자, 모든 타입 가능)
 * @returns 모든 값이 유효한 숫자면 true, 하나라도 아니면 false
 *
 * @example
 * areAllValidNumbers(1, 2, 3);           // true
 * areAllValidNumbers(1, null, 3);        // false
 * areAllValidNumbers(1, NaN, 3);         // false
 * areAllValidNumbers(1, Infinity, 3);    // false
 * areAllValidNumbers(1, "2", 3);         // false
 */
export function areAllValidNumbers(...values: unknown[]): values is number[] {
  return values.every(isValidNumber);
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Decode 모드에서 입력된 코드의 길이 및 존재 여부를 검증합니다.
 *
 * @param code - Decode할 코드 (URL 파라미터에서 추출)
 * @returns 검증 결과 객체
 *
 * @example
 * validateDecodeCode('abc123');      // { valid: true }
 * validateDecodeCode('');            // { valid: false, error: '잘못된 주소입니다.' }
 * validateDecodeCode(null);          // { valid: false, error: '잘못된 주소입니다.' }
 * validateDecodeCode('a'.repeat(51)); // { valid: false, error: '오류: 코드 길이가 너무 깁니다.' }
 */
export function validateDecodeCode(code: unknown): ValidationResult {
  if (!code || typeof code !== 'string') {
    return { valid: false, error: ERROR_MESSAGES.INVALID_CODE };
  }

  if (code.length > VALIDATION.MAX_CODE_LENGTH) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_CODE_LENGTH };
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
 * Encode 모드에서 필수 파라미터의 존재 여부를 검증합니다.
 *
 * site는 문자열이어야 하고, key, bbsNo, nttNo는 유효한 숫자여야 합니다.
 *
 * @param params - 검증할 파라미터 객체
 * @returns 검증 결과 객체
 *
 * @example
 * validateEncodeParams({ site: 'www', key: 1, bbsNo: 2, nttNo: 3 });
 * // { valid: true }
 *
 * @example
 * validateEncodeParams({ site: '', key: 1, bbsNo: 2, nttNo: 3 });
 * // { valid: false, error: '오류: 필수 파라미터가 누락되었거나 잘못되었습니다.' }
 */
export function validateEncodeParams(params: EncodeParams): ValidationResult {
  const { site, key, bbsNo, nttNo } = params;

  if (!site || !areAllValidNumbers(key, bbsNo, nttNo)) {
    return { valid: false, error: ERROR_MESSAGES.MISSING_PARAMETERS };
  }

  return { valid: true };
}

/**
 * Encode 모드에서 숫자 파라미터의 유효한 범위를 검증합니다.
 *
 * 모든 파라미터는 0 이상 999,999,999 이하여야 합니다.
 *
 * @param params - 검증할 파라미터 객체 (숫자만)
 * @returns 검증 결과 객체
 *
 * @example
 * validateParameterRange({ key: 123, bbsNo: 456, nttNo: 789 });
 * // { valid: true }
 *
 * @example
 * validateParameterRange({ key: 9999999999, bbsNo: 2, nttNo: 3 });
 * // { valid: false, error: '오류: 파라미터 값이 유효 범위를 벗어났습니다.' }
 */
export function validateParameterRange(params: {
  key: number;
  bbsNo: number;
  nttNo: number;
}): ValidationResult {
  const { key, bbsNo, nttNo } = params;
  const values = [key, bbsNo, nttNo];

  const isOutOfRange = values.some(
    n => n < VALIDATION.MIN_NUMERIC_VALUE || n > VALIDATION.MAX_NUMERIC_VALUE
  );

  if (isOutOfRange) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_PARAMETER_RANGE };
  }

  return { valid: true };
}
