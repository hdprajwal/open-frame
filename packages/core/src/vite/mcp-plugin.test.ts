import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { ConfigEnv, Connect, ResolvedConfig, UserConfig, ViteDevServer } from 'vite';
import { afterEach, describe, expect, it } from 'vitest';
import { validateMutationRequest } from '../http/request-guard.ts';
import { AGENT_PRESENCE_EVENT } from '../mcp/presence.ts';
import {
  checkMcpRequest,
  MAX_SESSIONS,
  MCP_ENDPOINT,
  mcpPlugin,
  mountMcpEndpoint,
} from './mcp-plugin.ts';

function makeReq(headers: Record<string, string | undefined>, method: string) {
  return {
    method,
    headers,
    socket: { encrypted: false },
  } as unknown as Connect.IncomingMessage;
}

const DEV_CONFIG = {} as ResolvedConfig;

function applies(env: ConfigEnv): boolean {
  const apply = mcpPlugin({ userCwd: '/tmp/deck', coreVersion: '1.2.3' }).apply;
  if (typeof apply !== 'function') throw new Error('expected a function apply');
  return apply({} as UserConfig, env);
}

type Harness = {
  url: string;
  port: number;
  events: Array<{ type?: string; event?: string; data?: unknown }>;
  close: () => Promise<void>;
};

type RawResponse = { status: number; body: string };

function rawRequest(
  port: number,
  options: { method: string; headers: Record<string, string>; body?: string },
): Promise<RawResponse> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { host: '127.0.0.1', port, path: MCP_ENDPOINT, method: options.method },
      (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk: string) => {
          body += chunk;
        });
        res.on('end', () => resolve({ status: res.statusCode ?? 0, body }));
      },
    );
    req.on('error', reject);
    for (const [name, value] of Object.entries(options.headers)) req.setHeader(name, value);
    req.end(options.body);
  });
}

async function startHarness(): Promise<Harness> {
  const events: Harness['events'] = [];
  let handler: Connect.NextHandleFunction | null = null;

  const server = http.createServer((req, res) => {
    if (!handler || !req.url?.startsWith(MCP_ENDPOINT)) {
      res.statusCode = 404;
      return res.end();
    }
    req.url = req.url.slice(MCP_ENDPOINT.length) || '/';
    handler(req, res, () => {
      res.statusCode = 404;
      res.end();
    });
  });

  const host = {
    config: DEV_CONFIG,
    httpServer: server,
    middlewares: {
      use: (_path: string, fn: Connect.NextHandleFunction) => {
        handler = fn;
      },
    },
    ws: {
      send: (payload: { type?: string; event?: string; data?: unknown }) => {
        events.push(payload);
      },
    },
  } as unknown as ViteDevServer;

  mountMcpEndpoint(host, { userCwd: '/tmp/deck', coreVersion: '1.2.3' });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;

  return {
    url: `http://127.0.0.1:${port}${MCP_ENDPOINT}`,
    port,
    events,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.closeAllConnections();
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };
}

describe('mcpPlugin', () => {
  it('mounts on the dev server only', () => {
    expect(applies({ command: 'serve', mode: 'development' })).toBe(true);
    expect(applies({ command: 'build', mode: 'production' })).toBe(false);
    expect(applies({ command: 'serve', mode: 'production', isPreview: true })).toBe(false);
  });

  it('has no preview hook', () => {
    const plugin = mcpPlugin({ userCwd: '/tmp/deck', coreVersion: '1.2.3' });
    expect(plugin.name).toBe('open-frame:mcp');
    expect(plugin.configurePreviewServer).toBeUndefined();
  });
});

describe('checkMcpRequest', () => {
  it('accepts same-origin JSON posts', () => {
    const req = makeReq(
      {
        host: 'localhost:5173',
        origin: 'http://localhost:5173',
        'content-type': 'application/json',
      },
      'POST',
    );
    expect(checkMcpRequest(req, DEV_CONFIG)).toEqual({ ok: true });
  });

  it('accepts stream and session-teardown requests without a JSON body', () => {
    const headers = { host: 'localhost:5173', origin: 'http://localhost:5173' };
    expect(checkMcpRequest(makeReq(headers, 'GET'), DEV_CONFIG)).toEqual({ ok: true });
    expect(checkMcpRequest(makeReq(headers, 'DELETE'), DEV_CONFIG)).toEqual({ ok: true });
  });

  it('rejects posts that are not JSON', () => {
    const req = makeReq({ host: 'localhost:5173', 'content-type': 'text/plain' }, 'POST');
    expect(checkMcpRequest(req, DEV_CONFIG)).toEqual({
      ok: false,
      status: 415,
      error: 'content-type must be application/json',
    });
  });

  it('rejects cross-site and cross-origin callers', () => {
    const crossSite = makeReq(
      {
        host: 'localhost:5173',
        origin: 'http://localhost:5173',
        'content-type': 'application/json',
        'sec-fetch-site': 'cross-site',
      },
      'POST',
    );
    expect(checkMcpRequest(crossSite, DEV_CONFIG)).toEqual({
      ok: false,
      status: 403,
      error: 'cross-site request blocked',
    });

    const badOrigin = makeReq(
      {
        host: 'localhost:5173',
        origin: 'http://evil.example',
        'content-type': 'application/json',
      },
      'POST',
    );
    expect(checkMcpRequest(badOrigin, DEV_CONFIG)).toEqual({
      ok: false,
      status: 403,
      error: 'origin mismatch',
    });
  });

  it('rejects a rebound host that the origin check waves through', () => {
    const rebound = makeReq(
      {
        host: 'rebind.evil.example:5173',
        origin: 'http://rebind.evil.example:5173',
        'sec-fetch-site': 'same-origin',
        'content-type': 'application/json',
      },
      'POST',
    );
    expect(validateMutationRequest(rebound, { requireJsonBody: true })).toEqual({ ok: true });
    expect(checkMcpRequest(rebound, DEV_CONFIG)).toEqual({
      ok: false,
      status: 403,
      error: 'host not allowed',
    });
  });

  it('rejects a request with no host header', () => {
    const req = makeReq({ origin: 'http://localhost:5173' }, 'GET');
    expect(checkMcpRequest(req, DEV_CONFIG)).toEqual({
      ok: false,
      status: 403,
      error: 'host not allowed',
    });
  });

  it('rejects methods the transport does not speak', () => {
    const req = makeReq({ host: 'localhost:5173' }, 'PUT');
    expect(checkMcpRequest(req, DEV_CONFIG)).toEqual({
      ok: false,
      status: 405,
      error: 'method not allowed',
    });
  });
});

describe('mounted /__mcp endpoint', () => {
  let harness: Harness | null = null;

  afterEach(async () => {
    await harness?.close();
    harness = null;
  });

  it('completes an initialize handshake, advertising no tools until the registry fills', async () => {
    harness = await startHarness();
    const client = new Client({ name: 'claude-code', version: '9.9.9' });
    await client.connect(new StreamableHTTPClientTransport(new URL(harness.url)));

    expect(client.getServerVersion()).toMatchObject({ name: 'open-frame', version: '1.2.3' });
    expect(client.getServerCapabilities()?.tools).toBeUndefined();

    await client.close();
  });

  it('announces the client name from the handshake over the ws event channel', async () => {
    harness = await startHarness();
    const client = new Client({ name: 'claude-code', version: '9.9.9' });
    await client.connect(new StreamableHTTPClientTransport(new URL(harness.url)));

    expect(harness.events).toEqual([
      {
        type: 'custom',
        event: AGENT_PRESENCE_EVENT,
        data: {
          name: 'claude-code',
          version: '9.9.9',
          source: 'mcp',
          at: expect.any(String),
        },
      },
    ]);

    await client.close();
  });

  it('rejects a cross-origin caller before the transport sees it', async () => {
    harness = await startHarness();
    const res = await fetch(harness.url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
        origin: 'http://evil.example',
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }),
    });

    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toEqual({ error: 'origin mismatch' });
  });

  it('rejects a non-initialize post that carries no session', async () => {
    harness = await startHarness();
    const res = await fetch(harness.url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
    });

    expect(res.status).toBe(400);
  });

  it('rejects an unknown session id', async () => {
    harness = await startHarness();
    const res = await fetch(harness.url, {
      method: 'GET',
      headers: { accept: 'text/event-stream', 'mcp-session-id': 'nope' },
    });

    expect(res.status).toBe(404);
  });

  it('rejects a rebound host before the transport sees it', async () => {
    harness = await startHarness();
    const res = await rawRequest(harness.port, {
      method: 'POST',
      headers: {
        host: `rebind.evil.example:${harness.port}`,
        origin: `http://rebind.evil.example:${harness.port}`,
        'sec-fetch-site': 'same-origin',
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2025-06-18',
          capabilities: {},
          clientInfo: { name: 'evil', version: '1.0.0' },
        },
      }),
    });

    expect(res.status).toBe(403);
    expect(JSON.parse(res.body)).toEqual({ error: 'host not allowed' });
  });

  it('pins an open session to the host it was opened from', async () => {
    harness = await startHarness();
    const transport = new StreamableHTTPClientTransport(new URL(harness.url));
    const client = new Client({ name: 'claude-code', version: '9.9.9' });
    await client.connect(transport);
    const sessionId = transport.sessionId as string;
    expect(sessionId).toBeTruthy();

    const res = await rawRequest(harness.port, {
      method: 'POST',
      headers: {
        host: `localhost:${harness.port}`,
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
        'mcp-session-id': sessionId,
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' }),
    });

    expect(res.status).toBe(403);
    expect(JSON.parse(res.body)).toMatchObject({
      error: { code: -32000, message: expect.stringContaining('Invalid Host header') },
    });

    await client.close();
  });

  it('drops a session on delete', async () => {
    harness = await startHarness();
    const transport = new StreamableHTTPClientTransport(new URL(harness.url));
    const client = new Client({ name: 'claude-code', version: '9.9.9' });
    await client.connect(transport);
    const sessionId = transport.sessionId as string;

    await transport.terminateSession();
    await client.close();

    const res = await fetch(harness.url, {
      method: 'GET',
      headers: { accept: 'text/event-stream', 'mcp-session-id': sessionId },
    });
    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({ error: 'unknown mcp session' });
  });

  it('evicts the least recently used session once the map is full', async () => {
    harness = await startHarness();
    const clients: Client[] = [];
    const sessionIds: string[] = [];

    for (let i = 0; i <= MAX_SESSIONS; i += 1) {
      const transport = new StreamableHTTPClientTransport(new URL(harness.url));
      const client = new Client({ name: 'claude-code', version: '9.9.9' });
      await client.connect(transport);
      clients.push(client);
      sessionIds.push(transport.sessionId as string);
    }

    const evicted = await rawRequest(harness.port, {
      method: 'DELETE',
      headers: {
        host: `127.0.0.1:${harness.port}`,
        'mcp-session-id': sessionIds[0] as string,
      },
    });
    expect(evicted.status).toBe(404);
    expect(JSON.parse(evicted.body)).toEqual({ error: 'unknown mcp session' });

    const kept = await rawRequest(harness.port, {
      method: 'DELETE',
      headers: {
        host: `127.0.0.1:${harness.port}`,
        'mcp-session-id': sessionIds[MAX_SESSIONS] as string,
      },
    });
    expect(kept.status).not.toBe(404);

    await Promise.all(clients.map((client) => client.close()));
  });

  it('rejects a malformed json body', async () => {
    harness = await startHarness();
    const res = await fetch(harness.url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
      },
      body: '{ not json',
    });

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: 'malformed mcp request' });
  });
});
