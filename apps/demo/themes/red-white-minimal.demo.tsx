import bg from '@assets/red-white-minimal-bg.png';
import { type DesignSystem, type Page, useSlidePageNumber } from '@open-frame/core';

export const design: DesignSystem = {
  palette: { bg: '#fbfbfb', text: '#2a2522', accent: '#ef3c1d' },
  fonts: {
    display: '"Inter", system-ui, -apple-system, sans-serif',
    body: '"Inter", system-ui, -apple-system, sans-serif',
  },
  typeScale: { hero: 124, body: 32 },
  radius: 14,
};

const muted = '#8a8580';
const surface = '#f1efec';
const hairline = '#ddd6cd';
const mono = '"JetBrains Mono", "SF Mono", ui-monospace, Menlo, monospace';

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

// ── Fixed components (verbatim from themes/red-white-minimal.md) ───────────────
const Badge = () => (
  <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2, opacity: 0.55 }}>
    <span
      style={{
        fontFamily: 'var(--osd-font-display)',
        fontWeight: 700,
        fontSize: 20,
        color: 'var(--osd-text)',
      }}
    >
      Prajwal
    </span>
    <span style={{ fontFamily: mono, fontSize: 18, color: 'var(--osd-accent)' }}>hdprajwal</span>
  </div>
);

const Title = ({ children, size = 68 }: { children: React.ReactNode; size?: number }) => (
  <h1
    style={{
      fontFamily: 'var(--osd-font-display)',
      fontWeight: 900,
      fontSize: size,
      lineHeight: 1.0,
      letterSpacing: '-0.035em',
      margin: 0,
      color: 'var(--osd-accent)',
    }}
  >
    {children}
  </h1>
);

const Em = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: 'var(--osd-text)' }}>{children}</span>
);

const SwipePill = () => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      background: 'var(--osd-accent)',
      color: '#fff',
      borderRadius: 100,
      padding: '11px 22px',
      fontFamily: 'var(--osd-font-display)',
      fontWeight: 800,
      fontSize: 18,
      letterSpacing: '0.04em',
    }}
  >
    SWIPE
    <svg width="34" height="14" viewBox="0 0 34 14" fill="none">
      <path
        d="M1 7h27M23 2l5 5-5 5"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginTop: 'auto',
      }}
    >
      {left ?? <Badge />}
      {current === total ? <Bookmark /> : <SwipePill />}
    </div>
  );
};

const SubLine = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 24, color: muted, lineHeight: 1.4, maxWidth: 560 }}>{children}</div>
);

const Callout = ({ value, children }: { value: string; children: React.ReactNode }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      background: surface,
      border: `1px solid ${hairline}`,
      borderLeft: '4px solid #ef3c1d',
      borderRadius: 14,
      padding: '22px 28px',
    }}
  >
    <span
      style={{
        fontFamily: mono,
        fontSize: 34,
        fontWeight: 700,
        color: 'var(--osd-accent)',
        flexShrink: 0,
      }}
    >
      {value}
    </span>
    <span style={{ fontSize: 22, color: 'var(--osd-text)', lineHeight: 1.35 }}>{children}</span>
  </div>
);

// ── Demo pages ────────────────────────────────────────────────────────────────
const Cover: Page = () => (
  <div style={fill}>
    <div style={{ marginTop: 8 }}>
      <Title size={124}>Reactive work &amp; focused work</Title>
    </div>
    <Footer
      left={
        <SubLine>
          Why you feel busy
          <br />
          but not effective
        </SubLine>
      }
    />
  </div>
);

const Content: Page = () => (
  <div style={fill}>
    <div>
      <Title size={68}>Reactive work:</Title>
      <p
        style={{
          fontSize: 32,
          color: 'var(--osd-text)',
          lineHeight: 1.5,
          marginTop: 32,
          maxWidth: 820,
        }}
      >
        Constantly checking emails, replying instantly, switching between tasks. Feels productive
        but drains your attention.
      </p>
      <div style={{ marginTop: 36 }}>
        <Callout value="80%">
          of a reactive day is spent on work that does not move the needle.
        </Callout>
      </div>
    </div>
    <Footer />
  </div>
);

const Closer: Page = () => (
  <div style={fill}>
    <div style={{ marginTop: 8 }}>
      <Title size={124}>
        Save this to <Em>rethink</Em> how you work
      </Title>
    </div>
    <Footer
      left={
        <SubLine>
          Control your attention,
          <br />
          or lose it.
        </SubLine>
      }
    />
  </div>
);

export const meta = {
  title: 'Red White Minimal — theme demo',
  canvasWidth: 1080,
  canvasHeight: 1080,
};

export default [Cover, Content, Closer];
