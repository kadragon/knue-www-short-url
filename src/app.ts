import { encodeURL, decodeURL, kstEpochDayToDate } from './urlEncoder';
import { VALIDATION } from './constants';
import {
  validateDecodeCode,
  validateEncodeParams,
  validateParameterRange,
  parseExpiryDaysParam,
} from './validators';
import { createCopyClickHandler, handleGenerateQRCode } from './uiHandlers';
import { logError } from './errorLogger';
import { t, initLocale, setLocale, getLocale } from './i18n';
import { trackRedirect } from './analytics';

// Global error handling and monitoring
window.addEventListener('error', (event: ErrorEvent) => {
  logError('GlobalError', event.error, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  logError('UnhandledRejection', event.reason);
});

/**
 * Initializes the main application logic and routes the current request.
 *
 * The application has three modes:
 * 1. Decode mode: ?<code> -> decode the original URL and redirect.
 * 2. Encode mode: ?site=...&key=...&bbsNo=...&nttNo=... -> create a short URL and QR code.
 * 3. Default mode: / -> display the default message.
 *
 * Parses URL parameters and routes to the appropriate mode.
 * All inputs are validated through functions in validators.ts.
 */
function render(): void {
  // Update the document title and locale-toggle label for the active locale.
  document.title = t('APP_TITLE');
  const localeToggle = document.getElementById('locale-toggle') as HTMLButtonElement | null;
  if (localeToggle) {
    localeToggle.textContent = t('LOCALE_TOGGLE');
  }

  // Reference DOM elements that must exist when the page loads.
  const search = window.location.search;
  const resultDiv = document.getElementById('result') as HTMLDivElement;
  const qrCanvas = document.getElementById('qrCanvas') as HTMLCanvasElement;
  const copyInfoDiv = document.getElementById('copy-info') as HTMLDivElement;

  // Clear previous output before re-rendering (for example, after a locale toggle).
  // Encode-success mode appends an <a> to resultDiv, so omitting this reset would
  // accumulate duplicate links.
  resultDiv.replaceChildren();

  /**
   * MODE 1: Decode Mode
   * Format: ?<code> (for example, ?XyZ123).
   * Action: decode the short code to the original URL and redirect.
   */
  if (search && !search.includes('=')) {
    // Remove '?' from the URL and trim whitespace.
    const code = search.substring(1).trim();

    // Validate code length and format through validators.ts.
    const validation = validateDecodeCode(code);
    if (!validation.valid) {
      alert(validation.error);
      // Redirect to the app root (current path), not the domain root, so
      // sub-path deployments like `/s/` keep the user inside the app.
      window.location.href = window.location.pathname;
      return;
    }

    // Decode the code to the original URL through urlEncoder.ts.
    const decodeResult = decodeURL(code);

    // Security: validate the decoded URL belongs to the KNUE domain before redirecting.
    // Redirect to the app root for other domains to prevent domain hijacking.
    if (decodeResult.url && decodeResult.url.startsWith(VALIDATION.KNUE_DOMAIN)) {
      // Best-effort inbound tracking: fire before navigation so the redirect
      // is still counted despite the immediate page unload.
      trackRedirect(code);
      window.location.href = decodeResult.url;
    } else {
      // Surface the specific decode error (e.g. expired code) when present,
      // falling back to the generic invalid-code message otherwise.
      alert(decodeResult.error ?? t('INVALID_CODE'));
      // See above: stay on the app root for sub-path deployments.
      window.location.href = window.location.pathname;
    }
    return;
  }

  /**
   * MODE 2: Encode Mode
   * Format: ?site=<site>&key=<key>&bbsNo=<bbsNo>&nttNo=<nttNo>.
   * Action: encode URL parameters into a short code and generate a QR code.
   */
  if (search && search.includes('=')) {
    // Parse the URL query string (for example, "?site=www&key=123" -> {site: "www", key: "123"}).
    const searchParams = new URLSearchParams(search);
    const params = Object.fromEntries(searchParams.entries());

    // Extract parameters and convert their types (strings -> numbers).
    // parseInt(value, 10) parses base 10 and returns NaN for non-numeric input.
    const site = params.site?.trim();
    const key = parseInt(params.key, 10);
    const bbsNo = parseInt(params.bbsNo, 10);
    const nttNo = parseInt(params.nttNo, 10);

    // Validate required parameters through validators.ts.
    // Check that site exists and key/bbsNo/nttNo are valid numbers.
    const encodeParamsValidation = validateEncodeParams({ site, key, bbsNo, nttNo });
    if (!encodeParamsValidation.valid) {
      resultDiv.innerText = encodeParamsValidation.error ?? '';
      return;
    }

    // Validate the range: every number must be between 0 and 999,999,999.
    // Excessively large numbers can cause Sqids encoding errors and security issues.
    const rangeValidation = validateParameterRange({ key, bbsNo, nttNo });
    if (!rangeValidation.valid) {
      resultDiv.innerText = rangeValidation.error ?? '';
      return;
    }

    // Expiry validation: an absent parameter is valid (no expiry); a present one
    // must be a digits-only string in the 1..3650 range ('30abc', '3.5' are rejected).
    const expiryValidation = parseExpiryDaysParam(params.expDays);
    if (!expiryValidation.valid) {
      resultDiv.innerText = expiryValidation.error ?? '';
      return;
    }
    const expDays = expiryValidation.days;

    // Encode parameters with Sqids to create a short code through urlEncoder.ts.
    const result = encodeURL({
      site,
      key,
      bbsNo,
      nttNo,
      expDays,
    });

    // On successful encoding: build the short URL and render its QR code.
    if (result.code) {
      // Build the short URL from the current origin and short code.
      // Example: https://knue.url.kr/?abc123
      const shortUrl = `${window.location.origin}${window.location.pathname}?${result.code}`;

      // Create an <a> element to display the short URL.
      const link = document.createElement('a');
      link.href = shortUrl;
      // Remove the protocol for display (shown as knue.url.kr/?abc123).
      link.textContent = shortUrl.replace(/^https?:\/\//, '');
      resultDiv.appendChild(link);

      // When an expiry is set, show it under the short URL. Render the very
      // expiryEpochDay encodeURL encoded rather than recomputing it from a
      // second Date.now() — near midnight the two clock reads could disagree
      // and the label would name a different day than the code carries.
      if (result.expiryEpochDay !== undefined) {
        const expiryDate = kstEpochDayToDate(result.expiryEpochDay);
        const expiryDiv = document.createElement('div');
        expiryDiv.textContent = t(
          'EXPIRES_ON',
          expiryDate.toLocaleDateString(getLocale(), { timeZone: 'Asia/Seoul' })
        );
        resultDiv.appendChild(expiryDiv);
      }

      // Display the clipboard-copy guidance text.
      copyInfoDiv.textContent = t('COPY_INFO');

      // Register a click handler that copies the URL to the clipboard.
      link.addEventListener('click', createCopyClickHandler(shortUrl));

      // Generate the QR code and render it on the Canvas through uiHandlers.ts.
      handleGenerateQRCode(qrCanvas, shortUrl);
    } else {
      // On encoding failure: display the error message (for example, an unsupported site).
      resultDiv.innerText = t('ERROR_PREFIX') + result.error;
    }
    return; // Encode mode complete.
  }

  /**
   * MODE 3: Default Mode
   * Format: / (no query string).
   * Action: display the default guidance message.
   */
  resultDiv.innerText = t('DEFAULT_MESSAGE');
}

/**
 * Connects the click event for the locale-toggle button.
 *
 * Called once from `window.onload`; a click switches the locale and reruns
 * `render()` to update visible strings. It stays outside render() so repeated
 * renders do not register duplicate handlers.
 */
function wireLocaleToggle(): void {
  const localeToggle = document.getElementById('locale-toggle') as HTMLButtonElement | null;
  if (!localeToggle) {
    return;
  }

  localeToggle.textContent = t('LOCALE_TOGGLE');
  localeToggle.addEventListener('click', () => {
    setLocale(getLocale() === 'ko' ? 'en' : 'ko');
    render();
  });
}

window.onload = function () {
  initLocale();
  render();
  wireLocaleToggle();
};
