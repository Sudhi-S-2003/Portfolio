import { useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton } from '../ui/IconButton';
import { MoonIcon, SunIcon } from '../ui/icons';

type Theme = 'light' | 'dark';

const DARK_QUERY = '(prefers-color-scheme: dark)';
const listeners = new Set<() => void>();

function readTheme(): Theme {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === 'light' || chosen === 'dark') return chosen;
  return window.matchMedia?.(DARK_QUERY).matches ? 'dark' : 'light';
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const query = window.matchMedia?.(DARK_QUERY);
  query?.addEventListener('change', onChange);
  return () => {
    listeners.delete(onChange);
    query?.removeEventListener('change', onChange);
  };
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem('theme', theme);
  } catch {
    // Storage blocked (private mode): the theme still applies for this visit.
  }
  for (const listener of listeners) listener();
}

/** Follows the system theme until the visitor picks one; the pick is remembered. */
export function ThemeToggle() {
  const { t } = useTranslation('common');
  // Pre-rendered HTML assumes light; the real value is read right after hydration.
  const theme = useSyncExternalStore(subscribe, readTheme, () => 'light' as const);
  const next: Theme = theme === 'dark' ? 'light' : 'dark';
  return (
    <IconButton
      label={t(next === 'dark' ? 'theme.toDark' : 'theme.toLight')}
      icon={theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      onClick={() => applyTheme(next)}
    />
  );
}
