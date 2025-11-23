# ChefDeck — Monorepo (Turborepo)

This repository contains ChefDeck as a monorepo. I moved the existing Next.js web app into `apps/web` and added a minimal Tauri + Vite + React desktop renderer scaffold in `apps/desktop`. This README explains the repository layout, how to run each app for development, and what you must do to finish the desktop/native setup.

---

## Quick summary

- The Next.js web application (original app) now lives at: `apps/web`
- The desktop renderer (Vite + React) lives at: `apps/desktop/src`
- Minimal Tauri config placeholder: `apps/desktop/src-tauri/tauri.conf.json`
  - You must run `tauri init` to produce native code and fully initialize Tauri
- Root orchestrator is Turborepo: top-level scripts run dev/build across workspaces

---

## Repo layout

Top-level folders you should care about:

- `apps/web/` — Next.js app (source moved into `apps/web/src`)
  - `apps/web/package.json` — app-specific scripts and deps
  - `apps/web/next.config.ts`, `apps/web/tsconfig.json`, etc.
- `apps/desktop/` — Vite + React renderer + Tauri scaffolding
  - `apps/desktop/src/` — Vite root with `index.html`, `main.tsx`, styles
  - `apps/desktop/vite.config.ts` — Vite config
  - `apps/desktop/package.json` — scripts to run Vite and Tauri
  - `apps/desktop/src-tauri/tauri.conf.json` — placeholder config (run `tauri init` to finish)
- `packages/` — (empty placeholder) recommended place for shared code (UI, utils)
- Root files:
  - `package.json` — workspace config and turbo scripts
  - `turbo.json` — Turborepo pipeline configuration

---

## Prerequisites

- Node.js (LTS recommended; Node >= 18)
- A package manager (npm is fine; `pnpm` is recommended for monorepos)
- For Tauri (desktop):
  - Rust toolchain (install via `rustup`)
  - Platform-specific native build tools:
    - macOS: Xcode command line tools
    - Linux: GTK dev packages (varies by distro)
    - Windows: Visual Studio / Build Tools
  - (Optional) Tauri CLI — you can use the local CLI in devDependencies or install globally

---

## Install dependencies

From the repository root:

- Using npm:
  ```bash
  npm install
  ```

- Or using pnpm (recommended for monorepos):
  ```bash
  pnpm install
  ```

This installs dependencies for all workspace packages.

---

## Development: run both apps (recommended)

At the repo root you can use the root scripts that orchestrate workspaces via Turborepo:

```bash
# start both web and desktop dev tasks in parallel
npm run dev
```

The root script delegates to each app's `dev` script. Useful when you want shortcuts to run both at once.

---

## Run a single workspace

- Run only the web app:
  ```bash
  # from repo root
  npm run dev:web

  # or from apps/web
  cd apps/web
  npm run dev
  ```

- Run only the desktop renderer (Vite preview / HMR):
  ```bash
  # from repo root
  npm run dev:desktop

  # or from apps/desktop
  cd apps/desktop
  npm run dev:vite
  ```

- Run only Tauri native dev (after `tauri init`):
  ```bash
  cd apps/desktop
  npm run dev:tauri
  ```

Note: `apps/desktop` includes a `dev` script that uses `concurrently` to run both Vite and `tauri dev` together — handy once Tauri has been initialized.

---

## Desktop (Tauri) — important manual step

I added a minimal `src-tauri/tauri.conf.json` placeholder, but did not run `tauri init` (this step requires native toolchains and is interactive). To finish the native setup:

1. Ensure Rust + cargo are installed (via `rustup`).
2. From `apps/desktop` run:
   ```bash
   cd apps/desktop
   npx tauri init
   ```
   Answer the prompts. This generates native Rust files under `apps/desktop/src-tauri` and finalizes platform-specific scaffolding.
3. Add icons to `apps/desktop/src-tauri/icons` and update `tauri.conf.json` as needed.
4. Start dev (after init):
   ```bash
   # concurrently runs vite + tauri dev
   npm run dev
   ```

If you prefer using the globally installed Tauri CLI, `tauri init` and `tauri dev/build` will work via that CLI too.

---

## Build / production

- Build the Next.js web app:
  ```bash
  cd apps/web
  npm run build
  ```

- Build the desktop app (renderer + native package):
  ```bash
  cd apps/desktop
  npm run build
  # This runs `vite build` then `tauri build` (produces platform bundles)
  ```

From the root you can also run:
```bash
npm run build
```
which uses Turbo to run `build` across workspaces according to `turbo.json`.

---

## Sharing code between web and desktop

If you plan to reuse components or logic between `apps/web` and `apps/desktop`:
- Create a workspace package under `packages/` (e.g. `packages/shared-ui`) and export common components.
- Add the package to `workspaces` (root `package.json` already covers `apps/*`; add `packages/*` if you create packages).
- Update `tsconfig.json` path mappings if you want nicer import paths across workspaces.

---

## Troubleshooting

- Missing types / modules in your editor?
  - Run `npm install` (or `pnpm install`) first and then restart the editor/TS server.
- Vite port conflict:
  - The desktop Vite dev server uses port `5173` by default. Change it in `apps/desktop/vite.config.ts` if needed.
- Tauri build fails:
  - Ensure Rust and platform-specific dependencies (Xcode, GTK, Visual Studio Build Tools) are installed and in PATH.
- If Tauri cannot connect to the renderer during `tauri dev`, verify `devPath` in `apps/desktop/src-tauri/tauri.conf.json` matches your Vite dev URL (default: `http://localhost:5173`).

---

## Next recommended steps

- Run dependency install: `npm install` at repo root.
- Initialize Tauri: `cd apps/desktop && npx tauri init` (follow prompts).
- Optional: create `packages/shared-ui` to reuse UI between web and desktop.
- Optional: add CI config to build web and desktop artifacts.

---

If you'd like, I can:
- Create a `packages/shared-ui` workspace and move common components there (e.g. `Card`).
- Update `tsconfig` path aliases and workspace settings for shared imports.
- Add a Makefile or helper root scripts for common flows.

Tell me which of the above you'd like next and I'll prepare it.