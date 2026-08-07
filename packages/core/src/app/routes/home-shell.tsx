import { useCallback, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAssets } from '@/lib/assets';
import { useFolders } from '@/lib/folders';
import { format, useLocale } from '@/lib/use-locale';
import { MobileFolderPill } from '../components/sidebar/mobile-pill';
import { ALL_ID, ASSETS_ID, DRAFT_ID, Sidebar, THEMES_ID } from '../components/sidebar/sidebar';
import { frameIds } from '../lib/frames';
import type { FoldersManifest } from '../lib/sdk';
import { themes as themeRegistry } from '../lib/themes';

export type HomeOutletContext = {
  manifest: FoldersManifest;
  loading: boolean;
  allFrames: string[];
  draftFrames: string[];
  framesByFolder: Record<string, string[]>;
  /** The rail row this page belongs to: ALL_ID, DRAFT_ID, a folder id, THEMES_ID or ASSETS_ID. */
  selectedId: string;
  reportTitle: (frameId: string, title: string) => void;
  titleMap: Record<string, string>;
  assign: (frameId: string, folderId: string | null) => Promise<void>;
  renameFrame: (frameId: string, name: string) => Promise<void>;
  duplicateFrame: (frameId: string, newId?: string) => Promise<string>;
  deleteFrame: (frameId: string) => Promise<void>;
};

function pathToSelectedId(pathname: string, search: URLSearchParams): string {
  if (pathname === '/themes' || pathname.startsWith('/themes/')) return THEMES_ID;
  if (pathname === '/assets') return ASSETS_ID;
  if (pathname === '/drafts') return DRAFT_ID;
  return search.get('f') ?? ALL_ID;
}

export function HomeShell() {
  const {
    manifest,
    loading,
    create,
    update,
    remove,
    reorder,
    assign,
    renameFrame,
    duplicateFrame,
    deleteFrame,
  } = useFolders();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const t = useLocale();

  const selectedId = pathToSelectedId(location.pathname, searchParams);

  const [titleMap, setTitleMap] = useState<Record<string, string>>({});
  const reportTitle = useCallback((frameId: string, frameTitle: string) => {
    setTitleMap((prev) =>
      prev[frameId] === frameTitle ? prev : { ...prev, [frameId]: frameTitle },
    );
  }, []);

  const selectFolder = useCallback(
    (id: string) => {
      if (id === THEMES_ID) navigate('/themes', { replace: true });
      else if (id === ASSETS_ID) navigate('/assets', { replace: true });
      else if (id === DRAFT_ID) navigate('/drafts', { replace: true });
      else if (id === ALL_ID) navigate('/', { replace: true });
      else navigate(`/?f=${encodeURIComponent(id)}`, { replace: true });
    },
    [navigate],
  );

  const { assets: globalAssets } = useAssets('@global');

  const { draftFrames, framesByFolder } = useMemo(() => {
    const byFolder: Record<string, string[]> = {};
    const draft: string[] = [];
    const known = new Set(manifest.folders.map((f) => f.id));
    for (const id of frameIds) {
      const folderId = manifest.assignments[id];
      if (folderId && known.has(folderId)) {
        byFolder[folderId] ??= [];
        byFolder[folderId].push(id);
      } else {
        draft.push(id);
      }
    }
    return { draftFrames: draft, framesByFolder: byFolder };
  }, [manifest]);

  const countFor = (folderId: string | null) =>
    folderId === null ? draftFrames.length : (framesByFolder[folderId]?.length ?? 0);

  const moveFrameWithToast = useCallback(
    async (frameId: string, folderId: string | null) => {
      if (manifest.assignments[frameId] === (folderId ?? undefined)) return;
      const frameName = titleMap[frameId] ?? frameId;
      const folderName =
        folderId === null
          ? t.home.draft
          : (manifest.folders.find((f) => f.id === folderId)?.name ?? folderId);
      try {
        await assign(frameId, folderId);
        toast.success(format(t.home.toastFrameMoved, { frame: frameName, folder: folderName }));
      } catch {
        toast.error(t.home.toastFrameMoveFailed);
      }
    },
    [assign, manifest, titleMap, t],
  );

  // A fresh object here would re-render every card in the grid — and with it
  // every live page preview — each time a card reports its resolved title.
  const ctx: HomeOutletContext = useMemo(
    () => ({
      manifest,
      loading,
      allFrames: frameIds,
      draftFrames,
      framesByFolder,
      selectedId,
      reportTitle,
      titleMap,
      assign,
      renameFrame,
      duplicateFrame,
      deleteFrame,
    }),
    [
      manifest,
      loading,
      draftFrames,
      framesByFolder,
      selectedId,
      reportTitle,
      titleMap,
      assign,
      renameFrame,
      duplicateFrame,
      deleteFrame,
    ],
  );

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <div className="hidden md:block">
        <Sidebar
          folders={manifest.folders}
          countFor={countFor}
          allCount={frameIds.length}
          themesCount={themeRegistry.length}
          assetsCount={globalAssets.length}
          selectedId={selectedId}
          onSelect={selectFolder}
          onCreate={(name, icon) => create(name, icon)}
          onRename={(id, name) => update(id, { name })}
          onChangeIcon={(id, icon) => update(id, { icon })}
          onDelete={async (id) => {
            const name = manifest.folders.find((f) => f.id === id)?.name ?? id;
            if (selectedId === id) selectFolder(ALL_ID);
            try {
              await remove(id);
              toast.success(format(t.home.toastFolderDeleted, { name }));
            } catch {
              toast.error(t.home.toastFolderDeleteFailed);
            }
          }}
          onDropToFolder={(folderId, frameId) => moveFrameWithToast(frameId, folderId)}
          onDropToDraft={(frameId) => moveFrameWithToast(frameId, null)}
          onReorder={async (ids) => {
            try {
              await reorder(ids);
            } catch {
              toast.error(t.home.toastFolderReorderFailed);
            }
          }}
        />
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
        <div className="flex shrink-0 items-center justify-between border-b border-hairline bg-sidebar px-4 py-3 md:hidden">
          <h1 className="font-heading text-lg font-medium tracking-tight">{t.home.appTitle}</h1>
        </div>
        <div className="shrink-0 border-b border-hairline bg-sidebar px-4 py-2 md:hidden">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <MobileFolderPill
              icon={{ type: 'lucide', value: 'frame' }}
              label={t.home.allFrames}
              count={frameIds.length}
              active={selectedId === ALL_ID}
              onClick={() => selectFolder(ALL_ID)}
            />
            <MobileFolderPill
              icon={{ type: 'lucide', value: 'square-pen' }}
              label={t.home.draft}
              count={countFor(null)}
              active={selectedId === DRAFT_ID}
              onClick={() => selectFolder(DRAFT_ID)}
            />
            <MobileFolderPill
              icon={{ type: 'lucide', value: 'palette' }}
              label={t.home.themes}
              count={themeRegistry.length}
              active={selectedId === THEMES_ID}
              onClick={() => selectFolder(THEMES_ID)}
            />
            <MobileFolderPill
              icon={{ type: 'lucide', value: 'images' }}
              label={t.home.assets}
              count={globalAssets.length}
              active={selectedId === ASSETS_ID}
              onClick={() => selectFolder(ASSETS_ID)}
            />
            {manifest.folders.map((f) => (
              <MobileFolderPill
                key={f.id}
                icon={f.icon}
                label={f.name}
                count={countFor(f.id)}
                active={selectedId === f.id}
                onClick={() => selectFolder(f.id)}
              />
            ))}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <Outlet context={ctx} />
        </div>
      </div>
    </div>
  );
}
