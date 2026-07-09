'use client';

import posthog from 'posthog-js';

export function HeroDocsLink() {
  return (
    <a
      href="/docs"
      onClick={() => posthog.capture('docs_link_clicked', { location: 'hero' })}
      className="inline-flex items-center justify-center h-12 rounded-full bg-accent px-7 text-on-primary font-mono text-13 font-medium uppercase -tracking-2 transition duration-200 hover:bg-accent-deep hover:shadow-lg hover:-translate-y-0.5 active:scale-98 motion-reduce:transform-none"
    >
      Read the docs
    </a>
  );
}
