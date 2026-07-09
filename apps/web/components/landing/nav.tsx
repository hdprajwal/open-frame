'use client';

import Link from 'next/link';
import posthog from 'posthog-js';

export function Nav() {
  return (
    <header className="relative bg-canvas">
      <div className="mx-auto px-5 sm:px-8 lg:px-12 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <svg
            width="22"
            height="22"
            viewBox="0 0 600 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_1_2)">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M307.071 6.07107C303.166 2.16583 296.834 2.16582 292.929 6.07107L178.285 120.715C174.38 124.62 174.38 130.952 178.285 134.857L207.072 163.643C210.977 167.548 217.309 167.548 221.214 163.643L292.929 91.9282C296.834 88.023 303.166 88.023 307.071 91.9282L378.786 163.643C382.691 167.548 389.023 167.548 392.928 163.643L421.715 134.857C425.62 130.952 425.62 124.62 421.715 120.715L307.071 6.07107ZM478.785 177.785C474.88 173.88 468.548 173.88 464.643 177.785L435.857 206.572C431.952 210.477 431.952 216.809 435.857 220.714L507.572 292.429C511.477 296.334 511.477 302.666 507.572 306.571L435.857 378.286C431.952 382.191 431.952 388.523 435.857 392.428L464.643 421.215C468.548 425.12 474.88 425.12 478.785 421.215L593.429 306.571C597.334 302.666 597.334 296.334 593.429 292.429L478.785 177.785ZM135.357 177.785C131.452 173.88 125.12 173.88 121.215 177.785L6.57108 292.429C2.66583 296.334 2.66584 302.666 6.57108 306.571L121.215 421.215C125.12 425.12 131.452 425.12 135.357 421.215L164.143 392.428C168.048 388.523 168.048 382.191 164.143 378.286L92.4282 306.571C88.523 302.666 88.523 296.334 92.4282 292.429L164.143 220.714C168.048 216.809 168.048 210.477 164.143 206.572L135.357 177.785ZM392.928 435.357C389.023 431.452 382.691 431.452 378.786 435.357L307.071 507.072C303.166 510.977 296.834 510.977 292.929 507.072L221.214 435.357C217.309 431.452 210.977 431.452 207.072 435.357L178.285 464.143C174.38 468.048 174.38 474.38 178.285 478.285L292.929 592.929C296.834 596.834 303.166 596.834 307.071 592.929L421.715 478.285C425.62 474.38 425.62 468.048 421.715 464.143L392.928 435.357Z"
                fill="currentColor"
              />
            </g>
            <defs>
              <clipPath id="clip0_1_2">
                <rect width="600" height="600" fill="white" />
              </clipPath>
            </defs>
          </svg>
          <span className="text-16 font-thin">Open Frame</span>
        </Link>

        <nav className="flex items-center gap-6 text-14 font-medium">
          <Link
            href="/docs"
            className="hidden md:inline text-body hover:text-ink transition-colors"
          >
            Docs
          </Link>
          <Link
            href="/#demo"
            onClick={() => posthog.capture('nav_external_link_clicked', { label: 'demo' })}
            className="hidden md:inline text-body hover:text-ink transition-colors"
          >
            Demo
          </Link>
          <a
            href="https://github.com/hdprajwal/open-frame"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => posthog.capture('nav_external_link_clicked', { label: 'github' })}
            className="hidden md:inline text-body hover:text-ink transition-colors"
          >
            GitHub
          </a>
          <Link
            href="/docs"
            className="inline-flex items-center justify-center h-9 rounded-full bg-accent px-5 text-on-primary font-mono text-13 font-medium uppercase -tracking-2 transition duration-200 hover:bg-accent-deep hover:shadow-lg hover:-translate-y-0.5 active:scale-98 motion-reduce:transform-none"
          >
            Get started
          </Link>
        </nav>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-full h-6 bg-gradient-to-b from-canvas to-transparent"
      />
    </header>
  );
}
