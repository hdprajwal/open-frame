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

async function triggerHotUpdate(file: string, read: () => Promise<string>): Promise<SentMessage[]> {
  const sent: SentMessage[] = [];
  const plugin = openFramePlugin({ userCwd: USER_CWD, config: {}, coreVersion: '0.0.0' });
  const handle = plugin.handleHotUpdate as (ctx: HmrContext) => Promise<unknown>;
  await handle({
    file,
    server: fakeServer(sent),
    read,
    modules: [],
    timestamp: Date.now(),
  } as unknown as HmrContext);
  return sent;
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
        data: { frameId: 'intro', file: FRAME_FILE },
      },
    ]);
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
