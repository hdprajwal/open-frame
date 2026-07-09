import { type DesignSystem, type Page, useSlidePageNumber } from '@open-frame/core';

export const design: DesignSystem = {
  palette: { bg: '#0b0b0c', text: '#f4f4f6', accent: '#fc4c02' },
  fonts: {
    display: '"Inter Tight", "Inter", system-ui, -apple-system, sans-serif',
    body: '"Inter", system-ui, -apple-system, sans-serif',
  },
  typeScale: { hero: 112, body: 32 },
  radius: 16,
};

const mono = '"IBM Plex Mono", ui-monospace, "SF Mono", Menlo, monospace';
const muted = '#9a9aa0';
const dim = '#6a6a70';
const surface = '#161618';
const hairline = 'rgba(255,255,255,.10)';

const fill = {
  width: '100%',
  height: '100%',
  backgroundColor: 'var(--osd-bg)',
  backgroundImage: 'radial-gradient(rgba(255,255,255,.06) 1px, transparent 1px)',
  backgroundSize: '46px 46px',
  color: 'var(--osd-text)',
  fontFamily: 'var(--osd-font-body)',
  display: 'flex',
  flexDirection: 'column' as const,
  padding: 88,
  boxSizing: 'border-box' as const,
  position: 'relative' as const,
};

// ── Fixed components (verbatim from themes/builder-orange.md) ──────────────────
const Cube = ({ size = 260 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    fill="none"
    style={{ color: 'var(--osd-accent)' }}
    aria-hidden
  >
    <g stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round">
      <path d="M100 18 L168 56 L168 134 L100 172 L32 134 L32 56 Z" />
      <path d="M100 18 L100 95 M100 95 L168 56 M100 95 L32 56 M100 95 L100 172" />
      <path d="M66 37 L134 37 L168 56 M66 37 L66 114 M134 37 L134 114 M66 75 L134 75 M66 114 L134 114" />
    </g>
    <g fill="currentColor">
      <circle cx="100" cy="18" r="4" />
      <circle cx="168" cy="56" r="4" />
      <circle cx="32" cy="56" r="4" />
      <circle cx="100" cy="95" r="4" />
      <circle cx="100" cy="172" r="4" />
      <circle cx="168" cy="134" r="4" />
      <circle cx="32" cy="134" r="4" />
    </g>
  </svg>
);

const BrandMini = ({ ctx = 'building in public' }: { ctx?: string }) => {
  const { current } = useSlidePageNumber();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: '#ffffff',
            color: 'var(--osd-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: mono,
            fontWeight: 700,
            fontSize: 24,
          }}
        >
          PH
        </div>
        <span style={{ fontFamily: 'var(--osd-font-display)', fontWeight: 700, fontSize: 26 }}>
          Prajwal HD
        </span>
      </div>
      <span style={{ fontFamily: mono, fontSize: 20, color: muted }}>
        {ctx} / {String(current).padStart(2, '0')}
      </span>
    </div>
  );
};

const Title = ({ children, size = 112 }: { children: React.ReactNode; size?: number }) => (
  <h1
    style={{
      fontFamily: 'var(--osd-font-display)',
      fontWeight: 800,
      fontSize: size,
      lineHeight: 1.0,
      letterSpacing: '-0.035em',
      margin: 0,
      color: 'var(--osd-text)',
    }}
  >
    {children}
  </h1>
);

const Em = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: 'var(--osd-accent)' }}>{children}</span>
);

const Footer = ({ chips = [], src }: { chips?: string[]; src?: React.ReactNode }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginTop: 'auto',
      gap: 32,
    }}
  >
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
      {chips.map((c) => (
        <span
          key={c}
          style={{
            fontFamily: mono,
            fontSize: 19,
            color: muted,
            border: `1px solid ${hairline}`,
            background: 'rgba(255,255,255,.05)',
            borderRadius: 100,
            padding: '9px 18px',
          }}
        >
          {c}
        </span>
      ))}
    </div>
    <div
      style={{ fontFamily: mono, fontSize: 22, color: dim, textAlign: 'right', lineHeight: 1.4 }}
    >
      {src ?? (
        <>
          Prajwal HD
          <br />
          hdprajwal.dev
        </>
      )}
    </div>
  </div>
);

const Callout = ({ value, children }: { value: string; children: React.ReactNode }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      background: surface,
      border: `1px solid ${hairline}`,
      borderLeft: '4px solid var(--osd-accent)',
      borderRadius: 14,
      padding: '22px 28px',
    }}
  >
    <span
      style={{
        fontFamily: mono,
        fontSize: 34,
        fontWeight: 600,
        color: 'var(--osd-accent)',
        flexShrink: 0,
      }}
    >
      {value}
    </span>
    <span style={{ fontSize: 24, color: muted, lineHeight: 1.35 }}>{children}</span>
  </div>
);

const Terminal = ({
  children,
  title = 'builder@prajwalhd: ~',
}: {
  children: React.ReactNode;
  title?: string;
}) => (
  <div
    style={{
      background: surface,
      border: `1px solid ${hairline}`,
      borderRadius: 16,
      overflow: 'hidden',
      fontFamily: mono,
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '14px 18px',
        borderBottom: `1px solid ${hairline}`,
      }}
    >
      <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }} />
      <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
      <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
      <span style={{ flex: 1, textAlign: 'center', fontSize: 18, color: dim }}>{title}</span>
    </div>
    <div
      style={{
        padding: '22px 24px',
        fontSize: 24,
        lineHeight: 1.75,
        color: '#d6d6da',
        whiteSpace: 'pre',
      }}
    >
      {children}
    </div>
  </div>
);

// ── Demo pages ────────────────────────────────────────────────────────────────
const Cover: Page = () => (
  <div style={fill}>
    <BrandMini ctx="building in public" />
    <div style={{ marginTop: 'auto' }}>
      <Title size={112}>
        Building
        <br />
        <Em>AI infra</Em>
        <br />
        that ships.
      </Title>
      <p style={{ fontSize: 32, color: muted, marginTop: 28, maxWidth: 720 }}>
        Notes from a builder who loves systems.
      </p>
    </div>
    <div style={{ position: 'absolute', right: 88, bottom: 210, opacity: 0.9 }}>
      <Cube size={240} />
    </div>
    <Footer chips={['tools', 'infra', 'shipping']} />
  </div>
);

const Content: Page = () => (
  <div style={fill}>
    <BrandMini ctx="building in public" />
    <div style={{ marginTop: 64 }}>
      <Title size={66}>
        The demo was
        <br />
        easy. <Em>Shipping</Em>
        <br />
        was the work.
      </Title>
      <p style={{ fontSize: 30, color: muted, lineHeight: 1.5, marginTop: 28, maxWidth: 820 }}>
        A weekend prototype runs once. Production runs every minute, for everyone, while you sleep.
      </p>
      <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Terminal>
          <span style={{ color: 'var(--osd-accent)' }}>$</span> ./infra run --watch{'\n'}
          <span style={{ color: '#27c93f' }}>✓</span> All systems go. p99 128ms
        </Terminal>
        <Callout value="0.02%">error rate after the boring parts were finally handled.</Callout>
      </div>
    </div>
    <Footer chips={['backend', 'reliability']} />
  </div>
);

const Closer: Page = () => (
  <div style={fill}>
    <BrandMini ctx="building in public" />
    <div style={{ marginTop: 'auto' }}>
      <Title size={108}>
        Save this
        <br />
        for the <Em>next</Em>
        <br />
        build.
      </Title>
      <p style={{ fontSize: 30, color: muted, marginTop: 28, maxWidth: 680 }}>
        I build, ship, and explain useful tools.
      </p>
    </div>
    <div style={{ position: 'absolute', right: 88, bottom: 210, opacity: 0.9 }}>
      <Cube size={240} />
    </div>
    <Footer
      chips={['follow']}
      src={
        <>
          Prajwal HD
          <br />
          @hdprajwal
        </>
      }
    />
  </div>
);

export const meta = {
  title: 'Builder Orange — theme demo',
  canvasWidth: 1080,
  canvasHeight: 1080,
};

export default [Cover, Content, Closer];
