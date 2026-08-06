# open-frame — Agent Guide

You are authoring **frames** in this repo. Every frame is arbitrary React code that you write.

## Hard rules

- Put your frame under `frames/<kebab-case-id>/`.
- The entry is `frames/<id>/index.tsx`.
- Put frame-specific images/videos/fonts under `frames/<id>/assets/`. For assets reused across decks or themes (logos, avatars), use the global `assets/` folder and import via `@assets/...`.
- Do **not** touch `package.json`, `open-frame.config.ts`, or other frames.
- Do not add dependencies. Use only `react` and standard web APIs.

## Which skill to use

- **Drafting a new deck** — use the `create-frame` skill. It walks through scoping questions, structure, and hand-off.
- **Applying inspector comments** (`@frame-comment` markers in a page) — use the `apply-comments` skill.
- **Creating or extracting a theme** — use the `create-theme` skill. Themes live as markdown under `themes/<id>.md` and are read by `create-frame` before authoring.
- **Resolving "this page" / "this element"** — when the user references the current frame or selection without naming it, consult the `current-frame` skill. It reads the dev server's `node_modules/.open-frame/current.json` to find which frame, page, and inspector-picked element they mean.
- **Any other frame edit** — read the `frame-authoring` skill before writing. It is the technical reference for everything inside `frames/<id>/`: file contract, the 1920×1080 canvas, type scale, palette, layout, assets, self-review checklist, and anti-patterns. `create-frame` and `apply-comments` both defer to it for the *how*.

Keep this file short: hard rules only. All deeper guidance lives in the skills above.

## Updating skills

The skills above are managed by `@open-frame/core`. Do not edit them in place. To pull the latest versions:

```
pnpm up @open-frame/core
pnpm sync:skills
```

`pnpm dev` will also detect drift on startup and offer to sync. `pnpm sync:skills --dry-run` (via `pnpm exec open-frame sync:skills --dry-run`) previews changes without writing.
