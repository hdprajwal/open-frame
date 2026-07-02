import type { SlideMeta } from './sdk.ts';

export type FormatPreset =
  | 'slide'
  | 'carousel'
  | 'portrait'
  | 'story'
  | 'thumbnail'
  | 'og'
  | 'x-post';

export type CanvasSize = { width: number; height: number };

export const FORMAT_PRESETS: Record<FormatPreset, CanvasSize> = Object.freeze({
  slide: { width: 1920, height: 1080 },
  carousel: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
  thumbnail: { width: 1280, height: 720 },
  og: { width: 1200, height: 630 },
  'x-post': { width: 1600, height: 900 },
});

function isValidDimension(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function describeSlide(slideId: string | undefined): string {
  return slideId ? ` for slide "${slideId}"` : '';
}

export function resolveCanvas(meta: SlideMeta | undefined, slideId?: string): CanvasSize {
  if (meta?.canvas) {
    const { canvas } = meta;
    if (!isValidDimension(canvas.width) || !isValidDimension(canvas.height)) {
      throw new Error(
        `Invalid canvas${describeSlide(slideId)}: width and height must be finite numbers greater than 0 (got ${JSON.stringify(canvas)}).`,
      );
    }
    return { width: canvas.width, height: canvas.height };
  }

  if (meta?.format) {
    const preset = FORMAT_PRESETS[meta.format];
    if (!preset) {
      const validPresets = Object.keys(FORMAT_PRESETS).join(', ');
      throw new Error(
        `Unknown format "${meta.format}"${describeSlide(slideId)}. Valid presets: ${validPresets}.`,
      );
    }
    return { width: preset.width, height: preset.height };
  }

  return { width: FORMAT_PRESETS.slide.width, height: FORMAT_PRESETS.slide.height };
}
