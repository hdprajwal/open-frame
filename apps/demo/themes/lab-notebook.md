---
name: Lab Notebook
description: A builder's hand-drawn scratchpad — warm paper or dark ink, ruled/grid/dotted texture, Caveat handwriting, and orange marks. Two variants, four paper styles, one voice.
mode: light
---

# Lab Notebook

A technical builder's notebook page for square (1:1) LinkedIn carousels. The whole slide is a sheet of notebook paper: a warm off-white **paper** sheet or a dark **ink** sheet, carrying a faint **ruled / grid / dotted** texture, with content set in Caveat handwriting and a single Strava orange for the marks that matter — checkmarks, underlines, stars, arrows, the one emphasized word. Two registers live together: printed chrome (IBM Plex Mono tabs and labels, an Inter Tight option) reads like the binding and tab dividers; everything written reads like it was scrawled in by hand. Derived from the "Lab notebook card" component (Notes / Ideas / Experiments tabs over ruled paper).

## Variants and paper styles

This theme has **two independent axes**, both chosen per page through the `Sheet` wrapper:

- **Color variant** — `paper` (light: warm `#faf7f2`, dark ink) or `ink` (dark: `#15151a`, off-white ink). One deck can mix both.
- **Paper style** — `ruled` (horizontal lines), `grid` (squares), `dotted` (dot lattice), or `blank` (no texture).

Pick the variant for mood (paper = editorial daylight, ink = focused night) and the paper style for the content (ruled for lists/prose, grid for diagrams, dotted for free sketches, blank when a doodle needs room). The orange accent is identical across all combinations.

## Palette

| Role        | Paper (light)         | Ink (dark)               | Notes                                            |
| ----------- | --------------------- | ------------------------ | ------------------------------------------------ |
| bg          | `#faf7f2`             | `#15151a`                | the sheet                                        |
| fg (ink)    | `#2a2a2e`             | `#ece9e2`                | handwriting + printed text (the "pen")           |
| accent      | `#fc4c02`             | `#fc4c02`                | marks only — check, underline, star, arrow, word |
| muted       | `#6b6f76`             | `rgba(236,233,226,.5)`   | captions, tabs (inactive), footer, page stamp    |
| edge        | `#e7e1d8`             | `rgba(255,255,255,.1)`   | tab divider, hairlines                           |
| grid-line   | `rgba(11,11,12,.05)`  | `rgba(255,255,255,.05)`  | ruled / grid lines                               |
| grid-dot    | `rgba(11,11,12,.11)`  | `rgba(255,255,255,.12)`  | dotted lattice                                   |

These are wired at runtime as `--nb-fg` / `--nb-muted` / `--nb-edge` / `--nb-accent` by the `Sheet` wrapper, so the same component renders correctly on either variant. Components read `var(--nb-*)`; only the accent is hardcoded (`#fc4c02`).

**Contrast rule (do not skip).** The texture (ruled/grid/dotted) must stay faint — it is paper, not content. Keep grid-lines near 5% and dots near 11–12% so handwriting reads cleanly over them; if the lines compete with the text, they are too strong. Handwriting is always the `fg` pen color (`#2a2a2e` on paper, `#ece9e2` on ink), never a light gray — Caveat is thin, so a washed-out pen disappears. Orange is for **marks only**: one emphasized word, the checkmarks, an underline, a star, an arrow. Never set a whole handwritten line or paragraph in orange — it vibrates against the paper and kills the legibility Caveat already strains for. One orange focus per page.

## Typography

- Hand (the voice): `"Caveat", cursive` — weight 600–700. This is the primary type — headlines, list items, annotations, the page stamp. Caveat runs small, so sizes are large.
- Printed display (optional): `"Inter Tight", "Inter", system-ui, sans-serif` — weight 700, for a clean printed title when you want contrast against the handwriting.
- Mono (chrome): `"IBM Plex Mono", ui-monospace, monospace` — tabs-as-labels, the eyebrow, the src signature. Uppercase, tracked.
- Body prose (rare): `"Inter", system-ui, sans-serif` — weight 400, only for a real paragraph; keep it short, the handwriting should dominate.
- Emphasis: drop **one** word to orange with `<Mark>` inside a `Scrawl`. Add a hand `<Underline>` under a phrase for a second beat. Not both on the same line.
- Type-scale overrides (canvas is **1080 × 1080**, not the 1920×1080 default; Caveat reads ~30% smaller than its em, so these run large):
  - Cover / closer scrawl: 120–140 px
  - Section scrawl (a page heading): 60–72 px
  - Annotation / list item / result: 44–52 px
  - Inter prose: 30 px · Tabs: 32 px Inter
  - Eyebrow / mono labels / src: 20–22 px · page stamp (hand): 38 px

## Layout

- Canvas: **1080 × 1080** (1:1). Set `meta.canvasWidth` / `meta.canvasHeight` to `1080`.
- Content padding: **88 px** from every edge.
- Alignment: **left-aligned, single column.** Cover/closer push the scrawl block low with `marginTop: 'auto'`; content pages lead with `Tabs`, then a section scrawl, then items. Never center.
- Background: the chosen paper texture is baked into the `Sheet` page root — the only texture. Do not drop it or re-fill over it. `ruled` is offset to start below the header so the first lines sit under the content, not the tabs.
- Chrome: content pages carry the **Tabs** header (Notes / Ideas / Experiments, active one underlined in orange) and a **Footer** (mono src on the left, handwritten page stamp on the right). The cover swaps Tabs for a mono **Eyebrow**.

## Fixed components

Paste-ready. Copy verbatim into a slide that uses this theme. They share these consts and the `Sheet` wrapper, which sets the `--nb-*` vars per variant.

```tsx
const hand = '"Caveat", cursive';
const body = '"Inter", system-ui, sans-serif';
const mono = '"IBM Plex Mono", ui-monospace, monospace';
const accent = '#fc4c02';

type Variant = 'paper' | 'ink';
type Paper = 'ruled' | 'grid' | 'dotted' | 'blank';

const vars = (variant: Variant) =>
  variant === 'ink'
    ? { bg: '#15151a', fg: '#ece9e2', muted: 'rgba(236,233,226,.5)', edge: 'rgba(255,255,255,.1)', line: 'rgba(255,255,255,.05)', dot: 'rgba(255,255,255,.12)' }
    : { bg: '#faf7f2', fg: '#2a2a2e', muted: '#6b6f76', edge: '#e7e1d8', line: 'rgba(11,11,12,.05)', dot: 'rgba(11,11,12,.11)' };

const paperImage = (paper: Paper, v: ReturnType<typeof vars>): React.CSSProperties => {
  if (paper === 'ruled') return { backgroundImage: `linear-gradient(${v.line} 2px, transparent 2px)`, backgroundSize: '100% 64px', backgroundPosition: '0 210px' };
  if (paper === 'grid') return { backgroundImage: `linear-gradient(${v.line} 1px, transparent 1px), linear-gradient(90deg, ${v.line} 1px, transparent 1px)`, backgroundSize: '56px 56px' };
  if (paper === 'dotted') return { backgroundImage: `radial-gradient(${v.dot} 2px, transparent 2px)`, backgroundSize: '48px 48px' };
  return {};
};

// The page root. Sets --nb-* so every component below renders for the chosen variant.
const Sheet = ({ paper = 'ruled', variant = 'paper', children }: { paper?: Paper; variant?: Variant; children: React.ReactNode }) => {
  const v = vars(variant);
  const style = {
    width: '100%', height: '100%', backgroundColor: v.bg, color: v.fg,
    fontFamily: hand, display: 'flex', flexDirection: 'column',
    padding: 88, boxSizing: 'border-box', position: 'relative', overflow: 'hidden',
    '--nb-fg': v.fg, '--nb-muted': v.muted, '--nb-edge': v.edge, '--nb-accent': accent,
    ...paperImage(paper, v),
  } as React.CSSProperties;
  return <div style={style}>{children}</div>;
};
```

### Scrawl (+ Mark) and Underline

```tsx
const Scrawl = ({ children, size = 132 }: { children: React.ReactNode; size?: number }) => (
  <h1 style={{ fontFamily: hand, fontWeight: 700, fontSize: size, lineHeight: 1.0, margin: 0, color: 'var(--nb-fg)' }}>
    {children}
  </h1>
);

// One orange handwritten word inside a scrawl.
const Mark = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: accent }}>{children}</span>
);

// Hand-drawn orange underline; stretches to `width`.
const Underline = ({ width = 360 }: { width?: number }) => (
  <svg width={width} height={14} viewBox="0 0 360 14" preserveAspectRatio="none" fill="none" style={{ display: 'block', marginTop: 4 }} aria-hidden>
    <path d="M4 8 Q90 1 180 7 T356 5" stroke={accent} strokeWidth={3.2} fill="none" strokeLinecap="round" />
  </svg>
);
```

### CheckItem

```tsx
const CheckItem = ({ children, done = false }: { children: React.ReactNode; done?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
    <svg width={52} height={52} viewBox="0 0 52 52" fill="none" style={{ flexShrink: 0 }} aria-hidden>
      <rect x={6} y={6} width={40} height={40} rx={10} stroke="var(--nb-fg)" strokeWidth={2.4} strokeLinejoin="round" />
      {done && <path d="M14 27 L23 37 L42 13" stroke={accent} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
    <span style={{ fontFamily: hand, fontSize: 48, lineHeight: 1, color: 'var(--nb-fg)', textDecoration: done ? 'line-through' : 'none', textDecorationColor: accent }}>
      {children}
    </span>
  </div>
);
```

### Arrow and Star (orange marks)

```tsx
const Arrow = ({ size = 46 }: { size?: number }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 46 28" fill="none" style={{ verticalAlign: 'middle' }} aria-hidden>
    <path d="M4 14 H38 M30 6 l9 8 l-9 8" stroke={accent} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Star = ({ size = 34 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 34 34" fill={accent} style={{ flexShrink: 0 }} aria-hidden>
    <path d="M17 2 l4.5 9.2 10.2 1.5 -7.4 7.2 1.8 10.1 -9.1 -4.8 -9.1 4.8 1.8 -10.1 -7.4 -7.2 10.2 -1.5 Z" />
  </svg>
);
```

### Tabs (printed header) and Eyebrow

```tsx
const Tabs = ({ active = 'Ideas' }: { active?: 'Notes' | 'Ideas' | 'Experiments' }) => (
  <div style={{ display: 'flex', gap: 48, borderBottom: '1px solid var(--nb-edge)', paddingBottom: 22 }}>
    {(['Notes', 'Ideas', 'Experiments'] as const).map((it) => {
      const on = it === active;
      return (
        <div key={it} style={{ position: 'relative', fontFamily: body, fontSize: 32, fontWeight: on ? 600 : 400, color: on ? 'var(--nb-fg)' : 'var(--nb-muted)' }}>
          {it}
          {on && <div style={{ position: 'absolute', left: 0, right: 0, bottom: -23, height: 3, background: accent, borderRadius: 3 }} />}
        </div>
      );
    })}
  </div>
);

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontFamily: mono, fontSize: 22, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: accent }}>
    {children}
  </div>
);
```

### Footer

Mono src on the left, a handwritten page stamp on the right. Pull the page number from `useSlidePageNumber()` — never hardcode it.

```tsx
import { useSlidePageNumber } from '@open-frame/core';

const Footer = ({ src }: { src?: React.ReactNode }) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 'auto' }}>
      <div style={{ fontFamily: mono, fontSize: 20, color: 'var(--nb-muted)', letterSpacing: '0.04em' }}>
        {src ?? 'Prajwal HD · hdprajwal.dev'}
      </div>
      <div style={{ fontFamily: hand, fontSize: 38, color: 'var(--nb-muted)' }}>{current}/{total}</div>
    </div>
  );
};
```

## Motion

- Philosophy: **static.** A still notebook page exported to PNG — no transitions, no keyframes. The hand-drawn marks already imply motion; let them sit. (If presenting live, the deck-wide `RISE` from `slide-authoring` is the only acceptable addition.)

## Aesthetic

A builder's lab notebook, scanned. Warm paper or dark ink, a faint ruled/grid/dotted texture, content in Caveat handwriting, and one Strava orange for the pen marks that carry the point — a checkmark, an underline, a star, an arrow, the single word that matters. Printed chrome (mono tabs and labels) plays the tab dividers and binding against the handwriting, so it reads as a real working notebook, not a font gimmick. References: engineering lab books, bullet-journal spreads, whiteboard sketches, "build in public" margin notes. Orange is the pen you only uncap to mark something — never a fill, never a whole line. Avoid: gradients, drop shadows, a second accent color, body copy in orange, centered text, decorative emoji, photographic textures, a texture so strong it competes with the writing, and pen color set to a washed gray (handwriting must hold the full `fg` ink).

## Example usage

```tsx
const Cover: Page = () => (
  <Sheet paper="dotted" variant="paper">
    <Eyebrow>Lab notebook · 01</Eyebrow>
    <div style={{ marginTop: 'auto' }}>
      <Scrawl size={132}>Small tools <Mark>win.</Mark></Scrawl>
      <Underline width={420} />
      <p style={{ fontFamily: body, fontSize: 30, color: 'var(--nb-muted)', marginTop: 28, maxWidth: 680 }}>
        Field notes from building in public.
      </p>
    </div>
    <div style={{ position: 'absolute', right: 120, top: 300, display: 'flex', alignItems: 'center', gap: 16, transform: 'rotate(-6deg)' }}>
      <Star size={40} /><span style={{ fontFamily: hand, fontSize: 46, color: 'var(--nb-fg)' }}>ship friday</span>
    </div>
    <Footer />
  </Sheet>
);
```
