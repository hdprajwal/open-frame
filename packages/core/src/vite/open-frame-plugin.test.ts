import path from 'node:path';
import type { HmrContext, ViteDevServer } from 'vite';
import { beforeEach, describe, expect, it } from 'vitest';
import { selfWrites } from '../files/self-writes.ts';
import { openFramePlugin } from './open-frame-plugin.ts';

type SentMessage = { type: string; event?: string; data?: unknown };

const USER_CWD = path.resolve('/tmp/open-frame-hot-update');
const SLIDE_FILE = path.join(USER_CWD, 'slides', 'intro', 'index.tsx');

function fakeServer(sent: SentMessage[]): ViteDevServer {
  return {
    ws: { send: (msg: SentMessage) => sent.push(msg) },
    moduleGraph: { getModuleById: () => null, invalidateModule: () => {} },
  } as unknown as ViteDevServer;
}

async function triggerHotUpdate(file: string, contents: string): Promise<SentMessage[]> {
  const sent: SentMessage[] = [];
  const plugin = openFramePlugin({ userCwd: USER_CWD, config: {}, coreVersion: '0.0.0' });
  const handle = plugin.handleHotUpdate as (ctx: HmrContext) => Promise<unknown>;
  await handle({
    file,
    server: fakeServer(sent),
    read: async () => contents,
    modules: [],
    timestamp: Date.now(),
  } as unknown as HmrContext);
  return sent;
}

function externalEdits(sent: SentMessage[]): SentMessage[] {
  return sent.filter((m) => m.event === 'open-frame:external-edit');
}

describe('openFramePlugin handleHotUpdate', () => {
  beforeEach(() => {
    selfWrites.clear();
  });

  it('emits external-edit for a change the dev server did not make', async () => {
    const sent = await triggerHotUpdate(SLIDE_FILE, 'export default []\n');

    expect(externalEdits(sent)).toEqual([
      {
        type: 'custom',
        event: 'open-frame:external-edit',
        data: { slideId: 'intro', file: SLIDE_FILE },
      },
    ]);
  });

  it('stays quiet for a change matching a recent own write', async () => {
    selfWrites.record(SLIDE_FILE, 'export default []\n');
    const sent = await triggerHotUpdate(SLIDE_FILE, 'export default []\n');

    expect(externalEdits(sent)).toEqual([]);
  });

  it('emits external-edit when a recent own write has different contents', async () => {
    selfWrites.record(SLIDE_FILE, 'export default []\n');
    const sent = await triggerHotUpdate(SLIDE_FILE, 'export default [Cover]\n');

    expect(externalEdits(sent)).toHaveLength(1);
  });

  it('ignores files that are not slide entries', async () => {
    const sent = await triggerHotUpdate(path.join(USER_CWD, 'slides', 'intro', 'helper.tsx'), 'x');

    expect(sent).toEqual([]);
  });
});
