import { describe, it, expect, afterEach, vi } from 'vitest';
import { logError } from '../src/errorLogger';

describe('errorLogger', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log an Error instance with context label, message and stack', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('boom');

    logError('TestContext', error);

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const [label, payload] = consoleSpy.mock.calls[0];
    expect(label).toBe('[TestContext]');
    const parsed = JSON.parse(payload as string);
    expect(parsed.message).toBe('boom');
    expect(parsed.stack).toBe(error.stack);
  });

  it('should stringify a non-Error value and leave stack undefined', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logError('TestContext', 'plain failure');

    const [, payload] = consoleSpy.mock.calls[0];
    const parsed = JSON.parse(payload as string);
    expect(parsed.message).toBe('plain failure');
    expect(parsed.stack).toBeUndefined();
  });

  it('should merge meta fields into the logged payload', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logError('TestContext', new Error('boom'), { filename: 'app.ts', lineno: 42 });

    const [, payload] = consoleSpy.mock.calls[0];
    const parsed = JSON.parse(payload as string);
    expect(parsed.message).toBe('boom');
    expect(parsed.filename).toBe('app.ts');
    expect(parsed.lineno).toBe(42);
  });
});
