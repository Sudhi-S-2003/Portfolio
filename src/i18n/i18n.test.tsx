import { act, render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { chooseLanguage, createI18n, detectedLanguage, syncDocumentLanguage } from './index';

const testResources = {
  ml: { common: { language: { label: 'ഭാഷ' } } },
  hi: { common: { language: { label: 'भाषा' } } },
};

function setBrowserLanguage(language: string) {
  vi.spyOn(navigator, 'language', 'get').mockReturnValue(language);
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue([language]);
}

afterEach(() => {
  vi.restoreAllMocks();
  document.documentElement.lang = 'en';
});

describe('language detection', () => {
  it('maps ml-IN to Malayalam', async () => {
    setBrowserLanguage('ml-IN');
    const i18n = await createI18n({ withBackend: false, extraResources: testResources });
    expect(i18n.resolvedLanguage).toBe('ml');
  });

  it('maps hi-IN to Hindi', async () => {
    setBrowserLanguage('hi-IN');
    const i18n = await createI18n({ withBackend: false, extraResources: testResources });
    expect(i18n.resolvedLanguage).toBe('hi');
  });

  it('falls back to English for an unsupported language', async () => {
    setBrowserLanguage('ta-IN');
    const i18n = await createI18n({ withBackend: false, extraResources: testResources });
    expect(i18n.resolvedLanguage).toBe('en');
    expect(i18n.t('common:language.label')).toBe('Language');
  });

  it('prefers a saved choice over the browser language', async () => {
    setBrowserLanguage('ml-IN');
    localStorage.setItem('lang', 'hi');
    const i18n = await createI18n({ withBackend: false, extraResources: testResources });
    expect(i18n.resolvedLanguage).toBe('hi');
  });

  it('remembers a language the visitor chooses', async () => {
    setBrowserLanguage('en-US');
    const i18n = await createI18n({ withBackend: false, extraResources: testResources });
    await chooseLanguage(i18n, 'ml');
    expect(i18n.resolvedLanguage).toBe('ml');
    expect(localStorage.getItem('lang')).toBe('ml');
  });

  it('does not save a detected language as if it were a choice', async () => {
    setBrowserLanguage('hi-IN');
    await createI18n({ withBackend: false, extraResources: testResources });
    expect(localStorage.getItem('lang')).toBeNull();
  });

  it('can start in English for hydration and still report the browser language', async () => {
    setBrowserLanguage('ml-IN');
    const i18n = await createI18n({ lng: 'en', withBackend: false, extraResources: testResources });
    expect(i18n.resolvedLanguage).toBe('en');
    expect(detectedLanguage(i18n)).toBe('ml');
    expect(localStorage.getItem('lang')).toBeNull();
  });
});

let mounts = 0;
function Probe() {
  const { t } = useTranslation('common');
  useEffect(() => {
    mounts += 1;
  }, []);
  return <p>{t('language.label')}</p>;
}

describe('switching language', () => {
  it('re-renders text in place and updates <html lang> without remounting', async () => {
    setBrowserLanguage('en-US');
    mounts = 0;
    const i18n = await createI18n({ withBackend: false, extraResources: testResources });
    syncDocumentLanguage(i18n);
    render(
      <I18nextProvider i18n={i18n}>
        <Probe />
      </I18nextProvider>,
    );
    expect(screen.getByText('Language')).toBeInTheDocument();
    await act(() => i18n.changeLanguage('ml'));
    expect(screen.getByText('ഭാഷ')).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('ml');
    expect(mounts).toBe(1);
  });
});
