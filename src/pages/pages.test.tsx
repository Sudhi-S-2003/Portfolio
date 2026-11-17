import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../App';
import { renderWithProviders } from '../test/render';

describe('home page', () => {
  it('says Sudhi is open to work and links to hire and resume', async () => {
    await renderWithProviders(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/open to backend-leaning full-stack roles/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Hire me' })).toHaveAttribute('href', '/contact?topic=job');
    expect(screen.getByRole('link', { name: /Download resume/ })).toHaveAttribute('href', '/files/Sudhi-S-Resume.pdf');
  });

  it('lists the four featured case studies', async () => {
    await renderWithProviders(<App />);
    const work = screen.getByRole('region', { name: 'Selected work' });
    const links = within(work).getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(links).toEqual([
      '/work/distribution-erp',
      '/work/dispatchhub',
      '/work/apiforge',
      '/work/movie-booking-platform',
      '/work',
    ]);
  });
});

describe('work page', () => {
  it('lists every case study', async () => {
    await renderWithProviders(<App />, { route: '/work' });
    expect(screen.getByRole('heading', { level: 1, name: 'Work' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(5);
    // Directly under the page title, so level 2 (no skipped level for screen-reader navigation).
    for (const article of screen.getAllByRole('article')) {
      expect(within(article).getByRole('heading', { level: 2 })).toBeInTheDocument();
    }
  });
});

describe('case study page', () => {
  it('shows a public project with its stack, source link and decisions', async () => {
    await renderWithProviders(<App />, { route: '/work/dispatchhub' });
    expect(screen.getByRole('heading', { level: 1, name: 'DispatchHub' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Stack' })).toHaveTextContent('NestJS');
    expect(screen.getByRole('link', { name: /Source code/ })).toHaveAttribute(
      'href',
      'https://github.com/Sudhi-S-2003/DispatchHub',
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Decisions' })).toBeInTheDocument();
    expect(screen.getByRole('figure')).toBeInTheDocument();
  });

  it('never links or names the private client project', async () => {
    const { container } = await renderWithProviders(<App />, { route: '/work/distribution-erp' });
    expect(screen.getByRole('heading', { level: 1, name: 'Distribution ERP for a food wholesaler' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Source code/ })).not.toBeInTheDocument();
    expect(screen.getByText(/code is private/i)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/choice/i);
  });

  it('shows the not-found page for an unknown project', async () => {
    await renderWithProviders(<App />, { route: '/work/unknown' });
    expect(screen.getByRole('heading', { level: 1, name: "This page doesn't exist" })).toBeInTheDocument();
  });

  it('sets a page title from the project name', async () => {
    await renderWithProviders(<App />, { route: '/work/apiforge' });
    expect(document.title).toBe('ApiForge · Sudhi S');
  });
});

describe('about page', () => {
  it('has the tools table, the AI note and the resume link', async () => {
    await renderWithProviders(<App />, { route: '/about' });
    expect(screen.getByRole('heading', { level: 1, name: 'About' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Tools I use' })).toBeInTheDocument();
    expect(screen.getByText(/AI coding assistants/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Download resume/ })).toHaveAttribute('href', '/files/Sudhi-S-Resume.pdf');
  });
});
