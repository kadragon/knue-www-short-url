import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const html = readFileSync(resolve(__dirname, '../index.html'), 'utf-8');

describe('SEO / OG meta tags', () => {
  it('has a Korean description meta tag', () => {
    expect(html).toMatch(/<meta name="description" content="[^"]*"/);
  });

  it('has all required Open Graph meta tags', () => {
    expect(html).toMatch(/<meta property="og:title" content="[^"]+"/);
    expect(html).toMatch(/<meta property="og:description" content="[^"]+"/);
    expect(html).toMatch(/<meta property="og:type" content="website">/);
    expect(html).toMatch(/<meta property="og:site_name" content="[^"]+"/);
    expect(html).toMatch(/<meta property="og:locale" content="ko_KR">/);
    expect(html).toMatch(/<meta property="og:url" content="[^"]+"/);
    expect(html).toMatch(/<meta property="og:image" content="[^"]+"/);
    expect(html).toMatch(/<meta property="og:image:width" content="1200">/);
    expect(html).toMatch(/<meta property="og:image:height" content="630">/);
  });

  it('has all required Twitter card meta tags', () => {
    expect(html).toMatch(/<meta name="twitter:card" content="summary_large_image">/);
    expect(html).toMatch(/<meta name="twitter:title" content="[^"]+"/);
    expect(html).toMatch(/<meta name="twitter:description" content="[^"]+"/);
    expect(html).toMatch(/<meta name="twitter:image" content="[^"]+"/);
  });

  it('uses absolute https URLs for og:url and og:image', () => {
    const ogUrlMatch = html.match(/<meta property="og:url" content="([^"]+)"/);
    const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);

    expect(ogUrlMatch).not.toBeNull();
    expect(ogImageMatch).not.toBeNull();
    expect(ogUrlMatch![1]).toMatch(/^https:\/\//);
    expect(ogImageMatch![1]).toMatch(/^https:\/\//);
  });
});
