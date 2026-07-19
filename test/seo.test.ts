import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Guards the SEO meta/OG/Twitter tags in index.html against regression.
// Crawlers don't run JS, so these must live in the static HTML head.
// Vitest runs with cwd at the project root (where index.html lives).
const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf-8');
const doc = new DOMParser().parseFromString(html, 'text/html');

const metaByName = (name: string) =>
  doc.querySelector(`meta[name="${name}"]`)?.getAttribute('content') ?? null;
const metaByProp = (prop: string) =>
  doc.querySelector(`meta[property="${prop}"]`)?.getAttribute('content') ?? null;

describe('SEO meta tags', () => {
  it('has a non-empty description meta', () => {
    const description = metaByName('description');
    expect(description).toBeTruthy();
    expect((description as string).length).toBeGreaterThan(10);
  });

  it('has the required Open Graph tags', () => {
    expect(metaByProp('og:type')).toBe('website');
    expect(metaByProp('og:site_name')).toBeTruthy();
    expect(metaByProp('og:title')).toBeTruthy();
    expect(metaByProp('og:description')).toBeTruthy();
    expect(metaByProp('og:url')).toBeTruthy();
    expect(metaByProp('og:image:width')).toBe('1200');
    expect(metaByProp('og:image:height')).toBe('630');
    expect(metaByProp('og:locale')).toBe('ko_KR');
  });

  it('exposes an absolute https og:image URL', () => {
    const image = metaByProp('og:image');
    expect(image).toMatch(/^https:\/\//);
    expect(image).toMatch(/og-image\.png$/);
  });

  it('has a summary_large_image Twitter card', () => {
    expect(metaByName('twitter:card')).toBe('summary_large_image');
    expect(metaByName('twitter:title')).toBeTruthy();
    expect(metaByName('twitter:description')).toBeTruthy();
    expect(metaByName('twitter:image')).toMatch(/^https:\/\//);
  });
});
