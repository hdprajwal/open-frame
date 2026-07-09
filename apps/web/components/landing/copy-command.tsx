'use client';

import posthog from 'posthog-js';
import { useState } from 'react';

export function CopyCommand({ command, size = 'lg' }: { command: string; size?: 'lg' | 'md' }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      posthog.capture('command_copied', { command });
    } catch {
      /* ignore */
    }
  };

  const height = size === 'lg' ? 'h-12' : 'h-10';
  const pad = size === 'lg' ? 'px-6' : 'px-5';
  const text = size === 'lg' ? 'text-14 sm:text-16' : 'text-14';

  return (
    <button
      type="button"
      onClick={onCopy}
      className={`group inline-flex items-center gap-3 ${height} ${pad} rounded-full border border-hairline bg-canvas text-ink font-mono ${text} hover:border-accent transition-colors`}
    >
      <span aria-hidden className="text-mute">
        $
      </span>
      <span>{command}</span>
      <span
        aria-hidden
        className="ml-1 inline-flex items-center text-body group-hover:text-ink transition-colors"
      >
        <span className="relative inline-flex h-3.5 w-3.5 items-center justify-center">
          <CopyGlyph
            className={`absolute inset-0 transition-opacity duration-200 ${copied ? 'opacity-0' : 'opacity-100'}`}
          />
          <CheckGlyph
            className={`absolute inset-0 text-ink transition-opacity duration-200 ${copied ? 'opacity-100' : 'opacity-0'}`}
          />
        </span>
      </span>
    </button>
  );
}

function CopyGlyph({ className }: { className?: string }) {
  return (
    <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="7" y="7" width="12" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckGlyph({ className }: { className?: string }) {
  return (
    <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M5 12.5 10 17.5 19 7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
