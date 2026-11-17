import { act, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/render';
import { Footer } from './Footer';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'] });
  // 17:29:50 in Kerala (UTC+5:30).
  vi.setSystemTime(new Date('2026-11-17T11:59:50Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

function timeText() {
  return screen.getByText(/in Kerala right now/).textContent ?? '';
}

describe('footer clock', () => {
  it('shows the current time in Kerala', async () => {
    await renderWithProviders(<Footer />);
    expect(timeText()).toMatch(/5:29/);
  });

  it('moves on when the minute changes', async () => {
    await renderWithProviders(<Footer />);
    expect(timeText()).toMatch(/5:29/);
    await act(async () => {
      vi.advanceTimersByTime(15_000); // 17:30:05
    });
    expect(timeText()).toMatch(/5:30/);
    await act(async () => {
      vi.advanceTimersByTime(60_000); // 17:31:05
    });
    expect(timeText()).toMatch(/5:31/);
  });

  it("takes the copyright year from the build, not the visitor's clock (so a new year never breaks hydration)", async () => {
    vi.setSystemTime(new Date('2031-01-01T00:00:00Z'));
    await renderWithProviders(<Footer />);
    expect(screen.getByText(`© ${__BUILD_YEAR__} Sudhi S`)).toBeInTheDocument();
  });

  it('catches up at once when a background tab becomes visible again', async () => {
    await renderWithProviders(<Footer />);
    // A background tab's timers barely run: the clock moves on but no tick fires.
    vi.setSystemTime(new Date('2026-11-17T12:42:10Z')); // 18:12:10
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(timeText()).toMatch(/6:12/);
  });
});
