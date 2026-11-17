import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { buttonStyles } from '../components/ui/Button';

export default function NotFound() {
  const { t } = useTranslation(['errors', 'common']);
  return (
    <div className="max-w-measure py-14 sm:py-24">
      <p className="meta">{t('errors:notFound.code')}</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">{t('errors:notFound.title')}</h1>
      <p className="mt-4 text-lg text-ink-muted">{t('errors:notFound.body')}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/" className={buttonStyles('primary')}>
          {t('common:actions.goHome')}
        </Link>
        <Link to="/work" className={buttonStyles('secondary')}>
          {t('common:actions.viewAllWork')}
        </Link>
      </div>
    </div>
  );
}
