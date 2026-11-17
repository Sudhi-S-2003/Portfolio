import { render } from '@testing-library/react';
import type { Resource } from 'i18next';
import type { ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router';
import { createI18n } from '../i18n';
import type { Language } from '../i18n/languages';

type Options = { route?: string; lng?: Language; extraResources?: Resource };

/** Render with a router and a real i18n instance (English bundled, no network). */
export async function renderWithProviders(ui: ReactElement, { route = '/', lng = 'en', extraResources }: Options = {}) {
  const i18n = await createI18n({ lng, withBackend: false, ...(extraResources ? { extraResources } : {}) });
  const result = render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </I18nextProvider>,
  );
  return { ...result, i18n };
}
