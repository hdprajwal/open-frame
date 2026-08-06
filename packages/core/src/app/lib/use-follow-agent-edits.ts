import { useCallback, useState } from 'react';

const STORAGE_KEY = 'open-frame:follow-agent-edits';

function read(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(STORAGE_KEY) === '1';
}

export function useFollowAgentEdits(): [boolean, (next: boolean) => void] {
  const [follow, setFollow] = useState(read);

  const update = useCallback((next: boolean) => {
    setFollow(next);
    window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
  }, []);

  return [follow, update];
}
