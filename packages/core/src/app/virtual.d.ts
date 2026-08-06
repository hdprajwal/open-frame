declare module 'virtual:open-frame/frames' {
  import type { FrameModule } from './lib/sdk';
  export const frameIds: string[];
  export const frameThemes: Record<string, string>;
  export const frameCreatedAt: Record<string, number>;
  export function loadFrame(id: string): Promise<FrameModule>;
}

declare module 'virtual:open-frame/config' {
  import type { Locale } from '../locale/types';

  const config: {
    base?: string;
    framesDir?: string;
    port?: number;
    locale?: Locale;
    version: string;
    build: {
      showFrameBrowser: boolean;
      showFrameUi: boolean;
      allowHtmlDownload: boolean;
    };
  };
  export default config;
}

declare module 'virtual:open-frame/folders' {
  import type { FoldersManifest } from './lib/sdk';

  const manifest: FoldersManifest;
  export default manifest;
}

declare module 'virtual:open-frame/themes' {
  import type { DesignSystem } from './lib/design';
  import type { Page } from './lib/sdk';

  export type ThemeMeta = {
    id: string;
    name: string;
    description: string;
    body: string;
    hasDemo: boolean;
  };

  export const themes: ThemeMeta[];
  export function loadThemeDemo(id: string): Promise<{
    default: Page[];
    design?: DesignSystem;
  }>;
}
