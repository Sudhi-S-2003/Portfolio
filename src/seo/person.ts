import { SITE, TOOLS } from '../data/site';

/**
 * schema.org Person data for the home page, so search engines can tie the name to this site, the LinkedIn and
 * GitHub profiles, the current job and the main skills. Facts only, in English; no email or phone.
 */
export function personJsonLd(): string {
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE.name,
    url: `${SITE.url}/`,
    image: `${SITE.url}/images/sudhi-336.jpg`,
    jobTitle: 'Full-stack developer',
    worksFor: { '@type': 'Organization', name: 'Oxium Technologies' },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Thiruvananthapuram',
      addressRegion: 'Kerala',
      addressCountry: 'IN',
    },
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'University of Kerala' },
    knowsAbout: [...TOOLS.backend.slice(0, 3), 'PostgreSQL', 'Kafka', 'React'],
    sameAs: [SITE.linkedin, SITE.github],
  };
  // "<" is escaped so the data can never close the <script> element it sits in.
  return JSON.stringify(person).replace(/</g, '\\u003c');
}
