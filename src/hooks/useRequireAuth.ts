import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import request from '@/utils/fetchUtils';

/**
 * Hook that verifies the current user's authentication state and performs redirects as necessary.
 *
 * On mount this hook:
 * - calls the backend auth check endpoint,
 * - if the user is not authenticated, redirects to `/login`,
 * - if the user is authenticated but has not completed profile setup (no username), redirects to `/setupProfile`,
 * - otherwise populates auth state via `setUser` and `setUsername`.
 *
 * @param {Function} redirect - Redirect function to be called if the user is not authenticated.
 * @returns void
 */
export default function useRequireAuth(redirect: (url: string) => void) {
  const { setUser, setUsername } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      const res = await request('/api/auth/checkAuth', 'GET');
      if (!res.ok) {
        redirect('/login');
        return;
      }
      const json = await res.json();
      setUser(json.data.user);
      setUsername(json.data.profile?.username ?? null);
      const username = json?.data?.profile?.username;
      if (!username) {
        redirect('/setupProfile');
      }
    };
    checkAuth();
  });
}
