type ArrowKeyEvent = {
  key: string;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  isComposing?: boolean;
};

export function thumbnailArrowTarget(
  event: ArrowKeyEvent,
  index: number,
  count: number,
): number | null {
  if (event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return null;
  const direction =
    event.key === 'ArrowRight' || event.key === 'ArrowDown'
      ? 1
      : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
        ? -1
        : 0;
  if (!direction) return null;
  return Math.min(Math.max(index + direction, 0), count - 1);
}
