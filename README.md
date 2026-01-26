# ChefDeck 

ChefDeck is a recipe manager tool. It allows you to manage your recipes, organize them with tags, schedule them, and generate grocery lists. It is both a cloud-based web app and a (WIP) desktop application with optional cloud syncing.

## Quick summary

- ChefDeck uses Turborepo.
- The Next.js web application is at: `apps/web`
- The desktop Tauri app is at: `apps/desktop/`
- Shared code is at: `packages/shared`

## Prerequisites

- Node.js (LTS recommended; Node >= 18)
- A package manager
- For Tauri (desktop):
  - Rust toolchain (install via `rustup`)
  - Platform-specific native build tools:
    - macOS: Xcode command line tools
    - Linux: GTK dev packages (varies by distro)
    - Windows: Visual Studio / Build Tools
  - (Optional) Tauri CLI — you can use the local CLI in devDependencies or install globally

## Installing dependencies

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

## Development
### Runing both apps (recommended)

At the repo root you can use the root scripts that orchestrate workspaces via Turborepo:

```bash
# start both web and desktop dev tasks in parallel
npm run dev
```

The root script delegates to each app's `dev` script. Useful when you want shortcuts to run both at once.

### Runing a single workspace

- Run only the web app:
  ```bash
  # from repo root
  npm run dev:web
  ```

- Run only the desktop renderer (Vite preview / HMR):
  ```bash
  # from repo root
  npm run dev:desktop
  ```

## Build / production

From the root, run:
```bash
npm run build
```
this builds both web and desktop apps.
