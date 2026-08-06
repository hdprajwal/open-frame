import { describe, expect, it } from 'vitest';
import { agentPresenceFromClientInfo } from './presence.ts';

const AT = new Date('2026-01-02T03:04:05.000Z');

describe('agentPresenceFromClientInfo', () => {
  it('carries the client name and version from the handshake', () => {
    expect(agentPresenceFromClientInfo({ name: 'claude-code', version: '2.1.0' }, AT)).toEqual({
      name: 'claude-code',
      version: '2.1.0',
      source: 'mcp',
      at: '2026-01-02T03:04:05.000Z',
    });
  });

  it('keeps the name when the client omits a version', () => {
    expect(agentPresenceFromClientInfo({ name: 'cursor' }, AT)).toMatchObject({
      name: 'cursor',
      version: null,
    });
  });

  it('collapses whitespace and caps runaway names', () => {
    const presence = agentPresenceFromClientInfo({ name: `  some\n agent ${'x'.repeat(200)}` }, AT);
    expect(presence?.name.startsWith('some agent ')).toBe(true);
    expect(presence?.name.length).toBe(64);
  });

  it('returns nothing for a nameless client', () => {
    expect(agentPresenceFromClientInfo(undefined, AT)).toBeNull();
    expect(agentPresenceFromClientInfo({ name: '   ' }, AT)).toBeNull();
    expect(agentPresenceFromClientInfo({ name: 42 }, AT)).toBeNull();
  });
});
