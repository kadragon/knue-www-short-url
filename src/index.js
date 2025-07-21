import Sqids from "sqids";
import { siteMap, siteMapReverse } from "./siteMap.js";

/**
 * Sqids 인스턴스 (기본 알파벳: 영문 대소문자 + 숫자)
 */
const sqids = new Sqids();

/**
 * site, key, bbsNo, nttNo 값을 단축 코드로 인코딩합니다.
 * @param {Object} param
 * @param {string} param.site - 사이트명(예: "www", "education" 등)
 * @param {number} param.key - key 파라미터 값
 * @param {number} param.bbsNo - 게시판 번호
 * @param {number} param.nttNo - 게시글 번호
 * @returns {Object} 성공 시 {code: string}, 실패 시 {error: string}
 */
export function encodeURL({ site, key, bbsNo, nttNo }) {
  const siteNum = siteMap[site];
  if (!siteNum) {
    return { error: `지원하지 않는 사이트입니다: ${site}` };
  }
  if ([key, bbsNo, nttNo].some(isNaN)) {
    return { error: "key, bbsNo, nttNo는 반드시 숫자여야 합니다." };
  }
  return { code: sqids.encode([siteNum, key, bbsNo, nttNo]) };
}

/**
 * 단축 코드(문자열)를 원본 URL로 디코딩합니다.
 * @param {string} code - Sqids로 인코딩된 단축 코드
 * @returns {Object} 성공 시 {url: string}, 실패 시 {error: string}
 */
export function decodeURL(code) {
  const arr = sqids.decode(code);
  if (arr.length !== 4) {
    return { error: "잘못된 코드입니다." };
  }

  const [siteNum, key, bbsNo, nttNo] = arr;
  const site = siteMapReverse[siteNum];
  if (!site) {
    return { error: "존재하지 않는 사이트 코드입니다." };
  }

  const url = new URL(`https://www.knue.ac.kr/${site}/selectBbsNttView.do`);
  url.search = new URLSearchParams({
    key,
    bbsNo,
    nttNo,
  }).toString();

  return { url: url.toString() };
}
