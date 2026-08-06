import {
  frameCreatedAt as createdAt,
  frameIds as ids,
  loadFrame as load,
  frameThemes as themes,
} from 'virtual:open-frame/frames';
import { resolveCanvas } from './formats.ts';
import type { FrameModule } from './sdk';

export const frameIds: string[] = ids;
export const frameThemes: Record<string, string> = themes;
export const frameCreatedAt: Record<string, number> = createdAt;

export function framesByTheme(themeId: string): string[] {
  return frameIds.filter((id) => frameThemes[id] === themeId);
}

export async function loadFrame(id: string): Promise<FrameModule> {
  const mod = await load(id);
  resolveCanvas(mod.meta, id);
  return mod;
}

export function frameChangeIncludes(data: unknown, frameId: string): boolean {
  if (!data || typeof data !== 'object') return false;
  const payload = data as { frameId?: unknown; frameIds?: unknown };
  if (payload.frameId === frameId) return true;
  return Array.isArray(payload.frameIds) && payload.frameIds.includes(frameId);
}
