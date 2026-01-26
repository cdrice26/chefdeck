import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router';
import RootPage from './components/pages/RootPage';
import RecipesPage from './components/pages/RecipesPage';
import SchedulePage from './components/pages/SchedulePage';
import GroceriesPage from './components/pages/GroceriesPage';
import AddRecipePage from './components/pages/AddRecipePage';
import ProfilePage from './components/pages/ProfilePage';
import { NotificationProvider } from 'chefdeck-shared';
import RecipePage from './components/pages/RecipePage';
import EditRecipePage from './components/pages/EditRecipePage';
import { AuthProvider } from './hooks/useAuth';

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
    <NotificationProvider>
      <AuthProvider>
        <MemoryRouterSafe>
          <RoutesSafe>
            <RouteSafe path="/" element={<RootPage />}>
              <RouteSafe index element={<RecipesPage />} />
              <RouteSafe path="dashboard" element={<RecipesPage />} />
              <RouteSafe path="schedule" element={<SchedulePage />} />
              <RouteSafe path="groceries" element={<GroceriesPage />} />
              <RouteSafe path="create" element={<AddRecipePage />} />
              <RouteSafe path="profile" element={<ProfilePage />} />
              <RouteSafe path="recipe/:id">
                <RouteSafe index element={<RecipePage />} />
                <RouteSafe path="edit" element={<EditRecipePage />} />
              </RouteSafe>
            </RouteSafe>
          </RoutesSafe>
        </MemoryRouterSafe>
      </AuthProvider>
    </NotificationProvider>
  </React.StrictMode>
);
