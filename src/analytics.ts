/**
 * Best-effort inbound (decode-mode) redirect tracking via Umami Cloud.
 *
 * Sends only the short code — no PII, no client-side timestamp (Umami
 * records the event time server-side). Manual `fetch` send (no `<script>`
 * tag), fired once immediately before navigation so the redirect is still
 * counted despite the immediate page unload. Never throws and never blocks
 * the caller: any failure (sync or async) is swallowed via logError,
 * consistent with the no-server, best-effort design.
 */
import { ANALYTICS } from './constants';
import { logError } from './errorLogger';

/**
 * Fires an Umami "redirect" event for the given short code.
 *
 * @param code - The short code being redirected from.
 */
export function trackRedirect(code: string): void {
  if (!ANALYTICS.ENABLED) {
    return;
  }

  try {
    const payload = {
      type: 'event',
      payload: {
        website: ANALYTICS.WEBSITE_ID,
        hostname: window.location.hostname,
        url: `${window.location.pathname}?${code}`,
        name: 'redirect',
        data: { code },
      },
    };

    fetch(ANALYTICS.ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    })
      .then((res) => {
        // `fetch` only rejects on network failure; a resolved 4xx/5xx (e.g. a
        // bad website ID or schema drift) would otherwise be discarded
        // silently. Surface it through the same best-effort log path.
        if (!res.ok) {
          throw new Error(`Umami responded ${res.status}`);
        }
      })
      .catch((err) => logError('Analytics', err));
  } catch (err) {
    logError('Analytics', err);
  }
}
