// GENERATED FROM SPEC-ui-handlers

import { inspectShortUrl, type InspectionResult } from './urlEncoder';
import { ERROR_MESSAGES } from './constants';
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
 * // With navigator.clipboard support: alert('Copied to clipboard.').
 *
 * @example
 * // Clipboard API unavailable
 * await handleCopyToClipboard('https://knue.url.kr/?abc123');
 * // alert('Automatic copy is not supported in this environment. Please copy manually.').
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

interface InspectionRow extends InspectionResult {
  line: number;
  input: string;
  expected?: string;
}

// Ephemeral state only: locale changes preserve the current draft and results.
let inspectionInput = '';
let inspectionRows: InspectionRow[] = [];
let inspectionFeedback: keyof typeof ERROR_MESSAGES | undefined;
const statusMessages = {
  valid: 'INSPECT_VALID',
  expired: 'INSPECT_EXPIRED',
  invalid: 'INSPECT_INVALID',
  mismatch: 'INSPECT_MISMATCH',
} as const;

/** Render a local-only inspection form. All pasted content is rendered as text. */
export function renderInspection(root: HTMLElement): void {
  root.replaceChildren();
  const section = document.createElement('section');
  section.className = 'inspection';
  const heading = document.createElement('h1');
  heading.textContent = t('INSPECT_TITLE');
  const help = document.createElement('p');
  help.id = 'inspect-help';
  help.textContent = t('INSPECT_HELP');
  const notice = document.createElement('p');
  notice.className = 'inspection-notice';
  notice.textContent = t('INSPECT_NOTICE');
  const label = document.createElement('label');
  label.htmlFor = 'inspect-input';
  label.textContent = t('INSPECT_INPUT');
  const textarea = document.createElement('textarea');
  textarea.id = 'inspect-input';
  textarea.rows = 7;
  textarea.spellcheck = false;
  textarea.setAttribute('aria-describedby', help.id);
  textarea.value = inspectionInput;
  const run = document.createElement('button');
  run.id = 'inspect-run';
  run.type = 'button';
  run.textContent = t('INSPECT_RUN');
  const copy = document.createElement('button');
  copy.id = 'inspect-copy';
  copy.type = 'button';
  copy.textContent = t('INSPECT_COPY');
  copy.disabled = !inspectionRows.some((row) => row.status !== 'valid');
  const feedback = document.createElement('p');
  feedback.setAttribute('role', 'status');
  feedback.textContent = inspectionFeedback
    ? t(inspectionFeedback)
    : inspectionRows.length
      ? t('INSPECT_DONE', String(inspectionRows.length))
      : '';
  const tableRegion = document.createElement('div');
  tableRegion.className = 'inspection-table';
  tableRegion.tabIndex = 0;
  tableRegion.setAttribute('role', 'region');
  tableRegion.setAttribute('aria-label', t('INSPECT_TITLE'));
  const table = document.createElement('table');
  const head = document.createElement('thead');
  const headerRow = document.createElement('tr');
  for (const key of [
    'INSPECT_LINE',
    'INSPECT_INPUT',
    'INSPECT_ORIGINAL',
    'INSPECT_STATUS',
    'INSPECT_REASON',
  ] as const) {
    const cell = document.createElement('th');
    cell.scope = 'col';
    cell.textContent = t(key);
    headerRow.append(cell);
  }
  head.append(headerRow);
  const body = document.createElement('tbody');
  for (const row of inspectionRows) {
    const tr = document.createElement('tr');
    tr.dataset.status = row.status;
    for (const value of [
      String(row.line),
      row.input,
      row.url ?? '—',
      t(statusMessages[row.status]),
      t(row.reason),
    ]) {
      const cell = document.createElement('td');
      cell.textContent = value;
      tr.append(cell);
    }
    body.append(tr);
  }
  table.append(head, body);
  if (inspectionRows.length) tableRegion.append(table);
  textarea.addEventListener('input', () => {
    inspectionInput = textarea.value;
    inspectionRows = [];
    inspectionFeedback = undefined;
    tableRegion.replaceChildren();
    feedback.textContent = '';
    copy.disabled = true;
  });
  run.addEventListener('click', () => {
    inspectionInput = textarea.value;
    const now = Date.now();
    inspectionRows = inspectionInput.split(/\r?\n/).flatMap((line, index) => {
      if (!line.trim()) return [];
      const columns = line.split('\t');
      const [input, expected] = columns.map((value) => value.trim());
      const result: InspectionResult =
        columns.length > 2
          ? { status: 'invalid', reason: 'INSPECT_COLUMNS_ERROR' }
          : inspectShortUrl(input, expected, now);
      return [{ ...result, line: index + 1, input, expected }];
    });
    inspectionFeedback = inspectionRows.length ? undefined : 'INSPECT_EMPTY';
    renderInspection(root);
    root.querySelector<HTMLButtonElement>('#inspect-run')?.focus();
  });
  copy.addEventListener('click', async () => {
    const text = inspectionRows
      .filter((row) => row.status !== 'valid')
      .map((row) =>
        [
          row.line,
          row.input,
          row.expected ?? '',
          t(statusMessages[row.status]),
          t(row.reason),
        ].join('\t')
      )
      .join('\n');
    try {
      if (!navigator.clipboard) {
        inspectionFeedback = 'CLIPBOARD_NOT_SUPPORTED';
      } else {
        await navigator.clipboard.writeText(text);
        inspectionFeedback = 'CLIPBOARD_COPIED';
      }
    } catch {
      inspectionFeedback = 'CLIPBOARD_COPY_FAILED';
    }
    feedback.textContent = t(inspectionFeedback!);
  });
  section.append(heading, help, notice, label, textarea, run, copy, feedback, tableRegion);
  root.append(section);
}
