// GENERATED FROM SPEC-ui-handlers

import { ERROR_MESSAGES } from "./constants";
import QRCode from "qrcode";

/**
 * 단축 URL을 클립보드에 복사하고 사용자에게 피드백을 제공합니다.
 *
 * Clipboard API 지원 여부를 확인하고, 지원하면 비동기로 복사를 진행합니다.
 * 성공/실패 여부를 alert()로 사용자에게 알립니다.
 * 에러 발생 시에도 throw하지 않고 alert로 처리합니다.
 *
 * @param url - 클립보드에 복사할 URL (단축 URL)
 * @returns 복사 완료 또는 사용자 알림 후 해결
 *
 * @example
 * // 성공 사례
 * await handleCopyToClipboard('https://knue.url.kr/?abc123');
 * // navigator.clipboard 지원 시: alert('클립보드에 복사되었습니다.')
 *
 * @example
 * // Clipboard API 미지원
 * await handleCopyToClipboard('https://knue.url.kr/?abc123');
 * // alert('자동 복사 기능이 지원되지 않는 환경입니다. 수동으로 복사해주세요.')
 */
export async function handleCopyToClipboard(url: string): Promise<void> {
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
 * 주어진 URL을 QR 코드로 인코딩하여 Canvas에 렌더링합니다.
 *
 * QR 코드 생성은 비동기 작업이므로 Promise를 반환합니다.
 * 생성 실패 시 console.error로 로깅하지만 Promise는 resolve되므로
 * UI를 차단하지 않습니다 (QR 코드는 선택사항이므로).
 *
 * @param canvas - QR 코드를 렌더링할 Canvas 요소
 * @param url - QR 코드로 인코딩할 URL (단축 URL)
 * @returns QR 코드 렌더링 완료 또는 실패 후 해결 (에러는 throw하지 않음)
 *
 * @example
 * const canvas = document.getElementById('qrCanvas');
 * await handleGenerateQRCode(canvas, 'https://knue.url.kr/?abc123');
 * // Canvas에 QR 코드 렌더링 완료
 */
export function handleGenerateQRCode(
  canvas: HTMLCanvasElement,
  url: string
): Promise<void> {
  return new Promise((resolve) => {
    QRCode.toCanvas(canvas, url, { width: 300 }, (error: Error | null) => {
      if (error) {
        console.error(ERROR_MESSAGES.QR_CODE_ERROR, error);
      }
      resolve(); // 에러 여부와 관계없이 resolve
    });
  });
}

/**
 * 클릭 이벤트 리스너용 핸들러 함수를 생성합니다.
 *
 * 고차 함수로서, URL을 인자로 받아 이벤트 핸들러 함수를 반환합니다.
 * 반환된 핸들러는 기본 동작을 방지하고 handleCopyToClipboard()를 호출합니다.
 *
 * @param url - 클릭 시 복사할 URL (단축 URL)
 * @returns 클릭 이벤트용 비동기 핸들러 함수
 *
 * @example
 * const link = document.querySelector('a');
 * const handler = createCopyClickHandler('https://knue.url.kr/?abc123');
 * link.addEventListener('click', handler);
 * // 링크 클릭 시 URL이 클립보드에 복사됨
 */
export function createCopyClickHandler(url: string) {
  return async (event: Event) => {
    event.preventDefault();
    await handleCopyToClipboard(url);
  };
}
