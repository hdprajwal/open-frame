import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ViteDevServer } from 'vite';

export type McpToolContext = {
  userCwd: string;
  slidesDir: string;
  assetsDir: string;
  coreVersion: string;
  server: ViteDevServer;
};

export type McpToolRegistrar = (mcp: McpServer, ctx: McpToolContext) => void;

export const toolRegistrars: readonly McpToolRegistrar[] = [];

export function registerTools(
  mcp: McpServer,
  ctx: McpToolContext,
  registrars: readonly McpToolRegistrar[] = toolRegistrars,
): void {
  for (const registrar of registrars) registrar(mcp, ctx);
}
