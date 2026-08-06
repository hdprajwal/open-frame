import net from 'node:net';

export type HostAllowlistConfig = {
  server?: { host?: string | boolean; allowedHosts?: string[] | true };
  additionalAllowedHosts?: readonly string[];
};

function hostnameOf(hostHeader: string): string | null {
  const trimmed = hostHeader.trim().toLowerCase();
  if (!trimmed) return null;
  if (trimmed.startsWith('[')) {
    const end = trimmed.indexOf(']');
    return end < 0 ? null : trimmed.slice(0, end + 1);
  }
  const colon = trimmed.indexOf(':');
  return (colon === -1 ? trimmed : trimmed.slice(0, colon)) || null;
}

function configuredHosts(config: HostAllowlistConfig): string[] {
  const entries: string[] = [];
  if (config.additionalAllowedHosts) entries.push(...config.additionalAllowedHosts);
  const host = config.server?.host;
  if (typeof host === 'string' && host) entries.push(host);
  const allowed = config.server?.allowedHosts;
  if (Array.isArray(allowed)) entries.push(...allowed);
  return entries;
}

// Origin-equals-Host is blind to DNS rebinding: a rebound page reports the same
// attacker hostname in both headers, so they match. Only pinning Host to names
// the dev server actually answers on rejects it. IP literals are safe because
// the browser connects to them directly, with no name left to rebind.
export function isAllowedDevHost(config: HostAllowlistConfig, hostHeader: string | null): boolean {
  if (config.server?.allowedHosts === true) return true;
  if (!hostHeader) return false;

  const hostname = hostnameOf(hostHeader);
  if (!hostname) return false;
  if (hostname.startsWith('[')) return net.isIP(hostname.slice(1, -1)) === 6;
  if (net.isIP(hostname) === 4) return true;
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) return true;

  return configuredHosts(config).some((entry) => {
    const allowed = entry.trim().toLowerCase();
    if (allowed === hostname) return true;
    return allowed.startsWith('.') && (allowed.slice(1) === hostname || hostname.endsWith(allowed));
  });
}
