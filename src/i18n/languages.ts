export const SUPPORTED_LANGUAGES = ['en', 'ml', 'hi'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = 'en';

/** Each language's own name, written in its own script. Shown in the switcher whatever the current language. */
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  ml: 'മലയാളം',
  hi: 'हिन्दी',
};

/** One file per namespace per language, under public/locales/<language>/<namespace>.json. */
export const NAMESPACES = ['common', 'home', 'work', 'projects', 'about', 'contact', 'errors', 'meta'] as const;

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}
