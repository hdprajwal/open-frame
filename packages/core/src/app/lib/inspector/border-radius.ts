export type BorderRadius = { kind: 'px'; px: number } | { kind: 'custom'; value: string };

const SINGLE_PX = /^-?\d*\.?\d+px$/;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function parseCorner(value: string): BorderRadius {
  const raw = value.trim();
  if (!raw) return { kind: 'px', px: 0 };
  if (!SINGLE_PX.test(raw)) return { kind: 'custom', value: raw };
  const n = Number.parseFloat(raw);
  return { kind: 'px', px: Number.isFinite(n) && n > 0 ? round2(n) : 0 };
}

function canonical(radius: BorderRadius): string {
  return radius.kind === 'px' ? `${radius.px}px` : radius.value;
}

// Percentages resolve against each axis and elliptical corners carry two
// lengths, so neither survives a round trip through a single px field.
// They stay `custom` until the user explicitly replaces them.
export function parseBorderRadius(corners: readonly string[]): BorderRadius {
  const parsed = corners.map(parseCorner);
  const first = parsed[0];
  if (!first) return { kind: 'px', px: 0 };
  const keys = parsed.map(canonical);
  if (keys.every((key) => key === keys[0])) return first;
  return { kind: 'custom', value: keys.join(' ') };
}
