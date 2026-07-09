'use client';

import posthog from 'posthog-js';

export function HeroDocsLink() {
  return (
    <a
      href="/docs"
      onClick={() => posthog.capture('docs_link_clicked', { location: 'hero' })}
      className="inline-flex items-center justify-center h-12 rounded-full bg-[color:var(--color-accent)] px-7 text-[color:var(--color-on-primary)] font-[family-name:var(--font-mono)] text-[13px] font-medium uppercase tracking-[-0.02em] transition duration-200 hover:bg-[color:var(--color-accent-deep)] hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] motion-reduce:transform-none"
    >
      Read the docs
    </a>
  );
}
