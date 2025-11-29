import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      // Ensure the desktop build resolves to the single React/react-dom copy
      // located at the workspace root. This prevents multiple React copies
      // (which cause invalid hook call errors) when running the Tauri app.
      react: path.resolve(__dirname, '../../node_modules/react'),
      'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
      // JSX runtimes
      'react/jsx-runtime': path.resolve(
        __dirname,
        '../../node_modules/react/jsx-runtime'
      ),
      'react/jsx-dev-runtime': path.resolve(
        __dirname,
        '../../node_modules/react/jsx-dev-runtime'
      ),
      // react-dom client entry
      'react-dom/client': path.resolve(
        __dirname,
        '../../node_modules/react-dom/client'
      )
    }
  }
});
