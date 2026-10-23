import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');
const doc = new DOMParser().parseFromString(html, 'text/html');
const policy = doc
  .querySelector('meta[http-equiv="Content-Security-Policy"]')!
  .getAttribute('content')!;
const directives = new Map(
  policy
    .split(';')
    .filter((part) => part.trim())
    .map((part) => {
      const [name, ...sources] = part.trim().split(/\s+/);
      return [name, sources];
    })
);

describe('browser security metadata', () => {
  it('allows the stylesheet CDN fonts without widening script sources', () => {
    const stylesheet = doc.querySelector('link[href*="pretendard"]')!.getAttribute('href')!;
    expect(directives.get('font-src')).toContain(new URL(stylesheet).origin);
    expect(directives.get('script-src')).toEqual(["'self'"]);
  });

  it('allows CDN source maps without allowing arbitrary CDN connections', () => {
    const sources = directives.get('connect-src');
    expect(sources).toContain('https://cdn.jsdelivr.net/sm/');
    expect(sources).not.toContain('https://cdn.jsdelivr.net');
  });

  it('does not advertise unsupported HTTP-only headers in meta elements', () => {
    expect(doc.querySelector('meta[http-equiv="X-Frame-Options"]')).toBeNull();
    expect(doc.querySelector('meta[http-equiv="X-Content-Type-Options"]')).toBeNull();
    expect(doc.querySelector('meta[name="referrer"]')?.getAttribute('content')).toBe(
      'strict-origin-when-cross-origin'
    );
  });
});
