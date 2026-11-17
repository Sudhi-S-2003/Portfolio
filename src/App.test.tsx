import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';
import { renderWithProviders } from './test/render';

describe('App', () => {
  it('renders the main landmark', async () => {
    await renderWithProviders(<App />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
