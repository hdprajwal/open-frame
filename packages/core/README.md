# @open-frame/core

Runtime and CLI for [open-frame](https://github.com/hdprajwal/open-frame) — a React-based slide framework where you write slides and the framework handles the Vite/React stack, layout, navigation, hot reload, and fullscreen play mode.

## Install

```bash
pnpm add @open-frame/core
```

Most users get this installed automatically by running `npx @open-frame/cli init`. Use this package directly only if you're wiring up an existing workspace by hand.

## What's inside

- **Runtime** — home page, slide viewer, thumbnail rail, keyboard navigation, and fullscreen presenter mode. Every slide renders into a fixed **1920×1080** canvas; the framework scales it.
- **Vite plugin** — discovers `slides/<id>/index.{tsx,jsx,ts,js}`, exposes them via virtual modules, and reloads when slides are added or removed.
- **CLI** — `open-frame dev | build | preview` so workspaces never need to touch Vite, React, or tsconfig directly.

## CLI

Once installed, the `open-frame` bin is available in the workspace:

| Command | Description |
| --- | --- |
| `open-frame dev` | Start the dev server. Flags: `-p, --port <port>`, `--host [host]`, `--open`. |
| `open-frame build` | Build a static site. Flags: `--out-dir <dir>` (defaults to `dist`). |
| `open-frame preview` | Preview the production build. Flags: `-p, --port <port>`, `--host [host]`, `--open`. |

## Config

Create `open-frame.config.ts` in the workspace root (all fields optional):

```ts
import type { OpenFrameConfig } from '@open-frame/core';

const openFrameConfig: OpenFrameConfig = {
  slidesDir: 'slides',
  port: 5173,
};

export default openFrameConfig;
```

### Hosting under a subpath

Set `base` to deploy the built site under a sub-directory (intranet folders, GitHub Pages project sites, reverse proxies). Use a leading and trailing slash:

```ts
const openFrameConfig: OpenFrameConfig = {
  base: '/my-slides/',
};
```

The value is passed straight to Vite's `base` and to React Router's `basename`, so client-side navigation matches the deployed path.

## Authoring slides

Slides live under `slides/<kebab-case-id>/index.tsx` and default-export an array of `Page` components:

```tsx
import type { Page } from '@open-frame/core';

const Cover: Page = () => (
  <div className="flex h-full w-full items-center justify-center">
    <h1 className="text-[120px] font-bold">Hello, open-frame</h1>
  </div>
);

const pages: Page[] = [Cover];
export default pages;

export const meta = { title: 'Hello' };
```

## Exports

```ts
import {
  CANVAS_WIDTH,   // 1920
  CANVAS_HEIGHT,  // 1080
  unstable_SharedElement, // match or fade objects across pages for shared element transitions
  type Page,
  type SlideMeta,
  type SlideModule,
  type SlideTransition,
  type OpenFrameConfig,
} from '@open-frame/core';
```

The Vite plugin is exposed under a subpath for advanced setups:

```ts
import { createViteConfig } from '@open-frame/core/vite';
```

## License

MIT
