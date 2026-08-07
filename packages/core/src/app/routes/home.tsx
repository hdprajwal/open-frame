import {
  ArrowDownAZ,
  ChevronDown,
  Clock,
  Copy,
  FolderInput,
  FolderPlus,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { relativeTime } from '@/lib/relative-time';
import { useFrameEditFlash } from '@/lib/use-external-edits';
import { format, plural, useLocale } from '@/lib/use-locale';
import { cn } from '@/lib/utils';
import { FrameCanvas } from '../components/frame-canvas';
import { FactSeparator, FrameCardShell } from '../components/frame-card-shell';
import { LibraryPage } from '../components/library-page';
import { FolderIconChip, FRAME_DND_MIME } from '../components/sidebar/folder-item';
import { ALL_ID, DRAFT_ID } from '../components/sidebar/sidebar';
import { resolveCanvas } from '../lib/formats';
import { frameCreatedAt, loadFrame } from '../lib/frames';
import { FramePageProvider } from '../lib/page-context';
import type { Folder, FolderIcon, FrameModule } from '../lib/sdk';
import type { HomeOutletContext } from './home-shell';

type SortKey = 'created-desc' | 'created-asc' | 'title-asc' | 'title-desc';

const SORT_KEYS: readonly SortKey[] = ['created-desc', 'created-asc', 'title-asc', 'title-desc'];

const DEFAULT_SORT: SortKey = 'created-desc';
const SORT_STORAGE_KEY = 'open-frame:home-sort';

function readSortPref(): SortKey {
  if (typeof window === 'undefined') return DEFAULT_SORT;
  try {
    const raw = window.localStorage.getItem(SORT_STORAGE_KEY);
    if (raw && (SORT_KEYS as readonly string[]).includes(raw)) return raw as SortKey;
  } catch {}
  return DEFAULT_SORT;
}

function useSortPref(): [SortKey, (next: SortKey) => void] {
  const [sortKey, setSortKey] = useState<SortKey>(readSortPref);
  const update = (next: SortKey) => {
    setSortKey(next);
    try {
      window.localStorage.setItem(SORT_STORAGE_KEY, next);
    } catch {}
  };
  return [sortKey, update];
}

const TITLE_COLLATOR = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });

export function Home() {
  const {
    manifest,
    loading,
    allFrames,
    draftFrames,
    framesByFolder,
    selectedId,
    reportTitle,
    titleMap,
    assign,
    renameFrame,
    duplicateFrame,
    deleteFrame,
  } = useOutletContext<HomeOutletContext>();
  const t = useLocale();

  const isAll = selectedId === ALL_ID;
  const isDraft = selectedId === DRAFT_ID;
  const selectedFolder =
    isAll || isDraft ? null : (manifest.folders.find((f) => f.id === selectedId) ?? null);
  const visibleFrames = isAll
    ? allFrames
    : isDraft
      ? draftFrames
      : (framesByFolder[selectedId] ?? []);

  const title = isAll ? t.home.allFrames : (selectedFolder?.name ?? t.home.draft);

  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useSortPref();

  const trimmedQuery = query.trim().toLowerCase();
  const filteredFrames = useMemo(() => {
    if (!trimmedQuery) return visibleFrames;
    return visibleFrames.filter((id) => {
      if (id.toLowerCase().includes(trimmedQuery)) return true;
      const tl = titleMap[id]?.toLowerCase();
      return tl ? tl.includes(trimmedQuery) : false;
    });
  }, [visibleFrames, titleMap, trimmedQuery]);
  const sortedFrames = useMemo(() => {
    const list = filteredFrames.slice();
    const titleOf = (id: string) => titleMap[id] ?? id;
    switch (sortKey) {
      case 'title-asc':
        list.sort((a, b) => TITLE_COLLATOR.compare(titleOf(a), titleOf(b)));
        break;
      case 'title-desc':
        list.sort((a, b) => TITLE_COLLATOR.compare(titleOf(b), titleOf(a)));
        break;
      case 'created-asc':
        list.sort((a, b) => (frameCreatedAt[a] ?? 0) - (frameCreatedAt[b] ?? 0));
        break;
      default:
        list.sort((a, b) => (frameCreatedAt[b] ?? 0) - (frameCreatedAt[a] ?? 0));
    }
    return list;
  }, [filteredFrames, sortKey, titleMap]);
  const isSearching = trimmedQuery.length > 0;

  const shown = isSearching ? filteredFrames.length : visibleFrames.length;

  // Read through a ref so the handler stays referentially stable — every card
  // holds it, and a new identity would defeat FrameCard's memo.
  const titleMapRef = useRef(titleMap);
  titleMapRef.current = titleMap;

  const handleDuplicate = useCallback(
    async (id: string) => {
      const frameName = titleMapRef.current[id] ?? id;
      try {
        const newFrameId = await duplicateFrame(id);
        toast.success(
          format(t.home.toastFrameDuplicated, { frame: frameName, newFrame: newFrameId }),
        );
      } catch {
        toast.error(t.home.toastFrameDuplicateFailed);
      }
    },
    [duplicateFrame, t],
  );

  return (
    <LibraryPage
      title={title}
      count={loading ? undefined : format(plural(shown, t.home.frameCount), { count: shown })}
      actions={<SearchInput value={query} onChange={setQuery} />}
      toolbar={<SortControl value={sortKey} onChange={setSortKey} />}
    >
      {loading ? (
        <HomeLoading />
      ) : visibleFrames.length === 0 ? (
        <EmptyState folderName={selectedFolder?.name} />
      ) : filteredFrames.length === 0 ? (
        <NoResultsState query={query} onClear={() => setQuery('')} />
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(272px,100%),1fr))] items-start gap-5 md:grid-cols-[repeat(auto-fill,minmax(296px,1fr))]">
          {sortedFrames.map((id) => (
            <li key={id}>
              <FrameCard
                id={id}
                folders={manifest.folders}
                currentFolderId={manifest.assignments[id] ?? null}
                onRename={renameFrame}
                onDuplicate={handleDuplicate}
                onMove={assign}
                onDelete={deleteFrame}
                onTitleResolved={reportTitle}
              />
            </li>
          ))}
        </ul>
      )}
    </LibraryPage>
  );
}

function SearchInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const t = useLocale();
  return (
    <div className="relative w-full md:w-[240px]">
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t.home.searchPlaceholder}
        className="h-8 w-full rounded-6 border border-border bg-background pl-8 pr-7 text-12.5 outline-none placeholder:text-muted-foreground/70 focus-visible:border-foreground/40 focus-visible:ring-2 focus-visible:ring-ring/30"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label={t.home.clearSearch}
          className="absolute right-1.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-4 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  );
}

function SortControl({ value, onChange }: { value: SortKey; onChange: (next: SortKey) => void }) {
  const t = useLocale();
  const labels: Record<SortKey, string> = {
    'created-desc': t.home.sortByCreatedDesc,
    'created-asc': t.home.sortByCreatedAsc,
    'title-asc': t.home.sortByTitleAsc,
    'title-desc': t.home.sortByTitleDesc,
  };
  const FieldIcon = ({ k, className }: { k: SortKey; className?: string }) =>
    k === 'title-asc' || k === 'title-desc' ? (
      <ArrowDownAZ className={className} aria-hidden />
    ) : (
      <Clock className={className} aria-hidden />
    );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`${t.home.sortLabel}: ${labels[value]}`}
          className="flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-6 border border-border bg-background pl-2 pr-1.5 text-12.5 font-medium text-foreground outline-none hover:bg-muted focus-visible:border-foreground/40 focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          <FieldIcon k={value} className="size-3.5 text-muted-foreground" />
          <span>{labels[value]}</span>
          <ChevronDown className="size-3 text-muted-foreground" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        {SORT_KEYS.map((key) => {
          const active = value === key;
          return (
            <DropdownMenuItem
              key={key}
              onSelect={() => onChange(key)}
              className={cn(active && 'bg-muted text-foreground')}
            >
              <FieldIcon k={key} className="size-3.5 text-muted-foreground" />
              <span>{labels[key]}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function HomeLoading() {
  const t = useLocale();
  return (
    <div className="grid place-items-center px-8 py-24 text-muted-foreground">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-px w-56 overflow-hidden bg-hairline">
          <span
            aria-hidden
            className="line-loader-bar absolute inset-y-[-0.5px] left-0 w-1/4 bg-foreground"
          />
        </div>
        <span className="eyebrow text-11.5">{t.frame.loadingEyebrow}</span>
      </div>
    </div>
  );
}

function NoResultsState({ query, onClear }: { query: string; onClear: () => void }) {
  const t = useLocale();
  return (
    <div className="rounded-10 border border-dashed border-border bg-card/60 px-8 py-20">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="flex size-12 items-center justify-center rounded-full border border-hairline bg-card text-muted-foreground">
          <Search className="size-5" />
        </div>
        <p className="mt-4 font-heading text-15 font-semibold tracking-tight">{t.home.noMatches}</p>
        <p className="mt-1.5 text-13 leading-relaxed text-muted-foreground">
          {t.home.nothingMatchesPrefix}
          <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span>
          {t.home.nothingMatchesSuffix}
        </p>
        <Button variant="ghost" size="sm" className="mt-4" onClick={onClear}>
          {t.home.clearSearch}
        </Button>
      </div>
    </div>
  );
}

function EmptyState({ folderName }: { folderName?: string }) {
  const t = useLocale();
  return (
    <div className="rounded-10 border border-dashed border-border bg-card/60 px-8 py-20">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="flex size-12 items-center justify-center rounded-full border border-hairline bg-card text-muted-foreground">
          <FolderPlus className="size-5" />
        </div>
        {folderName === undefined ? (
          <>
            <p className="mt-4 font-heading text-15 font-semibold tracking-tight">
              {t.home.noFramesYet}
            </p>
            <p className="mt-1.5 text-13 leading-relaxed text-muted-foreground">
              {t.home.createFrameHintPrefix}
              <code className="rounded-4 bg-muted px-1.5 py-0.5 font-mono text-11.5 text-foreground">
                /create-frame
              </code>
              {t.home.createFrameHintSuffix}
            </p>
          </>
        ) : (
          <>
            <p className="mt-4 font-heading text-15 font-semibold tracking-tight">
              {format(t.home.folderEmptyTitle, { name: folderName })}
            </p>
            <p className="mt-1.5 text-13 leading-relaxed text-muted-foreground">
              {t.home.folderEmptyHint}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function createDragChip(title: string): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  const chip = document.createElement('div');
  chip.style.cssText = [
    'position: fixed',
    'top: -9999px',
    'left: -9999px',
    'display: inline-flex',
    'align-items: center',
    'gap: 8px',
    'padding: 6px 10px 6px 6px',
    'border-radius: 6px',
    'background: var(--card)',
    'color: var(--foreground)',
    'border: 1px solid var(--border)',
    'box-shadow: 0 12px 32px -8px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.08)',
    'font: 500 12.5px/1 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
    'white-space: nowrap',
    'pointer-events: none',
    'z-index: 9999',
  ].join(';');

  const thumb = document.createElement('span');
  thumb.style.cssText = [
    'display: inline-block',
    'width: 30px',
    'height: 18px',
    'border-radius: 3px',
    'background: var(--muted)',
    'border: 1px solid var(--border)',
    'flex: 0 0 auto',
  ].join(';');

  const label = document.createElement('span');
  label.textContent = title;
  label.style.cssText = 'overflow: hidden; text-overflow: ellipsis; max-width: 220px;';

  chip.appendChild(thumb);
  chip.appendChild(label);
  document.body.appendChild(chip);
  return chip;
}

type DialogKind = null | 'rename' | 'move' | 'delete';

// Memoized because every card renders a live page tree: without it, one card
// reporting its title would reconcile the whole grid. Its callbacks all take
// the frame id so the parent can pass one stable function to every card.
const FrameCard = memo(function FrameCard({
  id,
  folders,
  currentFolderId,
  onRename,
  onDuplicate,
  onMove,
  onDelete,
  onTitleResolved,
}: {
  id: string;
  folders: Folder[];
  currentFolderId: string | null;
  onRename: (id: string, name: string) => Promise<void> | void;
  onDuplicate: (id: string) => Promise<void> | void;
  onMove: (id: string, folderId: string | null) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  onTitleResolved?: (id: string, title: string) => void;
}) {
  const [frame, setFrame] = useState<FrameModule | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dialog, setDialog] = useState<DialogKind>(null);
  const tCard = useLocale();
  const editFlash = useFrameEditFlash(id);

  useEffect(() => {
    let cancelled = false;
    loadFrame(id)
      .then((mod) => {
        if (!cancelled) setFrame(mod);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id]);

  const FirstPage = frame?.default[0];
  const displayTitle = frame?.meta?.title ?? id;
  const pageCount = frame?.default.length ?? 0;
  const canvas = frame ? resolveCanvas(frame.meta) : null;
  const createdAt = frameCreatedAt[id];

  useEffect(() => {
    if (frame && onTitleResolved) onTitleResolved(id, displayTitle);
  }, [id, frame, displayTitle, onTitleResolved]);

  return (
    <>
      <FrameCardShell
        to={`/f/${id}`}
        title={displayTitle}
        subtitle={`frames/${id}`}
        canvas={canvas}
        pageCount={pageCount}
        overlay={editFlash !== null ? <span key={editFlash} className="edit-flash" /> : undefined}
        className={cn(dragging && 'opacity-40')}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData(FRAME_DND_MIME, id);
          e.dataTransfer.effectAllowed = 'move';
          const chip = createDragChip(displayTitle);
          if (chip) {
            e.dataTransfer.setDragImage(chip, 14, 14);
            setTimeout(() => chip.remove(), 0);
          }
          setDragging(true);
        }}
        onDragEnd={() => setDragging(false)}
        actions={
          import.meta.env.DEV && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="-mr-1 flex size-5.5 shrink-0 items-center justify-center rounded-4 text-muted-foreground opacity-0 hover:bg-muted hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100 aria-expanded:opacity-100 motion-safe:transition-opacity"
                  aria-label={tCard.home.frameActions}
                >
                  <MoreHorizontal className="size-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-44">
                <DropdownMenuItem onSelect={() => setDialog('rename')}>
                  <Pencil />
                  {tCard.common.rename}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onDuplicate(id)}>
                  <Copy />
                  {tCard.home.duplicate}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setDialog('move')}>
                  <FolderInput />
                  {tCard.home.moveToFolder}
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onSelect={() => setDialog('delete')}>
                  <Trash2 />
                  {tCard.common.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }
        facts={
          <>
            {pageCount > 0 && (
              <span className="whitespace-nowrap">
                {format(plural(pageCount, tCard.home.pageCount), { count: pageCount })}
              </span>
            )}
            {createdAt !== undefined && (
              <>
                <FactSeparator />
                <span className="whitespace-nowrap">{relativeTime(createdAt, tCard.id)}</span>
              </>
            )}
            {frame?.meta?.theme && (
              <>
                <FactSeparator />
                <Link
                  to={`/themes/${encodeURIComponent(frame.meta.theme)}`}
                  className="max-w-35 truncate hover:text-foreground"
                >
                  {frame.meta.theme}
                </Link>
              </>
            )}
          </>
        }
      >
        {FirstPage ? (
          <FrameCanvas flat freezeMotion design={frame?.design} canvas={canvas ?? undefined}>
            <FramePageProvider index={0} total={pageCount || 1}>
              <FirstPage />
            </FramePageProvider>
          </FrameCanvas>
        ) : (
          <div className="grid h-full w-full place-items-center text-10 tracking-16 uppercase text-muted-foreground/60">
            {tCard.common.loading}
          </div>
        )}
      </FrameCardShell>

      <RenameDialog
        open={dialog === 'rename'}
        initialName={displayTitle}
        onOpenChange={(v) => setDialog(v ? 'rename' : null)}
        onSubmit={async (name) => {
          await onRename(id, name);
          setDialog(null);
        }}
      />
      <MoveDialog
        open={dialog === 'move'}
        frameName={displayTitle}
        folders={folders}
        currentFolderId={currentFolderId}
        onOpenChange={(v) => setDialog(v ? 'move' : null)}
        onSubmit={async (folderId) => {
          await onMove(id, folderId);
          setDialog(null);
        }}
      />
      <DeleteDialog
        open={dialog === 'delete'}
        frameName={displayTitle}
        onOpenChange={(v) => setDialog(v ? 'delete' : null)}
        onConfirm={async () => {
          await onDelete(id);
          setDialog(null);
        }}
      />
    </>
  );
});

function RenameDialog({
  open,
  initialName,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  initialName: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => Promise<void> | void;
}) {
  const [value, setValue] = useState(initialName);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const t = useLocale();

  useEffect(() => {
    if (open) {
      setValue(initialName);
      setSubmitting(false);
      queueMicrotask(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [open, initialName]);

  const submit = async () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === initialName) {
      onOpenChange(false);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(trimmed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <span className="eyebrow">{t.home.renameDialogEyebrow}</span>
          <DialogTitle>{t.home.renameDialogTitle}</DialogTitle>
          <DialogDescription>{t.home.renameDialogDescription}</DialogDescription>
        </DialogHeader>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            }
          }}
          maxLength={80}
          placeholder={t.home.frameNamePlaceholder}
          className="h-9 w-full rounded-6 border border-border bg-background px-3 text-13 outline-none focus-visible:border-foreground/40 focus-visible:ring-2 focus-visible:ring-ring/30"
        />
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            {t.common.cancel}
          </Button>
          <Button size="sm" disabled={submitting} onClick={submit}>
            {t.common.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MoveDialog({
  open,
  frameName,
  folders,
  currentFolderId,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  frameName: string;
  folders: Folder[];
  currentFolderId: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (folderId: string | null) => Promise<void> | void;
}) {
  const [selected, setSelected] = useState<string | null>(currentFolderId);
  const [submitting, setSubmitting] = useState(false);
  const t = useLocale();

  useEffect(() => {
    if (open) {
      setSelected(currentFolderId);
      setSubmitting(false);
    }
  }, [open, currentFolderId]);

  const submit = async () => {
    if (selected === currentFolderId) {
      onOpenChange(false);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(selected);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <span className="eyebrow">{t.home.moveDialogEyebrow}</span>
          <DialogTitle>{t.home.moveDialogTitle}</DialogTitle>
          <DialogDescription>
            {t.home.moveDialogDescriptionPrefix}
            <span className="font-medium text-foreground">{frameName}</span>
            {t.home.moveDialogDescriptionSuffix}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[320px] overflow-y-auto rounded-6 border border-border bg-background">
          <FolderOption
            icon={{ type: 'lucide', value: 'square-pen' }}
            label={t.home.draft}
            active={selected === null}
            onClick={() => setSelected(null)}
          />
          {folders.map((f) => (
            <FolderOption
              key={f.id}
              icon={f.icon}
              label={f.name}
              active={selected === f.id}
              onClick={() => setSelected(f.id)}
            />
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            {t.common.cancel}
          </Button>
          <Button size="sm" disabled={submitting || selected === currentFolderId} onClick={submit}>
            {t.common.move}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FolderOption({
  icon,
  label,
  active,
  onClick,
}: {
  icon: FolderIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const tOpt = useLocale();
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 border-b border-hairline px-3 py-2 text-left text-13 transition-colors last:border-b-0',
        active ? 'bg-muted text-foreground' : 'hover:bg-muted/60',
      )}
    >
      <FolderIconChip icon={icon} />
      <span className="truncate">{label}</span>
      {active && (
        <span className="ml-auto inline-flex items-center gap-1 text-10.5 text-brand">
          <span className="inline-block size-1 rounded-full bg-brand" aria-hidden />
          {tOpt.common.selected}
        </span>
      )}
    </button>
  );
}

function DeleteDialog({
  open,
  frameName,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  frameName: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const t = useLocale();

  useEffect(() => {
    if (open) setSubmitting(false);
  }, [open]);

  const confirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <span className="eyebrow text-destructive/80">{t.home.deleteDialogEyebrow}</span>
          <DialogTitle>{t.home.deleteDialogTitle}</DialogTitle>
          <DialogDescription>
            {t.home.deleteDialogDescriptionPrefix}
            <span className="font-medium text-foreground">{frameName}</span>
            {t.home.deleteDialogDescriptionMid}
            {t.home.deleteDialogDescriptionSuffix}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            {t.common.cancel}
          </Button>
          <Button variant="destructive" size="sm" disabled={submitting} onClick={confirm}>
            {t.common.delete}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
