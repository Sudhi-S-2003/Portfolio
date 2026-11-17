import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Section } from '../components/layout/Section';
import { buttonStyles } from '../components/ui/Button';
import { ArrowRightIcon, DownloadIcon } from '../components/ui/icons';
import { SITE } from '../data/site';
import { Experience } from '../features/about/Experience';
import { PROJECTS } from '../features/work/projects';
import { WorkList } from '../features/work/WorkList';

/** Made by scripts/optimize-images.ts with Sharp; keep the widths in step with it. */
const PORTRAIT_WIDTHS = [112, 224, 336];
const PORTRAIT_SIZES = '(min-width: 640px) 112px, 80px';
const portraitSet = (format: string) =>
  PORTRAIT_WIDTHS.map((width) => `/images/sudhi-${width}.${format} ${width}w`).join(', ');

export default function Home() {
  const { t, i18n } = useTranslation(['home', 'common']);
  const updated = new Intl.DateTimeFormat(i18n.resolvedLanguage ?? 'en', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(SITE.nowUpdated.year, SITE.nowUpdated.month - 1, 1)),
  );

  return (
    <>
      <section
        aria-labelledby="intro-title"
        className="grid gap-6 pt-6 pb-14 sm:pt-10 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-x-12 lg:pt-16"
      >
        <div>
          <picture>
            <source type="image/avif" srcSet={portraitSet('avif')} sizes={PORTRAIT_SIZES} />
            <source type="image/webp" srcSet={portraitSet('webp')} sizes={PORTRAIT_SIZES} />
            <img
              src="/images/sudhi-224.jpg"
              srcSet={portraitSet('jpg')}
              sizes={PORTRAIT_SIZES}
              alt={t('home:photoAlt')}
              width={112}
              height={140}
              fetchPriority="high"
              className="h-[6.25rem] w-20 rounded-ui object-cover object-top sm:h-[8.75rem] sm:w-28"
            />
          </picture>
        </div>
        <div className="max-w-measure">
          <h1 id="intro-title" className="text-[2.25rem] sm:text-5xl">
            {t('home:title')}
          </h1>
          <p className="mt-5 text-lg text-ink-muted">{t('home:intro')}</p>
          <p className="mt-5 font-medium text-ink">{t('home:openToWork')}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/contact?topic=job" className={buttonStyles('primary')}>
              {t('common:actions.hireMe')}
            </Link>
            <a href={SITE.resumeUrl} download className={buttonStyles('secondary')}>
              <DownloadIcon />
              {t('common:actions.downloadResume')}
            </a>
          </div>
        </div>
      </section>

      <Section label={t('home:sections.now')}>
        <p className="meta">{t('home:now.updated', { date: updated })}</p>
        <p className="mt-2 max-w-measure">{t('home:now.body')}</p>
      </Section>

      <Section label={t('home:sections.work')}>
        <WorkList projects={PROJECTS.filter((project) => project.featured)} />
        <Link to="/work" className="mt-6 inline-flex min-h-11 items-center gap-2">
          {t('common:actions.viewAllWork')}
          <ArrowRightIcon />
        </Link>
      </Section>

      <Section label={t('home:sections.experience')}>
        <Experience />
      </Section>

      <Section label={t('home:sections.contact')}>
        <p className="max-w-measure">{t('home:contact.body')}</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link to="/contact" className={buttonStyles('secondary')}>
            {t('home:contact.cta')}
          </Link>
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </div>
      </Section>
    </>
  );
}
