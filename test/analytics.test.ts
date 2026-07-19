import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { trackRedirect } from '../src/analytics';
import { ANALYTICS } from '../src/constants';

describe('analytics', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    // stubGlobal (not Object.defineProperty) so unstubAllGlobals restores the
    // real window.location afterwards — avoids leaking a stale value to other
    // tests in the file/run.
    vi.stubGlobal('location', { hostname: 'knue.url.kr', pathname: '/' });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should send a redirect event to the Umami endpoint on success', () => {
    trackRedirect('abc');

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe(ANALYTICS.ENDPOINT);
    expect(options.method).toBe('POST');
    expect(options.keepalive).toBe(true);
    expect(options.headers).toEqual({ 'Content-Type': 'application/json' });

    const body = JSON.parse(options.body as string);
    expect(body.type).toBe('event');
    expect(body.payload.website).toBe(ANALYTICS.WEBSITE_ID);
    expect(body.payload.name).toBe('redirect');
    expect(body.payload.data.code).toBe('abc');
  });

  it('should swallow a rejected fetch and log the error, without throwing', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    expect(() => trackRedirect('abc')).not.toThrow();
    // Flush the microtask queue so the fetch rejection's .catch runs.
    await Promise.resolve();
    await Promise.resolve();

    expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', expect.stringContaining('network down'));
  });

  it('should log a non-2xx Umami response instead of discarding it silently', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 400 }));

    expect(() => trackRedirect('abc')).not.toThrow();
    // Flush both the resolve (.then) and the thrown-error (.catch) microtasks.
    await Promise.resolve();
    await Promise.resolve();

    expect(consoleSpy).toHaveBeenCalledWith('[Analytics]', expect.stringContaining('400'));
  });

  it('should do nothing when analytics is disabled', async () => {
    vi.resetModules();
    vi.doMock('../src/constants', () => ({
      ANALYTICS: { ENABLED: false, ENDPOINT: 'unused', WEBSITE_ID: 'unused' },
    }));

    const { trackRedirect: trackRedirectDisabled } = await import('../src/analytics');
    trackRedirectDisabled('abc');

    expect(fetch).not.toHaveBeenCalled();

    vi.doUnmock('../src/constants');
    vi.resetModules();
  });
});
