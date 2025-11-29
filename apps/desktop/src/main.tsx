import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router';
import RootPage from './components/pages/RootPage';

const MemoryRouterSafe = MemoryRouter as unknown as React.ComponentType<
  React.PropsWithChildren<Record<string, unknown>>
>;

const RoutesSafe = Routes as unknown as React.ComponentType<
  React.PropsWithChildren<Record<string, unknown>>
>;

const RouteSafe = Route as unknown as React.ComponentType<
  Record<string, unknown>
>;

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <MemoryRouterSafe>
      <RoutesSafe>
        <RouteSafe path="/" element={<RootPage />} />
      </RoutesSafe>
    </MemoryRouterSafe>
  </React.StrictMode>
);
