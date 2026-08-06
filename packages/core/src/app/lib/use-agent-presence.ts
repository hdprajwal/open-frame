import { useEffect, useState, useSyncExternalStore } from 'react';
import {
  AGENT_ACTIVE_WINDOW_MS,
  type AgentPresenceState,
  derivePresenceState,
} from './agent-presence';
import { useAgentSocketConnected } from './use-agent-socket';
import { useExternalEdits } from './use-external-edits';

const listeners = new Set<() => void>();
let agentName: string | null = null;
let started = false;

function start() {
  if (started) return;
  started = true;
  import.meta.hot?.on('open-frame:agent-presence', (data: unknown) => {
    if (!data || typeof data !== 'object') return;
    const { name } = data as { name?: unknown };
    if (typeof name !== 'string' || !name) return;
    agentName = name;
    for (const listener of listeners) listener();
  });
}

function subscribeName(listener: () => void) {
  start();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getName() {
  return agentName;
}

export function useAgentPresence(): { state: AgentPresenceState; name: string | null } {
  const connected = useAgentSocketConnected();
  const name = useSyncExternalStore(subscribeName, getName, getName);
  const { latest } = useExternalEdits();
  const lastEditAt = latest?.at ?? null;
  const [now, setNow] = useState(() => Date.now());

  // Only re-derive when the active window is due to lapse — the state cannot
  // change between an edit and that deadline.
  useEffect(() => {
    if (lastEditAt === null) return;
    const remaining = lastEditAt + AGENT_ACTIVE_WINDOW_MS - Date.now();
    if (remaining <= 0) {
      setNow(Date.now());
      return;
    }
    const timer = setTimeout(() => setNow(Date.now()), remaining + 50);
    return () => clearTimeout(timer);
  }, [lastEditAt]);

  return { state: derivePresenceState({ connected, lastEditAt, now }), name };
}
