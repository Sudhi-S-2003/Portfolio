import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { getRouteMeta } from './routeMeta';

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.append(element);
  }
  element.content = content;
}

/** Keeps the tab title and description in step with the page and the language. */
export function PageMeta() {
  const { pathname } = useLocation();
  const { t } = useTranslation(['meta', 'projects']);
  const { title, description } = getRouteMeta(pathname, t);

  useEffect(() => {
    document.title = title;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
  }, [title, description]);

  return null;
}
