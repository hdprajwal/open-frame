import { capturePagesAsPng } from './capture';
import { downloadBlob } from './download';
import { resolveCanvas } from './formats';
import type { SlideModule } from './sdk';

export type PngExportProgress = {
  phase: 'processing' | 'generating' | 'done';
  current: number;
  total: number;
  percent: number;
};

export async function exportSlideAsPng(
  slide: SlideModule,
  slideId: string,
  onProgress?: (progress: PngExportProgress) => void,
): Promise<void> {
  const pages = slide.default ?? [];
  if (pages.length === 0) return;

  const total = pages.length;
  const canvas = resolveCanvas(slide.meta, slideId);
  onProgress?.({ phase: 'processing', current: 0, total, percent: 0 });

  try {
    const images = await capturePagesAsPng(slide, canvas, (captured) => {
      onProgress?.({
        phase: 'processing',
        current: captured,
        total,
        percent: Math.min(95, (captured / total) * 95),
      });
    });

    if (images.length === 1) {
      downloadBlob(new Blob([images[0] as BlobPart], { type: 'image/png' }), `${slideId}.png`);
      return;
    }

    onProgress?.({ phase: 'generating', current: total, total, percent: 98 });
    const pad = Math.max(2, String(images.length).length);
    const { zipSync } = await import('fflate');
    const files: Record<string, Uint8Array> = {};
    for (let i = 0; i < images.length; i++) {
      files[`${slideId}-${String(i + 1).padStart(pad, '0')}.png`] = images[i];
    }
    const zipped = zipSync(files);
    downloadBlob(new Blob([zipped as BlobPart], { type: 'application/zip' }), `${slideId}.zip`);
  } finally {
    onProgress?.({ phase: 'done', current: total, total, percent: 100 });
  }
}
