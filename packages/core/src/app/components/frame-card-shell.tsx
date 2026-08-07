import type { ComponentProps, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { CanvasSize } from '../lib/formats';

export function FactSeparator() {
  return <span className="size-0.5 shrink-0 rounded-full bg-input" aria-hidden />;
}

/**
 * A deck reads as a fanned stack of its own pages. Every cover band is the same
 * height across the grid; the page inside keeps its true aspect ratio, so a
 * carousel reads as a square and a story as a tall sliver — narrower than a
 * slide, never shorter. Format is legible from the silhouette before you read a
 * word.
 */
function DeckCover({
  canvas,
  pageCount,
  overlay,
  children,
}: {
  canvas: CanvasSize | null;
  pageCount: number;
  overlay?: ReactNode;
  children: ReactNode;
}) {
  const backers = Math.min(Math.max(pageCount - 1, 0), 2);
  const aspectRatio = canvas ? `${canvas.width} / ${canvas.height}` : '16 / 9';
  return (
    <div className="relative grid aspect-video place-items-center overflow-hidden bg-sidebar p-2.75">
      <span className="pointer-events-none absolute inset-0 bg-dotted" aria-hidden />
      <div className="relative h-full max-w-full" style={{ aspectRatio }}>
        {backers > 1 && (
          <span
            aria-hidden
            className="absolute inset-0 origin-center translate-x-1.5 translate-y-1.25 rotate-[1deg] border border-hairline bg-card opacity-70 shadow-edge motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:translate-x-2.5 motion-safe:group-hover:translate-y-2 motion-safe:group-hover:rotate-[1.9deg]"
          />
        )}
        {backers > 0 && (
          <span
            aria-hidden
            className="absolute inset-0 origin-center translate-x-0.75 translate-y-0.625 rotate-[0.5deg] border border-hairline bg-card opacity-90 shadow-edge motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:translate-x-1.25 motion-safe:group-hover:translate-y-1 motion-safe:group-hover:rotate-[0.95deg]"
          />
        )}
        <div className="absolute inset-0 overflow-hidden border border-hairline bg-card shadow-floating">
          {children}
          {overlay}
        </div>
      </div>
    </div>
  );
}

/**
 * The frame card: fanned cover, then title, the frame's path and a facts line.
 * Themes get their own shape in `theme-card.tsx` — a frame is a deck of pages,
 * a theme is a look, and they earn different cards.
 */
export function FrameCardShell({
  to,
  title,
  subtitle,
  facts,
  actions,
  canvas = null,
  pageCount = 0,
  overlay,
  children,
  className,
  ...articleProps
}: {
  to: string;
  title: string;
  subtitle?: string;
  facts?: ReactNode;
  actions?: ReactNode;
  canvas?: CanvasSize | null;
  pageCount?: number;
  overlay?: ReactNode;
  children: ReactNode;
  className?: string;
} & Pick<ComponentProps<'article'>, 'draggable' | 'onDragStart' | 'onDragEnd'>) {
  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-6 border border-hairline bg-card shadow-edge hover:border-input hover:shadow-floating motion-safe:transition-[box-shadow,border-color] motion-safe:duration-150',
        className,
      )}
      {...articleProps}
    >
      <DeckCover canvas={canvas} pageCount={pageCount} overlay={overlay}>
        {children}
      </DeckCover>

      <div className="border-t border-hairline px-3 pb-3 pt-2.5">
        <div className="flex items-center gap-1.75">
          {/* Stretched over the whole card, so the card is one click target and
              one tab stop — the live preview above holds frame-authored markup
              that must not become a second set of focusable children. */}
          <Link
            to={to}
            className="min-w-0 flex-1 after:absolute after:inset-0 focus-visible:outline-none"
          >
            <h3 className="truncate font-heading text-14 font-medium tracking-tight">{title}</h3>
          </Link>
          {actions && <div className="relative shrink-0">{actions}</div>}
        </div>

        {subtitle && (
          <span className="mt-0.75 block truncate font-mono text-11 text-muted-foreground">
            {subtitle}
          </span>
        )}

        {facts && (
          <div className="nums relative mt-2.5 flex w-fit max-w-full flex-wrap items-center gap-x-1.75 gap-y-1 font-mono text-10 uppercase tracking-4 text-muted-foreground">
            {facts}
          </div>
        )}
      </div>
    </article>
  );
}
