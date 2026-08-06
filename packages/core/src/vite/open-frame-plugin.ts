import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { loadConfigFromFile, normalizePath, type Plugin, type ViteDevServer } from 'vite';
import type { OpenFrameConfig } from '../config.ts';
import { changedPageIndices } from '../editing/page-diff.ts';
import { selfWrites } from '../files/self-writes.ts';

export type { OpenFrameConfig };

export type OpenFramePluginOptions = {
  userCwd: string;
  config: OpenFrameConfig;
  coreVersion: string;
};

const CONFIG_FILE = 'open-frame.config.ts';

const FRAMES_VMOD = 'virtual:open-frame/frames';
const CONFIG_VMOD = 'virtual:open-frame/config';
const FOLDERS_VMOD = 'virtual:open-frame/folders';

type FoldersManifest = {
  folders: unknown[];
  assignments: Record<string, string>;
};

async function readFoldersManifest(file: string): Promise<FoldersManifest> {
  try {
    const raw = await fs.readFile(file, 'utf8');
    const parsed = JSON.parse(raw) as Partial<FoldersManifest>;
    return {
      folders: Array.isArray(parsed.folders) ? parsed.folders : [],
      assignments:
        parsed.assignments && typeof parsed.assignments === 'object'
          ? (parsed.assignments as Record<string, string>)
          : {},
    };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return { folders: [], assignments: {} };
    }
    throw err;
  }
}

function resolved(id: string): string {
  return `\0${id}`;
}

// Unreadable files fail closed: a change we cannot hash is reported as our
// own, because a false external-edit signal is worse than a missed one.
async function classifyEdit(
  file: string,
  read: () => string | Promise<string>,
): Promise<{ external: boolean; contents: string | null }> {
  let contents: string;
  try {
    contents = await read();
  } catch {
    return { external: false, contents: null };
  }
  return { external: !selfWrites.matches(file, contents), contents };
}

async function findFrames(userCwd: string, framesDir: string): Promise<string[]> {
  const abs = path.resolve(userCwd, framesDir);
  if (!existsSync(abs)) return [];
  const hits = await fg('*/index.{tsx,jsx,ts,js}', {
    cwd: abs,
    absolute: true,
    onlyFiles: true,
  });
  return hits.sort();
}

function toId(absFile: string, framesRoot: string): string {
  const rel = path.relative(framesRoot, absFile);
  return rel.split(path.sep)[0];
}

const META_THEME_RE = /(?:^|[\s,{])theme\s*:\s*['"]([^'"]+)['"]/;
const META_CREATED_AT_RE = /(?:^|[\s,{])createdAt\s*:\s*['"]([^'"]+)['"]/;

type ExtractedMeta = { theme: string | null; createdAt: string | null };

function extractMeta(src: string): ExtractedMeta {
  const empty: ExtractedMeta = { theme: null, createdAt: null };
  const metaStart = src.search(/export\s+const\s+meta\b/);
  if (metaStart === -1) return empty;
  const eqIdx = src.indexOf('=', metaStart);
  if (eqIdx === -1) return empty;
  const openBrace = src.indexOf('{', eqIdx);
  if (openBrace === -1) return empty;
  let depth = 0;
  let closeBrace = -1;
  for (let i = openBrace; i < src.length; i++) {
    const ch = src[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        closeBrace = i;
        break;
      }
    }
  }
  if (closeBrace === -1) return empty;
  const body = src.slice(openBrace + 1, closeBrace);
  const themeMatch = body.match(META_THEME_RE);
  const createdAtMatch = body.match(META_CREATED_AT_RE);
  return {
    theme: themeMatch ? themeMatch[1] : null,
    createdAt: createdAtMatch ? createdAtMatch[1] : null,
  };
}

async function readFrameMeta(abs: string): Promise<ExtractedMeta> {
  try {
    const src = await fs.readFile(abs, 'utf8');
    return extractMeta(src);
  } catch {
    return { theme: null, createdAt: null };
  }
}

function parseCreatedAtMs(iso: string | null): number | null {
  if (!iso) return null;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : null;
}

async function generateFramesModule(
  files: string[],
  framesRoot: string,
  isDev: boolean,
): Promise<string> {
  const entries = await Promise.all(
    files.map(async (abs) => {
      const id = toId(abs, framesRoot);
      const importPath = isDev ? `@fs/${normalizePath(abs).replace(/^\/+/, '')}` : abs;
      const meta = await readFrameMeta(abs);
      return { id, importPath, theme: meta.theme, createdAt: parseCreatedAtMs(meta.createdAt) };
    }),
  );

  const ids = JSON.stringify(entries.map((e) => e.id).sort());
  const themesMap: Record<string, string> = {};
  const createdAtMap: Record<string, number> = {};
  for (const e of entries) {
    if (e.theme) themesMap[e.id] = e.theme;
    if (e.createdAt !== null) createdAtMap[e.id] = e.createdAt;
  }
  const themesJson = JSON.stringify(themesMap);
  const createdAtJson = JSON.stringify(createdAtMap);
  const importTokens = JSON.stringify(Object.fromEntries(entries.map((e) => [e.id, 0])));
  const devRuntime = isDev
    ? `
const frameImportTokens = ${importTokens};
if (import.meta.hot) {
  import.meta.hot.on('open-frame:frame-changed', (data) => {
    const ids = Array.isArray(data?.frameIds) ? data.frameIds : data?.frameId ? [data.frameId] : [];
    const token = Date.now();
    for (const id of ids) {
      if (Object.prototype.hasOwnProperty.call(frameImportTokens, id)) frameImportTokens[id] = token;
    }
  });
}
`
    : '';
  const cases = entries
    .map((e) => {
      const importExpr = isDev
        ? `import(/* @vite-ignore */ import.meta.env.BASE_URL + ${JSON.stringify(`${e.importPath}?t=`)} + frameImportTokens[${JSON.stringify(e.id)}])`
        : `import(${JSON.stringify(e.importPath)})`;
      return `    case ${JSON.stringify(e.id)}: return ${importExpr};`;
    })
    .join('\n');

  return `// virtual:open-frame/frames — generated
export const frameIds = ${ids};
export const frameThemes = ${themesJson};
export const frameCreatedAt = ${createdAtJson};
${devRuntime}

export async function loadFrame(id) {
  switch (id) {
${cases}
    default: throw new Error('Frame not found: ' + id);
  }
}
`;
}

export function openFramePlugin(opts: OpenFramePluginOptions): Plugin {
  const { userCwd, config, coreVersion } = opts;
  const framesDir = config.framesDir ?? 'frames';
  const framesRoot = path.resolve(userCwd, framesDir);
  const foldersManifestPath = path.join(framesRoot, '.folders.json');

  let isDev = false;
  const frameIdForEntry = (p: string): string | null => {
    const rel = path.relative(framesRoot, p);
    if (rel.startsWith('..') || path.isAbsolute(rel)) return null;
    const parts = rel.split(path.sep);
    if (parts.length !== 2) return null;
    if (!/^index\.(tsx|jsx|ts|js)$/.test(parts[1])) return null;
    return parts[0];
  };
  // Last contents seen for each frame entry, so an external edit can be
  // narrowed to the page it touched. Seeded at startup; without an entry the
  // edit still reports, just without a page.
  const lastFrameSource = new Map<string, string>();
  const seedFrameSources = async () => {
    for (const file of await findFrames(userCwd, framesDir)) {
      try {
        lastFrameSource.set(file, await fs.readFile(file, 'utf8'));
      } catch {}
    }
  };

  let frameChangeTimer: ReturnType<typeof setTimeout> | null = null;
  const pendingFrameChanges = new Set<string>();
  const queueFrameChanged = (server: ViteDevServer, id: string) => {
    pendingFrameChanges.add(id);
    if (frameChangeTimer) clearTimeout(frameChangeTimer);
    frameChangeTimer = setTimeout(() => {
      frameChangeTimer = null;
      const mod = server.moduleGraph.getModuleById(resolved(FRAMES_VMOD));
      if (mod) server.moduleGraph.invalidateModule(mod);
      const frameIds = Array.from(pendingFrameChanges);
      pendingFrameChanges.clear();
      server.ws.send({
        type: 'custom',
        event: 'open-frame:frame-changed',
        data: { frameIds },
      });
    }, 100);
  };

  return {
    name: 'open-frame',
    config(_c, env) {
      isDev = env.command === 'serve';
      return {
        server: { fs: { allow: [userCwd] } },
      };
    },
    resolveId(id) {
      if (id === FRAMES_VMOD) return resolved(FRAMES_VMOD);
      if (id === CONFIG_VMOD) return resolved(CONFIG_VMOD);
      if (id === FOLDERS_VMOD) return resolved(FOLDERS_VMOD);
      return null;
    },
    async load(id) {
      if (id === resolved(FRAMES_VMOD)) {
        const files = await findFrames(userCwd, framesDir);
        return await generateFramesModule(files, framesRoot, isDev);
      }
      if (id === resolved(CONFIG_VMOD)) {
        const userBuild = config.build ?? {};
        const buildResolved = isDev
          ? { showFrameBrowser: true, showFrameUi: true, allowHtmlDownload: true }
          : {
              showFrameBrowser: userBuild.showFrameBrowser ?? true,
              showFrameUi: userBuild.showFrameUi ?? true,
              allowHtmlDownload: userBuild.allowHtmlDownload ?? true,
            };
        const resolvedConfig = { ...config, build: buildResolved, version: coreVersion };
        return `export default ${JSON.stringify(resolvedConfig)};\n`;
      }
      if (id === resolved(FOLDERS_VMOD)) {
        const manifest = await readFoldersManifest(foldersManifestPath);
        return `export default ${JSON.stringify(manifest)};\n`;
      }
      return null;
    },
    async handleHotUpdate(ctx) {
      const frameId = frameIdForEntry(ctx.file);
      if (!frameId) return;
      const { external, contents } = await classifyEdit(ctx.file, ctx.read);
      if (external) {
        const previous = lastFrameSource.get(ctx.file);
        const changed =
          previous !== undefined && contents !== null
            ? changedPageIndices(previous, contents)
            : null;
        ctx.server.ws.send({
          type: 'custom',
          event: 'open-frame:external-edit',
          data: { frameId, file: ctx.file, pageIndex: changed?.length ? changed[0] : null },
        });
      }
      if (contents !== null) lastFrameSource.set(ctx.file, contents);
      queueFrameChanged(ctx.server, frameId);
      return [];
    },
    configureServer(server) {
      void seedFrameSources();
      const isFrameEntry = (p: string) => frameIdForEntry(p) !== null;

      let reloadTimer: ReturnType<typeof setTimeout> | null = null;
      const reload = () => {
        if (reloadTimer) clearTimeout(reloadTimer);
        reloadTimer = setTimeout(() => {
          reloadTimer = null;
          const mod = server.moduleGraph.getModuleById(resolved(FRAMES_VMOD));
          if (mod) server.moduleGraph.invalidateModule(mod);
          server.ws.send({ type: 'full-reload' });
        }, 150);
      };
      // Vite's `root` is the core app dir, so chokidar doesn't watch the
      // user's frames folder by default. Add it explicitly — and pass the
      // directory itself, since Vite sets `disableGlobbing: true` and would
      // otherwise treat a glob pattern as a literal path.
      if (existsSync(framesRoot)) server.watcher.add(framesRoot);
      server.watcher.on('add', (p) => {
        if (isFrameEntry(p)) reload();
      });
      server.watcher.on('unlink', (p) => {
        if (isFrameEntry(p)) reload();
      });

      let foldersTimer: ReturnType<typeof setTimeout> | null = null;
      const invalidateFolders = () => {
        if (foldersTimer) clearTimeout(foldersTimer);
        foldersTimer = setTimeout(() => {
          foldersTimer = null;
          const mod = server.moduleGraph.getModuleById(resolved(FOLDERS_VMOD));
          if (mod) server.moduleGraph.invalidateModule(mod);
        }, 100);
      };
      server.watcher.add(foldersManifestPath);
      server.watcher.on('change', (p) => {
        if (p === foldersManifestPath) invalidateFolders();
      });
      server.watcher.on('add', (p) => {
        if (p === foldersManifestPath) invalidateFolders();
      });
      server.watcher.on('unlink', (p) => {
        if (p === foldersManifestPath) invalidateFolders();
      });
    },
  };
}

export async function loadUserConfig(userCwd: string): Promise<OpenFrameConfig> {
  const file = path.join(userCwd, CONFIG_FILE);
  if (!existsSync(file)) return {};
  const loaded = await loadConfigFromFile(
    { command: 'serve', mode: 'development' },
    file,
    userCwd,
    'silent',
  );
  return (loaded?.config ?? {}) as OpenFrameConfig;
}
