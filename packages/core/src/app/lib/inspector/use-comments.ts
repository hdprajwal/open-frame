import { useCallback, useEffect, useState } from 'react';

export type FrameComment = {
  id: string;
  line: number;
  ts: string;
  note: string;
  hint?: string;
};

type ListResponse = { comments: FrameComment[] };

export function useComments(frameId: string) {
  const [comments, setComments] = useState<FrameComment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!frameId) return;
    try {
      const res = await fetch(`/__comments?frameId=${encodeURIComponent(frameId)}`);
      if (!res.ok) {
        setError(`GET /__comments → ${res.status}`);
        return;
      }
      const data = (await res.json()) as ListResponse;
      setComments(data.comments);
      setError(null);
    } catch (e) {
      setError(String((e as Error).message ?? e));
    }
  }, [frameId]);

  const add = useCallback(
    async (line: number, column: number, text: string) => {
      const res = await fetch('/__comments/add', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ frameId, line, column, text }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `POST /__comments/add → ${res.status}`);
      }
      await refetch();
    },
    [frameId, refetch],
  );

  const remove = useCallback(
    async (id: string) => {
      const res = await fetch(`/__comments/${id}?frameId=${encodeURIComponent(frameId)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`DELETE /__comments/${id} → ${res.status}`);
      await refetch();
    },
    [frameId, refetch],
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (!import.meta.hot) return;
    const handler = () => refetch();
    import.meta.hot.on('vite:afterUpdate', handler);
    return () => {
      import.meta.hot?.off('vite:afterUpdate', handler);
    };
  }, [refetch]);

  return { comments, error, refetch, add, remove };
}
