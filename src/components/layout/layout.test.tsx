import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter, useLocation } from 'react-router';
import { createI18n } from '../../i18n';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../../App';
import { renderWithProviders } from '../../test/render';

function LocationProbe() {
  return <output data-testid="location">{useLocation().pathname}</output>;
}

afterEach(() => {
  delete document.documentElement.dataset.theme;
});

describe('header', () => {
  it('links to Work, About and Contact', async () => {
    await renderWithProviders(<App />);
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(within(nav).getByRole('link', { name: 'Work' })).toHaveAttribute('href', '/work');
    expect(within(nav).getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');
    expect(within(nav).getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact');
  });

  it('has a skip link to the main content', async () => {
    await renderWithProviders(<App />);
    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute('href', '#main');
  });
});

describe('mobile menu', () => {
  it('opens as a dialog and closes after choosing a page', async () => {
    const user = userEvent.setup();
    await renderWithProviders(
      <>
        <App />
        <LocationProbe />
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    const dialog = screen.getByRole('dialog', { name: 'Menu' });
    await user.click(within(dialog).getByRole('link', { name: 'About' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/about');
  });

  it('gives focus back to the menu button when closed with Escape', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<App />);
    const button = screen.getByRole('button', { name: 'Open menu' });
    await user.click(button);
    expect(screen.getByRole('dialog', { name: 'Menu' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(button).toHaveFocus();
  });
});

describe('not found', () => {
  it('shows a not-found page with a way home', async () => {
    await renderWithProviders(<App />, { route: '/no-such-page' });
    expect(screen.getByRole('heading', { level: 1, name: "This page doesn't exist" })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to the home page' })).toHaveAttribute('href', '/');
  });
});

describe('theme toggle', () => {
  it('switches to dark and remembers it', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<App />);
    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(screen.getByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument();
  });
});

describe('focus on navigation', () => {
  it('leaves focus alone on the first page load, even under StrictMode', async () => {
    // Same shape as main.tsx: StrictMode at the root, around the providers and the router.
    const i18n = await createI18n({ lng: 'en', withBackend: false });
    render(
      <StrictMode>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter initialEntries={['/about']}>
            <App />
          </MemoryRouter>
        </I18nextProvider>
      </StrictMode>,
    );
    await act(async () => {});
    expect(screen.getByRole('main')).not.toHaveFocus();
  });

  it('moves focus to the new page after navigating', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<App />);
    const nav = screen.getByRole('navigation', { name: 'Main' });
    await user.click(within(nav).getByRole('link', { name: 'About' }));
    expect(screen.getByRole('main')).toHaveFocus();
  });
});

describe('page title', () => {
  it('sets the document title for the current page', async () => {
    await renderWithProviders(<App />, { route: '/no-such-page' });
    expect(document.title).toBe('Page not found · Sudhi S');
  });
});
