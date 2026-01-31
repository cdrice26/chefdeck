# ChefDeck 

ChefDeck is a recipe manager tool. It allows you to manage your recipes, organize them with tags, schedule them, and generate grocery lists. It is both a cloud-based web app and a (WIP) desktop application with optional cloud syncing.

## Quick summary

- ChefDeck uses Turborepo.
- The Next.js web application is at: `apps/web`
- The desktop Tauri app is at: `apps/desktop`
- Shared code is at: `packages/shared`

## Prerequisites

- Node.js and `npm`
- For Tauri (desktop):
  - Rust toolchain (install via `rustup`)
  - Platform-specific native build tools:
    - macOS: Xcode command line tools
    - Linux: GTK dev packages (varies by distro)
    - Windows: Visual Studio / Build Tools
  - (Optional) Tauri CLI — you can use the local CLI in devDependencies or install globally

## Environment Variables
You'll need to set the following environment variables for the web app (put `.env` file in `apps/web`):

- `SUPABASE_URL` - URL of your supabase database. You can use the sql scripts in the `apps/web/src/db` folder to set up the tables and procedures.
- `SUPABASE_ANON_KEY` - Your supabase anon key.
- `SUPABASE_SERVICE_ROLE_KEY` - Your supabase service role key. Used only for account deletion.
- `NEXT_PUBLIC_SITE_URL` - The URL of your website. This will be http://localhost:3000 in development.
- `PYTHON_API_URL` - URL of the Python API, used mostly for generating grocery lists. If you don't want to use this feature, you don't need it.

You'll also need the [Python API](https://github.com/cdrice26/chefdeck-python-api) cloned and running if you're using the grocery list feature.

For the desktop app Rust backend you'll need the following (put `.env` file in `apps/desktop/src-tauri`):
- `DATABASE_URL` - SQLx database connection URL for the sqlite database. The database should be located in the app's data directory and the .db file needs to be created in order for the app to compile. You can use the `sqlx` CLI to run migrations.
- `API_URL` - URL of the API in the web app. For dev, this would be `http://localhost:3000/api`.

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
