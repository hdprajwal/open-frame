import { describe, expect, it } from 'vitest';
import { FORMAT_PRESETS, type FormatPreset, resolveCanvas } from './formats.ts';
import type { FrameMeta } from './sdk.ts';

describe('FORMAT_PRESETS', () => {
  const expected: Record<FormatPreset, { width: number; height: number }> = {
    slide: { width: 1920, height: 1080 },
    carousel: { width: 1080, height: 1080 },
    portrait: { width: 1080, height: 1350 },
    story: { width: 1080, height: 1920 },
    thumbnail: { width: 1280, height: 720 },
    og: { width: 1200, height: 630 },
    'x-post': { width: 1600, height: 900 },
  };

  for (const [preset, size] of Object.entries(expected)) {
    it(`resolves ${preset} to ${size.width}x${size.height}`, () => {
      const meta: FrameMeta = { format: preset as FormatPreset };
      expect(resolveCanvas(meta)).toEqual(size);
    });
  }
});

describe('resolveCanvas defaults', () => {
  it('defaults to the slide preset when meta is undefined', () => {
    expect(resolveCanvas(undefined)).toEqual({ width: 1920, height: 1080 });
  });

  it('defaults to the slide preset when meta is empty', () => {
    expect(resolveCanvas({})).toEqual({ width: 1920, height: 1080 });
  });
});

describe('resolveCanvas precedence', () => {
  it('prefers meta.canvas over meta.format when both are set', () => {
    const meta: FrameMeta = { format: 'carousel', canvas: { width: 640, height: 480 } };
    expect(resolveCanvas(meta)).toEqual({ width: 640, height: 480 });
  });
});

describe('resolveCanvas error handling', () => {
  it('throws on an unknown format naming the bad value and listing valid presets', () => {
    const meta = { format: 'bogus' } as unknown as FrameMeta;
    expect(() => resolveCanvas(meta)).toThrowError(/bogus/);
    try {
      resolveCanvas(meta);
      throw new Error('expected resolveCanvas to throw');
    } catch (error) {
      const message = (error as Error).message;
      expect(message).toContain('bogus');
      for (const preset of [
        'slide',
        'carousel',
        'portrait',
        'story',
        'thumbnail',
        'og',
        'x-post',
      ]) {
        expect(message).toContain(preset);
      }
    }
  });

  it('names the frame id in the unknown-format error when provided', () => {
    const meta = { format: 'bogus' } as unknown as FrameMeta;
    expect(() => resolveCanvas(meta, 'my-frame')).toThrowError(/my-frame/);
  });

  it.each([
    ['zero width', { width: 0, height: 1080 }],
    ['negative width', { width: -100, height: 1080 }],
    ['NaN width', { width: Number.NaN, height: 1080 }],
    ['Infinity width', { width: Number.POSITIVE_INFINITY, height: 1080 }],
    ['missing height', { width: 1920 } as { width: number; height: number }],
    ['zero height', { width: 1920, height: 0 }],
    ['negative height', { width: 1920, height: -1 }],
  ])('throws on invalid canvas dims: %s', (_label, canvas) => {
    const meta: FrameMeta = { canvas };
    expect(() => resolveCanvas(meta, 'bad-canvas-frame')).toThrowError(/bad-canvas-frame/);
  });

  it('names the frame id in the invalid-canvas error when provided', () => {
    const meta: FrameMeta = { canvas: { width: 0, height: 0 } };
    expect(() => resolveCanvas(meta, 'zero-canvas')).toThrowError(/zero-canvas/);
  });
});

describe('resolveCanvas registry immutability', () => {
  it('does not let callers mutate the underlying preset via the returned object', () => {
    const first = resolveCanvas({ format: 'og' });
    first.width = 1;
    first.height = 1;
    const second = resolveCanvas({ format: 'og' });
    expect(second).toEqual({ width: 1200, height: 630 });
  });

  it('does not let callers mutate FORMAT_PRESETS entries directly', () => {
    try {
      FORMAT_PRESETS.slide.width = 1;
      FORMAT_PRESETS.slide.height = 1;
    } catch {}
    expect(FORMAT_PRESETS.slide).toEqual({ width: 1920, height: 1080 });
    expect(resolveCanvas({ format: 'slide' })).toEqual({ width: 1920, height: 1080 });
  });
});
