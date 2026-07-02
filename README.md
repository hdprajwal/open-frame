# open-studio

A studio for making slides, LinkedIn carousels, story graphics, YouTube thumbnails, OG images, and X post images with React and a coding agent. You describe what you want in plain language. Your agent writes the pages. open-studio handles the canvas, scaling, navigation, hot reload, present mode, and exports.

## What it is

open-studio started as a fork of [open-slide](https://github.com/1weiho/open-slide), a slide framework built for coding agents. open-slide renders every page into a fixed 1920 × 1080 canvas. open-studio generalizes that: each deck picks its own canvas format, so one workspace can hold talk slides, a LinkedIn carousel, an Instagram story, and a thumbnail side by side. Every page is a plain React component, not a constrained DSL.

## Formats

Set a format in the deck's meta and every page in that deck renders, previews, and exports at that size.

| Preset | Size | Use for |
| --- | --- | --- |
| `slide` | 1920 × 1080 | Talks and presentations (default) |
| `carousel` | 1080 × 1080 | LinkedIn and Instagram carousels |
| `portrait` | 1080 × 1350 | Portrait feed posts |
| `story` | 1080 × 1920 | Instagram and WhatsApp stories |
| `thumbnail` | 1280 × 720 | YouTube thumbnails |
| `og` | 1200 × 630 | Open Graph and link preview images |
| `x-post` | 1600 × 900 | X post images |

If none of these fit, set a custom `canvas` with any width and height.

## Highlights

### Agent authoring

Works with any coding agent (Claude Code, Codex, Cursor). The workspace ships with skills the agent reads before writing:

- `/create-slide` drafts a deck end to end. It asks a few scoping questions (topic, format, page count, text density, motion), plans the structure, and writes the pages.
- `/slide-authoring` is the technical reference for the canvas, type scale, palette, and layout rules for each format.

### In-browser inspector

Click any element in the dev server and attach a comment, like "make this red" or "shrink the headline". Comments are saved as `@slide-comment` markers in the source. Run `/apply-comments` and the agent applies every pending edit and clears the markers.

### Assets manager with logo search

Manage images, videos, and fonts per deck through a built-in assets panel. Search and drop in brand logos through the integrated [svgl](https://svgl.app/) catalogue.

### Present mode

Fullscreen playback with keyboard navigation, plus a presenter view with current and next slide, speaker notes, and a timer.

### Exports

Export a deck as a PDF, a PPTX, or PNG images, each sized to the deck's canvas format. You can also export a self-contained static HTML site.

### Slide manager

Organize decks into folders with custom emoji and drag and drop to reorder.

### Deploy anywhere

The build output is plain static files. Host it on Vercel, Cloudflare Pages, Netlify, or any static host. No server and no lock-in.

## Get started

The packages are not published to npm under the open-studio name yet, so for now run it from the repo:

```bash
git clone https://github.com/hdprajwal/open-studio
cd open-studio
pnpm install
pnpm dev
```

`pnpm dev` runs the demo workspace in `apps/demo` against the local core. From there you drive decks through your agent, or edit `slides/<id>/index.tsx` directly.

## Repo layout

This repo is a pnpm + Turbo monorepo.

| Path | Description |
| --- | --- |
| [packages/core](packages/core) | `@open-studio/core`. The runtime (home page, slide viewer, present mode, inspector), the Vite plugin, and the dev/build/preview CLI. |
| [packages/cli](packages/cli) | `@open-studio/cli`. The `init` scaffolder. It generates a minimal workspace where Vite, React, and tsconfig stay hidden inside core. |
| [apps/demo](apps/demo) | Example workspace that consumes the local core. Used for developing the framework. |
| [apps/web](apps/web) | Marketing site (Next.js). |

## Development

```bash
pnpm install
pnpm dev        # runs the demo against the local core
pnpm build      # builds all packages
pnpm typecheck  # type-checks all packages
pnpm check      # formats and lints via biome
pnpm test       # runs unit tests
```

## License

MIT

## Credits

open-studio is built on [open-slide](https://github.com/1weiho/open-slide) by [Yiwei Ho (1weiho)](https://github.com/1weiho). The runtime, the inspector, the present mode, and the agent-first authoring model all come from his work. This fork adds multi-format canvases and format-correct exports on top. If open-slide is useful to you, go star it and [support him on Ko-fi](https://ko-fi.com/D1D11YPUP1).
