import type { Page } from './sdk';

export type TransitionPhase = {
  keyframes: Keyframe[] | PropertyIndexedKeyframes;
  easing?: string;
  duration?: number;
  delay?: number;
};

export type FrameTransition = {
  duration: number;
  easing?: string;
  enter?: TransitionPhase;
  exit?: TransitionPhase;
  sharedElements?: boolean | SharedElementTransition;
};

export type SharedElementTransition = {
  duration?: number;
  easing?: string;
  delay?: number;
};

export function resolveTransition(
  pages: Page[],
  index: number,
  moduleDefault?: FrameTransition,
): FrameTransition | undefined {
  return pages[index]?.transition ?? moduleDefault;
}
