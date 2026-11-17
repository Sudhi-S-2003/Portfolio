import { useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { SITE } from '../../data/site';

const MINUTE_MS = 60_000;

/**
 * Tick exactly when the minute changes (India's UTC+5:30 offset keeps minute boundaries aligned with UTC), and
 * again whenever the tab comes back into view, because browsers slow timers down in background tabs.
 */
function subscribeToClock(onTick: () => void) {
  let timer: ReturnType<typeof setTimeout>;
  const scheduleNextMinute = () => {
    const untilNextMinute = MINUTE_MS - (Date.now() % MINUTE_MS) + 50;
    timer = setTimeout(() => {
      onTick();
      scheduleNextMinute();
    }, untilNextMinute);
  };
  const onVisible = () => {
    if (document.visibilityState !== 'visible') return;
    onTick();
    clearTimeout(timer);
    scheduleNextMinute();
  };
  scheduleNextMinute();
  document.addEventListener('visibilitychange', onVisible);
  return () => {
    clearTimeout(timer);
    document.removeEventListener('visibilitychange', onVisible);
  };
}

/** Current time in Kerala, formatted for the active language. Empty while pre-rendering. */
function useKeralaTime(language: string): string | null {
  return useSyncExternalStore(
    subscribeToClock,
    () =>
      new Intl.DateTimeFormat(language, { hour: 'numeric', minute: '2-digit', timeZone: SITE.timeZone }).format(
        new Date(),
      ),
    () => null,
  );
}

export function Footer() {
  const { t, i18n } = useTranslation('common');
  const time = useKeralaTime(i18n.resolvedLanguage ?? 'en');
  const links = [
    { href: SITE.github, label: t('footer.github') },
    { href: SITE.linkedin, label: t('footer.linkedin') },
    { href: `mailto:${SITE.email}`, label: t('footer.email') },
  ];
  return (
    <footer className="mx-auto mt-20 w-full max-w-5xl px-4 pb-10 sm:px-6">
      <div className="grid gap-4 border-t border-line pt-8 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-x-12">
        <h2 className="meta">{t('footer.elsewhere')}</h2>
        <div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-measure text-sm text-ink-muted">{t('footer.colophon')}</p>
          <p className="mt-2 text-sm text-ink-muted">
            {time ? <span>{t('footer.localTime', { time })} </span> : null}
            <span>{t('footer.copyright', { year: __BUILD_YEAR__ })}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
