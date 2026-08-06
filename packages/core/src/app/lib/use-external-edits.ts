import { useEffect, useState, useSyncExternalStore } from 'react';

export type ExternalEdit = {
  frameId: string;
  file: string;
  at: number;
  // Bumped on every delivery, including a replay of an edit that landed while
  // the tab was hidden. Consumers key their flash on it so the same edit can
  // animate twice.
  revision: number;
};

type ExternalEditSnapshot = {
  latest: ExternalEdit | null;
  byFrame: ReadonlyMap<string, ExternalEdit>;
};

const EMPTY: ExternalEditSnapshot = { latest: null, byFrame: new Map() };

const listeners = new Set<() => void>();
let snapshot: ExternalEditSnapshot = EMPTY;
let revision = 0;
let started = false;
let hiddenSince: number | null = null;

function publish(edit: ExternalEdit) {
  const byFrame = new Map(snapshot.byFrame);
  byFrame.set(edit.frameId, edit);
  snapshot = { latest: edit, byFrame };
  for (const listener of listeners) listener();
}

function parseExternalEdit(data: unknown): { frameId: string; file: string } | null {
  if (!data || typeof data !== 'object') return null;
  const { frameId, file } = data as { frameId?: unknown; file?: unknown };
  if (typeof frameId !== 'string' || !frameId) return null;
  return { frameId, file: typeof file === 'string' ? file : '' };
}

function replayIfMissedWhileHidden() {
  const latest = snapshot.latest;
  if (!latest || hiddenSince === null) return;
  if (latest.at < hiddenSince) return;
  revision += 1;
  publish({ ...latest, revision });
}

function start() {
  if (started) return;
  started = true;

  import.meta.hot?.on('open-frame:external-edit', (data: unknown) => {
    const parsed = parseExternalEdit(data);
    if (!parsed) return;
    revision += 1;
    publish({ ...parsed, at: Date.now(), revision });
  });

  if (typeof document === 'undefined') return;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      hiddenSince = Date.now();
      return;
    }
    replayIfMissedWhileHidden();
    hiddenSince = null;
  });
}

function subscribe(listener: () => void) {
  start();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return snapshot;
}

export function useExternalEdits(): ExternalEditSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

const FLASH_MS = 1800;

/**
 * Returns the revision of the edit currently worth flashing for `frameId`, or
 * null. Render the flash element with the revision as its `key` so a second
 * edit restarts the animation instead of riding out the first one.
 */
export function useFrameEditFlash(frameId: string): number | null {
  const { byFrame } = useExternalEdits();
  const edit = frameId ? byFrame.get(frameId) : undefined;
  const editRevision = edit?.revision ?? 0;
  const [flashing, setFlashing] = useState(0);

  useEffect(() => {
    if (!editRevision) {
      setFlashing(0);
      return;
    }
    setFlashing(editRevision);
    const timer = setTimeout(() => setFlashing(0), FLASH_MS);
    return () => clearTimeout(timer);
  }, [editRevision]);

  return flashing || null;
}
