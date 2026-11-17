import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../../App';
import { renderWithProviders } from '../../test/render';

const originalTz = process.env.TZ;

afterEach(() => {
  process.env.TZ = originalTz;
});

describe('dates for visitors in other time zones', () => {
  it('shows the same months in Los Angeles as in Kerala', async () => {
    process.env.TZ = 'America/Los_Angeles';
    await renderWithProviders(<App />);
    expect(screen.getByText(/Jun 2025 – now/)).toBeInTheDocument();
    expect(screen.getByText(/Aug 2024 – May 2025/)).toBeInTheDocument();
    expect(screen.getByText('Updated November 2026')).toBeInTheDocument();
  });
});
