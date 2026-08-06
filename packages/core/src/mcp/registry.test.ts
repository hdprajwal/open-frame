import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ViteDevServer } from 'vite';
import { describe, expect, it } from 'vitest';
import {
  type McpToolContext,
  type McpToolRegistrar,
  registerTools,
  toolRegistrars,
} from './registry.ts';
import { createMcpServer } from './server.ts';

function makeContext(): McpToolContext {
  return {
    userCwd: '/tmp/deck',
    framesDir: 'frames',
    assetsDir: 'assets',
    coreVersion: '1.2.3',
    server: {} as ViteDevServer,
  };
}

describe('tool registry', () => {
  it('ships empty so read/write tools can land later', () => {
    expect(toolRegistrars).toEqual([]);
  });

  it('runs every registrar in order with the server and context', () => {
    const calls: Array<{ label: string; mcp: McpServer; ctx: McpToolContext }> = [];
    const registrar =
      (label: string): McpToolRegistrar =>
      (mcp, ctx) => {
        calls.push({ label, mcp, ctx });
      };
    const ctx = makeContext();
    const mcp = createMcpServer(ctx);

    registerTools(mcp, ctx, [registrar('read'), registrar('write')]);

    expect(calls.map((c) => c.label)).toEqual(['read', 'write']);
    expect(calls[0]?.mcp).toBe(mcp);
    expect(calls[0]?.ctx).toBe(ctx);
  });
});
