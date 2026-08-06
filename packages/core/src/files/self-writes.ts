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
  const entries = new Map<string, { hash: string; at: number }>();

  const sweep = (at: number) => {
    for (const [key, entry] of entries) {
      if (at - entry.at >= ttlMs) entries.delete(key);
    }
  };

  return {
    record(file, contents) {
      const at = now();
      sweep(at);
      entries.set(keyFor(file), { hash: hashContents(contents), at });
    },
    // Deliberately non-destructive: one write can surface as more than one
    // watcher event, and every one of them is still our own write.
    matches(file, contents) {
      const at = now();
      sweep(at);
      const entry = entries.get(keyFor(file));
      if (!entry) return false;
      return entry.hash === hashContents(contents);
    },
    clear() {
      entries.clear();
    },
  };
}

export const selfWrites: SelfWriteTracker = createSelfWriteTracker();

export async function writeTrackedFile(file: string, contents: SelfWriteContents): Promise<void> {
  selfWrites.record(file, contents);
  await fs.writeFile(file, contents);
}
