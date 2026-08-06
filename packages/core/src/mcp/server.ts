import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type McpToolContext, registerTools } from './registry.ts';

export const MCP_SERVER_NAME = 'open-frame';

export function createMcpServer(ctx: McpToolContext): McpServer {
  const mcp = new McpServer({
    name: MCP_SERVER_NAME,
    title: 'open-frame',
    version: ctx.coreVersion,
  });
  registerTools(mcp, ctx);
  return mcp;
}
