import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

// Long enough to cover chokidar picking a write up (tens of ms in practice),
// short enough that a stale entry can only mask an external edit briefly.
export const SELF_WRITE_TTL_MS = 1500;

export type SelfWriteContents = string | Uint8Array;

export type SelfWriteTracker = {
  record(file: string, contents: SelfWriteContents): void;
  matches(file: string, contents: SelfWriteContents): boolean;
  clear(): void;
};

export type SelfWriteTrackerOptions = {
  ttlMs?: number;
  now?: () => number;
};

export function hashContents(contents: SelfWriteContents): string {
  return createHash('sha1').update(contents).digest('hex');
}

// Watcher paths come through with posix separators while route paths use the
// platform's, so both sides have to agree on one spelling of the same file.
function keyFor(file: string): string {
  return path.resolve(file).replace(/\\/g, '/');
}

export function createSelfWriteTracker(opts: SelfWriteTrackerOptions = {}): SelfWriteTracker {
  const ttlMs = opts.ttlMs ?? SELF_WRITE_TTL_MS;
  const now = opts.now ?? Date.now;
  const entries = new Map<string, { hash: string; at: number }[]>();

  const sweep = (at: number) => {
    for (const [key, list] of entries) {
      const live = list.filter((entry) => at - entry.at < ttlMs);
      if (live.length === 0) entries.delete(key);
      else if (live.length !== list.length) entries.set(key, live);
    }
  };

  return {
    // Every write in the TTL window stays matchable, not just the newest one:
    // a watcher event lags the write that produced it, so a later write can
    // land in the tracker while disk still holds the earlier contents that the
    // event is about.
    record(file, contents) {
      const at = now();
      sweep(at);
      const key = keyFor(file);
      const hash = hashContents(contents);
      const list = entries.get(key) ?? [];
      const seen = list.find((entry) => entry.hash === hash);
      if (seen) seen.at = at;
      else list.push({ hash, at });
      entries.set(key, list);
    },
    // Deliberately non-destructive: one write can surface as more than one
    // watcher event, and every one of them is still our own write.
    matches(file, contents) {
      const at = now();
      sweep(at);
      const list = entries.get(keyFor(file));
      if (!list) return false;
      const hash = hashContents(contents);
      return list.some((entry) => entry.hash === hash);
    },
    clear() {
      entries.clear();
    },
  };
}

export const selfWrites: SelfWriteTracker = createSelfWriteTracker();

const writeChains = new Map<string, Promise<void>>();

// Every dev-server write to a slide entry file has to go through here. A write
// the tracker never saw is indistinguishable from an editor saving the file,
// and reaches the client as a spurious external edit.
// Writes to one file are chained rather than run concurrently, so the last
// caller's contents are what ends up on disk instead of whichever write's
// `fs.writeFile` happened to finish last.
export async function writeTrackedFile(file: string, contents: SelfWriteContents): Promise<void> {
  const key = keyFor(file);
  const run = (writeChains.get(key) ?? Promise.resolve()).then(async () => {
    selfWrites.record(file, contents);
    await fs.writeFile(file, contents);
  });
  const tail = run.then(
    () => {},
    () => {},
  );
  writeChains.set(key, tail);
  try {
    await run;
  } finally {
    if (writeChains.get(key) === tail) writeChains.delete(key);
  }
}
