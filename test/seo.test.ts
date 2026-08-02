import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Production serves the app from this subpath (see docs/runbook.md → Deploy).
const DEPLOY_BASE = '/s/';

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

  it('ships the asset og:image points at', () => {
    // The absolute og:image URL can't be fetched at test time, but the mapping is
    // fixed: production serves the built app under DEPLOY_BASE and vite copies
    // public/ to the dist root, so the whole path after the base must resolve
    // inside public/. Checking only the filename would let a wrong directory
    // (…/s/missing/og-image.png) pass while crawlers get a 404.
    const image = metaByProp('og:image');
    expect(image).toBeTruthy();

    const url = new URL(image as string);
    expect(url.pathname.startsWith(DEPLOY_BASE)).toBe(true);

    const assetPath = resolve(process.cwd(), 'public', url.pathname.slice(DEPLOY_BASE.length));
    expect(existsSync(assetPath), assetPath).toBe(true);
  });

  it('has alt text for the card image', () => {
    // The card is Korean text baked into a raster, so it is inaccessible to
    // screen readers without alt text on both the OG and Twitter tags.
    expect(metaByProp('og:image:alt')).toBeTruthy();
    expect(metaByName('twitter:image:alt')).toBeTruthy();
  });

  it('has a summary_large_image Twitter card', () => {
    expect(metaByName('twitter:card')).toBe('summary_large_image');
    expect(metaByName('twitter:title')).toBeTruthy();
    expect(metaByName('twitter:description')).toBeTruthy();
    expect(metaByName('twitter:image')).toMatch(/^https:\/\//);
  });
});
