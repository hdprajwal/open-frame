import config from 'virtual:open-frame/config';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  Crosshair,
  Download,
  FileCode2,
  FileImage,
  FileText,
  Image,
  Link2,
  Loader2,
  Maximize,
  MonitorSpeaker,
  MoreHorizontal,
  Play,
  Presentation,
} from 'lucide-react';
import { type RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AgentPresenceDot } from '@/components/agent-presence-dot';
import { AssetView } from '@/components/asset-view';
import { HistoryProvider } from '@/components/history-provider';
import { CommentWidget } from '@/components/inspector/comment-widget';
import { InspectOverlay } from '@/components/inspector/inspect-overlay';
import { InspectorPanel } from '@/components/inspector/inspector-panel';
import {
  InspectorProvider,
  InspectToggleButton,
  useInspector,
} from '@/components/inspector/inspector-provider';
import { SaveBar } from '@/components/inspector/save-bar';
import { DesignProvider } from '@/components/style-panel/design-provider';
import { DesignPanel, DesignToggleButton } from '@/components/style-panel/style-panel';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFolders } from '@/lib/folders';
import { useAgentPresence } from '@/lib/use-agent-presence';
import { useClickPageNavigation } from '@/lib/use-click-page-navigation';
import { useExternalEdits, useFrameEditFlash } from '@/lib/use-external-edits';
import { useFollowAgentEdits } from '@/lib/use-follow-agent-edits';
import { useIsMobile } from '@/lib/use-is-mobile';
import { format, useLocale } from '@/lib/use-locale';
import { useWheelPageNavigation } from '@/lib/use-wheel-page-navigation';
import { cn } from '@/lib/utils';
import { FrameCanvas } from '../components/frame-canvas';
import { FrameTransitionLayer } from '../components/frame-transition-layer';
import { NotesDrawer } from '../components/notes-drawer';
import { OverviewGrid } from '../components/overview-grid';
import { PdfProgressToast } from '../components/pdf-progress-toast';
import { openPresenterWindow, Player } from '../components/player';
import { PngProgressToast } from '../components/png-progress-toast';
import { PptxProgressToast } from '../components/pptx-progress-toast';
import { type ThumbnailActions, ThumbnailRail } from '../components/thumbnail-rail';
import { exportFrameAsHtml } from '../lib/export-html';
import { exportFrameAsPdf, isSafari } from '../lib/export-pdf';
import { exportFrameAsPng } from '../lib/export-png';
import { exportFrameAsImagePptx } from '../lib/export-pptx';
import { type CanvasSize, FORMAT_PRESETS, resolveCanvas } from '../lib/formats';
import { remapNotesSessionCacheAfterReorder } from '../lib/inspector/use-notes';
import type { FrameModule } from '../lib/sdk';
import { useFrameModule } from '../lib/use-frame-module';
import { usePrefersReducedMotion } from '../lib/use-prefers-reduced-motion';

const { showFrameUi, showFrameBrowser, allowHtmlDownload } = config.build;

export function Frame() {
  const { frameId = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { frame, error } = useFrameModule(frameId);
  const [playMode, setPlayMode] = useState<'window' | 'fullscreen' | null>(null);
  const [exporting, setExporting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const linkCopiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [designOpen, setDesignOpen] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (linkCopiedTimerRef.current) clearTimeout(linkCopiedTimerRef.current);
    };
  }, []);
  const { renameFrame } = useFolders();
  const navigate = useNavigate();
  const [followEdits, setFollowEdits] = useFollowAgentEdits();
  const { latest: latestEdit } = useExternalEdits();
  const editFlash = useFrameEditFlash(frameId);
  const frameViewportRef = useRef<HTMLElement>(null);
  const t = useLocale();
  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();

  const modulePages = useMemo(() => frame?.default ?? [], [frame]);
  const canvas = useMemo(
    () => (frame ? resolveCanvas(frame.meta, frameId) : FORMAT_PRESETS.slide),
    [frame, frameId],
  );
  const [pages, setPages] = useState<typeof modulePages>(modulePages);
  useEffect(() => {
    setPages(modulePages);
  }, [modulePages]);
  const pageCount = pages.length;
  const rawIndex = Number(searchParams.get('p') ?? '1') - 1;
  const index = Number.isFinite(rawIndex) ? Math.max(0, Math.min(pageCount - 1, rawIndex)) : 0;
  const view = searchParams.get('view') === 'assets' ? 'assets' : 'frames';

  useEffect(() => {
    if (!import.meta.hot) return;
    if (!frameId || !frame || pageCount === 0) return;
    import.meta.hot.send('open-frame:current', {
      frameId,
      pageIndex: index,
      totalPages: pageCount,
      frameTitle: frame.meta?.title ?? frameId,
      view,
    });
  }, [frameId, index, pageCount, frame, view]);

  // Unclamped, because an edit that adds a page lands here before the reloaded
  // module has grown — clamping would strand you on the old last page.
  const setPageParam = useCallback(
    (i: number) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('p', String(i + 1));
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const goTo = useCallback(
    (i: number) => {
      setPageParam(Math.max(0, Math.min(pageCount - 1, i)));
    },
    [pageCount, setPageParam],
  );

  // Follow mode jumps to whatever the agent just touched, but never while you
  // are presenting — losing your place mid-talk is worse than missing an edit.
  useEffect(() => {
    if (!followEdits || !latestEdit || playMode) return;
    if (latestEdit.frameId !== frameId) {
      const page = latestEdit.pageIndex === null ? '' : `?p=${latestEdit.pageIndex + 1}`;
      navigate(`/f/${encodeURIComponent(latestEdit.frameId)}${page}`);
      return;
    }
    if (latestEdit.pageIndex !== null) setPageParam(latestEdit.pageIndex);
  }, [followEdits, latestEdit, playMode, frameId, navigate, setPageParam]);

  const reorderPage = useCallback(
    async (from: number, to: number) => {
      if (from === to) return;
      const before = pages;
      const nextPages = [...before];
      const [moved] = nextPages.splice(from, 1);
      nextPages.splice(to, 0, moved);
      setPages(nextPages);

      const order = before.map((_, i) => i);
      const [movedIdx] = order.splice(from, 1);
      order.splice(to, 0, movedIdx);

      remapNotesSessionCacheAfterReorder(frameId, order);

      // Keep the user looking at the same page they were on before the drag.
      let nextIndex = index;
      if (index === from) nextIndex = to;
      else if (from < index && to >= index) nextIndex = index - 1;
      else if (from > index && to <= index) nextIndex = index + 1;
      if (nextIndex !== index) goTo(nextIndex);

      try {
        const res = await fetch(`/__frames/${encodeURIComponent(frameId)}/reorder`, {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ order }),
        });
        if (!res.ok) {
          const detail = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(detail.error ?? `HTTP ${res.status}`);
        }
      } catch (err) {
        setPages(before);
        const inverse = order.map((_, i) => order.indexOf(i));
        remapNotesSessionCacheAfterReorder(frameId, inverse);
        toast.error(`Reorder failed: ${String((err as Error).message ?? err)}`);
      }
    },
    [pages, index, frameId, goTo],
  );

  const duplicatePage = useCallback(
    async (i: number) => {
      const before = pages;
      if (i < 0 || i >= before.length) return;
      const nextPages = [...before];
      nextPages.splice(i + 1, 0, before[i]);
      setPages(nextPages);
      if (index > i) goTo(index + 1);

      try {
        const res = await fetch(`/__frames/${encodeURIComponent(frameId)}/pages/${i}/duplicate`, {
          method: 'POST',
        });
        if (!res.ok) {
          const detail = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(detail.error ?? `HTTP ${res.status}`);
        }
        toast.success(format(t.thumbnailRail.toastDuplicated, { n: i + 1 }));
      } catch (err) {
        setPages(before);
        toast.error(
          `${t.thumbnailRail.toastDuplicateFailed}: ${String((err as Error).message ?? err)}`,
        );
      }
    },
    [pages, index, frameId, goTo, t.thumbnailRail],
  );

  const deletePage = useCallback(
    async (i: number) => {
      const before = pages;
      if (i < 0 || i >= before.length || before.length <= 1) return;
      const nextPages = before.slice(0, i).concat(before.slice(i + 1));
      setPages(nextPages);
      if (index >= i && index > 0) {
        const target = index === i ? Math.min(index, nextPages.length - 1) : index - 1;
        goTo(target);
      }

      try {
        const res = await fetch(`/__frames/${encodeURIComponent(frameId)}/pages/${i}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          const detail = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(detail.error ?? `HTTP ${res.status}`);
        }
        toast.success(format(t.thumbnailRail.toastDeleted, { n: i + 1 }));
      } catch (err) {
        setPages(before);
        toast.error(
          `${t.thumbnailRail.toastDeleteFailed}: ${String((err as Error).message ?? err)}`,
        );
      }
    },
    [pages, index, frameId, goTo, t.thumbnailRail],
  );

  const thumbnailActions = useMemo<ThumbnailActions | undefined>(
    () =>
      import.meta.env.DEV
        ? {
            onDuplicate: duplicatePage,
            onDelete: deletePage,
          }
        : undefined,
    [duplicatePage, deletePage],
  );

  useEffect(() => {
    if (playMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.matches('input, textarea')) return;
      // Letter shortcuts only fire bare so browser combos (Cmd/Ctrl-P, ⌘F…) stay intact.
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      // Toggle overview from either state — the overview's own capture-phase
      // handler doesn't consume O, so this stays consistent open ↔ closed.
      if (e.key === 'o' || e.key === 'O') {
        e.preventDefault();
        setOverviewOpen((v) => !v);
        return;
      }
      // Once overview owns focus, swallow everything else here — its
      // capture-phase listener drives the focused thumbnail.
      if (overviewOpen) return;
      if (
        e.key === 'ArrowRight' ||
        e.key === 'ArrowDown' ||
        e.key === ' ' ||
        e.key === 'PageDown'
      ) {
        e.preventDefault();
        goTo(index + 1);
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goTo(index - 1);
        return;
      }
      if (e.key === 'f' || e.key === 'F') {
        setPlayMode('fullscreen');
      } else if (e.key === 'Enter') {
        setPlayMode('window');
      } else if (e.key === 'p' || e.key === 'P') {
        if (frameId) openPresenterWindow(frameId);
        setPlayMode('window');
      } else if (import.meta.env.DEV && (e.key === 'd' || e.key === 'D')) {
        setDesignOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, goTo, playMode, frameId, overviewOpen]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-16 text-muted-foreground">
        {showFrameBrowser && (
          <Link to="/" className="text-12 font-medium text-foreground/70 hover:text-foreground">
            ← {t.common.home}
          </Link>
        )}
        <span className="mt-6 block eyebrow text-destructive/80">{t.common.loadFailed}</span>
        <h2 className="mt-2 font-heading text-xl font-semibold tracking-tight text-foreground">
          {t.common.failedToLoadFrame}
        </h2>
        <pre className="mt-4 overflow-auto rounded-6 border border-border bg-card p-4 text-11.5 leading-relaxed whitespace-pre-wrap shadow-edge">
          {error}
        </pre>
      </div>
    );
  }

  if (!frame) {
    return (
      <div className="grid min-h-dvh place-items-center px-8 text-muted-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-px w-56 overflow-hidden bg-hairline">
            <span
              aria-hidden
              className="line-loader-bar absolute inset-y-[-0.5px] left-0 w-1/4 bg-foreground"
            />
          </div>
          <div className="flex flex-wrap items-baseline justify-center gap-x-2 text-11.5">
            <span className="eyebrow">{t.frame.loadingEyebrow}</span>
            <span className="font-mono">{frameId}</span>
          </div>
        </div>
      </div>
    );
  }

  if (pageCount === 0) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-16 text-muted-foreground">
        {showFrameBrowser && (
          <Link to="/" className="text-12 font-medium text-foreground/70 hover:text-foreground">
            ← {t.common.home}
          </Link>
        )}
        <span className="mt-6 block eyebrow">{t.frame.emptyEyebrow}</span>
        <h2 className="mt-2 font-heading text-xl font-semibold tracking-tight text-foreground">
          {t.frame.nothingToShow}
        </h2>
        <p className="mt-3 text-13 leading-relaxed">
          <code className="rounded-4 bg-muted px-1.5 py-0.5 font-mono text-11.5">
            frames/{frameId}/index.tsx
          </code>
          {t.frame.emptyHintMust}
          <code className="rounded-4 bg-muted px-1.5 py-0.5 font-mono text-11.5">
            export default
          </code>
          {t.frame.emptyHintSuffix}
        </p>
      </div>
    );
  }

  if (!showFrameUi) {
    return (
      <Player
        pages={pages}
        design={frame.design}
        index={index}
        onIndexChange={goTo}
        onExit={() => {}}
        allowExit={false}
        canvas={canvas}
      />
    );
  }

  if (playMode) {
    return (
      <Player
        pages={pages}
        design={frame.design}
        transition={frame.transition}
        index={index}
        onIndexChange={goTo}
        onExit={() => setPlayMode(null)}
        controls
        frameId={frameId}
        fullscreen={playMode === 'fullscreen'}
        canvas={canvas}
      />
    );
  }

  const title = frame.meta?.title ?? frameId;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t.frame.toastCopyLinkSuccess);
      setLinkCopied(true);
      if (linkCopiedTimerRef.current) clearTimeout(linkCopiedTimerRef.current);
      linkCopiedTimerRef.current = setTimeout(() => setLinkCopied(false), 1200);
    } catch (err) {
      console.error('[open-frame] copy link failed', err);
      toast.error(t.frame.toastCopyLinkFailed);
    }
  };

  const exportHtml = async () => {
    if (!frame || exporting) return;
    setExporting(true);
    try {
      await exportFrameAsHtml(frame, frameId);
    } catch (err) {
      console.error('[open-frame] export failed', err);
    } finally {
      setExporting(false);
    }
  };

  const exportPng = async () => {
    if (!frame || exporting) return;
    setExporting(true);
    const toastId = `png-export-${frameId}`;
    toast.custom(
      () => (
        <PngProgressToast
          progress={{ phase: 'processing', current: 0, total: pages.length, percent: 0 }}
        />
      ),
      { id: toastId, duration: Infinity },
    );
    try {
      await exportFrameAsPng(frame, frameId, (p) => {
        toast.custom(() => <PngProgressToast progress={p} />, { id: toastId, duration: Infinity });
      });
      toast.dismiss(toastId);
    } catch (err) {
      console.error('[open-frame] png export failed', err);
      // The error toast must not reuse toastId: sonner keeps rendering a custom
      // toast's JSX when updated by id, so the error text would never paint.
      toast.dismiss(toastId);
      toast.error(t.frame.pngExportFailed, { duration: 4000 });
    } finally {
      setExporting(false);
    }
  };

  const exportPdf = async () => {
    if (!frame || exporting) return;
    if (isSafari()) {
      toast.error(t.frame.pdfExportSafariUnsupported, { duration: 5000 });
      return;
    }
    setExporting(true);
    const toastId = `pdf-export-${frameId}`;
    toast.custom(
      () => (
        <PdfProgressToast
          progress={{ phase: 'processing', current: 0, total: pages.length, percent: 0 }}
        />
      ),
      { id: toastId, duration: Infinity },
    );
    try {
      await exportFrameAsPdf(frame, frameId, (p) => {
        toast.custom(() => <PdfProgressToast progress={p} />, { id: toastId, duration: Infinity });
      });
    } catch (err) {
      console.error('[open-frame] pdf export failed', err);
      toast.error(t.frame.pdfExportFailed, { id: toastId, duration: 4000 });
    } finally {
      setExporting(false);
      toast.dismiss(toastId);
    }
  };

  const exportImagePptx = async () => {
    if (!frame || exporting) return;
    setExporting(true);
    const toastId = `pptx-export-${frameId}`;
    toast.custom(
      () => (
        <PptxProgressToast
          progress={{ phase: 'processing', current: 0, total: pages.length, percent: 0 }}
        />
      ),
      { id: toastId, duration: Infinity },
    );
    try {
      await exportFrameAsImagePptx(frame, frameId, (p) => {
        toast.custom(() => <PptxProgressToast progress={p} />, { id: toastId, duration: Infinity });
      });
    } catch (err) {
      console.error('[open-frame] image pptx export failed', err);
      toast.error(t.frame.imagePptxExportFailed, { id: toastId, duration: 4000 });
    } finally {
      setExporting(false);
      toast.dismiss(toastId);
    }
  };

  const exportMenuItems = (
    <>
      <DropdownMenuItem disabled={exporting} onSelect={exportHtml}>
        <FileCode2 />
        {t.frame.exportAsHtml}
      </DropdownMenuItem>
      <DropdownMenuItem disabled={exporting} onSelect={exportPng}>
        <Image />
        {t.frame.exportAsPng}
      </DropdownMenuItem>
      <DropdownMenuItem disabled={exporting} onSelect={exportPdf}>
        <FileText />
        {t.frame.exportAsPdf}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem disabled={exporting} onSelect={exportImagePptx}>
        <FileImage />
        {t.frame.exportAsImagePptx}
      </DropdownMenuItem>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              aria-disabled
              className="relative flex cursor-help items-center justify-between gap-2 rounded-5 px-2 py-1.5 text-12.5 opacity-45 select-none [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:opacity-80"
            >
              <span className="flex items-center gap-2">
                <Presentation />
                {t.frame.exportAsPptx}
              </span>
              <span className="rounded-3 bg-muted px-1.5 py-0.5 font-mono text-9.5 tracking-4 text-muted-foreground">
                {t.frame.comingSoon}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="left"
            className="w-max max-w-[min(520px,calc(100vw-2rem))] text-center leading-relaxed"
          >
            {t.frame.pptxComingSoonTooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );

  return (
    <HistoryProvider>
      <InspectorProvider frameId={frameId} pageIndex={index}>
        <SelectionReporter />
        <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
          {/* Editorial toolbar — three zones, hairline separators, mono-folio center */}
          <header className="relative flex h-12 shrink-0 items-center gap-2 border-b border-hairline bg-sidebar/85 px-2 backdrop-blur-md md:px-3">
            <div className="flex flex-1 items-center gap-1.5 md:flex-none md:gap-2">
              {showFrameBrowser && (
                <Button asChild variant="ghost" size="icon-sm" title={t.frame.home}>
                  <Link to="/" aria-label={t.frame.backToHome}>
                    <ChevronLeft className="size-4" />
                  </Link>
                </Button>
              )}
              <span aria-hidden className="mx-0.5 hidden h-5 w-px bg-hairline md:block" />
              {import.meta.env.DEV && (
                <Tabs
                  value={view}
                  onValueChange={(next) => {
                    setSearchParams(
                      (prev) => {
                        const params = new URLSearchParams(prev);
                        if (next === 'assets') params.set('view', 'assets');
                        else params.delete('view');
                        return params;
                      },
                      { replace: true },
                    );
                  }}
                >
                  <TabsList>
                    <TabsTrigger value="frames">{t.frame.framesTab}</TabsTrigger>
                    <TabsTrigger value="assets">{t.frame.assetsTab}</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
              {import.meta.env.DEV && <AgentPresenceBadge />}
              {import.meta.env.DEV && view === 'frames' && (
                <FollowEditsToggle
                  active={followEdits}
                  onToggle={() => setFollowEdits(!followEdits)}
                />
              )}
            </div>

            {/* On md+ the title centers to the viewport via absolute positioning. On mobile the
                two side groups each flex-1, so the in-flow title lands at the viewport center too —
                and min-w-0 lets it truncate instead of overlapping the icons on narrow widths. */}
            <div className="pointer-events-none relative flex min-w-0 justify-center px-2 md:absolute md:inset-x-0">
              <div className="pointer-events-auto min-w-0 max-w-[34rem]">
                <InlineTitleEditor title={title} onSubmit={(next) => renameFrame(frameId, next)} />
              </div>
            </div>

            <div className="flex flex-1 items-center justify-end gap-1 md:ml-auto md:flex-none">
              {view === 'frames' && (
                <button
                  type="button"
                  aria-label={t.frame.copyLink}
                  title={t.frame.copyLink}
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
                    'hidden md:inline-flex',
                  )}
                  onClick={copyLink}
                >
                  <span className="relative grid size-4 place-items-center">
                    <Link2
                      className={cn(
                        'col-start-1 row-start-1 size-4 transition-opacity duration-200',
                        linkCopied ? 'opacity-0' : 'opacity-100',
                      )}
                    />
                    <Check
                      className={cn(
                        'col-start-1 row-start-1 size-4 transition-opacity duration-200',
                        linkCopied ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                  </span>
                </button>
              )}
              {view === 'frames' && allowHtmlDownload && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    type="button"
                    disabled={exporting}
                    aria-label={t.frame.download}
                    title={t.frame.download}
                    className={cn(
                      buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
                      'hidden md:inline-flex',
                    )}
                  >
                    {exporting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Download className="size-4" />
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[200px]">
                    {exportMenuItems}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {view === 'frames' && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    type="button"
                    disabled={exporting}
                    aria-label={t.frame.moreActions}
                    title={t.frame.moreActions}
                    className={cn(
                      buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
                      'inline-flex md:hidden',
                    )}
                  >
                    {exporting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <MoreHorizontal className="size-4" />
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[200px]">
                    <DropdownMenuItem onSelect={copyLink}>
                      <Link2 />
                      {t.frame.copyLink}
                    </DropdownMenuItem>
                    {allowHtmlDownload && <DropdownMenuSeparator />}
                    {allowHtmlDownload && exportMenuItems}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {view === 'frames' && (
                <DesignToggleButton active={designOpen} onToggle={() => setDesignOpen((v) => !v)} />
              )}
              {view === 'frames' && <InspectToggleButton />}
              <span aria-hidden className="mx-0.5 hidden h-5 w-px bg-hairline md:block" />
              {view === 'frames' && (
                <div className="inline-flex items-stretch">
                  <Button
                    size="sm"
                    variant="brand"
                    onClick={() => setPlayMode(isMobile ? 'window' : 'fullscreen')}
                    className="px-2.5 md:rounded-r-none md:px-3"
                  >
                    <Play className="size-3.5 fill-current" />
                    <span className="hidden md:inline">{t.frame.present}</span>
                    <kbd className="ml-1 hidden rounded-3 bg-brand-foreground/15 px-1 font-mono text-9.5 tracking-4 md:inline">
                      F
                    </kbd>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      type="button"
                      aria-label={t.frame.presentMenuAria}
                      title={t.frame.presentMenuAria}
                      className={cn(
                        buttonVariants({ variant: 'brand', size: 'sm' }),
                        'hidden rounded-l-none px-1.5 shadow-[inset_1px_0_0_oklch(0_0_0/0.12),inset_0_1px_0_oklch(1_0_0/0.18),0_1px_0_oklch(0_0_0/0.16)] md:inline-flex',
                      )}
                    >
                      <ChevronDown className="size-3.5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[200px]">
                      <DropdownMenuItem onSelect={() => setPlayMode('window')}>
                        <Play />
                        {t.frame.presentInWindow}
                        <DropdownMenuShortcut>↵</DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setPlayMode('fullscreen')}>
                        <Maximize />
                        {t.frame.presentFullscreen}
                        <DropdownMenuShortcut>F</DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => {
                          if (frameId) openPresenterWindow(frameId);
                          setPlayMode('window');
                        }}
                      >
                        <MonitorSpeaker />
                        {t.frame.presentPresenter}
                        <DropdownMenuShortcut>P</DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </header>

          {view === 'assets' ? (
            <div className="min-h-0 flex-1">
              <AssetView frameId={frameId} />
            </div>
          ) : (
            <DesignProvider frameId={frameId}>
              <div className="relative flex min-h-0 flex-1 flex-col">
                <div className="flex min-h-0 flex-1 flex-col md:flex-row">
                  <ResizableRail
                    pages={pages}
                    design={frame.design}
                    current={index}
                    onSelect={goTo}
                    onReorder={import.meta.env.DEV ? reorderPage : undefined}
                    actions={thumbnailActions}
                    moduleTransition={frame.transition}
                    onOverview={() => setOverviewOpen(true)}
                    canvas={canvas}
                  />
                  <main
                    ref={frameViewportRef}
                    data-inspector-root
                    data-frame-id={frameId}
                    className="paper relative min-h-0 min-w-0 flex-1 bg-canvas p-2 md:p-10"
                  >
                    <FrameViewportNavigation
                      targetRef={frameViewportRef}
                      onPrev={() => goTo(index - 1)}
                      onNext={() => goTo(index + 1)}
                      canPrev={index > 0}
                      canNext={index < pageCount - 1}
                    />
                    <FrameCanvas design={frame.design} canvas={canvas}>
                      <FrameTransitionLayer
                        pages={pages}
                        index={index}
                        total={pageCount}
                        moduleTransition={frame.transition}
                        disabled={prefersReducedMotion}
                      />
                    </FrameCanvas>
                    <InspectOverlay />
                    <SaveBar />
                    {import.meta.env.DEV && <CommentWidget />}
                    {editFlash !== null && <span key={editFlash} className="edit-flash" />}
                  </main>
                  {/* Mobile-only horizontal rail. Sits below the canvas and
                    pads its bottom for the iOS home indicator / Safari URL bar. */}
                  <div
                    className="shrink-0 border-t border-hairline md:hidden"
                    style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                  >
                    <ThumbnailRail
                      pages={pages}
                      design={frame.design}
                      current={index}
                      onSelect={goTo}
                      orientation="horizontal"
                      actions={thumbnailActions}
                      canvas={canvas}
                    />
                  </div>
                  <InspectorPanel />
                  <DesignPanel open={designOpen} onClose={() => setDesignOpen(false)} />
                </div>
                {import.meta.env.DEV && (
                  <NotesDrawer
                    frameId={frameId}
                    index={index}
                    total={pageCount}
                    initial={frame.notes?.[index]}
                  />
                )}
                <OverviewGrid
                  pages={pages}
                  design={frame.design}
                  open={overviewOpen}
                  current={index}
                  onClose={() => setOverviewOpen(false)}
                  onSelect={goTo}
                  variant="editor"
                  moduleTransition={frame.transition}
                  canvas={canvas}
                />
              </div>
            </DesignProvider>
          )}
        </div>
      </InspectorProvider>
    </HistoryProvider>
  );
}

const RAIL_WIDTH_STORAGE_KEY = 'open-frame:thumbnail-rail-width';
const DEFAULT_RAIL_WIDTH = 264;
const MIN_RAIL_WIDTH = 200;
const MAX_RAIL_WIDTH = 480;

function readStoredRailWidth(): number {
  if (typeof window === 'undefined') return DEFAULT_RAIL_WIDTH;
  const raw = window.localStorage.getItem(RAIL_WIDTH_STORAGE_KEY);
  const parsed = raw == null ? Number.NaN : Number(raw);
  if (!Number.isFinite(parsed)) return DEFAULT_RAIL_WIDTH;
  return Math.min(MAX_RAIL_WIDTH, Math.max(MIN_RAIL_WIDTH, parsed));
}

function ResizableRail(props: {
  pages: FrameModule['default'];
  design?: FrameModule['design'];
  current: number;
  onSelect: (i: number) => void;
  onReorder?: (from: number, to: number) => void;
  actions?: ThumbnailActions;
  moduleTransition?: FrameModule['transition'];
  onOverview?: () => void;
  canvas?: CanvasSize;
}) {
  const t = useLocale();
  const [width, setWidth] = useState<number>(readStoredRailWidth);
  const [resizing, setResizing] = useState(false);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(RAIL_WIDTH_STORAGE_KEY, String(width));
  }, [width]);

  useEffect(() => {
    if (!resizing) return;
    const prev = {
      cursor: document.body.style.cursor,
      userSelect: document.body.style.userSelect,
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    return () => {
      document.body.style.cursor = prev.cursor;
      document.body.style.userSelect = prev.userSelect;
    };
  }, [resizing]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startWidth: width };
    setResizing(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const delta = e.clientX - dragRef.current.startX;
    const next = Math.min(
      MAX_RAIL_WIDTH,
      Math.max(MIN_RAIL_WIDTH, dragRef.current.startWidth + delta),
    );
    setWidth(next);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    dragRef.current = null;
    setResizing(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 32 : 8;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      e.stopPropagation();
      setWidth((w) => Math.max(MIN_RAIL_WIDTH, w - step));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopPropagation();
      setWidth((w) => Math.min(MAX_RAIL_WIDTH, w + step));
    } else if (e.key === 'Home') {
      e.preventDefault();
      e.stopPropagation();
      setWidth(DEFAULT_RAIL_WIDTH);
    }
  };

  return (
    <div className="relative hidden shrink-0 md:block" style={{ width }}>
      <ThumbnailRail width={width} {...props} />
      {/* biome-ignore lint/a11y/useSemanticElements: focusable resize handle (splitter pattern), not a static <hr> */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label={t.thumbnailRail.resizeRail}
        aria-valuenow={width}
        aria-valuemin={MIN_RAIL_WIDTH}
        aria-valuemax={MAX_RAIL_WIDTH}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        onDoubleClick={() => setWidth(DEFAULT_RAIL_WIDTH)}
        className={cn(
          'group/resize absolute inset-y-0 right-0 z-20 w-1.5 translate-x-1/2 cursor-col-resize touch-none outline-none',
          'focus-visible:bg-brand/20',
        )}
      >
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-brand opacity-0 transition-opacity',
            'group-hover/resize:opacity-100 group-focus-visible/resize:opacity-100',
            resizing && 'opacity-100',
          )}
        />
      </div>
    </div>
  );
}

function AgentPresenceBadge() {
  const t = useLocale();
  const { state, name } = useAgentPresence();
  const who = name ?? t.frame.agentName;

  const label =
    state === 'unreachable'
      ? t.frame.agentDisconnected
      : format(state === 'active' ? t.frame.agentActive : t.frame.agentIdle, { name: who });
  const tooltip =
    state === 'unreachable'
      ? t.frame.agentDisconnectedTooltip
      : format(state === 'active' ? t.frame.agentActiveTooltip : t.frame.agentIdleTooltip, {
          name: who,
        });

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="ml-1 flex shrink-0 cursor-help items-center gap-1.5 rounded-3 border border-hairline bg-card px-1.5 py-0.5 text-10.5 text-foreground/85 outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            <AgentPresenceDot state={state} />
            {label}
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="start"
          className="w-max max-w-[min(520px,calc(100vw-2rem))] text-center leading-relaxed"
        >
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function FollowEditsToggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  const t = useLocale();
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-pressed={active}
            aria-label={t.frame.followAgentEdits}
            onClick={onToggle}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
              'shrink-0',
              active && 'bg-brand/10 text-brand',
            )}
          >
            <Crosshair className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="start">
          {t.frame.followAgentEdits}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function SelectionReporter() {
  const { selected } = useInspector();
  useEffect(() => {
    if (!import.meta.hot) return;
    const selection = selected
      ? {
          line: selected.line,
          column: selected.column,
          tagName: selected.anchor.tagName.toLowerCase(),
          text: (selected.anchor.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 120),
        }
      : null;
    import.meta.hot.send('open-frame:current', { selection });
  }, [selected]);
  return null;
}

function FrameViewportNavigation({
  targetRef,
  onPrev,
  onNext,
  canPrev,
  canNext,
}: {
  targetRef: RefObject<HTMLElement>;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}) {
  const { active } = useInspector();
  const isMobile = useIsMobile();

  useWheelPageNavigation({
    ref: targetRef,
    enabled: !active,
    canPrev,
    canNext,
    onPrev,
    onNext,
  });

  // Tap-to-navigate is a touch affordance — desktop has visible prev/next
  // chrome, so it stays edge-only on small screens (matches the old md:hidden
  // zones). Interactive frame content keeps its tap via the hook's passthrough.
  useClickPageNavigation({
    ref: targetRef,
    enabled: isMobile && !active,
    edgeRatio: 0.18,
    canPrev,
    canNext,
    onPrev,
    onNext,
  });

  return null;
}

function InlineTitleEditor({
  title,
  onSubmit,
}: {
  title: string;
  onSubmit: (name: string) => Promise<void> | void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const t = useLocale();

  useEffect(() => {
    if (!editing) setValue(title);
  }, [title, editing]);

  useEffect(() => {
    if (editing) {
      queueMicrotask(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [editing]);

  const commit = async () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === title) {
      setValue(title);
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onSubmit(trimmed);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setValue(title);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex min-w-0 flex-1 items-center justify-center">
        <div className="inline-grid max-w-full items-center">
          <span
            aria-hidden
            className="invisible col-start-1 row-start-1 overflow-hidden whitespace-pre border border-transparent px-2 py-0.5 font-heading text-13.5 font-semibold -tracking-1"
          >
            {value || ' '}
          </span>
          <input
            ref={inputRef}
            size={1}
            value={value}
            disabled={saving}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => {
              if (!saving) commit();
            }}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing) return;
              if (e.key === 'Enter') {
                e.preventDefault();
                commit();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                cancel();
              }
            }}
            maxLength={80}
            className="col-start-1 row-start-1 w-full min-w-0 rounded-5 border border-foreground/30 bg-card px-2 py-0.5 text-center font-heading text-13.5 font-semibold -tracking-1 outline-none"
          />
        </div>
      </div>
    );
  }

  if (!import.meta.env.DEV) {
    return (
      <div className="flex min-w-0 items-baseline justify-center">
        <h1 className="truncate font-heading text-13.5 font-semibold -tracking-1">{title}</h1>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 items-center justify-center">
      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label={t.frame.renameFrame}
        className={cn(
          'min-w-0 max-w-full cursor-text rounded-5 border border-transparent px-2 py-0.5 transition-colors',
          'hover:border-foreground/30 hover:bg-card focus-visible:border-foreground/30 focus-visible:bg-card focus-visible:outline-none',
        )}
      >
        <h1 className="truncate font-heading text-13.5 font-semibold -tracking-1">{title}</h1>
      </button>
    </div>
  );
}
