import type { Locale } from './locale/types';

export type OpenFrameBuildConfig = {
  showFrameBrowser?: boolean;
  showFrameUi?: boolean;
  allowHtmlDownload?: boolean;
};

export type OpenFrameConfig = {
  base?: string;
  framesDir?: string;
  themesDir?: string;
  assetsDir?: string;
  port?: number;
  /**
   * @deprecated Pick the UI language from the language switcher in the frame UI
   * instead. When set, this only seeds the initial language until the user
   * chooses one (their choice is then remembered locally).
   */
  locale?: Locale;
  build?: OpenFrameBuildConfig;
};
