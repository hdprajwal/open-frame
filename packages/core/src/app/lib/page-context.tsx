import { type Context, createContext, type PropsWithChildren, useContext, useMemo } from 'react';

type FramePageContextValue = {
  index: number;
  total: number;
};

// Stored on globalThis so dev (src) and published (dist) copies of this module
// share one context instance — otherwise the provider writes to one context and
// the hook reads from another, and `useFramePageNumber` always sees null.
const GLOBAL_KEY = '__open_frame_page_context__';
type GlobalWithCtx = typeof globalThis & {
  [GLOBAL_KEY]?: Context<FramePageContextValue | null>;
};
const g = globalThis as GlobalWithCtx;
if (!g[GLOBAL_KEY]) {
  g[GLOBAL_KEY] = createContext<FramePageContextValue | null>(null);
}
const FramePageContext = g[GLOBAL_KEY];

export function FramePageProvider({
  index,
  total,
  children,
}: PropsWithChildren<{ index: number; total: number }>) {
  const value = useMemo(() => ({ index, total }), [index, total]);
  return <FramePageContext.Provider value={value}>{children}</FramePageContext.Provider>;
}

export function useFramePageNumber(): { current: number; total: number } {
  const ctx = useContext(FramePageContext);
  if (!ctx) {
    throw new Error(
      'useFramePageNumber must be called from a frame page rendered by @open-frame/core',
    );
  }
  return { current: ctx.index + 1, total: ctx.total };
}
