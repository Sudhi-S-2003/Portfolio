import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';
import { cx } from '../ui/cx';
import { Dialog } from '../ui/Dialog';
import { IconButton } from '../ui/IconButton';
import { MenuIcon } from '../ui/icons';
import { MOBILE_NAV_LINKS } from './navigation';

export function MobileMenu() {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  return (
    <div className="sm:hidden">
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={t('nav.menuTitle')}
        closeLabel={t('actions.close')}
        trigger={<IconButton label={t('nav.openMenu')} icon={<MenuIcon />} />}
      >
        <nav aria-label={t('nav.label')}>
          <ul className="border-t border-line">
            {MOBILE_NAV_LINKS.map((link) => (
              <li key={link.to} className="border-b border-line">
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cx(
                      'flex min-h-12 items-center text-lg no-underline hover:no-underline',
                      isActive ? 'text-ink' : 'text-ink-muted hover:text-ink',
                    )
                  }
                >
                  {t(link.labelKey)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </Dialog>
    </div>
  );
}
