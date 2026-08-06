import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import type { Connect, Plugin, ViteDevServer } from 'vite';
import { type HostAllowlistConfig, isAllowedDevHost } from '../http/host-guard.ts';
import { validateMutationRequest } from '../http/request-guard.ts';
import { AGENT_PRESENCE_EVENT, agentPresenceFromClientInfo } from '../mcp/presence.ts';
import type { McpToolContext } from '../mcp/registry.ts';
import { createMcpServer } from '../mcp/server.ts';
import { json, readBody } from './routes/context.ts';

export const MCP_ENDPOINT = '/__mcp';

const ALLOWED_METHODS = new Set(['POST', 'GET', 'DELETE']);
export const MAX_SESSIONS = 32;

export type McpPluginOptions = {
  userCwd: string;
  slidesDir?: string;
  assetsDir?: string;
  coreVersion: string;
};

export type McpRequestCheck = { ok: true } | { ok: false; status: number; error: string };

function headerOf(req: Connect.IncomingMessage, name: string): string | null {
  const raw = req.headers[name];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value?.trim() || null;
}

export function checkMcpRequest(
  req: Connect.IncomingMessage,
  config: HostAllowlistConfig,
): McpRequestCheck {
  const method = req.method ?? 'GET';
  if (!ALLOWED_METHODS.has(method)) {
    return { ok: false, status: 405, error: 'method not allowed' };
  }
  if (!isAllowedDevHost(config, headerOf(req, 'host'))) {
    return { ok: false, status: 403, error: 'host not allowed' };
  }
  return validateMutationRequest(req, { requireJsonBody: method === 'POST' });
}

function makeToolContext(server: ViteDevServer, opts: McpPluginOptions): McpToolContext {
  return {
    userCwd: path.resolve(opts.userCwd),
    slidesDir: opts.slidesDir ?? 'slides',
    assetsDir: opts.assetsDir ?? 'assets',
    coreVersion: opts.coreVersion,
    server,
  };
}

export function mountMcpEndpoint(server: ViteDevServer, opts: McpPluginOptions): void {
  const ctx = makeToolContext(server, opts);
  const sessions = new Map<string, StreamableHTTPServerTransport>();

  function touch(id: string): StreamableHTTPServerTransport | undefined {
    const transport = sessions.get(id);
    if (!transport) return undefined;
    sessions.delete(id);
    sessions.set(id, transport);
    return transport;
  }

  function evictOverflow(): void {
    while (sessions.size > MAX_SESSIONS) {
      const [oldest] = sessions.keys();
      if (oldest === undefined) return;
      const transport = sessions.get(oldest);
      sessions.delete(oldest);
      void transport?.close();
    }
  }

  async function openSession(
    host: string,
    origin: string | null,
  ): Promise<StreamableHTTPServerTransport> {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      // Pins the session to the exact Host/Origin it was opened from, so the
      // transport re-checks every follow-up request even if this middleware
      // is ever reordered behind something that skips the guard above.
      enableDnsRebindingProtection: true,
      allowedHosts: [host],
      allowedOrigins: origin ? [origin] : [],
      onsessioninitialized: (id) => {
        sessions.set(id, transport);
        evictOverflow();
      },
      onsessionclosed: (id) => {
        sessions.delete(id);
      },
    });
    transport.onclose = () => {
      if (transport.sessionId) sessions.delete(transport.sessionId);
    };
    const mcp = createMcpServer(ctx);
    mcp.server.oninitialized = () => {
      const presence = agentPresenceFromClientInfo(mcp.server.getClientVersion());
      if (!presence) return;
      server.ws.send({ type: 'custom', event: AGENT_PRESENCE_EVENT, data: presence });
    };
    await mcp.connect(transport);
    return transport;
  }

  server.httpServer?.on('close', () => {
    for (const transport of sessions.values()) void transport.close();
    sessions.clear();
  });

  server.middlewares.use(MCP_ENDPOINT, async (req, res) => {
    const check = checkMcpRequest(req, server.config);
    if (!check.ok) return json(res, check.status, { error: check.error });

    try {
      const sessionId = headerOf(req, 'mcp-session-id');
      if (sessionId) {
        const transport = touch(sessionId);
        if (!transport) return json(res, 404, { error: 'unknown mcp session' });
        const body = req.method === 'POST' ? await readBody(req) : undefined;
        return await transport.handleRequest(req, res, body);
      }

      if (req.method !== 'POST') return json(res, 400, { error: 'missing mcp-session-id header' });

      const body = await readBody(req);
      if (!isInitializeRequest(body)) {
        return json(res, 400, { error: 'missing mcp-session-id header' });
      }
      const host = headerOf(req, 'host');
      if (!host) return json(res, 403, { error: 'host not allowed' });
      const transport = await openSession(host, headerOf(req, 'origin'));
      return await transport.handleRequest(req, res, body);
    } catch {
      if (res.headersSent) return res.end();
      return json(res, 400, { error: 'malformed mcp request' });
    }
  });
}

export function mcpPlugin(opts: McpPluginOptions): Plugin {
  return {
    name: 'open-frame:mcp',
    apply: (_config, env) => env.command === 'serve' && !env.isPreview,
    configureServer(server) {
      mountMcpEndpoint(server, opts);
    },
  };
}
