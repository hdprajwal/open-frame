import path from 'node:path';
import type { HmrContext, ViteDevServer } from 'vite';
import { beforeEach, describe, expect, it } from 'vitest';
import { selfWrites } from '../files/self-writes.ts';
import { openFramePlugin } from './open-frame-plugin.ts';

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
