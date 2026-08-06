import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import type { Connect, Plugin, ViteDevServer } from 'vite';
import { validateMutationRequest } from '../http/request-guard.ts';
import type { McpToolContext } from '../mcp/registry.ts';
import { createMcpServer } from '../mcp/server.ts';
import { json, readBody } from './routes/context.ts';

export const MCP_ENDPOINT = '/__mcp';

const ALLOWED_METHODS = new Set(['POST', 'GET', 'DELETE']);

export type McpPluginOptions = {
  userCwd: string;
  slidesDir?: string;
  assetsDir?: string;
  coreVersion: string;
};

export type McpRequestCheck = { ok: true } | { ok: false; status: number; error: string };

export function checkMcpRequest(req: Connect.IncomingMessage): McpRequestCheck {
  const method = req.method ?? 'GET';
  if (!ALLOWED_METHODS.has(method)) {
    return { ok: false, status: 405, error: 'method not allowed' };
  }
  return validateMutationRequest(req, { requireJsonBody: method === 'POST' });
}

function sessionIdOf(req: Connect.IncomingMessage): string | null {
  const raw = req.headers['mcp-session-id'];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value?.trim() || null;
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

  async function openSession(): Promise<StreamableHTTPServerTransport> {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (id) => {
        sessions.set(id, transport);
      },
      onsessionclosed: (id) => {
        sessions.delete(id);
      },
    });
    transport.onclose = () => {
      if (transport.sessionId) sessions.delete(transport.sessionId);
    };
    const mcp = createMcpServer(ctx);
    await mcp.connect(transport);
    return transport;
  }

  server.httpServer?.on('close', () => {
    for (const transport of sessions.values()) void transport.close();
    sessions.clear();
  });

  server.middlewares.use(MCP_ENDPOINT, async (req, res) => {
    const check = checkMcpRequest(req);
    if (!check.ok) return json(res, check.status, { error: check.error });

    try {
      const sessionId = sessionIdOf(req);
      if (sessionId) {
        const transport = sessions.get(sessionId);
        if (!transport) return json(res, 404, { error: 'unknown mcp session' });
        const body = req.method === 'POST' ? await readBody(req) : undefined;
        return await transport.handleRequest(req, res, body);
      }

      if (req.method !== 'POST') return json(res, 400, { error: 'missing mcp-session-id header' });

      const body = await readBody(req);
      if (!isInitializeRequest(body)) {
        return json(res, 400, { error: 'missing mcp-session-id header' });
      }
      const transport = await openSession();
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
