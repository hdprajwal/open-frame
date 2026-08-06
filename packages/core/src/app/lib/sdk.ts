import type { ComponentType } from 'react';
import type { DesignSystem } from './design.ts';
import { FORMAT_PRESETS, type FormatPreset } from './formats.ts';
import type { FrameTransition } from './transition.ts';

export type Page = ComponentType & { transition?: FrameTransition };

export type FrameMeta = {
  title?: string;
  theme?: string;
  /** ISO 8601 timestamp. Set once at scaffold time; used to sort the frame list. */
  createdAt?: string;
  format?: FormatPreset;
  canvas?: { width: number; height: number };
};

export type FrameModule = {
  default: Page[];
  meta?: FrameMeta;
  design?: DesignSystem;
  // Index-aligned with `default`.
  notes?: (string | undefined)[];
  transition?: FrameTransition;
};

// 'lucide' is display-only for built-in rows (Draft, Themes, Assets); the
// icon picker and persisted folders only ever produce 'emoji' or 'color'.
export type FolderIcon =
  | { type: 'emoji'; value: string }
  | { type: 'color'; value: string }
  | { type: 'lucide'; value: 'square-pen' | 'palette' | 'images' };

export type Folder = {
  id: string;
  name: string;
  icon: FolderIcon;
};

export type FoldersManifest = {
  folders: Folder[];
  assignments: Record<string, string>;
};

export const CANVAS_WIDTH = FORMAT_PRESETS.slide.width;
export const CANVAS_HEIGHT = FORMAT_PRESETS.slide.height;
