export type AgentPresenceState = 'unreachable' | 'idle' | 'active';

export const AGENT_ACTIVE_WINDOW_MS = 90_000;

export function derivePresenceState(input: {
  connected: boolean;
  lastEditAt: number | null;
  now: number;
  activeWindowMs?: number;
}): AgentPresenceState {
  if (!input.connected) return 'unreachable';
  if (input.lastEditAt === null) return 'idle';
  const window = input.activeWindowMs ?? AGENT_ACTIVE_WINDOW_MS;
  return input.now - input.lastEditAt < window ? 'active' : 'idle';
}
