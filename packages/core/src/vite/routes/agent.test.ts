import { describe, expect, it } from 'vitest';
import { sanitizeAgentName } from './agent';

describe('sanitizeAgentName', () => {
  it('keeps a plain name', () => {
    expect(sanitizeAgentName('Claude')).toBe('Claude');
  });

  it('collapses whitespace and control characters', () => {
    expect(sanitizeAgentName('  Claude\n\tCode  ')).toBe('Claude Code');
  });

  it('rejects an empty or whitespace-only name', () => {
    expect(sanitizeAgentName('')).toBeNull();
    expect(sanitizeAgentName('   \n ')).toBeNull();
  });

  it('truncates without leaving a trailing space', () => {
    const name = sanitizeAgentName(`${'a'.repeat(39)} bbbb`);
    expect(name).toBe('a'.repeat(39));
  });
});
