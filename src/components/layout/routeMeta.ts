import type { TFunction } from 'i18next';
import { SITE } from '../../data/site';
import { isProjectSlug } from '../../features/work/projects';

export type RouteMeta = {
  title: string;
  description: string;
  ogImage: string;
  canonical: string;
  /** False for the not-found page: search engines should not list it. */
  indexable: boolean;
};

const STATIC_PAGES: Record<string, 'home' | 'work' | 'about' | 'contact'> = {
  '/': 'home',
  '/work': 'work',
  '/about': 'about',
  '/contact': 'contact',
};

function normalise(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

/** Title, description and preview image for a path, in the language of `t`. Used by the page and by pre-rendering. */
export function getRouteMeta(pathname: string, t: TFunction): RouteMeta {
  const path = normalise(pathname);

  const slug = /^\/work\/([^/]+)$/.exec(path)?.[1];
  if (isProjectSlug(slug)) {
    return {
      title: t('meta:caseStudy.title', { project: t(`projects:${slug}.title`) }),
      description: t(`projects:${slug}.summary`),
      ogImage: `${SITE.url}/og/${slug}.png`,
      canonical: `${SITE.url}${path}`,
      indexable: true,
    };
  }

  const page = STATIC_PAGES[path] ?? 'notFound';
  return {
    title: t(`meta:${page}.title`),
    description: t(`meta:${page}.description`),
    ogImage: `${SITE.url}/og/default.png`,
    canonical: `${SITE.url}${path}`,
    indexable: page !== 'notFound',
  };
}
