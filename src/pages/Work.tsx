import { useTranslation } from 'react-i18next';
import { PROJECTS } from '../features/work/projects';
import { WorkList } from '../features/work/WorkList';

export default function Work() {
  const { t } = useTranslation('work');
  return (
    <>
      <header className="max-w-measure pt-6 pb-10 sm:pt-10 lg:pt-16">
        <h1 className="text-4xl sm:text-5xl">{t('title')}</h1>
        <p className="mt-5 text-lg text-ink-muted">{t('intro')}</p>
      </header>
      <div className="border-t border-line pt-8">
        <WorkList projects={PROJECTS} headingLevel={2} />
      </div>
    </>
  );
}
