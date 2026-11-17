/** Pages in the main navigation, in order. Labels are keys in common.json. */
export const NAV_LINKS = [
  { to: '/work', labelKey: 'nav.work' },
  { to: '/about', labelKey: 'nav.about' },
  { to: '/contact', labelKey: 'nav.contact' },
] as const;

/** The phone menu also lists Home, since the site name is the only other way back. */
export const MOBILE_NAV_LINKS = [{ to: '/', labelKey: 'nav.home' }, ...NAV_LINKS] as const;
