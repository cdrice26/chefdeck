'use client';

import request from '@/utils/fetchUtils';
import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * Shape of the authentication context.
 *
 * This type describes the values and functions exposed by the auth context.
 */
type AuthContextType = {
  user: any;
  username: string | null;
  setUser: (user: any) => void;
  setUsername: (username: string | null) => void;
  fetchUser: () => Promise<void>;
};

/**
 * React context that holds authentication data and actions.
 *
 * The default values here are placeholders used for initialization.
 * Consumers should use the `useAuth` hook to access the context.
 */
const AuthContext = createContext<AuthContextType>({
  user: null,
  username: null,
  setUser: () => {},
  setUsername: () => {},
  fetchUser: async () => {}
});

/**
 * Provider component that initializes and supplies authentication state.
 *
 * Props:
 * - children: React nodes that will have access to the auth context.
 *
 * @param children React nodes to render inside the provider.
 * @returns The AuthContext provider element that wraps the provided children.
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState<string | null>(null);

  /**
   * Fetch the currently authenticated user from the server and update state.
   *
   * This function calls the backend endpoint to determine whether a session
   * exists. If the response is not OK or an error occurs, the auth state is
   * cleared. Successful responses populate `user` and `username`.
   */
  const fetchUser = async () => {
    try {
      const res = await request('/api/auth/checkAuth', 'GET');
      if (!res.ok) {
        setUser(null);
        setUsername(null);
        return;
      }
      const data = await res.json();
      setUser(data.data.user);
      setUsername(data.data.profile?.username ?? null);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
      setUsername(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, setUser, fetchUser, username, setUsername }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access authentication context values and actions.
 *
 * Returns the context value provided by `AuthProvider`. This hook should be
 * used by components that need to read auth state or call `fetchUser`.
 *
 * @returns The current authentication context value containing `user`, `username`, and helper functions.
 */
export const useAuth = () => useContext(AuthContext);
