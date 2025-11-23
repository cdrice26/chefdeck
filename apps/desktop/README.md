# ChefDeck — Desktop (Tauri + Vite + React)

This folder provides a minimal Tauri desktop shell around a Vite + React frontend.
It is intentionally lightweight so you can integrate the existing web UI or build
desktop-specific UI. The repository is a Turborepo monorepo; the Next.js web app
lives in `apps/web`. This README explains the steps a developer must follow to
finish the Tauri/native setup and get the desktop app running for development
and production builds.

Important: this repo contains a minimal `src-tauri/tauri.conf.json` to mark the
app initialized, but you still need to finish the native-side setup (install
Rust, the correct native toolchain, and optionally run `tauri init`/`tauri dev`
to generate native platform files). Follow the steps below.

Table of contents
- Prerequisites
- Install dependencies (monorepo)
- Development (recommended)
- Running only the renderer (Vite) or Tauri
- Building a production desktop bundle
- Icons / assets / tauri.conf edits
- Environment variables & secrets
- Troubleshooting & tips

Prerequisites
- Node.js (LTS recommended; Node >= 18)
- A package manager (npm, pnpm, or yarn). The workspace is configured as npm
  workspaces, but pnpm also works fine in most cases.
- Rust + Cargo (required for building/running Tauri native code)
  - Install via rustup: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
  - Ensure `cargo` is on your PATH.
- Platform-specific native dependencies:
  - macOS: Xcode command line tools (`xcode-select --install`).
  - Linux: GTK and required dev packages (varies by distro; see Tauri docs).
  - Windows: Visual Studio / Build Tools (see Tauri docs).
- (Optional) Tauri CLI: you can use the local CLI that's a devDependency, or
  install the CLI globally with `cargo install tauri-cli` if preferred.

Install dependencies (monorepo)
- From the repository root (where `package.json` and `turbo.json` live):
  - npm:
    - `npm install`
  - or pnpm (recommended for monorepos):
    - `pnpm install`
  This will install workspace packages, including `apps/desktop` and `apps/web`.

Development (recommended)
This project is set up as a Turborepo. There are scripts in the root package.json
to orchestrate workspaces.

- Start both web and desktop dev tasks in parallel (uses Turborepo):
  - From repository root:
    - `npm run dev`
  - This will run the `dev` pipeline (starts children `dev` scripts per package).

- To run only the desktop app (concurrently runs Vite + Tauri dev):
  - From repository root:
    - `npm run dev:desktop`
  - Or from inside `apps/desktop`:
    - `cd apps/desktop`
    - `npm run dev`
    - This script uses `concurrently` to start the Vite dev server and Tauri dev.

Running the renderer (Vite) and Tauri separately
Sometimes it's useful to run only the renderer or only the native runtime.

- Start only the Vite renderer (hot-reload for the frontend):
  - `cd apps/desktop && npm run dev:vite`
  - Vite serves the app at `http://localhost:5173` (configured in `vite.config.ts`).

- Start only Tauri and point it to an already running dev server:
  - `cd apps/desktop && npm run dev:tauri`
  - If you run Tauri dev this way, it expects `devPath` in `src-tauri/tauri.conf.json`
    to match the Vite dev URL (`http://localhost:5173` by default).

Building a production desktop bundle
- Build the renderer and then package with Tauri:
  - From `apps/desktop`:
    - `npm run build`
    - This runs `vite build` (output to `apps/desktop/dist`) and then `tauri build`
      to produce platform-specific bundles (dmg, deb, msi, etc., depending on host).
- Alternatively, run the two steps manually:
  - `cd apps/desktop`
  - `npm run build:vite` (if you add that script) or `vite build`
  - `npx tauri build` (or `npm run tauri:build`)

Icons, assets and tauri.conf.json
- `src-tauri/tauri.conf.json` included here is a minimal config. You must:
  - Add platform icons under `src-tauri/icons` (recommended sizes: 32x32, 128x128,
    512x512, etc.). Update `tauri.conf.json` `bundle.icon` entries accordingly.
  - Set `package.productName` and `tauri.bundle.identifier` appropriately.
  - For code signing and notarization (macOS) or installer customization (Windows/
    Linux), consult the Tauri docs and your platform's packaging/signing workflow.

Sharing code between `apps/web` (Next.js) and the desktop app
- You can reuse UI components and logic by creating packages under `packages/`
  or by importing shared code directly if you prefer (watch import paths and
  TypeScript path config).
- If you want the desktop app to embed the built Next app rather than a Vite
  build, you'd need to produce a static export and adjust `tauri.conf.json`'s
  `distDir` to point to that static folder. The current setup uses a Vite React
  renderer located in `apps/desktop/src`.

Environment variables & secrets
- Use Vite `.env` files for frontend config (`.env`, `.env.development`, `.env.production`).
- Do not commit secret keys. For secrets that must be available to native Rust
  code, use Tauri's secret management or pass values at build time/config files.
- For keys you want in the renderer, use Vite's `VITE_` prefixed env variables:
  - e.g. `VITE_API_URL=https://...` accessible as `import.meta.env.VITE_API_URL`.

Troubleshooting & tips
- If `tauri dev` fails with Rust toolchain errors:
  - Ensure `rustup` is installed and `rustc`/`cargo` are in PATH.
  - Run `rustup target add <target>` if needed, and install any platform developers tools.
- If `tauri build` fails on macOS due to signing issues, you may need to configure
  code signing or use `--no-sign` options during local test builds.
- If Vite's port is already in use, change the port in `vite.config.ts` or stop
  the conflicting service.
- If you prefer to use the local Tauri CLI from devDependencies, use:
  - `npx tauri dev` or `npx tauri build` (from `apps/desktop`).
- If the renderer works in the browser but the packaged app fails to load assets,
  check `tauri.conf.json` `distDir` and Vite `build.outDir` to ensure they match.

Next steps checklist (developer)
- [ ] Install Rust toolchain and verify `cargo` works.
- [ ] Run `npm install` (or `pnpm install`) at repo root to populate workspace deps.
- [ ] Add icons to `src-tauri/icons` and update `tauri.conf.json`.
- [ ] Verify `devPath` and `distDir` in `src-tauri/tauri.conf.json` match Vite config.
- [ ] Run `npm run dev:desktop` to iterate quickly (or run Vite and Tauri separately).
- [ ] Run `npm run build` to produce distribution artifacts.

Useful commands summary
- From repository root:
  - Install: `npm install` or `pnpm install`
  - Start both apps via Turborepo: `npm run dev`
  - Start only web workspace: `npm run dev:web`
  - Start only desktop workspace: `npm run dev:desktop`
- From `apps/desktop`:
  - Start both renderer + tauri (concurrently): `npm run dev`
  - Start only vite: `npm run dev:vite`
  - Start only tauri: `npm run dev:tauri`
  - Build (renderer + native): `npm run build`
  - Tauri build only: `npm run tauri:build` (or `npx tauri build`)

Resources
- Official Tauri documentation is the authoritative source for platform-specific
  setup, packaging, and signing. Consult it for advanced configuration and
  platform prerequisites.

If you want, I can:
- Add a `Makefile` or more explicit scripts to simplify local development.
- Create a `packages/shared-ui` workspace to share components across web & desktop.
- Add CI config to produce desktop artifacts automatically.

If you'd like me to add any of those, tell me which one and I'll prepare the files and scripts.