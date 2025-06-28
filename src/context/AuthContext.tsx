'use client';

import request from '@/utils/fetchUtils';
import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
  user: any;
  username: string | null;
  setUser: (user: any) => void;
  setUsername: (username: string | null) => void;
  fetchUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  username: null,
  setUser: () => {},
  setUsername: () => {},
  fetchUser: async () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState<string | null>(null);

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

export const useAuth = () => useContext(AuthContext);
