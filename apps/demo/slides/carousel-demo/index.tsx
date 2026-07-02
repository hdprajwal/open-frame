import type { Page, SlideMeta } from '@open-slide/core';
import type { CSSProperties } from 'react';

const ink = '#0d0d0f';
const paper = '#f4f1ea';
const accent = '#ff4a1c';

const fill: CSSProperties = {
  width: '100%',
  height: '100%',
  boxSizing: 'border-box',
  padding: 80,
  display: 'flex',
  flexDirection: 'column',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
};

const eyebrow: CSSProperties = {
  fontFamily: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
  fontSize: 22,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  fontWeight: 600,
};

function Cover() {
  return (
    <div style={{ ...fill, background: ink, color: paper, justifyContent: 'space-between' }}>
      <span style={{ ...eyebrow, color: accent }}>Carousel · 1080²</span>
      <h1
        style={{
          margin: 0,
          fontSize: 132,
          lineHeight: 0.94,
          fontWeight: 800,
          letterSpacing: '-0.03em',
        }}
      >
        Square
        <br />
        by design.
      </h1>
      <p style={{ margin: 0, fontSize: 30, lineHeight: 1.4, maxWidth: 720, color: '#b9b6ae' }}>
        One deck, one format. This page renders at its own 1:1 canvas everywhere.
      </p>
    </div>
  );
}

function Idea() {
  return (
    <div style={{ ...fill, background: paper, color: ink, justifyContent: 'center', gap: 40 }}>
      <span style={{ ...eyebrow, color: accent }}>01 — Rule</span>
      <h2
        style={{
          margin: 0,
          fontSize: 100,
          lineHeight: 1.0,
          fontWeight: 800,
          letterSpacing: '-0.02em',
        }}
      >
        One idea
        <br />
        per page.
      </h2>
      <p style={{ margin: 0, fontSize: 30, lineHeight: 1.45, maxWidth: 760, color: '#54524c' }}>
        Generous type, high contrast, plenty of breathing room. Nothing competes for attention.
      </p>
    </div>
  );
}

function Contrast() {
  return (
    <div style={{ ...fill, background: accent, color: paper, justifyContent: 'center', gap: 40 }}>
      <span style={{ ...eyebrow, color: ink }}>02 — Legibility</span>
      <h2
        style={{
          margin: 0,
          fontSize: 108,
          lineHeight: 0.98,
          fontWeight: 800,
          letterSpacing: '-0.02em',
        }}
      >
        Read it
        <br />
        from the feed.
      </h2>
      <p style={{ margin: 0, fontSize: 30, lineHeight: 1.45, maxWidth: 740, color: '#2a0d05' }}>
        High-contrast pairings keep every word crisp at thumbnail scale.
      </p>
    </div>
  );
}

function Close() {
  return (
    <div style={{ ...fill, background: ink, color: paper, justifyContent: 'space-between' }}>
      <span style={{ ...eyebrow, color: accent }}>03 — Ship</span>
      <h2
        style={{
          margin: 0,
          fontSize: 120,
          lineHeight: 0.96,
          fontWeight: 800,
          letterSpacing: '-0.03em',
        }}
      >
        Same code.
        <br />
        Any format.
      </h2>
      <p style={{ margin: 0, fontSize: 30, lineHeight: 1.4, maxWidth: 720, color: '#b9b6ae' }}>
        Editor, thumbnails, play mode, and presenter all follow the canvas.
      </p>
    </div>
  );
}

export const meta: SlideMeta = {
  title: 'Carousel demo',
  format: 'carousel',
  createdAt: '2026-07-02T00:00:00+05:30',
};

export default [Cover, Idea, Contrast, Close] satisfies Page[];
