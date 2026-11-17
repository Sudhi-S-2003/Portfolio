import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { PageMeta } from './components/layout/PageMeta';
import { SkipLink } from './components/ui/SkipLink';
import { TooltipProvider } from './components/ui/Tooltip';
import { AppRoutes } from './routes';

/** After moving to another page, start at the top and put keyboard focus on the new content. */
function useFocusOnNavigate() {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  // Compare with the last path rather than counting renders: StrictMode runs effects twice in development.
  const previousPath = useRef(pathname);
  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);
  return mainRef;
}

export default function App() {
  const { t } = useTranslation('common');
  const mainRef = useFocusOnNavigate();
  return (
    <TooltipProvider>
      <SkipLink targetId="main" label={t('skipToContent')} />
      <div className="flex min-h-dvh flex-col">
        <Header />
        <main id="main" ref={mainRef} tabIndex={-1} className="mx-auto w-full max-w-5xl flex-1 px-4 outline-none sm:px-6">
          <AppRoutes />
        </main>
        <Footer />
      </div>
      <PageMeta />
    </TooltipProvider>
  );
}
