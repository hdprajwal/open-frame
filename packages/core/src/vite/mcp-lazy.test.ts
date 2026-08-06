import type { ViteDevServer } from 'vite';
import { describe, expect, it, vi } from 'vitest';

const sdk = vi.hoisted(() => ({ loaded: [] as string[] }));

vi.mock('@modelcontextprotocol/sdk/server/mcp.js', () => {
  sdk.loaded.push('server/mcp.js');
  return { McpServer: class {} };
});

vi.mock('@modelcontextprotocol/sdk/types.js', () => {
  sdk.loaded.push('types.js');
  return { isInitializeRequest: () => false };
});

vi.mock('@modelcontextprotocol/sdk/server/streamableHttp.js', () => {
  sdk.loaded.push('server/streamableHttp.js');
  return { StreamableHTTPServerTransport: class {} };
});

describe('mcp sdk loading', () => {
  it('stays out of the module graph that build and preview walk', async () => {
    const { createViteConfig } = await import('./config.ts');
    expect(sdk.loaded).toEqual([]);

    const config = await createViteConfig({ userCwd: '/tmp/deck', config: {} });
    expect(sdk.loaded).toEqual([]);
    expect(
      config.plugins?.flat().some((p) => p && 'name' in p && p.name === 'open-frame:mcp'),
    ).toBe(true);
  });

  it('stays unloaded until a request reaches the mounted endpoint', async () => {
    const { mountMcpEndpoint } = await import('./mcp-plugin.ts');
    const server = {
      config: {},
      httpServer: { on: () => {} },
      middlewares: { use: () => {} },
      ws: { send: () => {} },
    } as unknown as ViteDevServer;

    mountMcpEndpoint(server, { userCwd: '/tmp/deck', coreVersion: '1.2.3' });
    expect(sdk.loaded).toEqual([]);
  });
});
