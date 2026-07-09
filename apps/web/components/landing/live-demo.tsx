'use client';

import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import posthog from 'posthog-js';
import { useState } from 'react';
import { InlineSlidePlayer, inlineSlideCount } from './inline-slide-player';

export function LiveDemo() {
  const [index, setIndex] = useState(0);
  const count = inlineSlideCount;
  const clamp = (i: number) => Math.max(0, Math.min(count - 1, i));
  const atStart = index === 0;
  const atEnd = index === count - 1;

  const handlePrev = () => {
    const next = clamp(index - 1);
    setIndex(next);
    posthog.capture('demo_slide_navigated', {
      direction: 'prev',
      slide_index: next,
    });
  };

  const handleNext = () => {
    const next = clamp(index + 1);
    setIndex(next);
    posthog.capture('demo_slide_navigated', {
      direction: 'next',
      slide_index: next,
    });
  };

  return (
    <section id="demo" className="relative" aria-labelledby="demo-heading">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 pt-4 sm:pt-8 pb-12 sm:pb-[88px]">
        <h2 id="demo-heading" className="sr-only">
          Live demo
        </h2>
        <div
          className="relative block w-full overflow-hidden rounded-[12px] border border-[color:var(--color-hairline)] bg-black shadow-sm"
          style={{ aspectRatio: '16 / 9' }}
        >
          <InlineSlidePlayer index={index} onIndexChange={setIndex} />
        </div>

        <div className="mt-6 flex items-center justify-between font-[family-name:var(--font-mono)] text-[12px] tracking-[0.08em] uppercase text-[color:var(--color-body)]">
          <a
            href="https://github.com/hdprajwal/open-frame/tree/main/apps/demo"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => posthog.capture('view_more_demos_clicked')}
            className="group inline-flex items-center gap-2 hover:text-[color:var(--color-ink)] transition-colors"
          >
            Browse the demo workspace
            <ArrowUpRight
              aria-hidden
              className="size-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none"
            />
          </a>
          <span className="flex items-center gap-3">
            <span className="text-[color:var(--color-charcoal)]">
              {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={handlePrev}
              disabled={atStart}
              aria-label="Previous slide"
              className="px-1.5 py-0.5 text-[color:var(--color-charcoal)] hover:text-[color:var(--color-ink)] transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-[color:var(--color-charcoal)]"
            >
              <ArrowLeft aria-hidden className="size-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={atEnd}
              aria-label="Next slide"
              className="px-1.5 py-0.5 text-[color:var(--color-charcoal)] hover:text-[color:var(--color-ink)] transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-[color:var(--color-charcoal)]"
            >
              <ArrowRight aria-hidden className="size-4" />
            </button>
          </span>
        </div>
      </div>
    </section>
  );
}
