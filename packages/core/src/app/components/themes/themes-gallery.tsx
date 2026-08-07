import { Palette } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocale } from '@/lib/use-locale';
import { resolveCanvas } from '../../lib/formats';
import { FramePageProvider } from '../../lib/page-context';
import { loadThemeDemo, type Theme, type ThemeDemoModule, themes } from '../../lib/themes';
import { FrameCanvas } from '../frame-canvas';
import { ThemeCardShell } from './theme-card';

export function ThemesGallery() {
  if (themes.length === 0) {
    return <ThemesEmptyState />;
  }

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(272px,100%),1fr))] items-start gap-5 md:grid-cols-[repeat(auto-fill,minmax(296px,1fr))]">
      {themes.map((theme) => (
        <li key={theme.id}>
          <ThemeCard theme={theme} />
        </li>
      ))}
    </ul>
  );
}

function ThemeCard({ theme }: { theme: Theme }) {
  const t = useLocale();
  const demo = useThemeDemo(theme);
  const pageCount = demo?.default.length ?? 0;
  const FirstPage = demo?.default[0];
  const canvas = demo ? resolveCanvas(demo.meta) : null;

  return (
    <ThemeCardShell
      to={`/themes/${encodeURIComponent(theme.id)}`}
      name={theme.name}
      description={theme.description}
      canvas={canvas}
    >
      {!theme.hasDemo ? (
        <NoDemoState />
      ) : FirstPage ? (
        <FrameCanvas flat freezeMotion design={demo?.design} canvas={canvas ?? undefined}>
          <FramePageProvider index={0} total={pageCount}>
            <FirstPage />
          </FramePageProvider>
        </FrameCanvas>
      ) : (
        <div className="grid h-full w-full place-items-center text-10 tracking-16 uppercase text-muted-foreground/60">
          {t.common.loading}
        </div>
      )}
    </ThemeCardShell>
  );
}

function NoDemoState() {
  const t = useLocale();
  return (
    <div className="grid h-full w-full place-items-center bg-muted/40 px-6 text-center">
      <div>
        <p className="font-heading text-12 font-semibold tracking-tight text-foreground/80">
          {t.themes.noDemoYet}
        </p>
        <p className="mt-1 text-10.5 leading-snug text-muted-foreground">
          {t.themes.noDemoHintPrefix}
          <code className="rounded-3 bg-card px-1 py-0.5 font-mono text-10 text-foreground">
            /create-theme
          </code>
          {t.themes.noDemoHintSuffix}
        </p>
      </div>
    </div>
  );
}

function ThemesEmptyState() {
  const t = useLocale();
  return (
    <div className="rounded-10 border border-dashed border-border bg-card/60 px-8 py-20">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <Palette className="size-6 text-muted-foreground" strokeWidth={1.75} />
        <p className="mt-3 font-heading text-15 font-semibold tracking-tight">
          {t.themes.noThemesTitle}
        </p>
        <p className="mt-1.5 text-13 leading-relaxed text-muted-foreground">
          {t.themes.noThemesHintPrefix}
          <code className="rounded-4 bg-muted px-1.5 py-0.5 font-mono text-11.5 text-foreground">
            /create-theme
          </code>
          {t.themes.noThemesHintSuffix}
        </p>
      </div>
    </div>
  );
}

function useThemeDemo(theme: Theme): ThemeDemoModule | null {
  const [demo, setDemo] = useState<ThemeDemoModule | null>(null);
  useEffect(() => {
    if (!theme.hasDemo) {
      setDemo(null);
      return;
    }
    let cancelled = false;
    loadThemeDemo(theme.id)
      .then((mod) => {
        if (!cancelled) setDemo(mod);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [theme.id, theme.hasDemo]);
  return demo;
}
