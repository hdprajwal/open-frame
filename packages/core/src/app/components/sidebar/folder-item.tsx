import { Frame, Images, MoreHorizontal, Palette, Pencil, SquarePen, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Folder, FolderIcon } from '@/lib/sdk';
import { useLocale } from '@/lib/use-locale';
import { cn } from '@/lib/utils';
import { IconPicker } from './icon-picker';

export const FRAME_DND_MIME = 'application/x-frame-id';

function useFrameDragActive() {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const onStart = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes(FRAME_DND_MIME)) setActive(true);
    };
    const onEnd = () => setActive(false);
    document.addEventListener('dragstart', onStart);
    document.addEventListener('dragend', onEnd);
    document.addEventListener('drop', onEnd);
    return () => {
      document.removeEventListener('dragstart', onStart);
      document.removeEventListener('dragend', onEnd);
      document.removeEventListener('drop', onEnd);
    };
  }, []);
  return active;
}

const LUCIDE_ICONS = {
  'square-pen': SquarePen,
  palette: Palette,
  images: Images,
  frame: Frame,
} as const;

export function FolderIconChip({ icon, className }: { icon: FolderIcon; className?: string }) {
  if (icon.type === 'lucide') {
    const Icon = LUCIDE_ICONS[icon.value];
    return (
      <span
        className={cn(
          'inline-flex size-4 items-center justify-center text-15 leading-none',
          className,
        )}
      >
        <Icon className="size-[1em]" strokeWidth={1.6} />
      </span>
    );
  }
  if (icon.type === 'emoji') {
    return (
      <span
        className={cn(
          'inline-flex size-4 items-center justify-center text-13 leading-none',
          className,
        )}
      >
        {icon.value}
      </span>
    );
  }
  return (
    <span
      className={cn(
        'inline-block size-2.5 rounded-3 ring-1 ring-foreground/15 shadow-[inset_0_1px_0_oklch(1_0_0/0.18)]',
        className,
      )}
      style={{ background: icon.value }}
    />
  );
}

type Row =
  | {
      kind: 'folder';
      folder: Folder;
      onRename: (name: string) => void;
      onChangeIcon: (icon: FolderIcon) => void;
      onDelete: () => void;
    }
  | {
      kind: 'all';
    }
  | {
      kind: 'draft';
    }
  | {
      kind: 'themes';
    }
  | {
      kind: 'assets';
    };

const NAV_ICONS: Record<Exclude<Row['kind'], 'folder'>, FolderIcon> = {
  all: { type: 'lucide', value: 'frame' },
  draft: { type: 'lucide', value: 'square-pen' },
  themes: { type: 'lucide', value: 'palette' },
  assets: { type: 'lucide', value: 'images' },
};

export function FolderItem({
  row,
  count,
  selected,
  onSelect,
  onDropFrame,
}: {
  row: Row;
  count: number;
  selected: boolean;
  onSelect: () => void;
  onDropFrame: (frameId: string) => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const dragDepth = useRef(0);
  const [draftName, setDraftName] = useState(row.kind === 'folder' ? row.folder.name : '');
  const frameDragActive = useFrameDragActive();
  const t = useLocale();

  const acceptsFrameDrop = row.kind === 'folder' || row.kind === 'draft';
  const isFrameDrag = (e: React.DragEvent) =>
    acceptsFrameDrop && e.dataTransfer.types.includes(FRAME_DND_MIME);
  const handleDragEnter = (e: React.DragEvent) => {
    if (!isFrameDrag(e)) return;
    dragDepth.current += 1;
    if (dragDepth.current === 1) setDragOver(true);
  };
  const handleDragOver = (e: React.DragEvent) => {
    if (!isFrameDrag(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const handleDragLeave = (e: React.DragEvent) => {
    if (!isFrameDrag(e)) return;
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragOver(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    if (!acceptsFrameDrop) return;
    const frameId = e.dataTransfer.getData(FRAME_DND_MIME);
    dragDepth.current = 0;
    setDragOver(false);
    if (!frameId) return;
    e.preventDefault();
    onDropFrame(frameId);
  };

  const icon: FolderIcon = row.kind === 'folder' ? row.folder.icon : NAV_ICONS[row.kind];
  const NAV_LABELS: Record<Exclude<Row['kind'], 'folder'>, string> = {
    all: t.home.allFrames,
    draft: t.home.draft,
    themes: t.home.themes,
    assets: t.home.assets,
  };
  const label = row.kind === 'folder' ? row.folder.name : NAV_LABELS[row.kind];

  const commitRename = () => {
    if (row.kind !== 'folder') return;
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== row.folder.name) row.onRename(trimmed);
    setRenaming(false);
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: drag-and-drop target wraps interactive children
    <div
      className={cn(
        'group relative flex h-7.5 items-center gap-2.5 rounded-5 px-2 text-14 transition-colors',
        selected
          ? 'bg-brand-soft text-brand-deep before:absolute before:inset-y-1.5 before:-left-2 before:w-[2px] before:rounded-r-full before:bg-brand'
          : 'text-foreground/80 hover:bg-muted hover:text-foreground',
        frameDragActive && acceptsFrameDrop && !dragOver && 'ring-1 ring-foreground/10',
        dragOver &&
          'bg-brand/10 text-foreground ring-1 ring-brand ring-offset-1 ring-offset-sidebar motion-safe:scale-[1.01] motion-safe:transition-transform',
      )}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {row.kind === 'folder' && import.meta.env.DEV ? (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex size-4 shrink-0 items-center justify-center rounded transition-transform hover:scale-110"
              aria-label={t.home.changeIcon}
              onClick={(e) => e.stopPropagation()}
            >
              <FolderIconChip icon={icon} />
            </button>
          </PopoverTrigger>
          <PopoverContent side="right" align="start" className="w-auto p-2">
            <IconPicker value={row.folder.icon} onChange={(next) => row.onChangeIcon(next)} />
          </PopoverContent>
        </Popover>
      ) : (
        <button
          type="button"
          onClick={onSelect}
          aria-label={label}
          className="flex size-4 shrink-0 items-center justify-center"
        >
          <FolderIconChip icon={icon} />
        </button>
      )}

      {renaming && row.kind === 'folder' ? (
        <input
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === 'Enter') commitRename();
            if (e.key === 'Escape') {
              setDraftName(row.folder.name);
              setRenaming(false);
            }
          }}
          maxLength={40}
          className="min-w-0 flex-1 rounded-3 bg-card px-1 text-12.5 outline-none ring-1 ring-foreground/20"
        />
      ) : (
        <button type="button" onClick={onSelect} className="min-w-0 flex-1 truncate text-left">
          {label}
        </button>
      )}

      <span
        className={cn(
          'nums ml-auto shrink-0 font-mono text-11 transition-opacity',
          selected ? 'text-brand-deep/70' : 'text-muted-foreground',
          row.kind === 'folder' &&
            import.meta.env.DEV &&
            'group-hover:opacity-0 group-has-[[aria-expanded=true]]:opacity-0',
        )}
      >
        {count}
      </span>

      {row.kind === 'folder' && import.meta.env.DEV && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="absolute right-2 top-1/2 size-5 -translate-y-1/2 rounded opacity-0 transition-opacity hover:bg-foreground/10 group-hover:opacity-100 aria-expanded:opacity-100"
              aria-label={t.home.folderActions}
            >
              <MoreHorizontal className="mx-auto size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[140px]">
            <DropdownMenuItem
              onSelect={() => {
                setDraftName(row.folder.name);
                setRenaming(true);
              }}
            >
              <Pencil />
              {t.common.rename}
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={() => row.onDelete()}>
              <Trash2 />
              {t.common.delete}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
