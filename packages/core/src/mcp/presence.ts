export const AGENT_PRESENCE_EVENT = 'open-frame:agent-presence';

export type AgentPresence = {
  name: string;
  version: string | null;
  source: 'mcp';
  at: string;
};

const FIELD_MAX = 64;

function clean(value: unknown): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, FIELD_MAX) : '';
}

export function agentPresenceFromClientInfo(
  info: { name?: unknown; version?: unknown } | undefined,
  now: Date = new Date(),
): AgentPresence | null {
  const name = clean(info?.name);
  if (!name) return null;
  const version = clean(info?.version);
  return { name, version: version || null, source: 'mcp', at: now.toISOString() };
}
