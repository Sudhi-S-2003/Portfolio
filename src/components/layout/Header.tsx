import { useTranslation } from 'react-i18next';
import { Link, NavLink } from 'react-router';
import { cx } from '../ui/cx';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MobileMenu } from './MobileMenu';
import { NAV_LINKS } from './navigation';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const { t } = useTranslation('common');
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-6">
      <Link to="/" className="shrink-0 font-serif text-xl whitespace-nowrap text-ink no-underline hover:text-accent hover:no-underline">
        {t('siteName')}
      </Link>
      <div className="flex items-center gap-1 sm:gap-4">
        <nav aria-label={t('nav.label')} className="hidden sm:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    cx(
                      'inline-flex min-h-11 items-center rounded-ui px-3 text-[0.9375rem] no-underline transition-colors hover:bg-paper-sunken hover:no-underline',
                      isActive ? 'text-ink underline decoration-accent underline-offset-8' : 'text-ink-muted hover:text-ink',
                    )
                  }
                >
                  {t(link.labelKey)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center">
          <LanguageSwitcher />
          <ThemeToggle />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
