import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * The theme declares value-named font sizes (`text-13`, `text-14`, …).
 * tailwind-merge can't tell those from text *colors*, so without this it drops
 * the size whenever a class list also sets a color — `text-14 text-brand-deep`
 * silently loses the 14px. Keep this list in sync with the `--text-*` tokens in
 * styles.css.
 */
const FONT_SIZES = [
  '9.5',
  '10',
  '10.5',
  '11',
  '11.5',
  '12',
  '12.5',
  '13',
  '13.5',
  '14',
  '15',
  '18',
  '21',
  '32',
  '44',
];

const twMerge = extendTailwindMerge({
  extend: { classGroups: { 'font-size': [{ text: FONT_SIZES }] } },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
