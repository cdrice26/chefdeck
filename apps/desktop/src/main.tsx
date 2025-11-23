import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';

/**
 * Minimal React entry for the Tauri + Vite desktop app.
 *
 * This file intentionally keeps the UI minimal so it can be used as a
 * starting point. It mounts into an element with id="root" which should
 * be present in `src/index.html`.
 */

const App: React.FC = () => {
  return (
    <div
      style={{
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
        color: '#0f172a',
        padding: 24
      }}
    >
      <div style={{ maxWidth: 720, textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>ChefDeck (Desktop)</h1>
        <p style={{ marginTop: 8, color: '#475569' }}>
          A minimal Tauri + Vite + React shell. Use this as the entry point for the desktop app.
        </p>
        <div style={{ marginTop: 18 }}>
          <button
            onClick={() => {
              // Keep this generic so it works in both browser preview and Tauri runtime.
              // If running inside Tauri you can import @tauri-apps/api and call native APIs.
              // Example (uncomment when @tauri-apps/api is present):
              // import { dialog } from '@tauri-apps/api';
              // dialog.message('Hello from Tauri!');
              // For now we show a plain alert which works everywhere.
              window.alert('Hello from ChefDeck desktop!');
            }}
            style={{
              backgroundColor: '#0ea5e9',
              color: '#fff',
              border: 'none',
              padding: '10px 16px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            Say hello
          </button>
        </div>
      </div>
    </div>
  );
};

const rootEl = document.getElementById('root');
if (!rootEl) {
  // If the root element doesn't exist, create one and append it to body.
  const el = document.createElement('div');
  el.id = 'root';
  document.body.appendChild(el);
}

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Enable HMR (Vite) - avoid TypeScript error about ImportMeta by casting to any
const __hmr = (import.meta as any).hot;
if (__hmr) {
  __hmr.accept();
}

// Export both named and default to make imports flexible in toolchains
export { App };
export default App;
