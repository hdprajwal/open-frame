import { describe, expect, it } from 'vitest';
import { thumbnailArrowTarget } from './thumbnail-keys.ts';

const key = (k: string, mods: Partial<Record<'altKey' | 'ctrlKey' | 'metaKey', boolean>> = {}) => ({
  key: k,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  ...mods,
});

describe('thumbnailArrowTarget', () => {
  it('moves forward on ArrowDown and ArrowRight', () => {
    expect(thumbnailArrowTarget(key('ArrowDown'), 1, 5)).toBe(2);
    expect(thumbnailArrowTarget(key('ArrowRight'), 1, 5)).toBe(2);
  });

  it('moves back on ArrowUp and ArrowLeft', () => {
    expect(thumbnailArrowTarget(key('ArrowUp'), 2, 5)).toBe(1);
    expect(thumbnailArrowTarget(key('ArrowLeft'), 2, 5)).toBe(1);
  });

  it('clamps at both ends', () => {
    expect(thumbnailArrowTarget(key('ArrowUp'), 0, 5)).toBe(0);
    expect(thumbnailArrowTarget(key('ArrowDown'), 4, 5)).toBe(4);
  });

  it('ignores modified arrows and composition', () => {
    expect(thumbnailArrowTarget(key('ArrowRight', { altKey: true }), 1, 5)).toBeNull();
    expect(thumbnailArrowTarget(key('ArrowRight', { ctrlKey: true }), 1, 5)).toBeNull();
    expect(thumbnailArrowTarget(key('ArrowRight', { metaKey: true }), 1, 5)).toBeNull();
    expect(thumbnailArrowTarget({ ...key('ArrowRight'), isComposing: true }, 1, 5)).toBeNull();
  });

  it('ignores non-arrow keys', () => {
    expect(thumbnailArrowTarget(key(' '), 1, 5)).toBeNull();
    expect(thumbnailArrowTarget(key('PageDown'), 1, 5)).toBeNull();
    expect(thumbnailArrowTarget(key('Enter'), 1, 5)).toBeNull();
  });
});
