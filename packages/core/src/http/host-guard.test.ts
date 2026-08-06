import { describe, expect, it } from 'vitest';
import { isAllowedDevHost } from './host-guard.ts';

describe('isAllowedDevHost', () => {
  const config = {};

  it('allows the addresses a default dev server answers on', () => {
    expect(isAllowedDevHost(config, 'localhost:5173')).toBe(true);
    expect(isAllowedDevHost(config, 'deck.localhost:5173')).toBe(true);
    expect(isAllowedDevHost(config, '127.0.0.1:5173')).toBe(true);
    expect(isAllowedDevHost(config, '192.168.1.20:5173')).toBe(true);
    expect(isAllowedDevHost(config, '[::1]:5173')).toBe(true);
    expect(isAllowedDevHost(config, 'LOCALHOST:5173')).toBe(true);
  });

  it('rejects a rebound hostname', () => {
    expect(isAllowedDevHost(config, 'rebind.evil.example:5173')).toBe(false);
    expect(isAllowedDevHost(config, 'evil.example')).toBe(false);
    expect(isAllowedDevHost(config, 'localhost.evil.example:5173')).toBe(false);
    expect(isAllowedDevHost(config, '[not-an-ip]:5173')).toBe(false);
  });

  it('rejects a request with no host header', () => {
    expect(isAllowedDevHost(config, null)).toBe(false);
    expect(isAllowedDevHost(config, '   ')).toBe(false);
  });

  it('honours the hostnames the dev server was configured for', () => {
    expect(isAllowedDevHost({ server: { host: 'deck.test' } }, 'deck.test:5173')).toBe(true);
    expect(isAllowedDevHost({ additionalAllowedHosts: ['deck.test'] }, 'deck.test:5173')).toBe(
      true,
    );
    expect(isAllowedDevHost({ server: { allowedHosts: ['deck.test'] } }, 'deck.test:5173')).toBe(
      true,
    );
    expect(isAllowedDevHost({ server: { allowedHosts: ['deck.test'] } }, 'other.test:5173')).toBe(
      false,
    );
  });

  it('matches subdomains for leading-dot entries, the way vite does', () => {
    const wildcard = { server: { allowedHosts: ['.example.com'] } };
    expect(isAllowedDevHost(wildcard, 'example.com:5173')).toBe(true);
    expect(isAllowedDevHost(wildcard, 'foo.bar.example.com:5173')).toBe(true);
    expect(isAllowedDevHost(wildcard, 'notexample.com:5173')).toBe(false);
  });

  it('defers to an explicit opt-out', () => {
    expect(isAllowedDevHost({ server: { allowedHosts: true } }, 'evil.example:5173')).toBe(true);
  });
});
