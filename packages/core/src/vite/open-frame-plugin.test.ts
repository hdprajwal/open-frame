import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type { HmrContext, ViteDevServer } from 'vite';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { selfWrites } from '../files/self-writes.ts';
import { generateFramesModule, openFramePlugin } from './open-frame-plugin.ts';

type SentMessage = { type: string; event?: string; data?: unknown };

const USER_CWD = path.resolve('/tmp/open-frame-hot-update');
const FRAME_FILE = path.join(USER_CWD, 'frames', 'intro', 'index.tsx');

function fakeServer(sent: SentMessage[]): ViteDevServer {
  return {
    ws: { send: (msg: SentMessage) => sent.push(msg) },
    moduleGraph: { getModuleById: () => null, invalidateModule: () => {} },
  } as unknown as ViteDevServer;
}

// One updater per plugin instance, so a test can replay successive edits to
// the same file against the source the plugin remembers from the last one.
function makeHotUpdater() {
  const plugin = openFramePlugin({ userCwd: USER_CWD, config: {}, coreVersion: '0.0.0' });
  const handle = plugin.handleHotUpdate as (ctx: HmrContext) => Promise<unknown>;
  return async (file: string, read: () => Promise<string>): Promise<SentMessage[]> => {
    const sent: SentMessage[] = [];
    await handle({
      file,
      server: fakeServer(sent),
      read,
      modules: [],
      timestamp: Date.now(),
    } as unknown as HmrContext);
    return sent;
  };
}

async function triggerHotUpdate(file: string, read: () => Promise<string>): Promise<SentMessage[]> {
  return await makeHotUpdater()(file, read);
}

function frameSource(names: string[], bodies: string[]): string {
  const pages = names.map(
    (name, i) => `function ${name}() {\n  return <div>${bodies[i]}</div>;\n}`,
  );
  return `${pages.join('\n\n')}\n\nexport default [${names.join(', ')}];\n`;
}

function reads(contents: string): () => Promise<string> {
  return async () => contents;
}

function externalEdits(sent: SentMessage[]): SentMessage[] {
  return sent.filter((m) => m.event === 'open-frame:external-edit');
}

function frameChanges(sent: SentMessage[]): SentMessage[] {
  return sent.filter((m) => m.event === 'open-frame:frame-changed');
}

describe('openFramePlugin handleHotUpdate', () => {
  beforeEach(() => {
    selfWrites.clear();
  });

  it('emits external-edit for a change the dev server did not make', async () => {
    const sent = await triggerHotUpdate(FRAME_FILE, reads('export default []\n'));

    expect(externalEdits(sent)).toEqual([
      {
        type: 'custom',
        event: 'open-frame:external-edit',
        data: { frameId: 'intro', file: FRAME_FILE, pageIndex: null },
      },
    ]);
  });

  it('names the page an edit landed on once it has seen the file before', async () => {
    const hot = makeHotUpdater();
    const before = frameSource(['Cover', 'Idea', 'Close'], ['a', 'b', 'c']);
    const after = frameSource(['Cover', 'Idea', 'Close'], ['a', 'b changed', 'c']);

    const first = await hot(FRAME_FILE, reads(before));
    expect(externalEdits(first)[0]?.data).toMatchObject({ pageIndex: null });

    const second = await hot(FRAME_FILE, reads(after));
    expect(externalEdits(second)[0]?.data).toMatchObject({ pageIndex: 1 });
  });

  it('names an inserted page rather than the pages it shifted', async () => {
    const hot = makeHotUpdater();
    await hot(FRAME_FILE, reads(frameSource(['Cover', 'Close'], ['a', 'c'])));

    const sent = await hot(
      FRAME_FILE,
      reads(frameSource(['Cover', 'Pace', 'Close'], ['a', 'b', 'c'])),
    );
    expect(externalEdits(sent)[0]?.data).toMatchObject({ pageIndex: 1 });
  });

  it('leaves the page unnamed when the change is outside any page', async () => {
    const hot = makeHotUpdater();
    const before = frameSource(['Cover', 'Close'], ['a', 'c']);
    await hot(FRAME_FILE, reads(before));

    const sent = await hot(FRAME_FILE, reads(`const unrelated = 1;\n${before}`));
    expect(externalEdits(sent)[0]?.data).toMatchObject({ pageIndex: null });
  });

  it('stays quiet for a change matching a recent own write', async () => {
    selfWrites.record(FRAME_FILE, 'export default []\n');
    const sent = await triggerHotUpdate(FRAME_FILE, reads('export default []\n'));

    expect(externalEdits(sent)).toEqual([]);
  });

  it('emits external-edit when a recent own write has different contents', async () => {
    selfWrites.record(FRAME_FILE, 'export default []\n');
    const sent = await triggerHotUpdate(FRAME_FILE, reads('export default [Cover]\n'));

    expect(externalEdits(sent)).toHaveLength(1);
  });

  it('stays quiet when the changed file cannot be read', async () => {
    const sent = await triggerHotUpdate(FRAME_FILE, async () => {
      throw new Error('EACCES');
    });

    expect(externalEdits(sent)).toEqual([]);
  });

  it('ignores files that are not frame entries', async () => {
    const sent = await triggerHotUpdate(
      path.join(USER_CWD, 'frames', 'intro', 'helper.tsx'),
      reads('x'),
    );

    expect(sent).toEqual([]);
  });
});

describe('openFramePlugin frame-changed broadcast', () => {
  beforeEach(() => {
    selfWrites.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function settle(sent: Promise<SentMessage[]>): Promise<SentMessage[]> {
    const messages = await sent;
    await vi.advanceTimersByTimeAsync(200);
    return messages;
  }

  it('broadcasts frame-changed for an external edit', async () => {
    const sent = await settle(triggerHotUpdate(FRAME_FILE, reads('export default []\n')));

    expect(frameChanges(sent)).toEqual([
      { type: 'custom', event: 'open-frame:frame-changed', data: { frameIds: ['intro'] } },
    ]);
  });

  it('broadcasts frame-changed for an own write so the canvas picks it up', async () => {
    selfWrites.record(FRAME_FILE, 'export default []\n');
    const sent = await settle(triggerHotUpdate(FRAME_FILE, reads('export default []\n')));

    expect(externalEdits(sent)).toEqual([]);
    expect(frameChanges(sent)).toHaveLength(1);
  });

  it('skips frame-changed and external-edit for a quiet own write', async () => {
    selfWrites.record(FRAME_FILE, 'export const notes = ["hi"];\n', { quiet: true });
    const sent = await settle(
      triggerHotUpdate(FRAME_FILE, reads('export const notes = ["hi"];\n')),
    );

    expect(sent).toEqual([]);
  });

  it('still names the edited page for an external edit after a quiet write', async () => {
    const hot = makeHotUpdater();
    const before = frameSource(['Cover', 'Idea'], ['a', 'b']);
    const withNotes = `${before}export const notes = ["hi"];\n`;
    const edited = `${frameSource(['Cover', 'Idea'], ['a', 'b changed'])}export const notes = ["hi"];\n`;

    await settle(hot(FRAME_FILE, reads(before)));
    selfWrites.record(FRAME_FILE, withNotes, { quiet: true });
    await settle(hot(FRAME_FILE, reads(withNotes)));
    const sent = await settle(hot(FRAME_FILE, reads(edited)));

    expect(externalEdits(sent)[0]?.data).toMatchObject({ pageIndex: 1 });
    expect(frameChanges(sent)).toHaveLength(1);
  });
});

async function withFramesRoot<T>(fn: (root: string) => Promise<T>): Promise<T> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'open-frame-test-'));
  try {
    return await fn(root);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
}

async function writeFrame(root: string, id: string): Promise<string> {
  await fs.mkdir(path.join(root, id), { recursive: true });
  const entry = path.join(root, id, 'index.tsx');
  await fs.writeFile(
    entry,
    `export const meta = { title: '${id}' };\nexport default [];\n`,
    'utf8',
  );
  return entry;
}

describe('generateFramesModule', () => {
  it('keeps frames whose id is valid and reports none ignored', async () => {
    await withFramesRoot(async (root) => {
      const files = [await writeFrame(root, 'cover'), await writeFrame(root, 'intro_2')].sort();

      const { code, ignored } = await generateFramesModule(files, root, false);

      expect(ignored).toEqual([]);
      expect(code).toContain('export const frameIds = ["cover","intro_2"];');
    });
  });

  it('excludes folders whose id is invalid and reports them as ignored', async () => {
    await withFramesRoot(async (root) => {
      const files = [
        await writeFrame(root, 'cover'),
        await writeFrame(root, '推薦系統'),
        await writeFrame(root, 'has space'),
      ].sort();

      const { code, ignored } = await generateFramesModule(files, root, false);

      expect(ignored.sort()).toEqual(['has space', '推薦系統'].sort());
      expect(code).toContain('export const frameIds = ["cover"];');
      expect(code).not.toContain('推薦系統');
      expect(code).not.toContain('has space');
    });
  });
});

describe('openFramePlugin frames module', () => {
  it('warns once per ignored folder across regenerations', async () => {
    await withFramesRoot(async (userCwd) => {
      await writeFrame(path.join(userCwd, 'frames'), 'cover');
      await writeFrame(path.join(userCwd, 'frames'), 'bad.id');
      const plugin = openFramePlugin({ userCwd, config: {}, coreVersion: '0.0.0' });
      const load = plugin.load as (this: { warn: (msg: string) => void }, id: string) => unknown;
      const warn = vi.fn();

      await load.call({ warn }, '\0virtual:open-frame/frames');
      await load.call({ warn }, '\0virtual:open-frame/frames');

      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0][0]).toContain('"bad.id"');
    });
  });
});
