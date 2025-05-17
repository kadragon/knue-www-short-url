import { siteMap, siteMapReverse } from "./siteMap.js";

/**
 * Sqids 인스턴스 (기본 알파벳: 영문 대소문자 + 숫자)
 */
const sqids = new window.Sqids();

/**
 * URL 쿼리 파라미터를 객체 형태로 파싱하여 반환합니다.
 * @returns {Object} 파싱된 쿼리 파라미터 객체
 */
export function getParams() {
  return Object.fromEntries(new URLSearchParams(window.location.search));
}

/**
 * site, key, bbsNo, nttNo 값을 단축 코드로 인코딩합니다.
 * @param {Object} param
 * @param {string} param.site - 사이트명(예: "www", "education" 등)
 * @param {number} param.key - key 파라미터 값
 * @param {number} param.bbsNo - 게시판 번호
 * @param {number} param.nttNo - 게시글 번호
 * @returns {string|null} Sqids로 인코딩된 단축 코드(실패 시 null)
 */
export function encodeURL({ site, key, bbsNo, nttNo }) {
  const siteNum = siteMap[site];
  if (!siteNum || [key, bbsNo, nttNo].some(isNaN)) return null;
  return sqids.encode([siteNum, key, bbsNo, nttNo]);
}

/**
 * 단축 코드(문자열)를 원본 URL로 디코딩합니다.
 * @param {string} code - Sqids로 인코딩된 단축 코드
 * @returns {string|null} 원래의 전체 URL(실패 시 null)
 */
export function decodeURL(code) {
  const arr = sqids.decode(code);
  if (arr.length !== 4) return null;

  const [siteNum, key, bbsNo, nttNo] = arr;
  const site = siteMapReverse[siteNum];
  if (!site) return null;

  return `https://www.knue.ac.kr/${site}/selectBbsNttView.do?key=${key}&bbsNo=${bbsNo}&nttNo=${nttNo}`;
}
