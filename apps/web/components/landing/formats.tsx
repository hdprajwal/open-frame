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
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12 sm:py-16 lg:py-22">
        <p className="caption mb-3">Formats</p>
        <h2 className="text-28 sm:text-34 font-light tracking-tight leading-1.15 mb-4">
          One workspace. Every format.
        </h2>

        <p className="max-w-560 text-16 leading-normal text-body mb-10 sm:mb-14">
          Seven presets and a custom canvas, all from the same workspace. It couldn't be easier to
          ship visuals that fit every platform.
        </p>

        <div className="rounded-12 border border-hairline bg-canvas p-6 sm:p-8 shadow-sm">
          <span className="inline-flex size-9 items-center justify-center rounded-10 bg-accent-soft text-accent-deep">
            <Frame aria-hidden className="size-5" />
          </span>
          <h3 className="mt-3 text-18 font-medium leading-1.56">Pick a format in seconds</h3>
          <p className="mt-1 max-w-[72ch] text-16 leading-normal text-body">
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
                className={`block rounded-2 border ${
                  f.custom ? 'border-dashed border-mute' : 'border-ink'
                }`}
                style={{
                  aspectRatio: `${f.w} / ${f.h}`,
                  ...(f.h > f.w ? { height: 20 } : { width: 24 }),
                }}
              />
              <p className="mt-3 text-14 leading-1.43">
                <span className="font-medium text-ink">{f.name}.</span>{' '}
                <span className="text-body">{f.use}</span>
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
    <div className="mt-8 flex h-70 sm:h-80 items-center justify-center rounded-8 bg-surface">
      <div
        className={`flex max-w-full flex-col items-center justify-center gap-1 rounded-4 border bg-canvas transition-all duration-700 [transition-timing-function:cubic-bezier(0.2,0.7,0.2,1)] ${
          f.custom ? 'border-dashed border-mute' : 'border-hairline-strong'
        }`}
        style={{ width, height }}
      >
        <span
          key={`name-${i}`}
          className="text-14 sm:text-16 font-medium text-ink"
          style={{ animation: 'textReveal 500ms cubic-bezier(0.2,0.7,0.2,1) both' }}
        >
          {f.name}
        </span>
        <span
          key={`size-${i}`}
          className="font-mono text-11 sm:text-12 text-mute"
          style={{ animation: 'textReveal 500ms 80ms cubic-bezier(0.2,0.7,0.2,1) both' }}
        >
          {f.size}
        </span>
      </div>
    </div>
  );
}
