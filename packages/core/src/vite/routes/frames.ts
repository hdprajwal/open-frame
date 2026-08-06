import fs from 'node:fs/promises';
import type { ViteDevServer } from 'vite';
import {
  duplicateFrameDir,
  duplicateNotesElementInSource,
  duplicatePageInDefaultExportInSource,
  FRAME_ID_RE,
  removeNotesElementInSource,
  removePageFromDefaultExportInSource,
  reorderDefaultExportPagesInSource,
  reorderNotesArrayInSource,
  resolveFrameEntry,
  rmFrameDir,
  updateMetaTitleInSource,
  validateFrameName,
} from '../../editing/frame-ops.ts';
import { readManifest, writeManifest } from '../../files/folders.ts';
import { writeTrackedFile } from '../../files/self-writes.ts';
import { validateMutationRequest } from '../../http/request-guard.ts';
import { type ApiContext, json, readBody } from './context.ts';

// PUT    /__frames/:id/reorder            reorder pages { order: number[] }
// DELETE /__frames/:id/pages/:i           remove page
// POST   /__frames/:id/pages/:i/duplicate duplicate page
// POST   /__frames/:id/duplicate          duplicate frame directory { newId? }
// PATCH  /__frames/:id                    rename frame (writes meta.title)
// DELETE /__frames/:id                    delete frame directory + folder assignment

type DuplicateFrameBody = { newId?: unknown };
type FramePatchBody = { name?: unknown };

export function registerFrameRoutes(server: ViteDevServer, ctx: ApiContext): void {
  server.middlewares.use('/__frames', async (req, res, next) => {
    const url = new URL(req.url ?? '/', 'http://local');
    const method = req.method ?? 'GET';

    try {
      const reorderMatch = url.pathname.match(/^\/([^/]+)\/reorder$/);
      if (reorderMatch && method === 'PUT') {
        const requestCheck = validateMutationRequest(req, { requireJsonBody: true });
        if (!requestCheck.ok) {
          return json(res, requestCheck.status, { error: requestCheck.error });
        }
        const frameId = reorderMatch[1];
        if (!FRAME_ID_RE.test(frameId)) return json(res, 400, { error: 'invalid frameId' });

        const body = (await readBody(req)) as { order?: unknown };
        if (!Array.isArray(body.order)) return json(res, 400, { error: 'invalid order' });
        const order: number[] = [];
        for (const v of body.order) {
          if (!Number.isInteger(v)) return json(res, 400, { error: 'invalid order' });
          order.push(v as number);
        }

        const entry = resolveFrameEntry(ctx.framesRoot, frameId);
        if (!entry) return json(res, 400, { error: 'invalid frameId' });

        let source: string;
        try {
          source = await fs.readFile(entry, 'utf8');
        } catch {
          return json(res, 404, { error: 'frame not found' });
        }

        const reordered = reorderDefaultExportPagesInSource(source, order);
        if (reordered === null) {
          return json(res, 422, {
            error: 'could not reorder pages — order must be a permutation of the existing array',
          });
        }
        const withNotes = reorderNotesArrayInSource(reordered, order);
        if (withNotes === null) {
          return json(res, 422, {
            error: 'could not reorder pages — `notes` export has an unexpected shape',
          });
        }
        if (withNotes !== source) {
          await writeTrackedFile(entry, withNotes);
        }
        return json(res, 200, { ok: true, frameId, order });
      }

      const pageOpMatch = url.pathname.match(/^\/([^/]+)\/pages\/(\d+)(?:\/([a-z]+))?$/);
      if (pageOpMatch) {
        const frameId = pageOpMatch[1];
        const pageIndex = Number.parseInt(pageOpMatch[2], 10);
        const op = pageOpMatch[3];
        if (!FRAME_ID_RE.test(frameId)) return json(res, 400, { error: 'invalid frameId' });
        if (!Number.isInteger(pageIndex) || pageIndex < 0)
          return json(res, 400, { error: 'invalid page index' });

        const isDelete = method === 'DELETE' && !op;
        const isDuplicate = method === 'POST' && op === 'duplicate';
        if (!isDelete && !isDuplicate) return next();
        const requestCheck = validateMutationRequest(req);
        if (!requestCheck.ok) {
          return json(res, requestCheck.status, { error: requestCheck.error });
        }

        const entry = resolveFrameEntry(ctx.framesRoot, frameId);
        if (!entry) return json(res, 400, { error: 'invalid frameId' });

        let source: string;
        try {
          source = await fs.readFile(entry, 'utf8');
        } catch {
          return json(res, 404, { error: 'frame not found' });
        }

        const updated = isDelete
          ? removePageFromDefaultExportInSource(source, pageIndex)
          : duplicatePageInDefaultExportInSource(source, pageIndex);
        if (updated === null) {
          return json(res, 422, {
            error: isDelete
              ? 'could not delete page — index out of range or default export is not an array'
              : 'could not duplicate page — index out of range or default export is not an array',
          });
        }
        const withNotes = isDelete
          ? removeNotesElementInSource(updated, pageIndex)
          : duplicateNotesElementInSource(updated, pageIndex);
        if (withNotes === null) {
          return json(res, 422, {
            error: isDelete
              ? 'could not delete page — `notes` export has an unexpected shape'
              : 'could not duplicate page — `notes` export has an unexpected shape',
          });
        }
        if (withNotes !== source) {
          await writeTrackedFile(entry, withNotes);
        }
        return json(res, 200, { ok: true, frameId, index: pageIndex });
      }

      const duplicateMatch = url.pathname.match(/^\/([^/]+)\/duplicate$/);
      if (duplicateMatch && method === 'POST') {
        const requestCheck = validateMutationRequest(req);
        if (!requestCheck.ok) {
          return json(res, requestCheck.status, { error: requestCheck.error });
        }
        const frameId = duplicateMatch[1];
        if (!FRAME_ID_RE.test(frameId)) return json(res, 400, { error: 'invalid frameId' });

        const body = (await readBody(req)) as DuplicateFrameBody;
        if (body.newId !== undefined && typeof body.newId !== 'string') {
          return json(res, 400, { error: 'invalid newId' });
        }

        const duplicated = await duplicateFrameDir(ctx.framesRoot, frameId, body.newId);
        if (!duplicated.ok) return json(res, duplicated.status, { error: duplicated.error });

        const manifest = await readManifest(ctx.manifestPath);
        const folderId = manifest.assignments[frameId];
        if (folderId) {
          manifest.assignments[duplicated.frameId] = folderId;
          await writeManifest(ctx.manifestPath, manifest);
        }
        return json(res, 200, { ok: true, frameId: duplicated.frameId });
      }

      const idMatch = url.pathname.match(/^\/([^/]+)$/);
      if (!idMatch) return next();
      const frameId = idMatch[1];
      if (!FRAME_ID_RE.test(frameId)) return json(res, 400, { error: 'invalid frameId' });

      if (method === 'PATCH') {
        const requestCheck = validateMutationRequest(req, { requireJsonBody: true });
        if (!requestCheck.ok) {
          return json(res, requestCheck.status, { error: requestCheck.error });
        }
        const body = (await readBody(req)) as FramePatchBody;
        const name = validateFrameName(body.name);
        if (!name) return json(res, 400, { error: 'invalid name' });

        const entry = resolveFrameEntry(ctx.framesRoot, frameId);
        if (!entry) return json(res, 400, { error: 'invalid frameId' });

        let source: string;
        try {
          source = await fs.readFile(entry, 'utf8');
        } catch {
          return json(res, 404, { error: 'frame not found' });
        }

        const updated = updateMetaTitleInSource(source, name);
        if (updated === null) {
          return json(res, 422, {
            error: 'could not locate a safe place to write meta.title in index.tsx',
          });
        }
        if (updated !== source) {
          await writeTrackedFile(entry, updated);
        }
        // The TSX edit lands through Vite's normal HMR pipeline, but the
        // React state holding `frame.meta` in the editor won't re-fetch on
        // its own — tell every client to refresh so the new title shows up.
        server.ws.send({ type: 'full-reload' });
        return json(res, 200, { ok: true, frameId, name });
      }

      if (method === 'DELETE') {
        const requestCheck = validateMutationRequest(req);
        if (!requestCheck.ok) {
          return json(res, requestCheck.status, { error: requestCheck.error });
        }
        const removed = await rmFrameDir(ctx.framesRoot, frameId);
        if (!removed) return json(res, 404, { error: 'frame not found' });

        const manifest = await readManifest(ctx.manifestPath);
        delete manifest.assignments[frameId];
        await writeManifest(ctx.manifestPath, manifest);
        return json(res, 200, { ok: true });
      }

      return next();
    } catch (err) {
      json(res, 500, { error: String((err as Error).message ?? err) });
    }
  });
}
