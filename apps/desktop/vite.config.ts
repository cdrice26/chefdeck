import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Vite configuration for the Tauri + Vite + React desktop app.
 *
 * - Compute paths using `import.meta.url` so the config works under ESM without
 *   relying on the CommonJS `__dirname` global.
 * - `root` points to the `src` directory so Vite serves/builds from there.
 * - `outDir` is the `dist` directory inside the desktop app folder which Tauri will consume.
 * - `base` is `./` so the app works when loaded from the filesystem.
 * - Alias `@` -> `src` for convenience.
 */
const root = path.resolve(fileURLToPath(new URL('./src', import.meta.url)));
const outDir = path.resolve(fileURLToPath(new URL('./dist', import.meta.url)));

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  return {
    root,
    base: './',
    plugins: [react()],
    resolve: {
      alias: {
        // `root` already points at the `src` directory, use that directly.
        '@': root
      }
    },
    server: {
      // Pick a fixed port so Tauri can connect to the dev server predictably.
      port: 5173,
      strictPort: true,
      // Allow serving files from the desktop app folder (useful for assets)
      fs: {
        // Use path.resolve(root) to produce a normalized absolute path.
        allow: [path.resolve(root)]
      },
      // HMR configuration: keep defaults; override only if you need platform-specific tweaks.
      hmr: {}
    },
    build: {
      outDir,
      emptyOutDir: true,
      sourcemap: isDev,
      target: 'esnext',
      rollupOptions: {
        input: path.resolve(root, 'index.html')
      }
    },
    optimizeDeps: {
      include: ['@tauri-apps/api']
    },
    define: {
      // Ensure code can detect production mode for Tauri-related conditionals
      'process.env.NODE_ENV': JSON.stringify(isDev ? 'development' : 'production')
    }
  };
});
