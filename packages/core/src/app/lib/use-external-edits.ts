import { useEffect, useState, useSyncExternalStore } from 'react';

export type ExternalEdit = {
  frameId: string;
  file: string;
  // The page the edit landed on, or null when the dev server couldn't narrow
  // it down — an unparseable file, or a change outside any page component.
  pageIndex: number | null;
  // When the edit landed. Presence reads this, so a replay must not move it.
  at: number;
  // When this revision reached the client — refreshed on replay. Flashes are
  // gated on this so a component mounting later doesn't replay a stale edit.
  deliveredAt: number;
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

function parseExternalEdit(
  data: unknown,
): Omit<ExternalEdit, 'at' | 'deliveredAt' | 'revision'> | null {
  if (!data || typeof data !== 'object') return null;
  const { frameId, file, pageIndex } = data as {
    frameId?: unknown;
    file?: unknown;
    pageIndex?: unknown;
  };
  if (typeof frameId !== 'string' || !frameId) return null;
  return {
    frameId,
    file: typeof file === 'string' ? file : '',
    pageIndex: typeof pageIndex === 'number' && pageIndex >= 0 ? pageIndex : null,
  };
}

function replayIfMissedWhileHidden() {
  const latest = snapshot.latest;
  if (!latest || hiddenSince === null) return;
  if (latest.at < hiddenSince) return;
  revision += 1;
  publish({ ...latest, deliveredAt: Date.now(), revision });
}

function start() {
  if (started) return;
  started = true;

  import.meta.hot?.on('open-frame:external-edit', (data: unknown) => {
    const parsed = parseExternalEdit(data);
    if (!parsed) return;
    revision += 1;
    const now = Date.now();
    publish({ ...parsed, at: now, deliveredAt: now, revision });
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

function useFlashTimer(edit: ExternalEdit | undefined): number | null {
  const revision = edit?.revision ?? 0;
  const deliveredAt = edit?.deliveredAt ?? 0;
  const [flashing, setFlashing] = useState(0);

  // Stored edits never expire, and a mounting component can't tell "this just
  // arrived" from "this was already here" — so the remaining lifetime decides,
  // not the revision alone. Without this, revisiting a frame minutes later
  // would flash an edit that has long since gone stale.
  useEffect(() => {
    const remaining = revision ? FLASH_MS - (Date.now() - deliveredAt) : 0;
    if (remaining <= 0) {
      setFlashing(0);
      return;
    }
    setFlashing(revision);
    const timer = setTimeout(() => setFlashing(0), remaining);
    return () => clearTimeout(timer);
  }, [revision, deliveredAt]);

  return flashing || null;
}

// Subscribing to one frame's entry rather than the whole snapshot: entries are
// replaced per revision, so React bails out for the frames an edit didn't
// touch. With a grid of cards mounted, the alternative re-renders every live
// page preview on every edit.
function useEditFor(frameId: string): ExternalEdit | undefined {
  const read = () => (frameId ? snapshot.byFrame.get(frameId) : undefined);
  return useSyncExternalStore(subscribe, read, read);
}

/**
 * Returns the revision of the edit currently worth flashing, or null. Render
 * the flash element with the revision as its `key` so a second edit restarts
 * the animation instead of riding out the first one.
 */
export function useFrameEditFlash(frameId: string): number | null {
  return useFlashTimer(useEditFor(frameId));
}

export function usePageEditFlash(frameId: string, pageIndex: number): number | null {
  const edit = useEditFor(frameId);
  return useFlashTimer(edit?.pageIndex === pageIndex ? edit : undefined);
}
