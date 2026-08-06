# @open-frame/cli

Scaffold a workspace for [open-frame](https://github.com/hdprajwal/open-frame) — a React-based multi-format content framework with Claude Code skills preconfigured.

## Usage

```bash
npx @open-frame/cli init my-frames
cd my-frames
pnpm install
pnpm dev
```

This creates a workspace containing:

- `frames/getting-started/` — a starter frame you can edit or delete.
- `package.json` — depends on `@open-frame/core`, which provides the runtime (home page, frame viewer, fullscreen mode) and the `open-frame` CLI.
- `open-frame.config.ts` — optional typed config (framesDir, port).
- `.claude/skills/` and `.agents/skills/` — Claude Code skills (`create-frame`, `apply-comments`, …).
- `CLAUDE.md` — agent guide for authoring frames.

You won't see any Vite, React, or tsconfig files in the workspace. They live inside `@open-frame/core` and you never touch them.

## Commands

| Command | Description |
| --- | --- |
| `open-frame init [dir]` | Scaffold a new workspace in `dir` (defaults to current dir). |
| `open-frame init --force` | Scaffold into a non-empty directory. |
| `open-frame init --name <name>` | Override the generated `package.json` name. |

(Once installed in the workspace, `@open-frame/core` provides `open-frame dev`, `open-frame build`, and `open-frame preview` via its own bin.)

## Authoring

Inside the scaffolded workspace, frames live under `frames/<kebab-case-id>/index.tsx` and default-export an array of `Page` components. Each page renders into a fixed 1920×1080 canvas; the framework handles scaling.

Ask Claude Code to "make frames about X" and the `create-frame` skill will take it from there.
