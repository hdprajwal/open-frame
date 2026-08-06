import { describe, expect, it } from 'vitest';
import { parseBorderRadius } from './border-radius.ts';

function uniform(value: string): string[] {
  return [value, value, value, value];
}

describe('parseBorderRadius', () => {
  it('reads a uniform pixel radius', () => {
    expect(parseBorderRadius(uniform('16px'))).toEqual({ kind: 'px', px: 16 });
  });

  it('rounds fractional pixels to two decimals', () => {
    expect(parseBorderRadius(uniform('16.456px'))).toEqual({ kind: 'px', px: 16.46 });
  });

  it('treats empty and zero values as no radius', () => {
    expect(parseBorderRadius(uniform(''))).toEqual({ kind: 'px', px: 0 });
    expect(parseBorderRadius(uniform('0px'))).toEqual({ kind: 'px', px: 0 });
    expect(parseBorderRadius([])).toEqual({ kind: 'px', px: 0 });
  });

  it('clamps negative pixel values to zero', () => {
    expect(parseBorderRadius(uniform('-4px'))).toEqual({ kind: 'px', px: 0 });
  });

  it('keeps a percentage radius as custom instead of reporting zero', () => {
    expect(parseBorderRadius(uniform('50%'))).toEqual({ kind: 'custom', value: '50%' });
  });

  it('keeps an elliptical radius as custom instead of dropping the second length', () => {
    expect(parseBorderRadius(uniform('10px 5px'))).toEqual({ kind: 'custom', value: '10px 5px' });
  });

  it('keeps unequal corners as custom instead of collapsing to the first one', () => {
    expect(parseBorderRadius(['8px', '0px', '0px', '8px'])).toEqual({
      kind: 'custom',
      value: '8px 0px 0px 8px',
    });
  });

  it('keeps values it cannot resolve as custom', () => {
    expect(parseBorderRadius(uniform('calc(10px + 5%)'))).toEqual({
      kind: 'custom',
      value: 'calc(10px + 5%)',
    });
  });
});
