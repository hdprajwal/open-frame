import { type DesignSystem, type Page, useSlidePageNumber } from '@open-frame/core';

export const design: DesignSystem = {
  palette: { bg: '#faf7f2', text: '#2a2a2e', accent: '#fc4c02' },
  fonts: {
    display: '"Caveat", cursive',
    body: '"Inter", system-ui, sans-serif',
  },
  typeScale: { hero: 132, body: 30 },
  radius: 18,
};

const hand = '"Caveat", cursive';
const body = '"Inter", system-ui, sans-serif';
const mono = '"IBM Plex Mono", ui-monospace, monospace';
const accent = '#fc4c02';

type Variant = 'paper' | 'ink';
type Paper = 'ruled' | 'grid' | 'dotted' | 'blank';

const vars = (variant: Variant) =>
  variant === 'ink'
    ? {
        bg: '#15151a',
        fg: '#ece9e2',
        muted: 'rgba(236,233,226,.5)',
        edge: 'rgba(255,255,255,.1)',
        line: 'rgba(255,255,255,.05)',
        dot: 'rgba(255,255,255,.12)',
      }
    : {
        bg: '#faf7f2',
        fg: '#2a2a2e',
        muted: '#6b6f76',
        edge: '#e7e1d8',
        line: 'rgba(11,11,12,.05)',
        dot: 'rgba(11,11,12,.11)',
      };

const paperImage = (paper: Paper, v: ReturnType<typeof vars>): React.CSSProperties => {
  if (paper === 'ruled')
    return {
      backgroundImage: `linear-gradient(${v.line} 2px, transparent 2px)`,
      backgroundSize: '100% 64px',
      backgroundPosition: '0 210px',
    };
  if (paper === 'grid')
    return {
      backgroundImage: `linear-gradient(${v.line} 1px, transparent 1px), linear-gradient(90deg, ${v.line} 1px, transparent 1px)`,
      backgroundSize: '56px 56px',
    };
  if (paper === 'dotted')
    return {
      backgroundImage: `radial-gradient(${v.dot} 2px, transparent 2px)`,
      backgroundSize: '48px 48px',
    };
  return {};
};

// ── Fixed components (verbatim from themes/lab-notebook.md) ────────────────────
const Sheet = ({
  paper = 'ruled',
  variant = 'paper',
  children,
}: {
  paper?: Paper;
  variant?: Variant;
  children: React.ReactNode;
}) => {
  const v = vars(variant);
  const style = {
    width: '100%',
    height: '100%',
    backgroundColor: v.bg,
    color: v.fg,
    fontFamily: hand,
    display: 'flex',
    flexDirection: 'column',
    padding: 88,
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
    '--nb-fg': v.fg,
    '--nb-muted': v.muted,
    '--nb-edge': v.edge,
    '--nb-accent': accent,
    ...paperImage(paper, v),
  } as React.CSSProperties;
  return <div style={style}>{children}</div>;
};

const Scrawl = ({ children, size = 132 }: { children: React.ReactNode; size?: number }) => (
  <h1
    style={{
      fontFamily: hand,
      fontWeight: 700,
      fontSize: size,
      lineHeight: 1.0,
      margin: 0,
      color: 'var(--nb-fg)',
    }}
  >
    {children}
  </h1>
);

const Mark = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: accent }}>{children}</span>
);

const Underline = ({ width = 360 }: { width?: number }) => (
  <svg
    width={width}
    height={14}
    viewBox="0 0 360 14"
    preserveAspectRatio="none"
    fill="none"
    style={{ display: 'block', marginTop: 4 }}
    aria-hidden
  >
    <path
      d="M4 8 Q90 1 180 7 T356 5"
      stroke={accent}
      strokeWidth={3.2}
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

const CheckItem = ({ children, done = false }: { children: React.ReactNode; done?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
    <svg
      width={52}
      height={52}
      viewBox="0 0 52 52"
      fill="none"
      style={{ flexShrink: 0 }}
      aria-hidden
    >
      <rect
        x={6}
        y={6}
        width={40}
        height={40}
        rx={10}
        stroke="var(--nb-fg)"
        strokeWidth={2.4}
        strokeLinejoin="round"
      />
      {done && (
        <path
          d="M14 27 L23 37 L42 13"
          stroke={accent}
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
    <span
      style={{
        fontFamily: hand,
        fontSize: 48,
        lineHeight: 1,
        color: 'var(--nb-fg)',
        textDecoration: done ? 'line-through' : 'none',
        textDecorationColor: accent,
      }}
    >
      {children}
    </span>
  </div>
);

const Arrow = ({ size = 46 }: { size?: number }) => (
  <svg
    width={size}
    height={size * 0.6}
    viewBox="0 0 46 28"
    fill="none"
    style={{ verticalAlign: 'middle' }}
    aria-hidden
  >
    <path
      d="M4 14 H38 M30 6 l9 8 l-9 8"
      stroke={accent}
      strokeWidth={3}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Star = ({ size = 34 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 34 34"
    fill={accent}
    style={{ flexShrink: 0 }}
    aria-hidden
  >
    <path d="M17 2 l4.5 9.2 10.2 1.5 -7.4 7.2 1.8 10.1 -9.1 -4.8 -9.1 4.8 1.8 -10.1 -7.4 -7.2 10.2 -1.5 Z" />
  </svg>
);

const Tabs = ({ active = 'Ideas' }: { active?: 'Notes' | 'Ideas' | 'Experiments' }) => (
  <div
    style={{
      display: 'flex',
      gap: 48,
      borderBottom: '1px solid var(--nb-edge)',
      paddingBottom: 22,
    }}
  >
    {(['Notes', 'Ideas', 'Experiments'] as const).map((it) => {
      const on = it === active;
      return (
        <div
          key={it}
          style={{
            position: 'relative',
            fontFamily: body,
            fontSize: 32,
            fontWeight: on ? 600 : 400,
            color: on ? 'var(--nb-fg)' : 'var(--nb-muted)',
          }}
        >
          {it}
          {on && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: -23,
                height: 3,
                background: accent,
                borderRadius: 3,
              }}
            />
          )}
        </div>
      );
    })}
  </div>
);

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      fontFamily: mono,
      fontSize: 22,
      fontWeight: 500,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color: accent,
    }}
  >
    {children}
  </div>
);

const Footer = ({ src }: { src?: React.ReactNode }) => {
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
      <div
        style={{
          fontFamily: mono,
          fontSize: 20,
          color: 'var(--nb-muted)',
          letterSpacing: '0.04em',
        }}
      >
        {src ?? 'Prajwal HD · hdprajwal.dev'}
      </div>
      <div style={{ fontFamily: hand, fontSize: 38, color: 'var(--nb-muted)' }}>
        {current}/{total}
      </div>
    </div>
  );
};

// ── Demo pages ────────────────────────────────────────────────────────────────
// Cover — paper variant, dotted texture.
const Cover: Page = () => (
  <Sheet paper="dotted" variant="paper">
    <Eyebrow>Lab notebook · 01</Eyebrow>
    <div style={{ marginTop: 'auto' }}>
      <Scrawl size={132}>
        Small tools <Mark>win.</Mark>
      </Scrawl>
      <Underline width={420} />
      <p
        style={{
          fontFamily: body,
          fontSize: 30,
          color: 'var(--nb-muted)',
          marginTop: 28,
          maxWidth: 680,
        }}
      >
        Field notes from building in public.
      </p>
    </div>
    <div
      style={{
        position: 'absolute',
        right: 120,
        top: 300,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        transform: 'rotate(-6deg)',
      }}
    >
      <Star size={40} />
      <span style={{ fontFamily: hand, fontSize: 46, color: 'var(--nb-fg)' }}>ship friday</span>
    </div>
    <Footer />
  </Sheet>
);

// Notes — paper variant, ruled texture, checklist.
const Notes: Page = () => (
  <Sheet paper="ruled" variant="paper">
    <Tabs active="Notes" />
    <div style={{ marginTop: 52 }}>
      <Scrawl size={66}>To do</Scrawl>
      <Underline width={170} />
      <div style={{ marginTop: 44, display: 'flex', flexDirection: 'column', gap: 26 }}>
        <CheckItem done>ship the log parser</CheckItem>
        <CheckItem>fix retry edge case</CheckItem>
        <CheckItem>write the readme</CheckItem>
      </div>
      <div style={{ marginTop: 48, display: 'flex', alignItems: 'center', gap: 18 }}>
        <Arrow />
        <span style={{ fontFamily: hand, fontSize: 48, color: 'var(--nb-fg)' }}>
          then cut a release
        </span>
      </div>
    </div>
    <Footer />
  </Sheet>
);

// Experiments — ink variant, grid texture, a result.
const Experiments: Page = () => (
  <Sheet paper="grid" variant="ink">
    <Tabs active="Experiments" />
    <div style={{ marginTop: 52 }}>
      <Scrawl size={66}>Hypothesis</Scrawl>
      <p style={{ fontFamily: hand, fontSize: 50, color: 'var(--nb-fg)', margin: '14px 0 0' }}>
        batch writes <Arrow /> fewer round trips
      </p>
      <div style={{ marginTop: 56, display: 'flex', alignItems: 'baseline', gap: 24 }}>
        <span style={{ fontFamily: hand, fontSize: 54, color: 'var(--nb-fg)' }}>Result:</span>
        <span style={{ fontFamily: hand, fontSize: 78, color: 'var(--nb-fg)' }}>
          128ms <Mark>→ 74ms</Mark>
        </span>
      </div>
      <Underline width={460} />
      <div style={{ marginTop: 36, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Star />
        <span style={{ fontFamily: hand, fontSize: 48, color: 'var(--nb-fg)' }}>-42% latency</span>
      </div>
    </div>
    <Footer />
  </Sheet>
);

export const meta = {
  title: 'Lab Notebook — theme demo',
  canvasWidth: 1080,
  canvasHeight: 1080,
};

export default [Cover, Notes, Experiments];
