import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createSelfWriteTracker,
  SELF_WRITE_TTL_MS,
  selfWrites,
  writeTrackedFile,
} from './self-writes.ts';

function fakeClock(start = 1_000) {
  let current = start;
  return {
    now: () => current,
    advance(ms: number) {
      current += ms;
    },
  };
}

async function tempFile(name = 'index.tsx'): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'open-frame-self-writes-'));
  return path.join(dir, name);
}

describe('self-write tracker', () => {
  it('matches a recorded write of the same file and contents', () => {
    const tracker = createSelfWriteTracker();
    tracker.record('/frames/intro/index.tsx', 'export default []');

    expect(tracker.matches('/frames/intro/index.tsx', 'export default []')).toBe(true);
  });

  it('matches regardless of how the path is spelled', () => {
    const tracker = createSelfWriteTracker();
    tracker.record('/frames/intro/index.tsx', 'a');

    expect(tracker.matches('/frames/./intro/../intro/index.tsx', 'a')).toBe(true);
  });

  it('stays matched across repeat checks so one write can fan out to many events', () => {
    const tracker = createSelfWriteTracker();
    tracker.record('/frames/intro/index.tsx', 'a');

    expect(tracker.matches('/frames/intro/index.tsx', 'a')).toBe(true);
    expect(tracker.matches('/frames/intro/index.tsx', 'a')).toBe(true);
  });

  it('does not match once the TTL has passed', () => {
    const clock = fakeClock();
    const tracker = createSelfWriteTracker({ now: clock.now });
    tracker.record('/frames/intro/index.tsx', 'a');

    clock.advance(SELF_WRITE_TTL_MS - 1);
    expect(tracker.matches('/frames/intro/index.tsx', 'a')).toBe(true);

    clock.advance(1);
    expect(tracker.matches('/frames/intro/index.tsx', 'a')).toBe(false);
  });

  it('does not match different contents for the same file', () => {
    const tracker = createSelfWriteTracker();
    tracker.record('/frames/intro/index.tsx', 'a');

    expect(tracker.matches('/frames/intro/index.tsx', 'b')).toBe(false);
  });

  it('does not match a file that was never recorded', () => {
    const tracker = createSelfWriteTracker();
    tracker.record('/frames/intro/index.tsx', 'a');

    expect(tracker.matches('/frames/outro/index.tsx', 'a')).toBe(false);
  });

  it('keeps every write to a file matchable, not just the latest', () => {
    const tracker = createSelfWriteTracker();
    tracker.record('/frames/intro/index.tsx', 'a');
    tracker.record('/frames/intro/index.tsx', 'b');

    expect(tracker.matches('/frames/intro/index.tsx', 'a')).toBe(true);
    expect(tracker.matches('/frames/intro/index.tsx', 'b')).toBe(true);
  });

  it('expires each write on its own TTL', () => {
    const clock = fakeClock();
    const tracker = createSelfWriteTracker({ now: clock.now });
    tracker.record('/frames/intro/index.tsx', 'a');
    clock.advance(SELF_WRITE_TTL_MS - 1);
    tracker.record('/frames/intro/index.tsx', 'b');

    expect(tracker.matches('/frames/intro/index.tsx', 'a')).toBe(true);

    clock.advance(1);
    expect(tracker.matches('/frames/intro/index.tsx', 'a')).toBe(false);
    expect(tracker.matches('/frames/intro/index.tsx', 'b')).toBe(true);
  });

  it('refreshes an entry rather than growing when the same contents repeat', () => {
    const clock = fakeClock();
    const tracker = createSelfWriteTracker({ now: clock.now });
    tracker.record('/frames/intro/index.tsx', 'a');
    clock.advance(SELF_WRITE_TTL_MS - 1);
    tracker.record('/frames/intro/index.tsx', 'a');

    clock.advance(SELF_WRITE_TTL_MS - 1);
    expect(tracker.matches('/frames/intro/index.tsx', 'a')).toBe(true);
  });

  // Accepted miss, not a bug: an external write of byte-identical content
  // inside the TTL window is indistinguishable from our own write, so it is
  // reported as ours and the client misses one external-edit flash.
  it('treats a byte-identical external write inside the TTL as its own', () => {
    const tracker = createSelfWriteTracker();
    tracker.record('/frames/intro/index.tsx', 'a');

    expect(tracker.matches('/frames/intro/index.tsx', 'a')).toBe(true);
  });

  it('forgets everything on clear', () => {
    const tracker = createSelfWriteTracker();
    tracker.record('/frames/intro/index.tsx', 'a');
    tracker.clear();

    expect(tracker.matches('/frames/intro/index.tsx', 'a')).toBe(false);
  });
});

describe('writeTrackedFile', () => {
  it('writes the file and records it on the shared tracker', async () => {
    const file = await tempFile();
    selfWrites.clear();

    await writeTrackedFile(file, 'export default []\n');

    await expect(fs.readFile(file, 'utf8')).resolves.toBe('export default []\n');
    expect(selfWrites.matches(file, 'export default []\n')).toBe(true);
    expect(selfWrites.matches(file, 'something else')).toBe(false);
  });

  it('keeps both contents matchable when two writes to one file overlap', async () => {
    const file = await tempFile();
    selfWrites.clear();

    await Promise.all([writeTrackedFile(file, 'first\n'), writeTrackedFile(file, 'second\n')]);

    expect(selfWrites.matches(file, 'first\n')).toBe(true);
    expect(selfWrites.matches(file, 'second\n')).toBe(true);
  });

  it('lands the last caller contents intact when writes to one file overlap', async () => {
    const file = await tempFile();
    selfWrites.clear();
    const first = 'a'.repeat(512 * 1024);
    const second = 'b'.repeat(512 * 1024);

    await Promise.all([writeTrackedFile(file, first), writeTrackedFile(file, second)]);

    await expect(fs.readFile(file, 'utf8')).resolves.toBe(second);
  });

  it('keeps accepting writes to a file after one of them failed', async () => {
    const file = await tempFile();
    await fs.mkdir(file);

    await expect(writeTrackedFile(file, 'nope')).rejects.toThrow();

    await fs.rmdir(file);
    await writeTrackedFile(file, 'ok\n');

    await expect(fs.readFile(file, 'utf8')).resolves.toBe('ok\n');
  });
});
