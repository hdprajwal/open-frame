'use client';

import { Frame } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

type Format = {
  name: string;
  w: number;
  h: number;
  size: string;
  use: string;
  custom?: boolean;
};

const formats: Format[] = [
  { name: 'Slide', w: 1920, h: 1080, size: '1920 × 1080', use: 'Talks and presentations.' },
  {
    name: 'Carousel',
    w: 1080,
    h: 1080,
    size: '1080 × 1080',
    use: 'LinkedIn and Instagram carousels.',
  },
  { name: 'Portrait', w: 1080, h: 1350, size: '1080 × 1350', use: 'Portrait feed posts.' },
  { name: 'Story', w: 1080, h: 1920, size: '1080 × 1920', use: 'Instagram and WhatsApp stories.' },
  { name: 'Thumbnail', w: 1280, h: 720, size: '1280 × 720', use: 'YouTube thumbnails.' },
  { name: 'OG image', w: 1200, h: 630, size: '1200 × 630', use: 'Link previews.' },
  { name: 'X post', w: 1600, h: 900, size: '1600 × 900', use: 'X post images.' },
  { name: 'Custom', w: 4, h: 3, size: 'any × any', use: 'Set any width and height.', custom: true },
];

const CYCLE_MS = 2400;

export function Formats() {
  return (
    <section id="formats" className="relative">
      <div className="mx-auto max-w-[1080px] px-5 sm:px-8 py-12 sm:py-16 lg:py-[88px]">
        <p className="caption mb-3">Formats</p>
        <h2 className="text-[28px] sm:text-[34px] font-light tracking-tight leading-[1.15] mb-4">
          One workspace. Every format.
        </h2>

        <p className="max-w-[560px] text-[16px] leading-[1.5] text-[color:var(--color-body)] mb-10 sm:mb-14">
          Seven presets and a custom canvas, all from the same workspace. It couldn't be easier to
          ship visuals that fit every platform.
        </p>

        <div className="rounded-[12px] border border-[color:var(--color-hairline)] bg-[color:var(--color-canvas)] p-6 sm:p-8 shadow-sm">
          <span className="inline-flex size-9 items-center justify-center rounded-[10px] bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent-deep)]">
            <Frame aria-hidden className="size-5" />
          </span>
          <h3 className="mt-3 text-[18px] font-medium leading-[1.56]">Pick a format in seconds</h3>
          <p className="mt-1 max-w-[72ch] text-[16px] leading-[1.5] text-[color:var(--color-body)]">
            Set a format in the deck's meta. Every page in that deck renders, previews, and exports
            at that size — swap the format and the whole deck follows.
          </p>

          <FormatStage />
        </div>

        <ul className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-8">
          {formats.map((f) => (
            <li key={f.name}>
              <span
                aria-hidden
                className={`block rounded-[2px] border ${
                  f.custom
                    ? 'border-dashed border-[color:var(--color-mute)]'
                    : 'border-[color:var(--color-ink)]'
                }`}
                style={{
                  aspectRatio: `${f.w} / ${f.h}`,
                  ...(f.h > f.w ? { height: 20 } : { width: 24 }),
                }}
              />
              <p className="mt-3 text-[14px] leading-[1.43]">
                <span className="font-medium text-[color:var(--color-ink)]">{f.name}.</span>{' '}
                <span className="text-[color:var(--color-body)]">{f.use}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const STAGE_MAX_W = 460;
const STAGE_MAX_H = 240;

function canvasSize(f: Format) {
  const scale = Math.min(STAGE_MAX_W / f.w, STAGE_MAX_H / f.h);
  return { width: Math.round(f.w * scale), height: Math.round(f.h * scale) };
}

function FormatStage() {
  const [i, setI] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setI((v) => (v + 1) % formats.length), CYCLE_MS);
    return () => clearInterval(id);
  }, [reduced]);

  const f = formats[i];
  const { width, height } = canvasSize(f);

  return (
    <div className="mt-8 flex h-[280px] sm:h-[320px] items-center justify-center rounded-[8px] bg-[color:var(--color-surface)]">
      <div
        className={`flex max-w-full flex-col items-center justify-center gap-1 rounded-[4px] border bg-[color:var(--color-canvas)] transition-all duration-700 [transition-timing-function:cubic-bezier(0.2,0.7,0.2,1)] ${
          f.custom
            ? 'border-dashed border-[color:var(--color-mute)]'
            : 'border-[color:var(--color-hairline-strong)]'
        }`}
        style={{ width, height }}
      >
        <span
          key={`name-${i}`}
          className="text-[14px] sm:text-[16px] font-medium text-[color:var(--color-ink)]"
          style={{ animation: 'textReveal 500ms cubic-bezier(0.2,0.7,0.2,1) both' }}
        >
          {f.name}
        </span>
        <span
          key={`size-${i}`}
          className="font-[family-name:var(--font-mono)] text-[11px] sm:text-[12px] text-[color:var(--color-mute)]"
          style={{ animation: 'textReveal 500ms 80ms cubic-bezier(0.2,0.7,0.2,1) both' }}
        >
          {f.size}
        </span>
      </div>
    </div>
  );
}
