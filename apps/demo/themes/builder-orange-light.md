---
name: Builder Orange Light
description: White canvas, near-black ink, one Strava orange, Inter Tight headlines, a mono brand bar and a wireframe cube mark — the light-canvas twin of Builder Orange for Prajwal HD "build in public" carousels.
mode: light
---

# Builder Orange Light

The light-canvas twin of **Builder Orange**, lifted from the Prajwal HD brand system: a clean white canvas with a faint dark dot grid, near-black ink, one warm Strava orange, confident Inter Tight headlines, and IBM Plex Mono chrome (a dark `PH` brand tile, mono context line, mono chips). The signature is the same wireframe orange cube. The one dark element kept from the brand is the terminal card — a deliberate near-black inset on the white page (exactly like the brand hero). Orange stays a highlight, never a wash: one word, number, or the cube per slide. Use this when you want the editorial, paper-clean read; use the dark `builder-orange` when you want the high-contrast night look. Same components, same names, inverted canvas.

## Palette

| Role     | Value     | Notes                                                       |
| -------- | --------- | ----------------------------------------------------------- |
| bg       | `#ffffff` | white canvas                                                |
| text     | `#0b0b0c` | headlines, primary copy (near-black, warm)                  |
| accent   | `#fc4c02` | the orange — emphasis word, cube, key number                |
| deep     | `#e84402` | pressed / hover orange, only for solid fills that need it   |
| muted    | `#6b6f76` | body / secondary copy, the mono context line                |
| dim      | `#9a9aa0` | timestamps, src signature, pending-state items              |
| surface  | `#faf7f2` | inset cards, callouts (warm off-white, sits just off bg)    |
| soft     | `#f2f2f3` | alternate cool inset / chip fill                            |
| hairline | `#e9e9ec` | 1px borders on surfaces and chips                           |
| tile     | `#0b0b0c` | the `PH` brand tile background (text sits in `#ffffff`)     |
| term     | `#0b0b0c` | the terminal card stays dark even on the white page         |

**Contrast rule (do not skip).** The canvas is white `#ffffff`, so the mirror of the dark-theme trap applies: any panel (card, chip, callout) must be a shade *darker* than the bg or it disappears. Keep `surface` in the **`#faf7f2`–`#f2f2f3`** band and always pair it with the `#e9e9ec` hairline border — a borderless near-white panel on white reads as nothing. Body copy is `muted #6b6f76`, never a lighter gray (it greys out against the paper). Headlines and the `PH` tile carry the near-black ink. Never set a whole paragraph in orange — it vibrates and kills readability. One orange emphasis per slide: a single word in the headline, or the cube, or one key figure. Not all three at once. The terminal card is the one allowed dark element; everything else stays light.

## Typography

- Display font: `"Inter Tight", "Inter", system-ui, -apple-system, sans-serif` — weight **800** for headlines, **700** for the brand name. Tight tracking (`-0.035em`) on big headlines.
- Body font: `"Inter", system-ui, -apple-system, sans-serif` — weight 400–500.
- Mono (brand tile, context line, chips, src, code): `"IBM Plex Mono", ui-monospace, "SF Mono", Menlo, monospace`.
- Hand (optional, rare): `"Caveat", cursive` — only for a single sketched annotation; skip it by default.
- Highlight technique: keep the headline near-black and drop **one** word to the accent orange via `<Em>`. The `em` is not italic — same weight, just orange. One per headline.
- Type-scale overrides (canvas is **1080 × 1080**, not the 1920×1080 default):
  - Hero / cover / closer title: 104–120 px
  - Content headline: 60–72 px
  - Body / kick sub-line: 30–34 px
  - Brand name: 26 px · context line / chips / handle: 19–20 px mono
  - src signature: 22 px mono

## Layout

- Canvas: **1080 × 1080** (1:1). Set `meta.canvasWidth` / `meta.canvasHeight` to `1080`.
- Content padding: **88 px** from every edge.
- Alignment: **left-aligned, single column.** Headline anchored low-left on the cover/closer; content headline + body in the upper two-thirds on content pages. Never center.
- Background: every page carries a faint **dark dot grid** (radial dots at ~5% black, ~46 px pitch) baked into the page-root `backgroundImage`. It is the only texture — no gradients, no flat re-fills that drop it.
- Chrome is fixed on every page: the **BrandMini** bar pinned top (dark PH tile + name on the left, mono `context / NN` page counter on the right) and a **Footer** pinned bottom (mono chips on the left, src signature on the right). The cover lets the headline block sit low with the cube mark floated to the lower-right.
- Vertical rhythm: a flex column with `padding: 88`. Use `marginTop: 'auto'` to push either the headline block (cover/closer) or the footer to the bottom.

## Fixed components

Paste-ready. Copy verbatim into a slide that uses this theme. They assume `--osd-*` vars from a `design` const (`bg #ffffff`, `text #0b0b0c`, `accent #fc4c02`) plus the `mono` / `muted` / `surface` / `hairline` consts below.

```tsx
const mono = '"IBM Plex Mono", ui-monospace, "SF Mono", Menlo, monospace';
const muted = '#6b6f76';
const dim = '#9a9aa0';
const surface = '#faf7f2';
const hairline = '#e9e9ec';

// Faint dark dot grid baked into the page root — apply this `fill` to every page.
const fill = {
  width: '100%',
  height: '100%',
  backgroundColor: 'var(--osd-bg)',
  backgroundImage: 'radial-gradient(rgba(0,0,0,.05) 1px, transparent 1px)',
  backgroundSize: '46px 46px',
  color: 'var(--osd-text)',
  fontFamily: 'var(--osd-font-body)',
  display: 'flex',
  flexDirection: 'column' as const,
  padding: 88,
  boxSizing: 'border-box' as const,
};
```

### Cube mark

The signature glyph — a wireframe orange cube. Use it once per cover/closer, floated lower-right, sized 220–300 px. Never recolor it; orange only.

```tsx
const Cube = ({ size = 260 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" style={{ color: 'var(--osd-accent)' }} aria-hidden>
    <g stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round">
      <path d="M100 18 L168 56 L168 134 L100 172 L32 134 L32 56 Z" />
      <path d="M100 18 L100 95 M100 95 L168 56 M100 95 L32 56 M100 95 L100 172" />
      <path d="M66 37 L134 37 L168 56 M66 37 L66 114 M134 37 L134 114 M66 75 L134 75 M66 114 L134 114" />
    </g>
    <g fill="currentColor">
      <circle cx="100" cy="18" r="4" /><circle cx="168" cy="56" r="4" /><circle cx="32" cy="56" r="4" />
      <circle cx="100" cy="95" r="4" /><circle cx="100" cy="172" r="4" /><circle cx="168" cy="134" r="4" /><circle cx="32" cy="134" r="4" />
    </g>
  </svg>
);
```

### BrandMini (top chrome)

Dark PH tile + name on the left, a mono `context / NN` page counter on the right. Pull the page number from `useSlidePageNumber()` — never hardcode it.

```tsx
import { useSlidePageNumber } from '@open-frame/core';

const BrandMini = ({ ctx = 'building in public' }: { ctx?: string }) => {
  const { current } = useSlidePageNumber();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18, background: '#0b0b0c', color: '#ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: mono, fontWeight: 700, fontSize: 24,
        }}>PH</div>
        <span style={{ fontFamily: 'var(--osd-font-display)', fontWeight: 700, fontSize: 26 }}>Prajwal HD</span>
      </div>
      <span style={{ fontFamily: mono, fontSize: 20, color: muted }}>
        {ctx} / {String(current).padStart(2, '0')}
      </span>
    </div>
  );
};
```

### Title (+ Em)

Heavy Inter Tight. Keep it near-black and drop one word to orange with `<Em>` (not italic). Use `<br />` to break lines deliberately.

```tsx
const Title = ({ children, size = 112 }: { children: React.ReactNode; size?: number }) => (
  <h1 style={{
    fontFamily: 'var(--osd-font-display)', fontWeight: 800, fontSize: size,
    lineHeight: 1.0, letterSpacing: '-0.035em', margin: 0, color: 'var(--osd-text)',
  }}>
    {children}
  </h1>
);

// One orange word inside a near-black headline. Same weight, not italic.
const Em = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: 'var(--osd-accent)' }}>{children}</span>
);
// usage: <Title>Building <Em>AI infra</Em> that ships.</Title>
```

### Footer (chips + src)

Mono chips on the left, a two-line src signature on the right. No page counter here — that lives in `BrandMini`.

```tsx
const Footer = ({ chips = [], src }: { chips?: string[]; src?: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 'auto', gap: 32 }}>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      {chips.map((c) => (
        <span key={c} style={{
          fontFamily: mono, fontSize: 19, color: muted,
          border: `1px solid ${hairline}`, background: '#faf7f2',
          borderRadius: 100, padding: '9px 18px',
        }}>{c}</span>
      ))}
    </div>
    <div style={{ fontFamily: mono, fontSize: 22, color: dim, textAlign: 'right', lineHeight: 1.4 }}>
      {src ?? <>Prajwal HD<br />hdprajwal.dev</>}
    </div>
  </div>
);
```

### Content blocks (optional)

Light building blocks that sit just *off* the white with a hairline edge; orange is reserved for the accent. The terminal is the one deliberate dark inset.

```tsx
// Callout — warm surface card, orange left bar + orange figure.
const Callout = ({ value, children }: { value: string; children: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 20, background: surface, border: `1px solid ${hairline}`, borderLeft: '4px solid var(--osd-accent)', borderRadius: 14, padding: '22px 28px' }}>
    <span style={{ fontFamily: mono, fontSize: 34, fontWeight: 600, color: 'var(--osd-accent)', flexShrink: 0 }}>{value}</span>
    <span style={{ fontSize: 24, color: muted, lineHeight: 1.35 }}>{children}</span>
  </div>
);

// Terminal snippet — stays dark on the white page (brand-accurate), orange prompt, mono throughout.
const Terminal = ({ children, title = 'builder@prajwalhd: ~' }: { children: React.ReactNode; title?: string }) => (
  <div style={{ background: '#0b0b0c', border: '1px solid #1c1c1f', borderRadius: 16, overflow: 'hidden', fontFamily: mono }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
      <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }} />
      <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
      <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
      <span style={{ flex: 1, textAlign: 'center', fontSize: 18, color: '#8a8a90' }}>{title}</span>
    </div>
    <div style={{ padding: '22px 24px', fontSize: 24, lineHeight: 1.75, color: '#d6d6da', whiteSpace: 'pre' }}>{children}</div>
  </div>
);
// inside Terminal: <span style={{ color: 'var(--osd-accent)' }}>$</span> ./infra run --watch
```

## Motion

- Philosophy: **static.** A still carousel exported to PNG — no transitions, no keyframes. The brand reads as a clean print system; let the type and the cube do the work. (If presenting live, the deck-wide `RISE` from `slide-authoring` is the only acceptable addition.)

## Aesthetic

Editorial, paper-clean, technical. A white canvas with a quiet dark dot grid, near-black ink, one warm Strava orange (`#fc4c02`), and heavy Inter Tight headlines that own the frame. IBM Plex Mono carries the chrome — the dark `PH` tile, the context counter, the chips, the src signature — so it reads like a builder's tooling, not a marketing deck. A single dark terminal card is allowed as a contrast inset (it is the brand hero). The wireframe cube is the signature mark. References: developer-tool brand systems, Swiss editorial grids, print/risograph, "build in public" carousels. Orange is a scalpel: one word, one number, or the cube — never a fill or a wash. Avoid: gradients, drop shadows, a second accent color, pure-black ink (use `#0b0b0c`), body copy in orange, centered text, decorative emoji, clip-art icons, borderless near-white panels on white (see the Contrast rule), and dropping the dot grid on any page.

## Example usage

```tsx
const Cover: Page = () => (
  <div style={fill}>
    <BrandMini ctx="building in public" />
    <div style={{ marginTop: 'auto' }}>
      <Title size={112}>Building<br /><Em>AI infra</Em><br />that ships.</Title>
      <p style={{ fontSize: 32, color: muted, marginTop: 28, maxWidth: 720 }}>
        Notes from a builder who loves systems.
      </p>
    </div>
    <div style={{ position: 'absolute', right: 88, bottom: 200, opacity: 0.9 }}><Cube size={240} /></div>
    <Footer chips={['tools', 'infra', 'shipping']} />
  </div>
);
```
