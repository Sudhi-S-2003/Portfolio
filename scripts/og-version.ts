import { createHash } from 'node:crypto';

/**
 * Add ?v=<hash of the image file> to every link-preview image URL (/og/*.png) in a page. LinkedIn and other sites
 * cache preview images by URL, so a re-rendered image under the same URL keeps showing the old one; with the content
 * hash in the URL, a changed image gets a new address and an unchanged one keeps its cache.
 */
export function versionOgImages(html: string, readImage: (pathname: string) => Uint8Array): string {
  return html.replace(/(https?:\/\/[^"'\s?]+)(\/og\/[\w-]+\.png)(?![?\w])/g, (_match, origin: string, pathname: string) => {
    const hash = createHash('sha256').update(readImage(pathname)).digest('hex').slice(0, 10);
    return `${origin}${pathname}?v=${hash}`;
  });
}
