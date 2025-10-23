import Sqids from "sqids";
import { siteMap, siteMapReverse } from "./knueSites.js";
import { ERROR_MESSAGES } from "./constants.js";
import { areAllValidNumbers } from "./validators.js";

/**
 * Sqids 인스턴스 - 최적화된 설정으로 더 짧은 코드 생성
 * - 확장된 알파벳: 더 많은 문자로 더 짧은 인코딩
 * - minLength: 3으로 설정하여 생성되는 코드의 최소 길이를 보장
 * - 최적화된 blocklist로 혼동을 피하면서 최대 효율성 유지
 */
const sqids = new Sqids({
  alphabet:
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~",
  minLength: 3,
  blocklist: ["admin", "www", "api"],
});

/**
 * site, key, bbsNo, nttNo 값을 단축 코드로 인코딩합니다.
 * 
 * @param {Object} param - 인코딩할 URL 파라미터들
 * @param {string} param.site - 사이트명 (예: "www", "education" 등). siteMap.js에 정의된 값이어야 함
 * @param {number} param.key - key 파라미터 값 (0 이상의 정수)
 * @param {number} param.bbsNo - 게시판 번호 (0 이상의 정수) 
 * @param {number} param.nttNo - 게시글 번호 (0 이상의 정수)
 * @returns {Object} 성공 시 {code: string} (단축 코드), 실패 시 {error: string} (오류 메시지)
 * 
 * @example
 * // 성공 사례
 * encodeURL({site: "www", key: 123, bbsNo: 456, nttNo: 789})
 * // Returns: {code: "AbC123"}
 * 
 * @example
 * // 실패 사례 - 지원하지 않는 사이트
 * encodeURL({site: "invalid", key: 123, bbsNo: 456, nttNo: 789})
 * // Returns: {error: "지원하지 않는 사이트입니다: invalid"}
 */
export function encodeURL({ site, key, bbsNo, nttNo }) {
  const siteNum = siteMap[site];
  if (!siteNum) {
    return { error: ERROR_MESSAGES.UNSUPPORTED_SITE(site) };
  }
  if (!areAllValidNumbers(key, bbsNo, nttNo)) {
    return { error: ERROR_MESSAGES.INVALID_NUMERIC_PARAMS };
  }
  return { code: sqids.encode([siteNum, key, bbsNo, nttNo]) };
}

/**
 * 단축 코드(문자열)를 원본 KNUE URL로 디코딩합니다.
 * 
 * @param {string} code - Sqids로 인코딩된 단축 코드 (영문자, 숫자, 일부 특수문자 조합)
 * @returns {Object} 성공 시 {url: string} (완전한 KNUE URL), 실패 시 {error: string} (오류 메시지)
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
 * @security 반환되는 URL은 항상 https://www.knue.ac.kr/ 도메인으로 제한됩니다
 */
export function decodeURL(code) {
  const arr = sqids.decode(code);
  if (arr.length !== 4) {
    return { error: ERROR_MESSAGES.INVALID_CODE_FORMAT };
  }

  const [siteNum, key, bbsNo, nttNo] = arr;
  const site = siteMapReverse[siteNum];
  if (!site) {
    return { error: ERROR_MESSAGES.UNKNOWN_SITE_CODE };
  }

  const url = new URL(`https://www.knue.ac.kr/${site}/selectBbsNttView.do`);
  url.search = new URLSearchParams({
    key,
    bbsNo,
    nttNo,
  }).toString();

  return { url: url.toString() };
}
