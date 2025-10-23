// GENERATED FROM SPEC-ui-handlers

import { ERROR_MESSAGES } from "./constants.js";
import QRCode from "qrcode";

/**
 * 단축 URL을 클립보드에 복사하고 사용자 피드백 제공
 * @param {string} url - 복사할 URL
 * @returns {Promise<void>}
 */
export async function handleCopyToClipboard(url) {
  try {
    if (!navigator.clipboard) {
      alert(ERROR_MESSAGES.CLIPBOARD_NOT_SUPPORTED);
      return;
    }

    await navigator.clipboard.writeText(url);
    alert(ERROR_MESSAGES.CLIPBOARD_COPIED);
  } catch (error) {
    console.error("Clipboard error:", error);
    alert(ERROR_MESSAGES.CLIPBOARD_COPY_FAILED);
  }
}

/**
 * QR 코드를 Canvas에 생성
 * @param {HTMLCanvasElement} canvas - QR 코드를 그릴 canvas
 * @param {string} url - 인코딩할 URL
 * @returns {Promise<void>}
 */
export function handleGenerateQRCode(canvas, url) {
  return new Promise((resolve) => {
    QRCode.toCanvas(canvas, url, { width: 300 }, (error) => {
      if (error) {
        console.error(ERROR_MESSAGES.QR_CODE_ERROR, error);
      }
      resolve(); // 에러 여부와 관계없이 resolve
    });
  });
}

/**
 * 클릭 이벤트: 클립보드 복사 핸들러 생성
 * @param {string} url - 복사할 URL
 * @returns {Function} 클릭 이벤트 핸들러
 */
export function createCopyClickHandler(url) {
  return async (event) => {
    event.preventDefault();
    await handleCopyToClipboard(url);
  };
}
