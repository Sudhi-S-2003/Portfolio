import { useTranslation } from 'react-i18next';
import { Section } from '../components/layout/Section';
import { buttonStyles } from '../components/ui/Button';
import { DownloadIcon } from '../components/ui/icons';
import { Table } from '../components/ui/Table';
import { SITE, TOOLS } from '../data/site';

const TOOL_AREAS = ['backend', 'data', 'frontend', 'infra'] as const;

export default function About() {
  const { t } = useTranslation(['about', 'common']);
  const story = t('about:story', { returnObjects: true }) as string[];
  const howIWork = t('about:howIWork', { returnObjects: true }) as string[];

  return (
    <>
      <header className="max-w-measure pt-6 pb-10 sm:pt-10 lg:pt-16">
        <h1 className="text-4xl sm:text-5xl">{t('about:title')}</h1>
        <p className="mt-5 text-xl text-ink-muted">{t('about:lead')}</p>
      </header>

      <Section label={t('about:sections.story')}>
        <div className="prose">
          {story.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </Section>

      <Section label={t('about:sections.howIWork')}>
        <ul className="prose">
          {howIWork.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section label={t('about:sections.lookingFor')}>
        <p className="max-w-measure">{t('about:lookingFor')}</p>
      </Section>

      <Section label={t('about:sections.tools')}>
        <Table
          caption={t('about:tools.caption')}
          columns={[t('about:tools.area'), t('about:tools.tools')]}
          rows={TOOL_AREAS.map((area) => [t(`about:tools.${area}`), TOOLS[area].join(', ')])}
        />
      </Section>

      <Section label={t('about:sections.resume')}>
        <p className="max-w-measure">{t('about:resume.body')}</p>
        <p className="meta mt-1">{t('about:resume.updated')}</p>
        <a href={SITE.resumeUrl} download className={buttonStyles('secondary', 'mt-5')}>
          <DownloadIcon />
          {t('common:actions.downloadResume')}
        </a>
      </Section>
    </>
  );
}
