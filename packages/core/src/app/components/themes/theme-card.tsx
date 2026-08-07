import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { CanvasSize } from '../../lib/formats';

/**
 * A theme is a look, not a deck — so its card shows one full-bleed page and a
 * description, with none of the frame card's stack, path or facts line.
 */
export function ThemeCardShell({
  to,
  name,
  description,
  canvas,
  children,
}: {
  to: string;
  name: string;
  description?: string;
  canvas: CanvasSize | null;
  children: ReactNode;
}) {
  const aspectRatio = canvas ? `${canvas.width} / ${canvas.height}` : '16 / 9';
  return (
    <article className="group relative overflow-hidden rounded-6 border border-hairline bg-card shadow-edge hover:border-input hover:shadow-floating motion-safe:transition-[box-shadow,border-color] motion-safe:duration-150">
      <div className="relative grid aspect-video place-items-center overflow-hidden bg-muted">
        <div className="relative h-full max-w-full overflow-hidden" style={{ aspectRatio }}>
          {children}
        </div>
      </div>

      <div className="border-t border-hairline px-3 pb-3 pt-2.5">
        <Link to={to} className="after:absolute after:inset-0 focus-visible:outline-none">
          <h3 className="truncate font-heading text-14 font-medium tracking-tight">{name}</h3>
        </Link>
        {description && (
          <p className="mt-1 line-clamp-2 text-12 leading-snug text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </article>
  );
}
