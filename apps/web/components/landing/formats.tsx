'use client';

import { Check, ChevronDown, Frame, Images, Play } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

type Format = {
  name: string;
  w: number;
  h: number;
  size: string;
  use: string;
  desc: string;
  custom?: boolean;
};

const formats: Format[] = [
  {
    name: 'Slide',
    w: 1920,
    h: 1080,
    size: '1920 × 1080',
    use: 'Talks and presentations.',
    desc: 'For presentations',
  },
  {
    name: 'Carousel',
    w: 1080,
    h: 1080,
    size: '1080 × 1080',
    use: 'LinkedIn and Instagram carousels.',
    desc: 'For LinkedIn & Instagram',
  },
  {
    name: 'Portrait',
    w: 1080,
    h: 1350,
    size: '1080 × 1350',
    use: 'Portrait feed posts.',
    desc: 'For feed posts',
  },
  {
    name: 'Story',
    w: 1080,
    h: 1920,
    size: '1080 × 1920',
    use: 'Instagram and WhatsApp stories.',
    desc: 'For stories',
  },
  {
    name: 'Thumbnail',
    w: 1280,
    h: 720,
    size: '1280 × 720',
    use: 'YouTube thumbnails.',
    desc: 'For YouTube',
  },
  {
    name: 'OG image',
    w: 1200,
    h: 630,
    size: '1200 × 630',
    use: 'Link previews.',
    desc: 'For link previews',
  },
  {
    name: 'X post',
    w: 1600,
    h: 900,
    size: '1600 × 900',
    use: 'X post images.',
    desc: 'For X posts',
  },
  {
    name: 'Custom',
    w: 4,
    h: 3,
    size: 'any × any',
    use: 'Set any width and height.',
    desc: 'For anything else',
    custom: true,
  },
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

const STAGE_MAX_W = 720;
const STAGE_MAX_H = 400;
const CARD_W = 240;
const EASE = 'cubic-bezier(0.2, 0.7, 0.2, 1)';

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
  const next = formats[(i + 1) % formats.length];
  const { width, height } = canvasSize(f);
  const base = Math.min(width, height);
  // On narrow canvases the card sits below the headline text instead of
  // beside it, so cap its size by the vertical space the text leaves over
  // and let more of it bleed off the bottom edge.
  const isWide = width > height * 1.15;
  const bleedBottom = isWide ? 18 : 44;
  const textClearance = (height - base * 0.3 - 10) * (CARD_W / (300 - bleedBottom));
  const cardW = isWide
    ? Math.min(width * 0.82, height * 0.72, 310)
    : Math.min(width * 0.9, textClearance, 310);
  const k = cardW / CARD_W;

  return (
    <div className="mt-8 flex h-[440px] sm:h-[480px] items-center justify-center rounded-8 bg-surface">
      <div
        className={`relative max-w-full overflow-hidden rounded-4 border ${
          f.custom ? 'border-dashed border-mute' : 'border-hairline-strong'
        }`}
        style={{
          width,
          height,
          backgroundImage: "url('/assets/gradient-bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: `all 700ms ${EASE}`,
        }}
      >
        <span
          key={`label-${i}`}
          className="absolute right-2 top-2 z-10 inline-flex items-baseline gap-1.5 rounded-4 bg-white/85 px-2 py-1 backdrop-blur-sm"
          style={{ animation: `textReveal 500ms ${EASE} both` }}
        >
          <span className="text-11 font-medium text-ink">{f.name}</span>
          <span className="font-mono text-11 text-mute">{f.size}</span>
        </span>

        <div className="absolute z-10" style={{ left: '7%', top: '8%' }}>
          <div
            style={{
              fontSize: base * 0.042,
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.85)',
              letterSpacing: '0.01em',
              transition: `font-size 700ms ${EASE}`,
            }}
          >
            Introducing
          </div>
          <div
            style={{
              fontSize: base * 0.088,
              fontWeight: 650,
              color: '#fff',
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
              marginTop: 2,
              textShadow: '0 2px 24px rgba(0, 40, 90, 0.3)',
              transition: `font-size 700ms ${EASE}`,
            }}
          >
            OpenFrame
          </div>
          <div
            style={{
              fontSize: base * 0.036,
              color: 'rgba(255, 255, 255, 0.75)',
              marginTop: 6,
              transition: `font-size 700ms ${EASE}`,
            }}
          >
            The content studio for agents
          </div>
        </div>

        <div
          aria-hidden
          className="absolute"
          style={{ right: -12 * k, bottom: -bleedBottom * k, transition: `all 700ms ${EASE}` }}
        >
          <div
            style={{
              width: CARD_W,
              transform: `scale(${k})`,
              transformOrigin: 'bottom right',
              transition: `transform 700ms ${EASE}`,
              background: '#fff',
              borderRadius: 14,
              boxShadow: '0 24px 48px -16px rgba(2, 32, 71, 0.45)',
              padding: '16px 16px 20px',
            }}
          >
            <div style={{ display: 'flex', gap: 6 }}>
              {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
                <span
                  key={c}
                  style={{ width: 11, height: 11, borderRadius: '50%', background: c }}
                />
              ))}
            </div>

            <div
              style={{
                marginTop: 14,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#f1f3f5',
                borderRadius: 10,
                padding: '9px 12px',
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#101828',
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                }}
              >
                OpenFrame{' '}
                <span
                  key={`dd-${i}`}
                  style={{
                    color: 'var(--color-accent)',
                    display: 'inline-block',
                    animation: `textReveal 500ms ${EASE} both`,
                  }}
                >
                  {f.name}
                </span>
              </span>
              <ChevronDown aria-hidden size={14} color="#667085" strokeWidth={2.5} />
            </div>

            <div
              style={{
                marginTop: 10,
                borderRadius: 12,
                background: '#fff',
                boxShadow:
                  '0 12px 32px -8px rgba(16, 24, 40, 0.18), 0 0 0 1px rgba(16, 24, 40, 0.05)',
                padding: 5,
              }}
            >
              <div
                key={`m1-${i}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f7f8fa',
                  borderRadius: 8,
                  padding: '8px 10px',
                  animation: `textReveal 500ms ${EASE} both`,
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-accent)' }}>
                    {f.name}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#667085', marginTop: 1 }}>{f.desc}</div>
                </div>
                <Check aria-hidden size={14} color="#101828" strokeWidth={2.5} />
              </div>
              <div
                key={`m2-${i}`}
                style={{ padding: '8px 10px', animation: `textReveal 500ms 60ms ${EASE} both` }}
              >
                <div style={{ fontSize: 14, fontWeight: 600, color: '#101828' }}>{next.name}</div>
                <div style={{ fontSize: 11.5, color: '#667085', marginTop: 1 }}>{next.desc}</div>
              </div>
            </div>

            <div
              style={{
                marginTop: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                paddingLeft: 2,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13.5,
                  color: '#344054',
                }}
              >
                <Play aria-hidden size={13} strokeWidth={2.25} />
                Present
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13.5,
                  color: '#344054',
                }}
              >
                <Images aria-hidden size={13} strokeWidth={2.25} />
                Assets
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
