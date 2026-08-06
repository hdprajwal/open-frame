import { useCallback, useState } from 'react';

const STORAGE_KEY = 'open-frame:follow-agent-edits';

// Defaults on: watching an agent work is the point of the studio, and now that
// an edit names the page it landed on, following is a small hop rather than a
// jump across the deck.
function read(): boolean {
  if (typeof window === 'undefined') return true;
  return window.localStorage.getItem(STORAGE_KEY) !== '0';
}

export function useFollowAgentEdits(): [boolean, (next: boolean) => void] {
  const [follow, setFollow] = useState(read);

  const update = useCallback((next: boolean) => {
    setFollow(next);
    window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
  }, []);

  return [follow, update];
}
