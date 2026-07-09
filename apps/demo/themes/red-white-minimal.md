---
name: Red White Minimal
description: Off-white paper canvas, one bold red, huge red grotesque headlines — a clean editorial carousel look for LinkedIn.
mode: light
---

# Red White Minimal

A minimal, editorial carousel identity for square (1:1) LinkedIn posts: warm off-white background, a single confident red, and oversized heavy grotesque headlines that own the upper-left. Body copy is quiet charcoal. The only chrome is a low-opacity text signature and a red SWIPE pill (or bookmark on the closer). Derived from the `assets/red_white_minimal/` template.

## Palette

| Role    | Value     | Notes                                                  |
| ------- | --------- | ------------------------------------------------------ |
| bg      | image     | `@assets/red-white-minimal-bg.png` (full-bleed); `#fbfbfb` is only the fallback color behind it |
| accent  | `#ef3c1d` | the red — headlines, pill, bookmark, accents           |
| text    | `#2a2522` | body copy — warm charcoal, never pure black            |
| muted   | `#8a8580` | captions, cover sub-line, handle                       |
| surface | `#f1efec` | inset cards / code blocks (sits just off the bg)       |
| hairline| `#ddd6cd` | 1px borders on surfaces                                 |

**Contrast rule (do not skip).** This canvas is near-white `#fbfbfb`, so the mirror of the dark-theme trap applies: any panel (card, callout, code block) must be a shade *darker* than the bg or it disappears. Keep `surface` around **`#f1efec`–`#eceae6`** and always pair it with the `#ddd6cd` hairline border — a borderless near-white panel on near-white reads as nothing. Body text must be charcoal `#2a2522`, never a light gray, or it greys out against the paper. Red is for headlines and accents only; never set body paragraphs in red (it vibrates and kills readability). One red headline per slide.

## Typography

- Display font: `"Inter", system-ui, -apple-system, sans-serif` — weight **900** for headlines, set in the accent red.
- Body font: same Inter stack — weight 400, charcoal.
- Mono (handle, code, any counter): `"JetBrains Mono", "SF Mono", ui-monospace, Menlo, monospace`.
- Headlines are **single-color red**, not two-tone. For emphasis, drop one word to charcoal `#2a2522` inside the red headline — use sparingly, at most once in the deck.
- A colon-headline doubles as the label: `Reactive work:` then body below. No separate eyebrow needed.
- Type-scale overrides (canvas is **1080 × 1080**, not the 1920×1080 default):
  - Hero / closer headline: 116–132 px (fills 3–4 lines, upper-left)
  - Content headline: 60–72 px
  - Body text: 30–34 px
  - Cover / closer sub-line: 24 px
  - Handle: 18–20 px mono

## Background

Every page uses the **`@assets/red-white-minimal-bg.png`** paper texture as a full-bleed background — this is the theme's only background; do not fall back to a flat fill. Import it once and apply it on each page root via `backgroundImage` with `backgroundSize: 'cover'`. Keep `backgroundColor: '#fbfbfb'` underneath purely as a fallback. Never put the image on inner elements — only the page root.

```tsx
import bg from '@assets/red-white-minimal-bg.png';

const fill = {
  width: '100%',
  height: '100%',
  backgroundColor: '#fbfbfb',
  backgroundImage: `url(${bg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  color: 'var(--osd-text)',
  fontFamily: 'var(--osd-font-body)',
  display: 'flex',
  flexDirection: 'column' as const,
  padding: 88,
  boxSizing: 'border-box' as const,
};
```

## Layout

- Canvas: **1080 × 1080** (1:1). Set `meta.canvasWidth` / `meta.canvasHeight` to `1080`.
- Content padding: **88 px** from every edge.
- Alignment: **left-aligned, single column.** Headline anchored to the top-left of the content area; body directly under it. Never center.
- Vertical rhythm: a flex column with `padding: 88`. Cover/closer push the headline block up and the sub-line to the bottom row. Content slides: headline + body in the upper two-thirds, footer pinned bottom.
- Chrome lives in the **bottom row** (not the top): a low-opacity text **Badge** on the left, and a red **SwipePill** on the right — swapped for a red **Bookmark** on the final page. The cover replaces the badge with a muted sub-line.

## Fixed components

Paste-ready. Copy verbatim into a slide that uses this theme. They assume `--osd-*` vars from a `design` const (`bg #fbfbfb`, `text #2a2522`, `accent #ef3c1d`) plus the `mono` and `muted` consts above.

### Badge

Text-only by design — name over handle, no avatar, held at low opacity so it reads as a quiet signature in the footer, not a header.

```tsx
const mono = '"JetBrains Mono", "SF Mono", ui-monospace, Menlo, monospace';

const Badge = () => (
  <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2, opacity: 0.55 }}>
    <span style={{ fontFamily: 'var(--osd-font-display)', fontWeight: 700, fontSize: 20, color: 'var(--osd-text)' }}>Prajwal</span>
    <span style={{ fontFamily: mono, fontSize: 18, color: 'var(--osd-accent)' }}>hdprajwal</span>
  </div>
);
```

### Title (+ emphasis)

```tsx
const Title = ({ children, size = 68 }: { children: React.ReactNode; size?: number }) => (
  <h1 style={{
    fontFamily: 'var(--osd-font-display)', fontWeight: 900, fontSize: size,
    lineHeight: 1.0, letterSpacing: '-0.035em', margin: 0, color: 'var(--osd-accent)',
  }}>
    {children}
  </h1>
);

// Optional: drop one word to charcoal inside the red headline. Use at most once.
const Em = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: 'var(--osd-text)' }}>{children}</span>
);
// usage: <Title size={124}>Save this to <Em>rethink</Em> how you work</Title>
```

### Footer

Pull the page number from `useSlidePageNumber()` so the pill auto-swaps to a bookmark on the last page. Pass `left` to replace the badge (e.g. the cover/closer sub-line).

```tsx
import { useSlidePageNumber } from '@open-frame/core';

const SwipePill = () => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 12,
    background: 'var(--osd-accent)', color: '#fff', borderRadius: 100, padding: '11px 22px',
    fontFamily: 'var(--osd-font-display)', fontWeight: 800, fontSize: 18, letterSpacing: '0.04em',
  }}>
    SWIPE
    <svg width="34" height="14" viewBox="0 0 34 14" fill="none">
      <path d="M1 7h27M23 2l5 5-5 5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

const Bookmark = () => (
  <svg width="32" height="42" viewBox="0 0 32 42" fill="none">
    <path d="M3 2h26v37l-13-9-13 9V2z" fill="#ef3c1d" />
  </svg>
);

const Footer = ({ left }: { left?: React.ReactNode }) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 'auto' }}>
      {left ?? <Badge />}
      {current === total ? <Bookmark /> : <SwipePill />}
    </div>
  );
};

// Cover/closer sub-line for the footer's left slot:
const SubLine = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 24, color: '#8a8580', lineHeight: 1.4, maxWidth: 560 }}>{children}</div>
);
```

### Content blocks (optional)

Light-theme building blocks. Cards are a touch *darker* than the paper with a hairline edge; the red is reserved for accents.

```tsx
// Callout card — light surface, red left bar + red figure.
const Callout = ({ value, children }: { value: string; children: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 20, background: '#f1efec', border: '1px solid #ddd6cd', borderLeft: '4px solid #ef3c1d', borderRadius: 14, padding: '22px 28px' }}>
    <span style={{ fontFamily: mono, fontSize: 34, fontWeight: 700, color: '#ef3c1d', flexShrink: 0 }}>{value}</span>
    <span style={{ fontSize: 22, color: '#2a2522', lineHeight: 1.35 }}>{children}</span>
  </div>
);

// Status row — done = red dot, active = red ring, pending = hollow gray.
type StepState = 'done' | 'active' | 'pending';
const TrackRow = ({ label, state, tag }: { label: string; state: StepState; tag?: string }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '34px 1fr auto', alignItems: 'center', gap: 20, padding: '16px 24px', background: '#f1efec', border: '1px solid #ddd6cd', borderRadius: 12 }}>
    <span style={{
      width: 20, height: 20, borderRadius: '50%', justifySelf: 'center',
      background: state === 'done' ? '#ef3c1d' : 'transparent',
      border: state === 'active' ? '4px solid #ef3c1d' : state === 'pending' ? '3px solid #c9c2b9' : 'none',
      boxSizing: 'border-box',
    }} />
    <span style={{ fontSize: 25, fontWeight: state === 'pending' ? 400 : 600, color: state === 'pending' ? '#8a8580' : '#2a2522' }}>{label}</span>
    <span style={{ fontFamily: mono, fontSize: 15, fontWeight: 700, color: state === 'active' ? '#ef3c1d' : '#8a8580', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{tag ?? ''}</span>
  </div>
);

// Code block — light inset, red for the line you want noticed.
const CodeBlock = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: '#f1efec', border: '1px solid #ddd6cd', borderRadius: 14, padding: '28px 32px', fontFamily: mono, fontSize: 24, lineHeight: 1.7, whiteSpace: 'pre', color: '#2a2522' }}>
    {children}
  </div>
);
```

## Motion

- Philosophy: **static.** A still carousel exported to PNG — no transitions, no keyframes. (If presenting live, the deck-wide `RISE` from `slide-authoring` is the only acceptable addition.)

## Aesthetic

Confident, editorial, minimal. One bold red on warm paper, oversized heavy grotesque headlines hugging the top-left, generous white space, quiet charcoal body. The red does all the talking; everything else gets out of its way. References: Swiss editorial posters, modern "build in public" carousels, risograph print. The paper grain comes from the `@assets/red-white-minimal-bg.png` background (see the Background section) — that texture is the whole point of the off-white, so every page must carry it. Avoid: gradients, drop shadows, a second accent color, pure-black ink (use charcoal), body copy in red, centered text, decorative emoji, near-white panels with no border (see the Contrast rule), clip-art icons, and flat-color backgrounds that drop the paper texture.

## Example usage

```tsx
import bg from '@assets/red-white-minimal-bg.png';

const Content: Page = () => (
  <div style={{ width: '100%', height: '100%', backgroundColor: '#fbfbfb', backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'var(--osd-text)', display: 'flex', flexDirection: 'column', padding: 88, boxSizing: 'border-box', fontFamily: 'var(--osd-font-body)' }}>
    <div style={{ marginTop: 0 }}>
      <Title size={68}>Reactive work:</Title>
      <p style={{ fontSize: 32, color: '#2a2522', lineHeight: 1.5, marginTop: 32, maxWidth: 820 }}>
        Constantly checking emails, replying instantly, switching between tasks. Feels productive but drains your attention.
      </p>
    </div>
    <Footer />
  </div>
);
```
