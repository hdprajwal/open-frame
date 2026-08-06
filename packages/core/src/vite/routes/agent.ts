import type { ViteDevServer } from 'vite';
import { validateMutationRequest } from '../../http/request-guard.ts';
import { json, readBody } from './context.ts';

// POST /__agent/presence   announce { name } so the presence chip can name the agent

const MAX_NAME_LENGTH = 40;

// An announced name is rendered as UI text, so control characters go first —
// \s only covers the handful of them that count as whitespace.
function blankControlChars(value: string): string {
  let out = '';
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0;
    out += code < 0x20 || code === 0x7f ? ' ' : ch;
  }
  return out;
}

export function sanitizeAgentName(raw: string): string | null {
  const collapsed = blankControlChars(raw).replace(/\s+/g, ' ').trim();
  // Truncate by code point — slicing UTF-16 units can cut an emoji in half and
  // leave a lone surrogate to be rendered as UI text.
  const name = Array.from(collapsed).slice(0, MAX_NAME_LENGTH).join('').trim();
  return name || null;
}

export function registerAgentRoutes(server: ViteDevServer): void {
  server.middlewares.use('/__agent', async (req, res, next) => {
    const url = new URL(req.url ?? '/', 'http://local');
    if (req.method !== 'POST' || url.pathname !== '/presence') return next();

    const requestCheck = validateMutationRequest(req, { requireJsonBody: true });
    if (!requestCheck.ok) return json(res, requestCheck.status, { error: requestCheck.error });

    try {
      const body = (await readBody(req)) as { name?: unknown };
      if (typeof body.name !== 'string') return json(res, 400, { error: 'missing name' });
      const name = sanitizeAgentName(body.name);
      if (!name) return json(res, 400, { error: 'invalid name' });

      server.ws.send({
        type: 'custom',
        event: 'open-frame:agent-presence',
        data: { name },
      });
      return json(res, 200, { ok: true, name });
    } catch (err) {
      json(res, 500, { error: String((err as Error).message ?? err) });
    }
  });
}
