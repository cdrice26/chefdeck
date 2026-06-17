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
import MorePage from './components/pages/MorePage';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <NotificationProvider>
      <AuthProvider>
        <MemoryRouter>
          <Routes>
            <Route path="/" element={<RootPage />}>
              <Route index element={<RecipesPage />} />
              <Route path="dashboard" element={<RecipesPage />} />
              <Route path="schedule" element={<SchedulePage />} />
              <Route path="groceries" element={<GroceriesPage />} />
              <Route path="create" element={<AddRecipePage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="more" element={<MorePage />} />
              <Route path="recipe/:id">
                <Route index element={<RecipePage />} />
                <Route path="edit" element={<EditRecipePage />} />
              </Route>
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </NotificationProvider>
  </React.StrictMode>
);
