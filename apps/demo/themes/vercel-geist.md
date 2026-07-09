---
name: Vercel Geist
description: White canvas, black Geist type, a monochrome base with a vibrant signal spectrum, mono eyebrows, syntax-highlighted code, and rich subtle motion — the Vercel / Next.js docs-deck look. Landscape 16:9.
mode: light
---

# Vercel Geist

A precise, developer-grade presentation identity in the Vercel / Geist house style: a pure white canvas, black Geist headlines, a quiet gray scale for structure (border, surface, muted, subtle), and a small spectrum of saturated signal colors used semantically — pink for dynamic/hot, cyan for static/cached, blue for functions, green for strings, amber and purple for accents. Chrome is monospace: a dotted eyebrow (`02 — The idea`), a hairline footer with a page counter, and syntax-highlighted code blocks. Motion is rich but disciplined — content fades up, skeletons shimmer, an accent gradient bar drifts, a cursor blinks. Built for explaining systems (architecture, framework internals, API design) in **landscape 16:9**, not square social posts. Extracted from the `nextjs-ppr-cache` deck.

## Palette

A monochrome base plus a semantic signal spectrum. The base carries the layout; the spectrum is only ever used to mean something (state, syntax token, category).

| Role        | Value     | Notes                                                     |
| ----------- | --------- | --------------------------------------------------------- |
| bg          | `#ffffff` | the canvas                                                |
| text        | `#000000` | headlines, primary copy (true black)                      |
| muted       | `#666666` | secondary copy, eyebrow label, captions                   |
| subtle      | `#a1a1a1` | footer, code comments, faint mono                         |
| border      | `#eaeaea` | hairlines, card borders, dividers                         |
| surface     | `#fafafa` | cards, code blocks                                        |
| surfaceAlt  | `#f5f5f5` | secondary fills (static blocks in diagrams)               |
| accent/blue | `#0070f3` | the Vercel blue — function names, primary links/chips     |
| pink        | `#ff0080` | **primary accent** — dynamic state, emphasis, keywords    |
| cyan        | `#50e3c2` | static / cached state                                     |
| green       | `#0cce6b` | strings, success                                          |
| amber       | `#f5a623` | warnings, optional category                               |
| purple      | `#7928ca` | extra category, gradient stop                             |

`--osd-accent` is set to **pink `#ff0080`** (the headline emphasis color). The blue `#0070f3` is the secondary accent used inside code (function tokens) and primary chips. Keep both in the per-slide `design` const / local `palette` object.

**Contrast rule (do not skip).** The canvas is pure white, so panels must be a shade *darker* to exist: `surface #fafafa` and `surfaceAlt #f5f5f5`, always with the `#eaeaea` hairline border — a borderless near-white card on white reads as nothing. Body copy is `muted #666666`, never lighter, or it greys out. Signal colors are **semantic, not decorative**: pink = dynamic, cyan = static, blue = function, green = string. Never paint a headline or paragraph fully in a signal color — emphasize one span (e.g. one pink word) and leave the rest black. At most one or two signal colors visible per slide; reaching for a third usually means the slide is doing too much.

## Typography

- Display + body font: `'Geist', 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif` — weight 700 for headlines, 400 for body. Tight tracking on big type (`-0.035em` to `-0.045em`).
- Mono: `'Geist Mono', 'SF Mono', Menlo, Consolas, monospace` — every label, eyebrow, footer, code block, and the `'use cache'`-style directive headline.
- A directive or literal can become the headline itself, set in **mono** at display size with the key token in the accent (see the `'use cache'` page: 132 px mono, the words `use cache` in pink).
- Type-scale overrides (canvas is the **1920 × 1080** default — these are the deck's sizes):
  - Cover hero: 176 px / line-height 0.92 (the `design.typeScale.hero`)
  - Section heading (h2): 80–112 px
  - Mono directive headline: 132 px mono
  - Cover sub-line: 38 px · body: 28 px (the `design.typeScale.body`)
  - Card title: 44–52 px · card body: 26 px
  - Eyebrow / mono labels / footer: 20–22 px

## Layout

- Canvas: **1920 × 1080** (16:9) — the open-frame default. Do **not** set `meta.canvasWidth/Height`; this theme is landscape.
- Content padding: **120 px** left/right. Content pages use `padding: '120px 120px 0'` and pin the footer to the bottom; the cover centers vertically with `padding: '0 120px'`.
- Alignment: left-aligned. Eyebrow → heading → optional lede at the top, then the content band (cards / code / diagram) below, footer pinned.
- Chrome: every content page leads with an **Eyebrow** (`NN — label`) and ends with a **Footer** (hairline top border, mono brand label left, `NN / NN` page counter right). The cover swaps the eyebrow for the **Logo** top-left and a context line top-right, and carries the animated **GradientBar** along the bottom edge.
- Cards: `surface` fill, `border` hairline, radius 14–20, generous padding (28–36). Diagrams sit in a white box with a 1.5px black border and a mono label notched into the top-left edge.

## Fixed components

Paste-ready. They assume `--osd-*` vars from the `design` const (`bg #ffffff`, `text #000000`, `accent #ff0080`, the Geist fonts, `radius 12`, `size-hero 176`, `size-body 28`) plus the `palette` object and `fontMono` const below. The logo is inlined as the Vercel triangle so the bundle stays self-contained.

```tsx
const palette = {
  bg: '#ffffff', text: '#000000', muted: '#666666', subtle: '#a1a1a1',
  border: '#eaeaea', surface: '#fafafa', surfaceAlt: '#f5f5f5',
  accent: '#0070f3', cyan: '#50e3c2', pink: '#ff0080', amber: '#f5a623', green: '#0cce6b', purple: '#7928ca',
};
const fontMono = "'Geist Mono', 'SF Mono', Menlo, Consolas, monospace";

const fill = {
  width: '100%', height: '100%',
  background: 'var(--osd-bg)', color: 'var(--osd-text)', fontFamily: 'var(--osd-font-body)',
  position: 'relative' as const, overflow: 'hidden' as const, boxSizing: 'border-box' as const,
};
```

### Style (keyframes — rich motion)

Render once per page (it is idempotent). These power every animation in the deck.

```tsx
const Style = () => (
  <style>{`
    @keyframes ppr-fade-up { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes ppr-fade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes ppr-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
    @keyframes ppr-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    @keyframes ppr-gradient-shift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
    @keyframes ppr-scan { 0% { left: 0; } 100% { left: 100%; } }
  `}</style>
);
```

### Logo (inlined Vercel triangle)

```tsx
const Logo = ({ size = 28 }: { size?: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.5, color: 'var(--osd-text)' }}>
    <svg width={size * 0.95} height={size * 0.82} viewBox="0 0 76 65" style={{ display: 'block' }} aria-hidden>
      <path d="M37.53 0 75.06 65H0z" fill="currentColor" />
    </svg>
    <span style={{ fontSize: size, fontWeight: 700, letterSpacing: '-0.02em' }}>Vercel</span>
  </div>
);
```

### Eyebrow

```tsx
const Eyebrow = ({ index, label }: { index: string; label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 22, fontFamily: fontMono, color: palette.muted, letterSpacing: '0.02em' }}>
    <span style={{ width: 10, height: 10, borderRadius: '50%', background: palette.text }} />
    <span style={{ fontWeight: 600, color: palette.text }}>{index}</span>
    <span style={{ color: palette.border }}>—</span>
    <span>{label}</span>
  </div>
);
```

### Footer

Pull the page number from `useSlidePageNumber()` — never hardcode it.

```tsx
import { useSlidePageNumber } from '@open-frame/core';

const Footer = ({ label = "Next.js · partial pre-rendering & 'use cache'" }: { label?: string }) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div style={{ position: 'absolute', bottom: 56, left: 120, right: 120, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 20, fontFamily: fontMono, color: palette.subtle, borderTop: `1px solid ${palette.border}`, paddingTop: 22 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: 2, background: palette.text }} />
        <span>{label}</span>
      </span>
      <span>{String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
    </div>
  );
};
```

### Code + syntax tokens

```tsx
import type { ReactNode } from 'react';

const Code = ({ children, fontSize = 20 }: { children: ReactNode; fontSize?: number }) => (
  <pre style={{ margin: 0, padding: 24, background: palette.surface, border: `1px solid ${palette.border}`, borderRadius: 'var(--osd-radius)', fontFamily: fontMono, fontSize, lineHeight: 1.45, color: palette.text, overflow: 'hidden', whiteSpace: 'pre' }}>
    {children}
  </pre>
);

const kw = (s: string) => <span style={{ color: palette.pink }}>{s}</span>;   // keyword
const fn = (s: string) => <span style={{ color: palette.accent }}>{s}</span>; // function (blue)
const str = (s: string) => <span style={{ color: palette.green }}>{s}</span>; // string
const com = (s: string) => <span style={{ color: palette.subtle, fontStyle: 'italic' }}>{s}</span>; // comment
const tag = (s: string) => <span style={{ color: palette.accent }}>{s}</span>; // JSX tag
```

### GradientBar (cover edge accent)

```tsx
const GradientBar = () => (
  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 6, background: `linear-gradient(90deg, ${palette.pink}, ${palette.purple}, ${palette.accent}, ${palette.purple}, ${palette.pink})`, backgroundSize: '300% 100%', animation: 'ppr-gradient-shift 7s ease-in-out infinite' }} />
);
```

## Motion

- Philosophy: **rich.** Content blocks fade-and-rise on enter (`ppr-fade-up`, staggered by 0.15s per card), skeleton holes shimmer (`ppr-shimmer`), the cover gradient bar drifts (`ppr-gradient-shift`), a cursor blinks (`ppr-blink`), and a scan highlight sweeps a timeline (`ppr-scan`). Always `both` fill-mode with a `cubic-bezier(0.2, 0.8, 0.2, 1)` ease so the first frame is the pre-state. Stagger reveals so the eye lands on the heading first, then the supporting content. Keep durations 0.6–0.9s; nothing should loop fast enough to distract from reading. Respect `prefers-reduced-motion` if you extend it.

## Aesthetic

Clean, technical, confident — the Vercel docs look. A white page, black Geist headlines tracked tight, a disciplined gray scale for structure, and a saturated signal spectrum used only to carry meaning (pink dynamic, cyan static, blue functions, green strings). Monospace does all the chrome — eyebrows, footer, code, even a directive promoted to a headline. Motion is present but never loud: things rise into place and settle. References: Vercel.com, Next.js docs, Geist design system, Linear changelogs. Avoid: off-white or tinted backgrounds (stay pure `#ffffff`), drop shadows (use the `#eaeaea` hairline instead), gradients except the single cover accent bar, a signal color used decoratively, more than two signal hues per slide, rounded "friendly" everything (corners are 10–20, restrained), and any serif or handwritten type.

## Example usage

```tsx
const Cover: Page = () => {
  const { current, total } = useSlidePageNumber();
  return (
    <div style={{ ...fill, padding: '0 120px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Style />
      <div style={{ position: 'absolute', top: 72, left: 120 }}><Logo size={28} /></div>
      <div style={{ animation: 'ppr-fade-up 0.9s cubic-bezier(0.2,0.8,0.2,1) both' }}>
        <div style={{ fontSize: 28, fontFamily: fontMono, color: palette.muted, marginBottom: 32 }}>rendering, reimagined.</div>
        <h1 style={{ fontSize: 'var(--osd-size-hero)', fontWeight: 700, margin: 0, lineHeight: 0.92, letterSpacing: '-0.045em' }}>
          Partial<br />Pre-Rendering
        </h1>
      </div>
      <GradientBar />
      <div style={{ position: 'absolute', bottom: 56, left: 120, right: 120, display: 'flex', justifyContent: 'space-between', fontSize: 20, fontFamily: fontMono, color: palette.subtle }}>
        <span style={{ color: palette.text, fontWeight: 600 }}>
          <span style={{ animation: 'ppr-blink 1.2s steps(1) infinite' }}>▍</span> ready when you are
        </span>
        <span>{String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
      </div>
    </div>
  );
};
```
