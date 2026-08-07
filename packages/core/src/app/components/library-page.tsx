import type { ReactNode } from 'react';

/**
 * One list per page: a borderless header carrying the title and a count chip,
 * an optional toolbar that only reorders what the rail already chose, and a
 * body that scrolls on its own so the header stays put.
 */
export function LibraryPage({
  title,
  count,
  actions,
  toolbar,
  children,
}: {
  title: string;
  count?: string;
  actions?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <header className="flex shrink-0 flex-wrap items-center gap-2.5 px-5 pb-4 pt-5 md:px-8 md:pb-4.5 md:pt-6.5">
        <h1 className="font-heading text-21 font-medium tracking-tight">{title}</h1>
        {count && (
          <span className="nums inline-flex h-5 items-center rounded-4 border border-hairline px-1.5 font-mono text-11 text-muted-foreground">
            {count}
          </span>
        )}
        {actions && (
          <div className="ml-auto flex w-full items-center gap-2 md:w-auto">{actions}</div>
        )}
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-12 pt-2 md:px-8">
        {toolbar && <div className="mb-4.5 flex items-center gap-2">{toolbar}</div>}
        {children}
      </div>
    </>
  );
}
