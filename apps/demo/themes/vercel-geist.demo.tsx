import { type DesignSystem, type Page, useSlidePageNumber } from '@open-frame/core';
import type { ReactNode } from 'react';

export const design: DesignSystem = {
  palette: { bg: '#ffffff', text: '#000000', accent: '#ff0080' },
  fonts: {
    display: "'Geist', 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
    body: "'Geist', 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  },
  typeScale: { hero: 176, body: 28 },
  radius: 12,
};

const palette = {
  bg: '#ffffff',
  text: '#000000',
  muted: '#666666',
  subtle: '#a1a1a1',
  border: '#eaeaea',
  surface: '#fafafa',
  surfaceAlt: '#f5f5f5',
  accent: '#0070f3',
  cyan: '#50e3c2',
  pink: '#ff0080',
  amber: '#f5a623',
  green: '#0cce6b',
  purple: '#7928ca',
};
const fontMono = "'Geist Mono', 'SF Mono', Menlo, Consolas, monospace";

const fill = {
  width: '100%',
  height: '100%',
  background: 'var(--osd-bg)',
  color: 'var(--osd-text)',
  fontFamily: 'var(--osd-font-body)',
  position: 'relative' as const,
  overflow: 'hidden' as const,
  boxSizing: 'border-box' as const,
};

// ── Fixed components (verbatim from themes/vercel-geist.md) ────────────────────
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

const Logo = ({ size = 28 }: { size?: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.5, color: 'var(--osd-text)' }}>
    <svg
      width={size * 0.95}
      height={size * 0.82}
      viewBox="0 0 76 65"
      style={{ display: 'block' }}
      aria-hidden
    >
      <path d="M37.53 0 75.06 65H0z" fill="currentColor" />
    </svg>
    <span style={{ fontSize: size, fontWeight: 700, letterSpacing: '-0.02em' }}>Vercel</span>
  </div>
);

const Eyebrow = ({ index, label }: { index: string; label: string }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      fontSize: 22,
      fontFamily: fontMono,
      color: palette.muted,
      letterSpacing: '0.02em',
    }}
  >
    <span style={{ width: 10, height: 10, borderRadius: '50%', background: palette.text }} />
    <span style={{ fontWeight: 600, color: palette.text }}>{index}</span>
    <span style={{ color: palette.border }}>—</span>
    <span>{label}</span>
  </div>
);

const Footer = ({
  label = "Next.js · partial pre-rendering & 'use cache'",
}: {
  label?: string;
}) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 56,
        left: 120,
        right: 120,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 20,
        fontFamily: fontMono,
        color: palette.subtle,
        borderTop: `1px solid ${palette.border}`,
        paddingTop: 22,
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: 2, background: palette.text }} />
        <span>{label}</span>
      </span>
      <span>
        {String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </span>
    </div>
  );
};

const Code = ({ children, fontSize = 20 }: { children: ReactNode; fontSize?: number }) => (
  <pre
    style={{
      margin: 0,
      padding: 24,
      background: palette.surface,
      border: `1px solid ${palette.border}`,
      borderRadius: 'var(--osd-radius)',
      fontFamily: fontMono,
      fontSize,
      lineHeight: 1.45,
      color: palette.text,
      overflow: 'hidden',
      whiteSpace: 'pre',
    }}
  >
    {children}
  </pre>
);

const kw = (s: string) => <span style={{ color: palette.pink }}>{s}</span>;
const fn = (s: string) => <span style={{ color: palette.accent }}>{s}</span>;
const com = (s: string) => <span style={{ color: palette.subtle, fontStyle: 'italic' }}>{s}</span>;
const tag = (s: string) => <span style={{ color: palette.accent }}>{s}</span>;

const GradientBar = () => (
  <div
    style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 6,
      background: `linear-gradient(90deg, ${palette.pink}, ${palette.purple}, ${palette.accent}, ${palette.purple}, ${palette.pink})`,
      backgroundSize: '300% 100%',
      animation: 'ppr-gradient-shift 7s ease-in-out infinite',
    }}
  />
);

// ── Demo pages ────────────────────────────────────────────────────────────────
const Cover: Page = () => {
  const { current, total } = useSlidePageNumber();
  return (
    <div
      style={{
        ...fill,
        padding: '0 120px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Style />
      <div style={{ position: 'absolute', top: 72, left: 120 }}>
        <Logo size={28} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 78,
          right: 120,
          fontSize: 22,
          fontFamily: fontMono,
          color: palette.muted,
        }}
      >
        Next.js · 2026
      </div>

      <div style={{ animation: 'ppr-fade-up 0.9s cubic-bezier(0.2,0.8,0.2,1) both' }}>
        <div
          style={{
            fontSize: 28,
            fontFamily: fontMono,
            color: palette.muted,
            marginBottom: 32,
            letterSpacing: '0.02em',
          }}
        >
          rendering, reimagined.
        </div>
        <h1
          style={{
            fontSize: 'var(--osd-size-hero)',
            fontWeight: 700,
            margin: 0,
            lineHeight: 0.92,
            letterSpacing: '-0.045em',
          }}
        >
          Partial
          <br />
          Pre-Rendering
        </h1>
        <div
          style={{
            marginTop: 48,
            fontSize: 38,
            color: palette.muted,
            fontWeight: 400,
            maxWidth: 1400,
            lineHeight: 1.4,
          }}
        >
          Plus{' '}
          <code
            style={{
              fontFamily: fontMono,
              color: palette.text,
              background: palette.surface,
              border: `1px solid ${palette.border}`,
              padding: '4px 14px',
              borderRadius: 10,
              fontSize: 32,
            }}
          >
            'use cache'
          </code>{' '}
          — the speed of static, the freshness of dynamic, in one request.
        </div>
      </div>

      <GradientBar />
      <div
        style={{
          position: 'absolute',
          bottom: 56,
          left: 120,
          right: 120,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          fontSize: 20,
          fontFamily: fontMono,
          color: palette.subtle,
        }}
      >
        <span style={{ color: palette.text, fontWeight: 600 }}>
          <span style={{ animation: 'ppr-blink 1.2s steps(1) infinite' }}>▍</span> ready when you
          are
        </span>
        <span>
          {String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};

const Concept: Page = () => {
  const Card = ({
    title,
    tag,
    color,
    pros,
    cons,
    delay,
  }: {
    title: string;
    tag: string;
    color: string;
    pros: string[];
    cons: string;
    delay: number;
  }) => (
    <div
      style={{
        flex: 1,
        background: palette.surface,
        border: `1px solid ${palette.border}`,
        borderRadius: 20,
        padding: 36,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        animation: `ppr-fade-up 0.7s cubic-bezier(0.2,0.8,0.2,1) ${delay}s both`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: color }} />
        <span
          style={{
            fontSize: 22,
            fontFamily: fontMono,
            color: palette.muted,
            letterSpacing: '0.04em',
          }}
        >
          {tag}
        </span>
      </div>
      <div style={{ fontSize: 52, fontWeight: 700, letterSpacing: '-0.02em' }}>{title}</div>
      <ul style={{ margin: 0, paddingLeft: 24, fontSize: 26, lineHeight: 1.5 }}>
        {pros.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <div
        style={{
          marginTop: 'auto',
          paddingTop: 16,
          borderTop: `1px dashed ${palette.border}`,
          fontSize: 22,
          color: palette.muted,
          fontFamily: fontMono,
        }}
      >
        ✕ {cons}
      </div>
    </div>
  );

  return (
    <div style={{ ...fill, padding: '120px 120px 0' }}>
      <Style />
      <div style={{ animation: 'ppr-fade-up 0.6s ease-out both' }}>
        <Eyebrow index="02" label="The old trade-off" />
        <h2
          style={{
            fontSize: 84,
            fontWeight: 700,
            margin: '28px 0 0',
            letterSpacing: '-0.035em',
            lineHeight: 1.0,
          }}
        >
          Static <span style={{ color: palette.muted }}>or</span> dynamic,
          <br />
          pick one?
        </h2>
        <p
          style={{
            fontSize: 'var(--osd-size-body)',
            color: palette.muted,
            margin: '24px 0 0',
            maxWidth: 1300,
            lineHeight: 1.5,
          }}
        >
          One route, one mode. Trade personalization for speed, or trade cache for freshness.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 32, marginTop: 48 }}>
        <Card
          title="Static"
          tag="SSG · ISR"
          color={palette.cyan}
          pros={['Edge CDN cache hits', 'Near-zero TTFB', 'Cheap and predictable']}
          cons="No personalization. Content goes stale."
          delay={0.15}
        />
        <Card
          title="Dynamic"
          tag="SSR · 'force-dynamic'"
          color={palette.pink}
          pros={['Recomputed per request', 'Reads cookies & headers', 'Always fresh']}
          cons="Slow. Hard to scale. Origin takes the hit."
          delay={0.3}
        />
      </div>

      <Footer />
    </div>
  );
};

const CodePage: Page = () => (
  <div style={{ ...fill, padding: '120px 120px 0' }}>
    <Style />
    <div style={{ animation: 'ppr-fade-up 0.6s ease-out both' }}>
      <Eyebrow index="03" label="In code" />
      <h2
        style={{
          fontSize: 88,
          fontWeight: 700,
          margin: '36px 0 0',
          letterSpacing: '-0.035em',
          lineHeight: 1.0,
        }}
      >
        Suspense is the boundary.
      </h2>
      <p
        style={{
          fontSize: 'var(--osd-size-body)',
          color: palette.muted,
          margin: '24px 0 0',
          maxWidth: 1300,
        }}
      >
        Inside the boundary: dynamic. Outside: static. Next.js walks the tree and decides.
      </p>
    </div>

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 0.8fr',
        gap: 48,
        marginTop: 56,
        alignItems: 'start',
      }}
    >
      <div style={{ animation: 'ppr-fade-up 0.7s ease-out 0.2s both' }}>
        <Code fontSize={20}>
          {com('// app/page.tsx')}
          {'\n'}
          {kw('export default function')} {fn('Page')}() {'{'}
          {'\n'}
          {'  '}
          {kw('return')} ({'\n'}
          {'    '}&lt;{tag('main')}&gt;{'\n'}
          {'      '}&lt;{tag('Header')} /&gt; {com('// static, prerendered')}
          {'\n'}
          {'\n'}
          {'      '}&lt;{tag('Suspense')} {fn('fallback')}={'{'}&lt;{tag('CartSkeleton')} /&gt;{'}'}
          &gt;{'\n'}
          {'        '}&lt;{tag('Cart')} /&gt; {com('// dynamic, streamed')}
          {'\n'}
          {'      '}&lt;/{tag('Suspense')}&gt;{'\n'}
          {'\n'}
          {'      '}&lt;{tag('Footer')} /&gt; {com('// static')}
          {'\n'}
          {'    '}&lt;/{tag('main')}&gt;{'\n'}
          {'  '});{'\n'}
          {'}'}
        </Code>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          animation: 'ppr-fade-up 0.7s ease-out 0.35s both',
        }}
      >
        <div
          style={{
            padding: '24px 28px',
            background: palette.surface,
            border: `1px solid ${palette.border}`,
            borderRadius: 14,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontFamily: fontMono,
              color: palette.cyan,
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            ◆ STATIC
          </div>
          <div style={{ fontSize: 26, lineHeight: 1.5 }}>
            Everything <em style={{ fontStyle: 'normal', fontWeight: 600 }}>outside</em> a Suspense
            boundary.
          </div>
        </div>
        <div
          style={{
            padding: '24px 28px',
            background: palette.surface,
            border: `1px solid ${palette.border}`,
            borderRadius: 14,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontFamily: fontMono,
              color: palette.pink,
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            ◇ DYNAMIC
          </div>
          <div style={{ fontSize: 26, lineHeight: 1.5 }}>
            The fallback is prerendered into the shell. The real content streams in.
          </div>
        </div>
        <div
          style={{
            padding: '20px 24px',
            background: palette.text,
            color: palette.bg,
            borderRadius: 14,
            fontSize: 22,
            fontFamily: fontMono,
            lineHeight: 1.5,
          }}
        >
          experimental.ppr = <span style={{ color: palette.cyan }}>'incremental'</span>
        </div>
      </div>
    </div>

    <Footer />
  </div>
);

export const meta = {
  title: 'Vercel Geist — theme demo',
};

export default [Cover, Concept, CodePage];
