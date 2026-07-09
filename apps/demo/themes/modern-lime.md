---
name: Modern Lime
description: Black canvas, lime-green accents, heavy left-aligned headlines — a bold social-carousel look for LinkedIn build posts.
mode: dark
---

# Modern Lime

A high-contrast carousel identity for square (1:1) LinkedIn posts: pure black background, one electric lime accent, fat grotesque headlines, and a creator badge in the top-left. Built for swipe-through "build in public" decks. Derived from the `assets/bg_modern_1/` template.

## Palette

| Role    | Value     | Notes                                              |
| ------- | --------- | -------------------------------------------------- |
| bg      | `#000000` | pure black canvas                                  |
| text    | `#ffffff` | headlines, primary copy                            |
| accent  | `#c9f224` | lime — highlighted words, eyebrow, counter, arrow  |
| muted   | `#9a9a9a` | body / secondary copy                              |
| dim     | `#5a5a5a` | tech stack line, pending-state items               |
| surface | `#202020` | code blocks, inset cards                           |
| hairline| `#3a3a3a` | 1px borders on surfaces                            |
| amber   | `#f0a92f` | optional "active / in-progress" state only         |

**Contrast rule (do not skip).** The canvas is pure `#000000`, so any panel (chat bubble, step row, callout, code block) must lift **clearly** off black. Keep `surface` in the **`#1e1e1e`–`#242424`** band — never darker than `#1a1a1a`, or the card melts into the background. Always pair a surface with the `#3a3a3a` hairline border so its edge is visible; a borderless dark panel on black reads as nothing. The only panel allowed to go darker is a code block (`#141414`), and only because it still carries the `#3a3a3a` border. If you find yourself using `#141414` or below for a bubble/row/callout, it is too dark — bump it to `#202020`.

## Typography

- Display font: `"Inter", system-ui, -apple-system, sans-serif` — weight **900** for headlines, **700** for the badge name and the italic eyebrow.
- Body font: same Inter stack — weight 400.
- Mono (handle, counter, code, tech stack): `"JetBrains Mono", "SF Mono", ui-monospace, Menlo, monospace`.
- Highlight technique: wrap the 2–4 key words of each headline in the accent color, leave the rest white. One highlight per headline.
- Type-scale overrides (canvas is **1080 × 1080**, not the 1920×1080 default):
  - Hero / cover title: 88–92 px
  - Page headline: 84 px
  - Body text: 27–30 px
  - Eyebrow ("Step N:"): 30 px, italic
  - Badge name: 22 px · handle / counter: 18–20 px mono

## Layout

- Canvas: **1080 × 1080** (1:1). Set `meta.canvasWidth` / `meta.canvasHeight` to `1080`.
- Content padding: **88 px** from every edge.
- Alignment: **left-aligned, single column.** Never center.
- Vertical rhythm: badge pinned top, content block centered (`margin: auto` top and bottom), footer pinned bottom. Use a flex column with `padding: 88` and let the middle block take `margin-top/bottom: auto`.
- Chrome is fixed on every page: creator **Badge** top-left, **Footer** (page counter left + lime arrow right) bottom. Cover swaps the arrow for a **SWIPE** pill; the final page swaps it for a **Bookmark** glyph.

## Fixed components

Paste-ready. Copy verbatim into a slide that uses this theme. They assume `--osd-*` vars from a `design` const (`bg #000000`, `text #ffffff`, `accent #c9f224`) plus the `mono` and `muted`/`dim` consts above.

### Badge

```tsx
const mono = '"JetBrains Mono", "SF Mono", ui-monospace, Menlo, monospace';

const Badge = () => (
  <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2, opacity: 0.55 }}>
    <span style={{ fontFamily: 'var(--osd-font-display)', fontWeight: 700, fontSize: 22, color: 'var(--osd-text)' }}>Prajwal</span>
    <span style={{ fontFamily: mono, fontSize: 18, color: 'var(--osd-accent)' }}>hdprajwal</span>
  </div>
);
```

Text-only by design: name over handle, no avatar, held at low opacity so it reads as a quiet signature, not a header.

### Eyebrow

```tsx
const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    fontFamily: 'var(--osd-font-display)', fontStyle: 'italic', fontWeight: 700,
    fontSize: 30, color: 'var(--osd-accent)', marginBottom: 18,
  }}>
    {children}
  </div>
);
```

### Title (+ highlight)

```tsx
const Title = ({ children, size = 84 }: { children: React.ReactNode; size?: number }) => (
  <h1 style={{
    fontFamily: 'var(--osd-font-display)', fontWeight: 900, fontSize: size,
    lineHeight: 1.02, letterSpacing: '-0.035em', margin: 0, color: 'var(--osd-text)',
  }}>
    {children}
  </h1>
);

const Hl = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: 'var(--osd-accent)' }}>{children}</span>
);
// usage: <Title>The workflow <Hl>stops at one line</Hl></Title>
```

### Footer

Pull the page number from `useSlidePageNumber()` — never hardcode it. Pass `end` to swap the arrow (SWIPE pill on the cover, Bookmark on the closer).

```tsx
import { useSlidePageNumber } from '@open-frame/core';

const Arrow = () => (
  <svg width="64" height="22" viewBox="0 0 64 22" fill="none">
    <path d="M2 11h57M50 3l9 8-9 8" stroke="#c9f224" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Footer = ({ end }: { end?: React.ReactNode }) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
      <span style={{ fontFamily: mono, fontSize: 20, fontWeight: 700, color: 'var(--osd-accent)', letterSpacing: '0.04em' }}>
        {String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </span>
      {end ?? <Arrow />}
    </div>
  );
};
```

### Cover / closer accents (optional)

```tsx
const SwipePill = () => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 14,
    background: 'var(--osd-accent)', color: '#000', borderRadius: 100, padding: '12px 26px',
    fontFamily: 'var(--osd-font-display)', fontWeight: 800, fontSize: 20, letterSpacing: '0.04em',
  }}>
    SWIPE
    <svg width="40" height="16" viewBox="0 0 40 16" fill="none">
      <path d="M1 8h33M28 2l6 6-6 6" stroke="#000" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

const Bookmark = () => (
  <svg width="34" height="44" viewBox="0 0 34 44" fill="none">
    <path d="M4 3h26v37l-13-9-13 9V3z" fill="#c9f224" />
  </svg>
);
```

### Content blocks (optional)

The richer building blocks for a "build in public" carousel — all on the dark surface, lime/amber for state. Use these when a slide needs more than type. Assumes the `surface` (`#202020`), `hairline` (`#3a3a3a`), `muted`, `dim`, `amber` (`#f0a92f`) and `mono` consts above.

```tsx
// Chat bubble — user is lime-on-black, agent is dark surface.
const Bubble = ({ from, children }: { from: 'user' | 'agent'; children: React.ReactNode }) => (
  <div style={{
    maxWidth: '82%', padding: '20px 26px', fontSize: 25, lineHeight: 1.4,
    alignSelf: from === 'user' ? 'flex-end' : 'flex-start',
    background: from === 'user' ? 'var(--osd-accent)' : '#202020',
    color: from === 'user' ? '#000' : '#e6e6e6',
    border: from === 'user' ? 'none' : '1px solid #3a3a3a',
    borderRadius: 18,
    borderBottomRightRadius: from === 'user' ? 4 : 18,
    borderBottomLeftRadius: from === 'user' ? 18 : 4,
  }}>{children}</div>
);

// Status row — done = lime dot, active = amber dot + glow, pending = hollow.
type StepState = 'done' | 'active' | 'pending';
const TrackRow = ({ label, state, tag }: { label: string; state: StepState; tag?: string }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '34px 1fr auto', alignItems: 'center', gap: 20, padding: '16px 24px', background: '#202020', border: '1px solid #3a3a3a', borderRadius: 12 }}>
    <span style={{
      width: 20, height: 20, borderRadius: '50%', justifySelf: 'center',
      background: state === 'done' ? 'var(--osd-accent)' : state === 'active' ? '#f0a92f' : 'transparent',
      border: state === 'pending' ? '3px solid #5a5a5a' : 'none',
      boxShadow: state === 'active' ? '0 0 0 5px rgba(240,169,47,0.2)' : 'none',
      boxSizing: 'border-box',
    }} />
    <span style={{ fontSize: 25, fontWeight: state === 'pending' ? 400 : 600, color: state === 'pending' ? '#5a5a5a' : state === 'active' ? '#f0a92f' : '#fff' }}>{label}</span>
    <span style={{ fontFamily: mono, fontSize: 15, fontWeight: 700, color: state === 'active' ? '#f0a92f' : '#5a5a5a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{tag ?? ''}</span>
  </div>
);

// Code block — dark inset, lime for the line you want noticed.
const CodeBlock = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: '#141414', border: '1px solid #3a3a3a', borderRadius: 14, padding: '28px 32px', fontFamily: mono, fontSize: 24, lineHeight: 1.7, whiteSpace: 'pre' }}>
    {children}
  </div>
);

// Numbered reason — lime mono index, white head, muted sub.
const Reason = ({ num, head, sub }: { num: string; head: React.ReactNode; sub: string }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 22 }}>
    <div style={{ fontFamily: mono, fontSize: 24, fontWeight: 700, color: 'var(--osd-accent)', flexShrink: 0, marginTop: 4 }}>{num}</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontFamily: 'var(--osd-font-display)', fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.08 }}>{head}</div>
      <div style={{ fontSize: 22, color: '#9a9a9a', lineHeight: 1.4 }}>{sub}</div>
    </div>
  </div>
);

// Callout card — dark surface, lime left bar + lime number.
const Callout = ({ value, children }: { value: string; children: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 20, background: '#202020', border: '1px solid #3a3a3a', borderLeft: '4px solid #c9f224', borderRadius: 14, padding: '22px 28px' }}>
    <span style={{ fontFamily: mono, fontSize: 34, fontWeight: 700, color: 'var(--osd-accent)', flexShrink: 0 }}>{value}</span>
    <span style={{ fontSize: 22, color: '#9a9a9a', lineHeight: 1.35 }}>{children}</span>
  </div>
);
```

When a slide carries one of these blocks, drop the headline to ~52 px so the block has vertical room (the 84 px headline is for type-only pages).

## Motion

- Philosophy: **static.** This is a still carousel exported to PNG — no transitions, no keyframes. (If presenting live, the deck-wide `RISE` from `slide-authoring` is the only acceptable addition.)

## Aesthetic

Bold, brash, high-contrast social-first. Pure black with a single electric lime, fat grotesque headlines that fill the upper-left, and short punchy body lines. One idea per slide, one accent highlight per headline, generous black negative space. References: modern LinkedIn "build in public" carousels and sports/streetwear typography. Avoid: gradients, drop shadows (except the single amber active-state glow), rounded photo frames, more than one accent color, centered text, decorative emoji, any second hue competing with the lime, and — most commonly missed — **near-black surfaces that vanish into the canvas** (see the Contrast rule under Palette: panels live at `#202020`, never `#141414` or darker, always with a `#3a3a3a` border).

## Example usage

```tsx
const Content: Page = () => (
  <div style={{ width: '100%', height: '100%', background: 'var(--osd-bg)', color: 'var(--osd-text)', display: 'flex', flexDirection: 'column', padding: 88, boxSizing: 'border-box', fontFamily: 'var(--osd-font-body)' }}>
    <Badge />
    <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
      <Eyebrow>Step 2:</Eyebrow>
      <Title>The workflow <Hl>stops at one line</Hl></Title>
      <p style={{ fontSize: 28, color: '#9a9a9a', lineHeight: 1.55, marginTop: 36 }}>
        It suspends right there. No polling, no database flag, no bill while it waits.
      </p>
    </div>
    <Footer />
  </div>
);
```
