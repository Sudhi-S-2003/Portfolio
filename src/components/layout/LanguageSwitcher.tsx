import { useTranslation } from 'react-i18next';
import { chooseLanguage } from '../../i18n';
import { isLanguage, LANGUAGE_NAMES, SUPPORTED_LANGUAGES } from '../../i18n/languages';
import { LanguageIcon } from '../ui/icons';
import { Menu } from '../ui/Menu';

const items = SUPPORTED_LANGUAGES.map((language) => ({
  value: language,
  label: LANGUAGE_NAMES[language],
  lang: language,
}));

/** Changes the language in place: no reload, and the choice is remembered for the next visit. */
export function LanguageSwitcher() {
  const { t, i18n } = useTranslation('common');
  return (
    <Menu
      label={t('language.label')}
      icon={<LanguageIcon />}
      items={items}
      value={i18n.resolvedLanguage ?? 'en'}
      onChange={(language) => {
        if (isLanguage(language)) void chooseLanguage(i18n, language);
      }}
    />
  );
}
