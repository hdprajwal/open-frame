import { useCallback, useEffect, useRef, useState } from 'react';
import { frameChangeIncludes, loadFrame } from './frames';
import type { FrameModule } from './sdk';

export function useFrameModule(frameId: string) {
  const [frame, setFrame] = useState<FrameModule | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loadSeqRef = useRef(0);

  const reload = useCallback(
    (reset: boolean) => {
      const seq = ++loadSeqRef.current;
      if (reset) setFrame(null);
      setError(null);
      loadFrame(frameId)
        .then((mod) => {
          if (seq === loadSeqRef.current) setFrame(mod);
        })
        .catch((e) => {
          if (seq === loadSeqRef.current) setError(String(e?.message ?? e));
        });
    },
    [frameId],
  );

  useEffect(() => {
    reload(true);
  }, [reload]);

  useEffect(() => {
    if (!import.meta.hot) return;
    let cancelled = false;
    const handler = (data: unknown) => {
      if (frameChangeIncludes(data, frameId)) {
        queueMicrotask(() => {
          if (!cancelled) reload(false);
        });
      }
    };
    import.meta.hot.on('open-frame:frame-changed', handler);
    return () => {
      cancelled = true;
      import.meta.hot?.off('open-frame:frame-changed', handler);
    };
  }, [frameId, reload]);

  return { frame, error, reload };
}
