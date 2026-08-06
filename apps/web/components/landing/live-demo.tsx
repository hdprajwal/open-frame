'use client';

import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import posthog from 'posthog-js';
import { useState } from 'react';
import { InlineFramePlayer, inlineFrameCount } from './inline-frame-player';

export function LiveDemo() {
  const [index, setIndex] = useState(0);
  const count = inlineFrameCount;
  const clamp = (i: number) => Math.max(0, Math.min(count - 1, i));
  const atStart = index === 0;
  const atEnd = index === count - 1;

  const handlePrev = () => {
    const next = clamp(index - 1);
    setIndex(next);
    posthog.capture('demo_frame_navigated', {
      direction: 'prev',
      frame_index: next,
    });
  };

  const handleNext = () => {
    const next = clamp(index + 1);
    setIndex(next);
    posthog.capture('demo_frame_navigated', {
      direction: 'next',
      frame_index: next,
    });
  };

  return (
    <section id="demo" className="relative" aria-labelledby="demo-heading">
      <div className="mx-auto max-w-350 px-5 sm:px-8 pt-4 sm:pt-8 pb-12 sm:pb-22">
        <h2 id="demo-heading" className="sr-only">
          Live demo
        </h2>
        <div
          className="relative block w-full overflow-hidden rounded-12 border border-hairline bg-black shadow-sm"
          style={{ aspectRatio: '16 / 9' }}
        >
          <InlineFramePlayer index={index} onIndexChange={setIndex} />
        </div>

        <div className="mt-6 flex items-center justify-between font-mono text-12 tracking-8 uppercase text-body">
          <a
            href="https://github.com/hdprajwal/open-frame/tree/main/apps/demo"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => posthog.capture('view_more_demos_clicked')}
            className="group inline-flex items-center gap-2 hover:text-ink transition-colors"
          >
            Browse the demo workspace
            <ArrowUpRight
              aria-hidden
              className="size-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none"
            />
          </a>
          <span className="flex items-center gap-3">
            <span className="text-charcoal">
              {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={handlePrev}
              disabled={atStart}
              aria-label="Previous frame"
              className="px-1.5 py-0.5 text-charcoal hover:text-ink transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-charcoal"
            >
              <ArrowLeft aria-hidden className="size-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={atEnd}
              aria-label="Next frame"
              className="px-1.5 py-0.5 text-charcoal hover:text-ink transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-charcoal"
            >
              <ArrowRight aria-hidden className="size-4" />
            </button>
          </span>
        </div>
      </div>
    </section>
  );
}
