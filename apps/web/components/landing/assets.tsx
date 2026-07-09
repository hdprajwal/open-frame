import type { ReactNode } from 'react';

type AssetMock = { name: string; size: string; logo: string; themed?: boolean };

const assets: AssetMock[] = [
  { name: 'claude.svg', size: '3.4 KB', logo: 'claude' },
  { name: 'codex-dark.svg', size: '2.1 KB', logo: 'codex-dark' },
  { name: 'gemini.svg', size: '4.0 KB', logo: 'gemini' },
  { name: 'cursor-dark.svg', size: '5.2 KB', logo: 'cursor-dark' },
  { name: 'cloudflare.svg', size: '6.8 KB', logo: 'cloudflare' },
  { name: 'zeabur-dark.svg', size: '4.7 KB', logo: 'zeabur', themed: true },
];

const svglResults: { name: string; logo: string; themed?: boolean }[] = [
  { name: 'Vercel', logo: 'vercel', themed: true },
  { name: 'Cloudflare', logo: 'cloudflare' },
  { name: 'Zeabur', logo: 'zeabur', themed: true },
];

const callouts: { eyebrow: string; title: string; body: ReactNode }[] = [
  {
    eyebrow: 'drop · rename · replace',
    title: 'In-place file management.',
    body: 'Drag images straight into the deck. Rename and replace from the same pane the inspector uses to swap an element’s src.',
  },
  {
    eyebrow: 'svgl · 1500+ logos',
    title: 'Brand logos, no dance.',
    body: (
      <>
        Search{' '}
        <a
          href="https://svgl.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-ink underline underline-offset-4"
        >
          svgl
        </a>{' '}
        from inside the editor. Pick a result and the SVG lands in your assets folder, ready to{' '}
        <code className="font-mono text-ink">import</code>.
      </>
    ),
  },
];

export function Assets() {
  return (
    <section id="assets" className="relative">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12 sm:py-16 lg:py-22">
        <p className="caption mb-3">Assets</p>
        <h2 className="text-28 sm:text-34 font-light tracking-tight leading-1.15 mb-10 sm:mb-14">
          Drop in images. Pull in logos.
        </h2>

        <div className="grid grid-cols-1 lg:gap-12 items-start">
          {/* asset manager mock */}
          <AssetManagerMock />

          {/* side callouts */}
          <div className="flex gap-px bg-hairline border border-hairline rounded-12 overflow-hidden shadow-sm">
            {callouts.map((c) => (
              <div key={c.eyebrow} className="bg-canvas p-6 sm:p-7 flex flex-col gap-3">
                <span className="caption">{c.eyebrow}</span>
                <h3 className="text-20 font-medium leading-1.4">{c.title}</h3>
                <p className="text-14 leading-normal text-body">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AssetManagerMock() {
  return (
    <div className="relative rounded-12 border border-hairline bg-canvas overflow-hidden shadow-sm">
      {/* window header */}
      <div className="flex items-center px-4 sm:px-5 h-10 sm:h-11 border-b border-hairline font-mono text-12 text-body">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[#ff5f56]" />
          <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="size-2.5 rounded-full bg-[#27c93f]" />
        </div>
        <span className="flex-1 text-center">localhost:5173 · assets</span>
        <span className="w-10" />
      </div>

      {/* toolbar — slides/assets switcher + upload */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b border-hairline">
        <div className="relative inline-flex rounded-full border border-hairline bg-surface p-1">
          <span
            aria-hidden
            className="absolute top-1 bottom-1 left-1/2 right-1 rounded-full border border-brand bg-brand/15"
          />
          <span className="relative px-4 py-1.5 font-mono text-12 text-body">Slides</span>
          <span className="relative px-4 py-1.5 font-mono text-12 text-brand">Assets</span>
        </div>
        <span className="inline-flex items-center gap-2 rounded-8 border border-hairline bg-surface px-3.5 py-1.5 font-sans text-13 text-ink">
          <span className="text-brand">↑</span>
          Upload
        </span>
      </div>

      {/* grid */}
      <div className="relative">
        <div className="grid grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-5">
          {assets.map((a) => (
            <AssetCard key={a.name} asset={a} />
          ))}
        </div>

        {/* svgl Logo Search dialog */}
        <div className="absolute right-3 sm:right-5 bottom-3 sm:bottom-5 w-4/5 sm:w-[64%] max-w-420 rounded-8 border border-hairline bg-surface shadow-[0_10px_28px_-14px_rgba(0,0,0,0.35)] p-4">
          <div className="flex items-center justify-between mb-3 font-mono text-12 text-body">
            <span>Search svgl</span>
            <span className="text-mute">✕</span>
          </div>
          <div className="flex items-center gap-2 rounded-8 border border-hairline bg-canvas px-3 py-2 mb-3 font-mono text-13 text-ink">
            <span className="text-body">⌕</span>
            <span>vercel</span>
            <span className="caret" aria-hidden />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {svglResults.map((r, i) => (
              <div
                key={r.name}
                className={`rounded-8 border ${
                  i === 0 ? 'border-brand bg-brand/[0.06]' : 'border-hairline bg-canvas'
                } p-2 flex flex-col items-center gap-1.5`}
              >
                <div className="h-8 flex items-center justify-center">
                  <img
                    src={`/assets/${r.logo}${r.themed ? '-light' : ''}.svg`}
                    alt={r.name}
                    className="h-7 w-auto object-contain"
                  />
                </div>
                <span className="font-mono text-12 text-charcoal">{r.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AssetCard({ asset }: { asset: AssetMock }) {
  return (
    <div className="rounded-8 border border-hairline bg-surface overflow-hidden flex flex-col">
      <div
        className="h-20 sm:h-30 flex items-center justify-center"
        style={{
          background:
            'repeating-conic-gradient(color-mix(in srgb, var(--color-hairline) 70%, transparent) 0 25%, transparent 0 50%) 0 0 / 16px 16px',
        }}
      >
        <img
          src={`/assets/${asset.logo}${asset.themed ? '-light' : ''}.svg`}
          alt=""
          className="h-12 w-auto object-contain agent-mono"
        />
      </div>
      <div className="border-t border-hairline px-3 py-2">
        <div className="font-sans text-13 text-ink truncate" title={asset.name}>
          {asset.themed ? asset.name.replace('-dark', '-light') : asset.name}
        </div>
        <div className="font-mono text-12 text-body mt-0.5">{asset.size}</div>
      </div>
    </div>
  );
}
