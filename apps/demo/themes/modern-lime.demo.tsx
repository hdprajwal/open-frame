import { type DesignSystem, type Page, useSlidePageNumber } from '@open-frame/core';

export const design: DesignSystem = {
  palette: { bg: '#000000', text: '#ffffff', accent: '#c9f224' },
  fonts: {
    display: '"Inter", system-ui, -apple-system, sans-serif',
    body: '"Inter", system-ui, -apple-system, sans-serif',
  },
  typeScale: { hero: 84, body: 30 },
  radius: 14,
};

const muted = '#9a9a9a';
const dim = '#5a5a5a';
const surface = '#202020';
const hairline = '#3a3a3a';
const mono = '"JetBrains Mono", "SF Mono", ui-monospace, Menlo, monospace';

const fill = {
  width: '100%',
  height: '100%',
  background: 'var(--osd-bg)',
  color: 'var(--osd-text)',
  fontFamily: 'var(--osd-font-body)',
  display: 'flex',
  flexDirection: 'column' as const,
  padding: 88,
  boxSizing: 'border-box' as const,
};

// ── Fixed components (verbatim from themes/modern-lime.md) ─────────────────────
const Badge = () => (
  <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2, opacity: 0.55 }}>
    <span
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontWeight: 700,
        fontSize: 22,
        color: 'var(--osd-text)',
      }}
    >
      Prajwal
    </span>
    <span style={{ fontFamily: mono, fontSize: 18, color: 'var(--osd-accent)' }}>hdprajwal</span>
  </div>
);

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      fontFamily: 'var(--osd-font-display)',
      fontStyle: 'italic',
      fontWeight: 700,
      fontSize: 30,
      color: 'var(--osd-accent)',
      marginBottom: 18,
    }}
  >
    {children}
  </div>
);

const Title = ({ children, size = 84 }: { children: React.ReactNode; size?: number }) => (
  <h1
    style={{
      fontFamily: 'var(--osd-font-display)',
      fontWeight: 900,
      fontSize: size,
      lineHeight: 1.02,
      letterSpacing: '-0.035em',
      margin: 0,
      color: 'var(--osd-text)',
    }}
  >
    {children}
  </h1>
);

const Hl = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: 'var(--osd-accent)' }}>{children}</span>
);

const Arrow = () => (
  <svg width="64" height="22" viewBox="0 0 64 22" fill="none">
    <path
      d="M2 11h57M50 3l9 8-9 8"
      stroke="#c9f224"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Footer = ({ end }: { end?: React.ReactNode }) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 'auto',
      }}
    >
      <span
        style={{
          fontFamily: mono,
          fontSize: 20,
          fontWeight: 700,
          color: 'var(--osd-accent)',
          letterSpacing: '0.04em',
        }}
      >
        {String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </span>
      {end ?? <Arrow />}
    </div>
  );
};

const SwipePill = () => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 14,
      background: 'var(--osd-accent)',
      color: '#000',
      borderRadius: 100,
      padding: '12px 26px',
      fontFamily: 'var(--osd-font-display)',
      fontWeight: 800,
      fontSize: 20,
      letterSpacing: '0.04em',
    }}
  >
    SWIPE
    <svg width="40" height="16" viewBox="0 0 40 16" fill="none">
      <path
        d="M1 8h33M28 2l6 6-6 6"
        stroke="#000"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

const Bookmark = () => (
  <svg width="34" height="44" viewBox="0 0 34 44" fill="none">
    <path d="M4 3h26v37l-13-9-13 9V3z" fill="#c9f224" />
  </svg>
);

// ── Demo pages ────────────────────────────────────────────────────────────────
const Cover: Page = () => (
  <div style={fill}>
    <Badge />
    <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
      <Title size={88}>
        Build posts that <Hl>stop the scroll</Hl>.
      </Title>
    </div>
    <div
      style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 32 }}
    >
      <div style={{ fontSize: 27, color: muted, lineHeight: 1.45, maxWidth: 620 }}>
        Black canvas. One lime accent.
        <br />
        Headlines that fill the frame.
      </div>
      <SwipePill />
    </div>
  </div>
);

const Content: Page = () => (
  <div style={fill}>
    <Badge />
    <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
      <Eyebrow>Step 2:</Eyebrow>
      <Title>
        The workflow <Hl>stops at one line</Hl>
      </Title>
      <div
        style={{
          background: surface,
          border: `1px solid ${hairline}`,
          borderRadius: 14,
          padding: '24px 30px',
          marginTop: 36,
          fontFamily: mono,
          fontSize: 28,
        }}
      >
        <span style={{ color: '#c2a8ff' }}>const</span> verdict ={' '}
        <span style={{ color: '#c2a8ff' }}>await</span>{' '}
        <span style={{ color: 'var(--osd-accent)' }}>hook</span>
      </div>
      <div style={{ fontSize: 28, color: muted, lineHeight: 1.55, marginTop: 28 }}>
        One highlight per headline. Short body lines.
        <br />
        Let the black space breathe.
      </div>
    </div>
    <Footer />
  </div>
);

const Closer: Page = () => (
  <div style={fill}>
    <Badge />
    <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
      <Title size={92}>
        <span style={{ fontStyle: 'italic', color: 'var(--osd-accent)' }}>Save this</span>
        <br />
        for your next deck.
      </Title>
      <div style={{ fontFamily: mono, fontSize: 19, color: dim, lineHeight: 1.7, marginTop: 34 }}>
        Modern Lime · 1080 × 1080 · LinkedIn carousel
      </div>
    </div>
    <Footer end={<Bookmark />} />
  </div>
);

export const meta = {
  title: 'Modern Lime — theme demo',
  canvasWidth: 1080,
  canvasHeight: 1080,
};

export default [Cover, Content, Closer];
