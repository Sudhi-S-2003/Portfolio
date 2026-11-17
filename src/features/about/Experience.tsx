import { useTranslation } from 'react-i18next';
import { EXPERIENCE } from '../../data/site';

type YearMonth = { year: number; month: number };

function formatMonth(value: YearMonth, language: string): string {
  return new Intl.DateTimeFormat(language, { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(value.year, value.month - 1, 1)),
  );
}

/** Career timeline, newest first, with dates formatted for the active language. */
export function Experience() {
  const { t, i18n } = useTranslation('home');
  const language = i18n.resolvedLanguage ?? 'en';
  return (
    <ol className="space-y-7">
      {EXPERIENCE.map((entry) => {
        const period = entry.start
          ? `${formatMonth(entry.start, language)} – ${entry.end ? formatMonth(entry.end, language) : t('experience.present')}`
          : null;
        return (
          <li key={entry.id} className="grid gap-1 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-x-6">
            <p className="meta pt-1">{period}</p>
            <div className="max-w-measure">
              <h3 className="text-xl">{t(`experience.${entry.id}.role`)}</h3>
              <p className="text-ink-muted">{t(`experience.${entry.id}.org`)}</p>
              <p className="mt-2">{t(`experience.${entry.id}.body`)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
