// GENERATED FROM SPEC-ui-handlers

import { logError } from './errorLogger';
import { t } from './i18n';

/**
 * Copies a short URL to the clipboard and provides user feedback.
 *
 * Checks for Clipboard API support and copies asynchronously when available.
 * Reports success or failure to the user with alert().
 * Handles errors with alert() instead of throwing.
 *
 * @param url - URL to copy to the clipboard (short URL).
 * @returns Resolves after copying or notifying the user.
 *
 * @example
 * // Success case
 * await handleCopyToClipboard('https://knue.url.kr/?abc123');
 * // With navigator.clipboard support: alert(<localized copied-message>).
 *
 * @example
 * // Clipboard API unavailable
 * await handleCopyToClipboard('https://knue.url.kr/?abc123');
 * // alert(<localized clipboard-unsupported message>).
 */
export async function handleCopyToClipboard(url: string): Promise<void> {
  try {
    if (!navigator.clipboard) {
      alert(t('CLIPBOARD_NOT_SUPPORTED'));
      return;
    }

    await navigator.clipboard.writeText(url);
    alert(t('CLIPBOARD_COPIED'));
  } catch (error) {
    logError('Clipboard', error);
    alert(t('CLIPBOARD_COPY_FAILED'));
  }
}

/**
 * Encodes the given URL as a QR code and renders it on a Canvas.
 *
 * QR generation is asynchronous and returns a Promise.
 * The qrcode library is lazy-loaded through a dynamic import into a separate chunk.
 * Generation failures are logged with logError, but the Promise resolves so the
 * UI is not blocked because the QR code is optional.
 *
 * @param canvas - Canvas element on which to render the QR code.
 * @param url - URL to encode as a QR code (short URL).
 * @returns Resolves after QR rendering succeeds or fails (never throws).
 *
 * @example
 * const canvas = document.getElementById('qrCanvas');
 * await handleGenerateQRCode(canvas, 'https://knue.url.kr/?abc123');
 * // QR code rendered on the Canvas.
 */
export async function handleGenerateQRCode(canvas: HTMLCanvasElement, url: string): Promise<void> {
  try {
    const { default: QRCode } = await import('qrcode');
    await new Promise<void>((resolve) => {
      QRCode.toCanvas(canvas, url, { width: 300 }, (error: Error | null | undefined) => {
        if (error) logError('QRCode', error);
        resolve(); // Resolve regardless of whether an error occurred.
      });
    });
  } catch (error) {
    // Swallow dynamic chunk loading failures (network, stale deployment, and so on)
    // to preserve the always-resolve contract. QR is optional, so do not propagate
    // an unhandled rejection to the fire-and-forget caller.
    logError('QRCode', error);
  }
}

/**
 * Creates a handler function for a click event listener.
 *
 * As a higher-order function, accepts a URL and returns an event handler.
 * The returned handler prevents the default action and calls handleCopyToClipboard().
 *
 * @param url - URL to copy on click (short URL).
 * @returns Async handler function for the click event.
 *
 * @example
 * const link = document.querySelector('a');
 * const handler = createCopyClickHandler('https://knue.url.kr/?abc123');
 * link.addEventListener('click', handler);
 * // Clicking the link copies the URL to the clipboard.
 */
export function createCopyClickHandler(url: string) {
  return async (event: Event) => {
    event.preventDefault();
    await handleCopyToClipboard(url);
  };
}
