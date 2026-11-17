import { describe, expect, it } from 'vitest';
import { versionOgImages } from './og-version';

const head =
  '<meta property="og:image" content="https://sudhis.netlify.app/og/default.png" />' +
  '<meta name="twitter:image" content="https://sudhis.netlify.app/og/default.png" />';

describe('versionOgImages', () => {
  it('tags every preview image URL with a hash of the image, which changes when the image does', () => {
    const before = versionOgImages(head, () => new TextEncoder().encode('old image'));
    const after = versionOgImages(head, () => new TextEncoder().encode('new image'));

    expect(before).toMatch(/\/og\/default\.png\?v=[0-9a-f]{10}"/);
    expect(before.match(/\?v=/g)).toHaveLength(2);
    expect(after).not.toBe(before);
    expect(versionOgImages(head, () => new TextEncoder().encode('old image'))).toBe(before);
  });

  it('reads the image by its path on the site', () => {
    const read: string[] = [];
    versionOgImages(head, (pathname) => {
      read.push(pathname);
      return new Uint8Array();
    });
    expect(read).toEqual(['/og/default.png', '/og/default.png']);
  });

  it('leaves other URLs alone', () => {
    const html = '<link rel="canonical" href="https://sudhis.netlify.app/work" /><img src="/images/sudhi.webp" />';
    expect(versionOgImages(html, () => new Uint8Array())).toBe(html);
  });
});
