const cornerFades = {
  'top-right': 'radial-gradient(ellipse 80% 80% at 100% 0%, #000 50%, transparent 90%)',
  'bottom-left': 'radial-gradient(ellipse 80% 80% at 0% 100%, #000 50%, transparent 90%)',
} as const;

export function FadeGrid({ corner }: { corner: keyof typeof cornerFades }) {
  const mask = `
    repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px),
    repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px),
    ${cornerFades[corner]}
  `;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 select-none"
      style={{
        backgroundImage:
          'linear-gradient(to right, #e7e5e4 1px, transparent 1px), linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 0',
        maskImage: mask,
        WebkitMaskImage: mask,
        maskComposite: 'intersect',
        WebkitMaskComposite: 'source-in',
      }}
    />
  );
}
