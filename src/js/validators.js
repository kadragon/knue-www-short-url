// GENERATED FROM SPEC-validation

import { VALIDATION, ERROR_MESSAGES } from "./constants.js";

/**
 * Decode 모드: 코드 길이 및 형식 검증
 * @param {string} code - Decode할 코드
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateDecodeCode(code) {
  if (!code) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_CODE };
  }

  if (code.length > VALIDATION.MAX_CODE_LENGTH) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_CODE };
  }

  return { valid: true };
}

/**
 * Encode 모드: 파라미터 필수값 검증
 * @param {Object} params - { site, key, bbsNo, nttNo }
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateEncodeParams(params) {
  const { site, key, bbsNo, nttNo } = params;

  if (!site || isNaN(key) || isNaN(bbsNo) || isNaN(nttNo)) {
    return { valid: false, error: ERROR_MESSAGES.MISSING_PARAMETERS };
  }

  return { valid: true };
}

/**
 * Encode 모드: 파라미터 범위 검증
 * @param {Object} params - { key, bbsNo, nttNo }
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateParameterRange(params) {
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

/**
 * 숫자 파라미터 타입 검증
 * Validates that a value is a finite number (not NaN, null, undefined, or Infinity)
 * @param {number} value - 검증할 값
 * @returns {boolean} 유효한 숫자면 true
 */
export function isValidNumber(value) {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * 숫자 배열의 모든 요소가 유효한 숫자인지 검증
 * @param {...number} values - 검증할 값들 (가변 인자)
 * @returns {boolean} 모두 유효하면 true
 */
export function areAllValidNumbers(...values) {
  return values.every(isValidNumber);
}
