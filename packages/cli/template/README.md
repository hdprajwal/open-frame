# open-frame workspace

Frames as React components. Each frame lives under `frames/<id>/index.tsx` and default-exports an array of page components. The `@open-frame/core` runtime handles layout, scaling, navigation, thumbnails, and fullscreen play mode — you just write the pages.

## Getting started

```bash
pnpm install
pnpm dev
```

Then open the dev server and edit `frames/getting-started/index.tsx`, or create a new frame at `frames/<your-frame>/index.tsx`.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server with hot reload. |
| `pnpm build` | Build a static bundle you can deploy. |
| `pnpm preview` | Preview the built bundle locally. |

## Authoring a frame

```tsx
// frames/my-frame/index.tsx
import type { Page, FrameMeta } from '@open-frame/core';

const Cover: Page = () => (
  <div style={{ width: '100%', height: '100%' }}>Hello</div>
);

export const meta: FrameMeta = { title: 'My frame' };
export default [Cover] satisfies Page[];
```

Every page renders into a fixed **1920 × 1080** canvas — design with absolute pixel values. Put images, videos, and fonts under `frames/<id>/assets/` and import them directly.

See [`CLAUDE.md`](./CLAUDE.md) for the full authoring guide.

## Navigation

- Arrow keys / PageUp / PageDown move between pages.
- `F` enters fullscreen play mode; Esc exits.
- In play mode: Space / → next, ← prev.

## Claude Code integration

This workspace ships with Claude Code skills preconfigured under `.claude/skills/` and `.agents/skills/`. Ask Claude Code to "make frames about X" and the `create-frame` skill takes over. Use `apply-comments` to iterate via inspector-style markers inside your source.

## Config

Optional `open-frame.config.ts` at the workspace root:

```ts
import type { OpenFrameConfig } from '@open-frame/core';

const openFrameConfig: OpenFrameConfig = {
  port: 5173,
};

export default openFrameConfig;
```

Supported fields: `framesDir`, `port`.
