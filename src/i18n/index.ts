import i18next, { type i18n as I18n, type Resource } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';
import about from '../../public/locales/en/about.json';
import common from '../../public/locales/en/common.json';
import contact from '../../public/locales/en/contact.json';
import errors from '../../public/locales/en/errors.json';
import home from '../../public/locales/en/home.json';
import meta from '../../public/locales/en/meta.json';
import projects from '../../public/locales/en/projects.json';
import work from '../../public/locales/en/work.json';
import { DEFAULT_LANGUAGE, isLanguage, NAMESPACES, SUPPORTED_LANGUAGES, type Language } from './languages';

/**
 * English ships inside the JavaScript bundle so pre-rendered pages and the first paint never wait on a request.
 * Malayalam and Hindi are fetched from /locales/<language>/<namespace>.json when they are detected or chosen.
 */
const englishResources = { about, common, contact, errors, home, meta, projects, work };

const SAVED_LANGUAGE_KEY = 'lang';

type CreateI18nOptions = {
  /** Start in this language instead of detecting one (pre-rendering, and hydrating pre-rendered pages). */
  lng?: Language;
  /** Load Malayalam and Hindi over HTTP. Off in tests and while pre-rendering. */
  withBackend: boolean;
  /** Extra in-memory resources, for tests. */
  extraResources?: Resource;
};

export async function createI18n({ lng, withBackend, extraResources }: CreateI18nOptions): Promise<I18n> {
  const instance = i18next.createInstance();
  const inBrowser = typeof window !== 'undefined';
  if (withBackend) instance.use(HttpBackend);
  if (inBrowser) instance.use(LanguageDetector);
  instance.use(initReactI18next);

  await instance.init({
    ...(lng ? { lng } : {}),
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    ns: [...NAMESPACES],
    defaultNS: 'common',
    resources: { en: englishResources, ...extraResources },
    partialBundledLanguages: true,
    backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
    detection: {
      // A choice the visitor made wins; then the browser's language; English when nothing matches.
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: SAVED_LANGUAGE_KEY,
      // Nothing is cached automatically: only an explicit choice is saved (see chooseLanguage), so a detected
      // language never masquerades as a choice and a later change of browser language is still followed.
      caches: [],
      convertDetectedLanguage: (detected: string) => detected.split('-')[0] ?? detected,
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

  return instance;
}

/** The language the detector would pick right now (saved choice, then browser), limited to supported ones. */
export function detectedLanguage(instance: I18n): Language {
  const found = instance.services.languageDetector?.detect();
  const candidates = (Array.isArray(found) ? found : [found]).filter((value): value is string => Boolean(value));
  for (const candidate of candidates) {
    const base = candidate.split('-')[0];
    if (isLanguage(base)) return base;
  }
  return DEFAULT_LANGUAGE;
}

/** Switch language because the visitor asked to, and remember it for next time. */
export async function chooseLanguage(instance: I18n, language: Language): Promise<void> {
  try {
    localStorage.setItem(SAVED_LANGUAGE_KEY, language);
  } catch {
    // Storage blocked: the switch still applies for this visit.
  }
  await instance.changeLanguage(language);
}

/** Keep <html lang> (and so the :lang() font rules) in step with the active language. */
export function syncDocumentLanguage(instance: I18n): () => void {
  const apply = () => {
    const language = instance.resolvedLanguage ?? DEFAULT_LANGUAGE;
    document.documentElement.lang = language;
    document.documentElement.dir = instance.dir(language);
  };
  apply();
  instance.on('languageChanged', apply);
  return () => instance.off('languageChanged', apply);
}
