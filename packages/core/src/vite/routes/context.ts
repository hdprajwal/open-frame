import type { ServerResponse } from 'node:http';
import path from 'node:path';
import type { Connect } from 'vite';
import { FRAME_ID_RE } from '../../editing/frame-ops.ts';

export type ApiContext = {
  userCwd: string;
  framesDir: string;
  framesRoot: string;
  globalAssetsRoot: string;
  manifestPath: string;
  coreVersion: string;
};

export type ApiPluginOptions = {
  userCwd: string;
  framesDir?: string;
  assetsDir?: string;
  coreVersion: string;
};

export function makeContext(opts: ApiPluginOptions): ApiContext {
  const userCwd = opts.userCwd;
  const framesDir = opts.framesDir ?? 'frames';
  const assetsDir = opts.assetsDir ?? 'assets';
  const framesRoot = path.resolve(userCwd, framesDir);
  const globalAssetsRoot = path.resolve(userCwd, assetsDir);
  const manifestPath = path.join(framesRoot, '.folders.json');
  return {
    userCwd,
    framesDir,
    framesRoot,
    globalAssetsRoot,
    manifestPath,
    coreVersion: opts.coreVersion,
  };
}

export async function readBody(req: Connect.IncomingMessage): Promise<unknown> {
  return await new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

export function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(body));
}

export function resolveFramePath(
  userCwd: string,
  framesDir: string,
  frameId: string,
): string | null {
  if (!FRAME_ID_RE.test(frameId)) return null;
  const framesRoot = path.resolve(userCwd, framesDir);
  const full = path.resolve(framesRoot, frameId, 'index.tsx');
  if (!full.startsWith(framesRoot + path.sep)) return null;
  return full;
}

export function resolveFrameEntryPath(ctx: ApiContext, frameId: string): string | null {
  return resolveFramePath(ctx.userCwd, ctx.framesDir, frameId);
}
