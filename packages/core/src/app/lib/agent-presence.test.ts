import { describe, expect, it } from 'vitest';
import { AGENT_ACTIVE_WINDOW_MS, derivePresenceState } from './agent-presence';

describe('derivePresenceState', () => {
  it('reports unreachable when the dev server socket is down, even after a recent edit', () => {
    expect(derivePresenceState({ connected: false, lastEditAt: 1_000, now: 1_100 })).toBe(
      'unreachable',
    );
  });

  it('reports idle when connected and nothing has been edited', () => {
    expect(derivePresenceState({ connected: true, lastEditAt: null, now: 1_000 })).toBe('idle');
  });

  it('reports active inside the window', () => {
    expect(
      derivePresenceState({
        connected: true,
        lastEditAt: 1_000,
        now: 1_000 + AGENT_ACTIVE_WINDOW_MS - 1,
      }),
    ).toBe('active');
  });

  it('falls back to idle once the window lapses', () => {
    expect(
      derivePresenceState({
        connected: true,
        lastEditAt: 1_000,
        now: 1_000 + AGENT_ACTIVE_WINDOW_MS,
      }),
    ).toBe('idle');
  });

  it('honours a custom window', () => {
    expect(
      derivePresenceState({ connected: true, lastEditAt: 1_000, now: 1_500, activeWindowMs: 400 }),
    ).toBe('idle');
  });
});
