import { describe, expect, it } from 'vitest';
import { render } from './entry-server';

describe('pre-rendered <head>', () => {
  it('gives a real page its canonical address and its own preview image', async () => {
    const { head } = await render('/work/apiforge');
    expect(head).toContain('<title>ApiForge · Sudhi S</title>');
    expect(head).toContain('<link rel="canonical" href="https://sudhis.netlify.app/work/apiforge" />');
    expect(head).toContain('https://sudhis.netlify.app/og/apiforge.png');
    expect(head).not.toContain('noindex');
  });

  it('tells search engines who the home page is about, and only on the home page', async () => {
    const { head } = await render('/');
    const json = head.match(/<script type="application\/ld\+json">(.*?)<\/script>/)?.[1];
    expect(json).toBeDefined();
    const person = JSON.parse(json ?? '{}') as Record<string, unknown>;
    expect(person['@type']).toBe('Person');
    expect(person.name).toBe('Sudhi S');
    expect(person.sameAs).toEqual(['https://www.linkedin.com/in/sudhi-s-a2a4ab30b', 'https://github.com/Sudhi-S-2003']);
    expect(person.worksFor).toEqual({ '@type': 'Organization', name: 'Oxium Technologies' });
    expect(json).not.toMatch(/@gmail|phone/i);

    const other = await render('/work/apiforge');
    expect(other.head).not.toContain('application/ld+json');
  });

  it('keeps the not-found page out of search results', async () => {
    const { head } = await render('/404');
    expect(head).toContain('<meta name="robots" content="noindex" />');
    expect(head).not.toContain('rel="canonical"');
  });
});
